import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Recommendation } from '@/shared/types/entities';
import { formatCurrency, formatDistance } from '@/shared/utils/formatters';

export function RecommendationCard({
  isSelected = false,
  recommendation,
  onSelectRecommendation,
}: {
  isSelected?: boolean;
  recommendation: Recommendation;
  onSelectRecommendation?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(recommendation.isBest);
  const [isProductListVisible, setIsProductListVisible] = useState(false);
  const hasMissingProducts = recommendation.missingProducts.length > 0;
  const hasRouteImpacts = recommendation.routeConditions.length > 0 || recommendation.routeImpactCost > 0;

  return (
    <Pressable
      className={`rounded-2xl border p-5 ${
        isSelected ? 'border-secondary bg-white' : recommendation.isBest ? 'border-primary bg-white' : 'border-line bg-white'
      }`}
      onPress={() => {
        onSelectRecommendation?.();
        setIsExpanded((current) => !current);
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-extrabold leading-6 text-ink">{recommendation.market.name}</Text>
          <Text className="mt-1 text-xs font-semibold uppercase text-muted">
            {recommendation.market.type} - {formatDistance(recommendation.market.distanceKm)}
          </Text>
        </View>
        <View className="items-end gap-2">
          {recommendation.isBest ? (
            <Text className="rounded-full bg-success px-3 py-1 text-xs font-bold text-white">Melhor opcao</Text>
          ) : null}
          {isSelected && !recommendation.isBest ? (
            <Text className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white">Rota selecionada</Text>
          ) : null}
        </View>
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
              setIsProductListVisible(true);
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
        {hasRouteImpacts ? (
          <Row
            label="Impactos na rota"
            value={`+${Math.round(recommendation.routeImpactPercent * 100)}% (${formatCurrency(recommendation.routeImpactCost)})`}
          />
        ) : null}
        <View className="h-px bg-line" />
        {!recommendation.isBest ? <Row label="Diferenca para o melhor" value={formatCurrency(recommendation.estimatedSavings)} /> : null}
        {recommendation.routeConditions.length > 0 ? (
          <View className="mt-2 gap-2">
            {recommendation.routeConditions.map((condition) => (
              <View key={`${condition.type}-${condition.label}`} className="rounded-xl bg-amber-50 p-3">
                <Text className="text-xs font-extrabold text-amber-900">
                  {condition.label}: +{Math.round(condition.impactPercent * 100)}%
                </Text>
                <Text className="mt-1 text-xs text-amber-800">{condition.description}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {!isSelected ? (
          <Pressable
            className="mt-2 min-h-12 items-center justify-center rounded-xl bg-secondary px-4 active:opacity-80"
            onPress={(event) => {
              event.stopPropagation();
              onSelectRecommendation?.();
            }}
          >
            <Text className="text-sm font-extrabold text-white">Usar esta rota</Text>
          </Pressable>
        ) : null}
      </View> : null}

      <MarketProductsModal
        isSelected={isSelected}
        onSelectRecommendation={onSelectRecommendation}
        recommendation={recommendation}
        visible={isProductListVisible}
        onClose={() => setIsProductListVisible(false)}
      />

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

function MarketProductsModal({
  isSelected,
  onSelectRecommendation,
  recommendation,
  visible,
  onClose,
}: {
  isSelected: boolean;
  onSelectRecommendation?: () => void;
  recommendation: Recommendation;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/45">
        <View className="max-h-[82%] rounded-t-3xl bg-sand p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-extrabold text-ink">Produtos encontrados</Text>
              <Text className="mt-1 text-sm font-semibold text-muted">{recommendation.market.name}</Text>
              <Text className="mt-1 text-xs text-muted">
                {recommendation.market.neighborhood}, {recommendation.market.city}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar lista de produtos"
              className="h-11 w-11 items-center justify-center rounded-xl bg-primary active:opacity-80"
              onPress={onClose}
            >
              <Text className="text-lg font-extrabold text-white">X</Text>
            </Pressable>
          </View>

          <View className="mt-4 rounded-2xl border border-line bg-white p-4">
            <Row label="Total dos produtos" value={formatCurrency(recommendation.productsTotal)} isStrong />
            <View className="mt-3 h-px bg-line" />
            <Row label="Total final" value={formatCurrency(recommendation.finalTotal)} isStrong />
            {recommendation.routeImpactCost > 0 ? (
              <>
                <View className="mt-3 h-px bg-line" />
                <Row
                  label="Impactos na rota"
                  value={`+${Math.round(recommendation.routeImpactPercent * 100)}% (${formatCurrency(recommendation.routeImpactCost)})`}
                />
              </>
            ) : null}
          </View>

          {!isSelected ? (
            <Pressable
              className="mt-4 min-h-12 items-center justify-center rounded-xl bg-secondary px-4 active:opacity-80"
              onPress={() => {
                onSelectRecommendation?.();
                onClose();
              }}
            >
              <Text className="text-sm font-extrabold text-white">Usar esta rota</Text>
            </Pressable>
          ) : (
            <View className="mt-4 min-h-12 items-center justify-center rounded-xl bg-green-50 px-4">
              <Text className="text-sm font-extrabold text-success">Esta rota esta selecionada</Text>
            </View>
          )}

          <ScrollView className="mt-4" contentContainerClassName="gap-3 pb-6">
            {recommendation.market.products.length > 0 ? (
              recommendation.market.products.map((product) => (
                <View key={`${recommendation.market.id}-${product.productName}`} className="rounded-2xl border border-line bg-white p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                      <Text className="text-base font-extrabold text-ink">{product.productName}</Text>
                      <Text className="mt-1 text-xs font-semibold uppercase text-muted">{product.unit}</Text>
                    </View>
                    <Text className="text-lg font-extrabold text-success">{formatCurrency(product.price)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="rounded-2xl border border-line bg-white p-4">
                <Text className="text-center text-sm font-semibold text-muted">
                  Nenhum produto da lista foi encontrado neste mercado.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
