import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAppNavigation } from '@/app/routes/appNavigation';
import { RouteMapPreview } from '@/features/map/presentation/RouteMapPreview';
import { useCurrentLocation } from '@/features/map/presentation/useCurrentLocation';
import { useProductStore } from '@/features/products/store/productStore';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';
import { useRecommendations } from '@/features/recommendations/presentation/useRecommendations';
import { useUserStore } from '@/features/user/store/userStore';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { RecommendationCard } from '@/shared/components/RecommendationCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { GeoLocation, Recommendation } from '@/shared/types/entities';
import { formatCurrency } from '@/shared/utils/formatters';

type MarketFilter = 'all' | 'city' | 'neighborhood';

export function RecommendationsScreen() {
  const { products, loadProducts } = useProductStore();
  const { user, loadUser } = useUserStore();
  const { loadVehicle } = useVehicleStore();
  const { recommendations, isLoading, error, clearRecommendations, loadRecommendations } = useRecommendations();
  const { navigate } = useAppNavigation();
  const {
    currentLocation,
    isLocating,
    loadCurrentLocation,
    locationError,
    openLocationSettings,
    restartLocation,
    startWatchingLocation,
    stopWatchingLocation,
  } = useCurrentLocation();
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const lastRecommendationLocationRef = useRef(currentLocation);

  const reloadScreen = useCallback(async () => {
    lastRecommendationLocationRef.current = null;
    await Promise.all([loadProducts(), loadUser(), loadVehicle(), loadCurrentLocation()]);

    if (currentLocation) {
      lastRecommendationLocationRef.current = currentLocation;
      await loadRecommendations(currentLocation);
    }
  }, [currentLocation, loadCurrentLocation, loadProducts, loadRecommendations, loadUser, loadVehicle]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadUser();
      loadVehicle();
      loadCurrentLocation();
      startWatchingLocation();

      return () => {
        stopWatchingLocation();
      };
    }, [loadCurrentLocation, loadProducts, loadUser, loadVehicle, startWatchingLocation, stopWatchingLocation]),
  );

  useEffect(() => {
    if (!currentLocation) {
      clearRecommendations();
      lastRecommendationLocationRef.current = null;
      return;
    }

    if (!shouldRefreshRecommendations(lastRecommendationLocationRef.current, currentLocation)) {
      return;
    }

    lastRecommendationLocationRef.current = currentLocation;
    loadRecommendations(currentLocation);
  }, [clearRecommendations, currentLocation, loadRecommendations]);

  const filteredRecommendations = useMemo(() => {
    if (!user || filter === 'all') {
      return recommendations;
    }

    return recommendations.filter((recommendation) => {
      if (filter === 'city') {
        return normalize(recommendation.market.city) === normalize(user.city);
      }

      return (
        normalize(recommendation.market.city) === normalize(user.city) &&
        normalize(recommendation.market.neighborhood) === normalize(user.neighborhood)
      );
    });
  }, [filter, recommendations, user]);

  const visibleRecommendations = useMemo(
    () => markBestRecommendationForActiveFilter(filteredRecommendations),
    [filteredRecommendations],
  );

  useEffect(() => {
    if (!selectedMarketId || visibleRecommendations.some((recommendation) => recommendation.market.id === selectedMarketId)) {
      return;
    }

    setSelectedMarketId(null);
  }, [selectedMarketId, visibleRecommendations]);

  const selectedRecommendation = useMemo(
    () => visibleRecommendations.find((recommendation) => recommendation.market.id === selectedMarketId),
    [selectedMarketId, visibleRecommendations],
  );

  const mapMarket = useMemo(
    () => selectedRecommendation?.market ?? visibleRecommendations.find((recommendation) => recommendation.isBest)?.market ?? visibleRecommendations[0]?.market,
    [selectedRecommendation, visibleRecommendations],
  );

  if (isLoading) {
    return <Loading label="Calculando recomendacoes" />;
  }

  return (
    <ScreenContainer onRefresh={reloadScreen}>
      <Header
        title="Recomendacao"
        subtitle="Produtos, combustivel, rota real e filtros por localidade."
      />

      <View className="gap-4">
        <View className="flex-row gap-2">
          <FilterButton isActive={filter === 'all'} label="Todos" onPress={() => setFilter('all')} />
          <FilterButton isActive={filter === 'city'} label="Cidade" onPress={() => setFilter('city')} />
          <FilterButton isActive={filter === 'neighborhood'} label="Bairro" onPress={() => setFilter('neighborhood')} />
        </View>

        <View className="gap-3 sm:flex-row">
          <View className="flex-1">
            <Button title="Historico" variant="ghost" onPress={() => navigate('History')} />
          </View>
        </View>

        {!currentLocation ? (
          <GpsRequiredMapOverlay
            message={locationError ?? 'Ative o GPS para calcular rotas a partir da sua localizacao real.'}
            isLocating={isLocating}
            onEnableGps={restartLocation}
            onOpenSettings={openLocationSettings}
          />
        ) : mapMarket ? (
          <RouteMapPreview currentLocation={currentLocation} market={mapMarket} recommendations={visibleRecommendations} />
        ) : (
          <LocationReadyEmptyMap
            description={
              recommendations.length > 0
                ? 'Existem mercados na recomendacao, mas o filtro atual nao encontrou estabelecimentos para exibir no mapa.'
                : 'Sua localizacao foi obtida. O mapa sera exibido quando a SEFAZ retornar mercados reais para os produtos da lista.'
            }
          />
        )}

        {error ? (
          <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm font-semibold text-red-700">{error}</Text>
          </View>
        ) : null}

        {products.length === 0 ? (
          <EmptyState title="Nenhum produto na lista" description="Adicione produtos para comparar supermercados e atacadistas." />
        ) : !currentLocation ? null : visibleRecommendations.length === 0 ? (
          <RecommendationEmptyState
            hasRecommendations={recommendations.length > 0}
            onShowAll={() => setFilter('all')}
          />
        ) : (
          <>
            <CostGauge recommendations={visibleRecommendations} />
            {visibleRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.market.id}
                isSelected={recommendation.market.id === mapMarket?.id}
                recommendation={recommendation}
                onSelectRecommendation={() => setSelectedMarketId(recommendation.market.id)}
              />
            ))}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

