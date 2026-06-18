import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MockMapPreview } from '@/features/map/presentation/MockMapPreview';
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
import { Recommendation } from '@/shared/types/entities';

type MarketFilter = 'all' | 'city' | 'neighborhood';

export function RecommendationsScreen() {
  const { products, loadProducts } = useProductStore();
  const { user, loadUser } = useUserStore();
  const { loadVehicle } = useVehicleStore();
  const { recommendations, isLoading, error, clearRecommendations, loadRecommendations } = useRecommendations();
  const {
    currentLocation,
    loadCurrentLocation,
    locationError,
    openLocationSettings,
    startWatchingLocation,
    stopWatchingLocation,
  } = useCurrentLocation();
  const [filter, setFilter] = useState<MarketFilter>('all');

  const reloadScreen = useCallback(async () => {
    await Promise.all([loadProducts(), loadUser(), loadVehicle(), loadCurrentLocation()]);

    if (currentLocation) {
      await loadRecommendations(currentLocation);
    }
  }, [currentLocation, loadCurrentLocation, loadProducts, loadRecommendations, loadUser, loadVehicle]);

  const enableGps = useCallback(async () => {
    stopWatchingLocation();
    await loadCurrentLocation();
    await startWatchingLocation();
  }, [loadCurrentLocation, startWatchingLocation, stopWatchingLocation]);

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
      return;
    }

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

  const mapMarket = useMemo(
    () => visibleRecommendations.find((recommendation) => recommendation.isBest)?.market ?? visibleRecommendations[0]?.market,
    [visibleRecommendations],
  );

  if (isLoading) {
    return <Loading label="Calculando recomendacoes" />;
  }

  return (
    <ScreenContainer onRefresh={reloadScreen}>
      <Header
        title="Recomendacao"
        subtitle="Produtos, combustivel, impactos do percurso e filtros por localidade."
      />

      <View className="gap-3">
        <View className="flex-row flex-wrap gap-2">
          <FilterButton isActive={filter === 'all'} label="Todos" onPress={() => setFilter('all')} />
          <FilterButton isActive={filter === 'city'} label="Cidade" onPress={() => setFilter('city')} />
          <FilterButton isActive={filter === 'neighborhood'} label="Bairro" onPress={() => setFilter('neighborhood')} />
        </View>

        {currentLocation && mapMarket ? (
          <MockMapPreview currentLocation={currentLocation} market={mapMarket} recommendations={visibleRecommendations} />
        ) : (
          <GpsRequiredMapOverlay
            message={locationError ?? 'Ative o GPS para calcular rotas a partir da sua localizacao real.'}
            onEnableGps={enableGps}
            onOpenSettings={openLocationSettings}
          />
        )}

        {error ? (
          <View className="rounded-lg border border-red-200 bg-red-50 p-3">
            <Text className="text-sm font-semibold text-red-700">{error}</Text>
          </View>
        ) : null}

        {products.length === 0 ? (
          <EmptyState title="Nenhum produto na lista" description="Adicione produtos para comparar supermercados e atacadistas." />
        ) : !currentLocation ? null : visibleRecommendations.length === 0 ? (
          <EmptyState title="Sem mercados nesse filtro" description="Altere o filtro ou atualize cidade e bairro no perfil." />
        ) : (
          visibleRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.market.id} recommendation={recommendation} />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

function GpsRequiredMapOverlay({
  message,
  onEnableGps,
  onOpenSettings,
}: {
  message: string;
  onEnableGps: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <View className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
      <View className="h-80 opacity-35">
        <View className="h-full w-full bg-slate-300">
          <View className="absolute left-8 top-10 h-20 w-40 rounded-full border-4 border-slate-400" />
          <View className="absolute right-6 top-20 h-28 w-48 rounded-full border-4 border-slate-400" />
          <View className="absolute bottom-12 left-10 h-4 w-64 rotate-12 rounded-full bg-slate-400" />
          <View className="absolute bottom-24 right-8 h-4 w-56 -rotate-12 rounded-full bg-slate-400" />
        </View>
      </View>
      <View className="absolute inset-0 items-center justify-center bg-white/75 p-5">
        <View className="w-full max-w-sm gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Text className="text-center text-base font-bold text-amber-950">GPS necessario</Text>
          <Text className="text-center text-sm text-amber-900">{message}</Text>
          <Button title="Ativar GPS" onPress={onEnableGps} />
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

function FilterButton({ isActive, label, onPress }: { isActive: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      className={`min-h-10 min-w-24 flex-1 items-center justify-center rounded-lg border px-3 ${
        isActive ? 'border-primary bg-primary' : 'border-slate-200 bg-white'
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{label}</Text>
    </Pressable>
  );
}
