import { Text, View } from 'react-native';

import { Recommendation } from '@/shared/types/entities';
import { formatCurrency, formatDistance } from '@/shared/utils/formatters';

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <View
      className={`rounded-lg border p-4 ${
        recommendation.isBest ? 'border-primary bg-teal-50' : 'border-slate-200 bg-white'
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-lg font-bold text-ink">{recommendation.market.name}</Text>
        {recommendation.isBest ? (
          <Text className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Melhor</Text>
        ) : null}
      </View>
      <Text className="mt-1 text-sm text-muted">{recommendation.market.type}</Text>

      <View className="mt-4 gap-2">
        <Row label="Produtos" value={formatCurrency(recommendation.productsTotal)} />
        <Row label="Distancia" value={formatDistance(recommendation.market.distanceKm)} />
        <Row label="Combustivel ida e volta" value={formatCurrency(recommendation.displacementCost)} />
        <View className="h-px bg-slate-200" />
        <Row isStrong label="Total final" value={formatCurrency(recommendation.finalTotal)} />
        {!recommendation.isBest ? <Row label="Diferenca para o melhor" value={formatCurrency(recommendation.estimatedSavings)} /> : null}
      </View>

      {recommendation.missingProducts.length > 0 ? (
        <Text className="mt-3 text-xs text-red-700">
          Itens indisponiveis: {recommendation.missingProducts.map((product) => product.name).join(', ')}
        </Text>
      ) : null}
    </View>
  );
}

function Row({ label, value, isStrong = false }: { label: string; value: string; isStrong?: boolean }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className={`${isStrong ? 'font-bold text-ink' : 'text-muted'}`}>{label}</Text>
      <Text className={`${isStrong ? 'font-bold text-ink' : 'font-semibold text-slate-700'}`}>{value}</Text>
    </View>
  );
}