function RecommendationEmptyState({
  hasRecommendations,
  onShowAll,
}: {
  hasRecommendations: boolean;
  onShowAll: () => void;
}) {
  if (hasRecommendations) {
    return (
      <View className="gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <Text className="text-base font-bold text-amber-950">Nenhum mercado nesse filtro</Text>
        <Text className="text-sm text-amber-900">
          Existem mercados calculados, mas eles nao combinam com o filtro selecionado. Use Todos para ver a recomendacao completa.
        </Text>
        <Button title="Ver todos" variant="secondary" onPress={onShowAll} />
      </View>
    );
  }

  return (
    <EmptyState
      title="Nenhum mercado encontrado"
      description="A SEFAZ nao retornou estabelecimentos reais para os produtos da lista. Tente produtos mais comuns ou atualize a busca."
    />
  );
}

function LocationReadyEmptyMap({ description }: { description: string }) {
  return (
    <View className="relative overflow-hidden rounded-2xl border border-line bg-slate-200">
      <View className="h-80 opacity-35">
        <View className="h-full w-full bg-slate-300">
          <View className="absolute left-8 top-10 h-20 w-40 rounded-full border-4 border-slate-400" />
          <View className="absolute right-6 top-20 h-28 w-48 rounded-full border-4 border-slate-400" />
          <View className="absolute bottom-12 left-10 h-4 w-64 rotate-12 rounded-full bg-slate-400" />
          <View className="absolute bottom-24 right-8 h-4 w-56 -rotate-12 rounded-full bg-slate-400" />
        </View>
      </View>
      <View className="absolute inset-0 items-center justify-center bg-white/75 p-5">
        <View className="w-full max-w-sm gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <Text className="text-center text-base font-bold text-emerald-950">GPS ativo</Text>
          <Text className="text-center text-sm text-emerald-900">{description}</Text>
        </View>
      </View>
    </View>
  );
}

