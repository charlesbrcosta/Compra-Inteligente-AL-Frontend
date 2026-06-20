import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAppNavigation } from '@/app/routes/appNavigation';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { MarketCard } from '@/shared/components/MarketCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { formatCurrency, formatFuelConsumption } from '@/shared/utils/formatters';
import { useProductStore } from '@/features/products/store/productStore';
import { useUserStore } from '@/features/user/store/userStore';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';
import { useRecommendations } from '@/features/recommendations/presentation/useRecommendations';

export function HomeScreen() {
  const { products, loadProducts } = useProductStore();
  const { user, loadUser } = useUserStore();
  const { vehicle, loadVehicle } = useVehicleStore();
  const { recommendations, loadRecommendations } = useRecommendations();
  const { navigate } = useAppNavigation();
  const best = recommendations[0];

  const reloadScreen = useCallback(async () => {
    await Promise.all([loadUser(), loadVehicle(), loadProducts(), loadRecommendations()]);
  }, [loadProducts, loadRecommendations, loadUser, loadVehicle]);

  useFocusEffect(
    useCallback(() => {
      reloadScreen();
    }, [reloadScreen]),
  );

  return (
    <ScreenContainer onRefresh={reloadScreen}>
      <Header title={`Ola, ${user?.name?.split(' ')[0] ?? 'comprador'}`} subtitle="Resumo do seu planejamento de compra em Alagoas." />

      <View className="gap-4">
        <View className="overflow-hidden rounded-3xl bg-primary p-6">
          <Text className="self-start rounded-full bg-[#C97A12] px-3 py-1 text-xs font-extrabold uppercase text-white">
            Recomendacao de hoje
          </Text>
          <Text className="mt-4 text-2xl font-extrabold leading-8 text-white">
            {best ? `${best.market.name} sai por ${formatCurrency(best.finalTotal)}` : 'Monte sua lista para comparar'}
          </Text>
          <Text className="mt-2 max-w-xl text-sm leading-5 text-white/85">
            {best
              ? `Economia estimada considerando produtos, combustivel e ida e volta.`
              : 'Adicione produtos e cadastre seu veiculo para descobrir o menor custo total.'}
          </Text>
          <Pressable className="mt-5 self-start rounded-xl bg-white px-4 py-2 active:opacity-80" onPress={() => navigate('Recommendations')}>
            <Text className="text-sm font-extrabold text-primary">Ver comparacao completa</Text>
          </Pressable>
        </View>

        <View className="flex-row rounded-2xl border border-line bg-white p-4">
          <Stat label="Veiculo" value={vehicle ? formatFuelConsumption(vehicle.averageConsumptionKmPerLiter) : 'Pendente'} />
          <Divider />
          <Stat label="Combustivel" value={vehicle ? `${formatCurrency(vehicle.fuelPricePerLiter)}/l` : 'Pendente'} />
          <Divider />
          <Stat label="Itens" value={`${products.length}`} />
        </View>

        <View>
          <Text className="mb-3 text-xl font-extrabold text-ink">Mercados monitorados</Text>
          {recommendations.length === 0 ? (
            <Card>
              <Text className="text-sm leading-5 text-muted">
                Quando houver produtos, GPS e retorno da SEFAZ, os estabelecimentos reais aparecem aqui.
              </Text>
            </Card>
          ) : null}
          <View className="gap-3">
            {recommendations.slice(0, 3).map((recommendation) => (
              <MarketCard key={recommendation.market.id} market={recommendation.market} />
            ))}
          </View>
        </View>

        <View className="gap-3 sm:flex-row">
          <View className="flex-1">
            <Button title="Ver historico" variant="ghost" onPress={() => navigate('History')} />
          </View>
          <View className="flex-1">
            <Button title="Impactos da rota" variant="ghost" onPress={() => navigate('RouteImpacts')} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1 items-center px-2">
      <Text className="text-center text-[10px] font-bold uppercase tracking-wide text-muted">{label}</Text>
      <Text className="mt-1 text-center text-sm font-extrabold text-ink">{value}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-9 w-px bg-line" />;
}
