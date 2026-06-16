import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MockMapPreview } from '@/features/map/presentation/MockMapPreview';
import { useCurrentLocation } from '@/features/map/presentation/useCurrentLocation';
import { useProductStore } from '@/features/products/store/productStore';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';
import { useRecommendations } from '@/features/recommendations/presentation/useRecommendations';
import { useUserStore } from '@/features/user/store/userStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { RecommendationCard } from '@/shared/components/RecommendationCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

type MarketFilter = 'all' | 'city' | 'neighborhood';

export function RecommendationsScreen() {
  const { products, loadProducts } = useProductStore();
  const { user, loadUser } = useUserStore();
  const { loadVehicle } = useVehicleStore();
  const { recommendations, isLoading, loadRecommendations } = useRecommendations();
  const {
    currentLocation,
    loadCurrentLocation,
    locationError,
    startWatchingLocation,
    stopWatchingLocation,
  } = useCurrentLocation();
  const [filter, setFilter] = useState<MarketFilter>('all');

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
    loadRecommendations(currentLocation ?? undefined);
  }, [currentLocation, loadRecommendations]);

  const filteredRecommendations = useMemo(() => {
    if (!user || filter === 'all') {
      return recommendations;
    }

    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    return recommendations.filter((recommendation) => {
      if (filter === 'city') {
        return normalize(recommendation.market.city) === normalize(user.city);
      }

      return normalize(recommendation.market.neighborhood) === normalize(user.neighborhood);
    });
  }, [filter, recommendations, user]);

  const mapMarket = useMemo(
    () => filteredRecommendations.find((recommendation) => recommendation.isBest)?.market ?? filteredRecommendations[0]?.market,
    [filteredRecommendations],
  );

  if (isLoading) {
    return <Loading label="Calculando recomendacoes" />;
  }

  return (
    <ScreenContainer>
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

        {locationError ? (
          <View className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Text className="text-sm font-semibold text-amber-900">{locationError}</Text>
          </View>
        ) : null}

        {currentLocation && mapMarket ? (
          <MockMapPreview currentLocation={currentLocation} market={mapMarket} />
        ) : null}

        {products.length === 0 ? (
          <EmptyState title="Nenhum produto na lista" description="Adicione produtos para comparar supermercados e atacadistas." />
        ) : filteredRecommendations.length === 0 ? (
          <EmptyState title="Sem mercados nesse filtro" description="Altere o filtro ou atualize cidade e bairro no perfil." />
        ) : (
          filteredRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.market.id} recommendation={recommendation} />
          ))
        )}
      </View>
    </ScreenContainer>
  );
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
