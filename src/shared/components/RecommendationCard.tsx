import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Recommendation } from '@/shared/types/entities';
import { formatCurrency, formatDistance } from '@/shared/utils/formatters';

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isExpanded, setIsExpanded] = useState(recommendation.isBest);
  const [isProductListVisible, setIsProductListVisible] = useState(false);
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
          <Pressable
            accessibilityLabel="Ver produtos encontrados neste mercado"
            className={`h-9 w-9 items-center justify-center rounded-xl border ${
              isProductListVisible ? 'border-secondary bg-secondary' : 'border-line bg-white'
            }`}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              setIsProductListVisible((current) => !current);
            }}
          >
            <ListIcon isActive={isProductListVisible} />
          </Pressable>
          <Text className="text-lg font-extrabold text-muted">{isExpanded ? '^' : 'v'}</Text>
        </View>
      </View>

      {isExpanded ? <View className="mt-4 gap-2">
        <Row label="Produtos" value={formatCurrency(recommendation.productsTotal)} />
        <Row label="Distancia" value={formatDistance(recommendation.market.distanceKm)} />
        <Row label="Combustivel estimado" value={formatCurrency(recommendation.displacementCost)} />
        <View className="h-px bg-line" />
        {!recommendation.isBest ? <Row label="Diferenca para o melhor" value={formatCurrency(recommendation.estimatedSavings)} /> : null}
      </View> : null}

      {isProductListVisible ? (
        <View className="mt-4 rounded-2xl border border-line bg-sand p-4">
          <Text className="text-sm font-extrabold text-ink">Produtos encontrados neste mercado</Text>
          <View className="mt-3 gap-2">
            {recommendation.market.products.length > 0 ? (
              recommendation.market.products.map((product) => (
                <View key={`${recommendation.market.id}-${product.productName}`} className="flex-row justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-bold text-ink">{product.productName}</Text>
                    <Text className="text-xs text-muted">{product.unit}</Text>
                  </View>
                  <Text className="text-sm font-extrabold text-success">{formatCurrency(product.price)}</Text>
                </View>
              ))
            ) : (
              <Text className="text-sm text-muted">Nenhum produto da lista foi encontrado neste mercado.</Text>
            )}
          </View>
        </View>
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

function ListIcon({ isActive }: { isActive: boolean }) {
  return (
    <View className="h-5 w-5 justify-center gap-1">
      <View className={`h-0.5 rounded-full ${isActive ? 'bg-white' : 'bg-secondary'}`} />
      <View className={`h-0.5 rounded-full ${isActive ? 'bg-white' : 'bg-secondary'}`} />
      <View className={`h-0.5 rounded-full ${isActive ? 'bg-white' : 'bg-secondary'}`} />
    </View>
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
