import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { useMarkets } from '@/features/markets/presentation/useMarkets';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export function RouteImpactsScreen() {
  const { markets, isLoading, loadMarkets } = useMarkets();
  const reloadScreen = useCallback(async () => {
    await loadMarkets();
  }, [loadMarkets]);

  if (isLoading) {
    return <Loading label="Carregando impactos" />;
  }

  return (
    <ScreenContainer onRefresh={reloadScreen}>
        <Header
          title="Impactos"
          subtitle="Condicoes mockadas que alteram o custo de deslocamento antes da recomendacao."
        />

        <View className="gap-3">
          {markets.length === 0 ? (
            <EmptyState title="Sem mercados" description="Nenhum mercado mockado foi carregado." />
          ) : (
            markets.map((market) => {
              const conditions = market.routeConditions ?? [];

              return (
                <View key={market.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <View className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-ink">{market.name}</Text>
                      <Text className="mt-1 text-sm text-muted">
                        {market.neighborhood}, {market.city}
                      </Text>
                    </View>
                    <Text className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                      {Math.round(conditions.reduce((total, condition) => total + condition.impactPercent, 0) * 100)}%
                    </Text>
                  </View>

                  {conditions.length === 0 ? (
                    <Text className="mt-3 text-sm text-emerald-700">Sem impacto mockado no percurso.</Text>
                  ) : (
                    <View className="mt-3 gap-2">
                      {conditions.map((condition) => (
                        <View key={`${market.id}-${condition.type}-${condition.label}`} className="rounded-md bg-slate-50 p-3">
                          <Text className="text-sm font-bold text-ink">
                            {condition.label} (+{Math.round(condition.impactPercent * 100)}%)
                          </Text>
                          <Text className="mt-1 text-xs text-muted">{condition.description}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
    </ScreenContainer>
  );
}
