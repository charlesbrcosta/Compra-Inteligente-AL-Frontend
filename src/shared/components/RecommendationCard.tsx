import { Text, View } from 'react-native';

import { Recommendation } from '@/shared/types/entities';
import { formatCurrency, formatDistance } from '@/shared/utils/formatters';

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const routeConditions = recommendation.routeConditions ?? [];

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
        <Row label="Combustivel base" value={formatCurrency(recommendation.baseDisplacementCost ?? recommendation.displacementCost)} />
        <Row label="Impacto do percurso" value={`${formatCurrency(recommendation.routeImpactCost ?? 0)} (${Math.round((recommendation.routeImpactPercent ?? 0) * 100)}%)`} />
        <Row label="Combustivel ajustado" value={formatCurrency(recommendation.displacementCost)} />
        <View className="h-px bg-slate-200" />
        <Row isStrong label="Total final" value={formatCurrency(recommendation.finalTotal)} />
        {!recommendation.isBest ? <Row label="Diferenca para o melhor" value={formatCurrency(recommendation.estimatedSavings)} /> : null}
      </View>

      {routeConditions.length > 0 ? (
        <View className="mt-3 gap-1 rounded-md bg-slate-100 p-3">
          <Text className="text-xs font-bold uppercase text-slate-600">Condicoes do percurso</Text>
          {routeConditions.map((condition) => (
            <Text key={`${recommendation.market.id}-${condition.type}-${condition.label}`} className="text-xs text-slate-700">
              {condition.label}: +{Math.round(condition.impactPercent * 100)}%
            </Text>
          ))}
        </View>
      ) : (
        <Text className="mt-3 text-xs text-emerald-700">Percurso sem impactos mockados no momento.</Text>
      )}

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
    <View className="flex-row flex-wrap justify-between gap-x-4 gap-y-1">
      <Text className={`min-w-0 flex-1 ${isStrong ? 'font-bold text-ink' : 'text-muted'}`}>{label}</Text>
      <Text className={`max-w-full shrink text-right ${isStrong ? 'font-bold text-ink' : 'font-semibold text-slate-700'}`}>
        {value}
      </Text>
    </View>
  );
}
