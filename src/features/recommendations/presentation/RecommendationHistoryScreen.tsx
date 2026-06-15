import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRecommendations } from '@/features/recommendations/presentation/useRecommendations';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Loading } from '@/shared/components/Loading';
import { formatCurrency } from '@/shared/utils/formatters';

export function RecommendationHistoryScreen() {
  const { history, isHistoryLoading, loadHistory } = useRecommendations();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  if (isHistoryLoading) {
    return <Loading label="Carregando historico" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="p-5 pb-8">
        <Header title="Historico" subtitle="Ultimas recomendacoes calculadas para comparar decisoes anteriores." />

        <View className="gap-3">
          {history.length === 0 ? (
            <EmptyState title="Sem historico" description="Gere uma recomendacao para salvar o primeiro registro." />
          ) : (
            history.map((entry) => {
              const best = entry.recommendations.find((recommendation) => recommendation.isBest);

              return (
                <View key={entry.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <Text className="text-xs font-semibold uppercase text-muted">
                    {new Date(entry.createdAt).toLocaleString('pt-BR')}
                  </Text>
                  <Text className="mt-2 text-base font-bold text-ink">
                    {best?.market.name ?? 'Mercado nao identificado'}
                  </Text>
                  <Text className="mt-1 text-sm text-muted">
                    Total recomendado: {formatCurrency(best?.finalTotal ?? 0)}
                  </Text>
                  <Text className="mt-2 text-xs text-slate-600">
                    {entry.recommendations.length} mercados comparados nesta simulacao.
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
