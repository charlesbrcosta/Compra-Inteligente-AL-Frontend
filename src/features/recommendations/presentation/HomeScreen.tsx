import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { MarketCard } from '@/shared/components/MarketCard';
import { mockCurrentLocation } from '@/shared/constants/mockData';
import { formatCurrency, formatFuelConsumption } from '@/shared/utils/formatters';
import { useMarkets } from '@/features/markets/presentation/useMarkets';
import { useProductStore } from '@/features/products/store/productStore';
import { useUserStore } from '@/features/user/store/userStore';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';
import { useRecommendations } from '@/features/recommendations/presentation/useRecommendations';

export function HomeScreen() {
  const { markets } = useMarkets();
  const { products, loadProducts } = useProductStore();
  const { user, loadUser } = useUserStore();
  const { vehicle, loadVehicle } = useVehicleStore();
  const recommendations = useRecommendations(products, markets, vehicle, mockCurrentLocation);
  const best = recommendations[0];

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadVehicle();
      loadProducts();
    }, [loadProducts, loadUser, loadVehicle]),
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="p-5 pb-8">
        <Header title={`Ola, ${user?.name?.split(' ')[0] ?? 'comprador'}`} subtitle="Resumo do seu planejamento de compra em Alagoas." />

        <View className="gap-3">
          <Card>
            <Text className="text-sm text-muted">Melhor opcao agora</Text>
            <Text className="mt-1 text-xl font-bold text-ink">{best?.market.name ?? 'Adicione produtos'}</Text>
            <Text className="mt-2 text-sm text-slate-700">
              {best ? `Total estimado: ${formatCurrency(best.finalTotal)}` : 'Monte sua lista para receber uma recomendacao.'}
            </Text>
          </Card>

          <View className="flex-row gap-3">
            <Card className="flex-1">
              <Text className="text-sm text-muted">Produtos</Text>
              <Text className="mt-2 text-2xl font-bold text-ink">{products.length}</Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-sm text-muted">Veiculo</Text>
              <Text className="mt-2 text-base font-bold text-ink">{vehicle ? formatFuelConsumption(vehicle.averageConsumptionKmPerLiter) : 'Pendente'}</Text>
            </Card>
          </View>

          <Card>
            <Text className="text-sm text-muted">Combustivel</Text>
            <Text className="mt-2 text-lg font-bold text-ink">
              {vehicle ? `${vehicle.fuelType} - ${formatCurrency(vehicle.fuelPricePerLiter)}/l` : 'Cadastre seu veiculo'}
            </Text>
          </Card>

          <Header title="Mercados monitorados" />
          {recommendations.slice(0, 3).map((recommendation) => (
            <MarketCard key={recommendation.market.id} market={recommendation.market} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
