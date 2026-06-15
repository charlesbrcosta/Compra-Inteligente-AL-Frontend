import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { RecommendationCard } from '@/shared/components/RecommendationCard';
import { MockMapPreview } from '@/features/map/presentation/MockMapPreview';
import { useCurrentLocation } from '@/features/map/presentation/useCurrentLocation';
import { useProductStore } from '@/features/products/store/productStore';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';
import { useRecommendations } from '@/features/recommendations/presentation/useRecommendations';

export function RecommendationsScreen() {
  const { products, loadProducts } = useProductStore();
  const { vehicle, loadVehicle } = useVehicleStore();
  const { recommendations, isLoading, loadRecommendations } = useRecommendations();
  const { currentLocation, loadCurrentLocation } = useCurrentLocation();

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadVehicle();
      loadRecommendations();
      loadCurrentLocation();
    }, [loadCurrentLocation, loadProducts, loadRecommendations, loadVehicle]),
  );

  if (isLoading) {
    return <Loading label="Calculando recomendacoes" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="p-5 pb-8">
        <Header
          title="Recomendacao"
          subtitle="Total dos produtos somado ao custo de combustivel para ida e volta."
        />

        <View className="gap-3">
          {currentLocation ? <MockMapPreview currentLocation={currentLocation} markets={recommendations.map((item) => item.market)} /> : null}
          {products.length === 0 ? (
            <EmptyState title="Nenhum produto na lista" description="Adicione produtos para comparar supermercados e atacadistas." />
          ) : recommendations.length === 0 ? (
            <EmptyState title="Sem mercados disponiveis" description="Os mercados mockados nao foram carregados." />
          ) : (
            recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.market.id} recommendation={recommendation} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
