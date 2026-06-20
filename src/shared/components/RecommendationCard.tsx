import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Recommendation } from '@/shared/types/entities';
import { formatCurrency, formatDistance } from '@/shared/utils/formatters';

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isExpanded, setIsExpanded] = useState(recommendation.isBest);
  const routeConditions = recommendation.routeConditions ?? [];
  const hasMissingProducts = recommendation.missingProducts.length > 0;

  return (
    <Pressable
      className={`rounded-2xl border p-5 ${
        recommendation.isBest ? 'border-primary bg-white' : 'border-line bg-white'
      }`}
      onPress={() => setIsExpanded((current) => !current)}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-extrabold leading-6 text-ink">{recommendation.market.name}</Text>
          <Text className="mt-1 text-xs font-semibold uppercase text-muted">
            {recommendation.market.type} - {formatDistance(recommendation.market.distanceKm)}
          </Text>
        </View>
        {recommendation.isBest ? (
          <Text className="rounded-full bg-success px-3 py-1 text-xs font-bold text-white">Melhor opcao</Text>
        ) : null}
      </View>

      <View className="mt-4 flex-row items-end justify-between gap-4">
        <Text className="text-sm font-bold text-ink">{hasMissingProducts ? 'Total parcial' : 'Total final'}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-extrabold text-success">{formatCurrency(recommendation.finalTotal)}</Text>
          <Text className="text-lg font-extrabold text-muted">{isExpanded ? '^' : 'v'}</Text>
        </View>
      </View>

      {isExpanded ? <View className="mt-4 gap-2">
        <Row label="Produtos" value={formatCurrency(recommendation.productsTotal)} />
        <Row label="Distancia" value={formatDistance(recommendation.market.distanceKm)} />
        <Row label="Combustivel base" value={formatCurrency(recommendation.baseDisplacementCost ?? recommendation.displacementCost)} />
        <Row label="Impacto do percurso" value={`${formatCurrency(recommendation.routeImpactCost ?? 0)} (${Math.round((recommendation.routeImpactPercent ?? 0) * 100)}%)`} />
        <Row label="Combustivel ajustado" value={formatCurrency(recommendation.displacementCost)} />
        <View className="h-px bg-line" />
        {!recommendation.isBest ? <Row label="Diferenca para o melhor" value={formatCurrency(recommendation.estimatedSavings)} /> : null}
      </View> : null}

      {isExpanded && routeConditions.length > 0 ? (
        <View className="mt-3 gap-1 rounded-xl bg-sand p-3">
          <Text className="text-xs font-bold uppercase text-slate-600">Condicoes do percurso</Text>
          {routeConditions.map((condition) => (
            <Text key={`${recommendation.market.id}-${condition.type}-${condition.label}`} className="text-xs text-slate-700">
              {condition.label}: +{Math.round(condition.impactPercent * 100)}%
            </Text>
          ))}
        </View>
      ) : isExpanded ? (
        <Text className="mt-3 text-xs text-amber-800">
          Impactos de transito em tempo real ainda nao estao integrados.
        </Text>
      ) : null}

      {hasMissingProducts ? (
        <View className="mt-3 rounded-xl bg-amber-50 p-3">
          <Text className="text-xs font-bold text-amber-900">Total parcial, nao compara a lista completa</Text>
          <Text className="mt-1 text-xs text-amber-800">
            Itens indisponiveis: {recommendation.missingProducts.map((product) => product.name).join(', ')}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Row({ label, value, isStrong = false }: { label: string; value: string; isStrong?: boolean }) {
  return (
    <View className="flex-row flex-wrap justify-between gap-x-4 gap-y-1">
      <Text className={`min-w-0 flex-1 ${isStrong ? 'font-bold text-ink' : 'text-muted'}`}>{label}</Text>
      <Text className={`max-w-full shrink text-right ${isStrong ? 'font-bold text-ink' : 'font-semibold text-ink'}`}>
        {value}
      </Text>
    </View>
  );
}