function GpsRequiredMapOverlay({
  message,
  isLocating,
  onEnableGps,
  onOpenSettings,
}: {
  message: string;
  isLocating: boolean;
  onEnableGps: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <View className="relative overflow-hidden rounded-2xl border border-line bg-slate-200">
      <View className="h-80 opacity-35">
        <View className="h-full w-full bg-slate-300">
          <View className="absolute left-8 top-10 h-20 w-40 rounded-full border-4 border-slate-400" />
          <View className="absolute right-6 top-20 h-28 w-48 rounded-full border-4 border-slate-400" />
          <View className="absolute bottom-12 left-10 h-4 w-64 rotate-12 rounded-full bg-slate-400" />
          <View className="absolute bottom-24 right-8 h-4 w-56 -rotate-12 rounded-full bg-slate-400" />
        </View>
      </View>
      <View className="absolute inset-0 items-center justify-center bg-white/75 p-5">
        <View className="w-full max-w-sm gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-center text-base font-bold text-amber-950">GPS necessario</Text>
          <Text className="text-center text-sm text-amber-900">{message}</Text>
          <Button title="Ativar GPS" isLoading={isLocating} onPress={onEnableGps} />
          <Button title="Abrir configuracoes" variant="secondary" onPress={onOpenSettings} />
        </View>
      </View>
    </View>
  );
}

function markBestRecommendationForActiveFilter(recommendations: Recommendation[]) {
  const bestRecommendation = recommendations[0];

  if (!bestRecommendation) {
    return [];
  }

  return recommendations.map((recommendation) => ({
    ...recommendation,
    estimatedSavings: Math.max(0, recommendation.finalTotal - bestRecommendation.finalTotal),
    isBest: recommendation.market.id === bestRecommendation.market.id,
  }));
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function shouldRefreshRecommendations(previousLocation: GeoLocation | null, currentLocation: GeoLocation) {
  if (!previousLocation) {
    return true;
  }

  return calculateDistanceKm(previousLocation, currentLocation) >= 0.2;
}

function calculateDistanceKm(origin: GeoLocation, destination: GeoLocation) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function FilterButton({ isActive, label, onPress }: { isActive: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      className={`min-h-11 min-w-24 flex-1 items-center justify-center rounded-xl border px-3 ${
        isActive ? 'border-primary bg-primary' : 'border-line bg-white'
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{label}</Text>
    </Pressable>
  );
}

function CostGauge({ recommendations }: { recommendations: Recommendation[] }) {
  const costs = recommendations.map((recommendation) => recommendation.finalTotal);
  const min = Math.min(...costs);
  const max = Math.max(...costs);
  const best = recommendations[0];
  const worst = recommendations[recommendations.length - 1];
  const savings = worst && best ? Math.max(0, worst.finalTotal - best.finalTotal) : 0;

  if (!best) {
    return null;
  }

  return (
    <View className="rounded-2xl border border-line bg-white p-5">
      <Text className="text-xs font-extrabold uppercase tracking-wide text-muted">Comparativo de custo total</Text>
      <View className="mt-5 h-2 justify-center rounded-full bg-sand">
        <View className="h-2 rounded-full bg-ink/10" />
        {recommendations.slice(0, 4).map((recommendation) => {
          const position = max === min ? 0 : ((recommendation.finalTotal - min) / (max - min)) * 100;
          const isBest = recommendation.market.id === best.market.id;

          return (
            <View
              key={recommendation.market.id}
              className="absolute top-1/2 -mt-2 h-4 w-4 rounded-full border-2 border-white"
              style={{ left: `${Math.min(96, Math.max(0, position))}%`, backgroundColor: isBest ? '#2F8F5B' : '#B9AFA2' }}
            />
          );
        })}
      </View>
      <View className="mt-5 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-extrabold text-ink" numberOfLines={1}>{best.market.name}</Text>
          <Text className="mt-1 text-xs text-muted">menor custo total</Text>
        </View>
        <Text className="text-right text-sm font-extrabold text-success">economia de {formatCurrency(savings)}</Text>
      </View>
    </View>
  );
}
