import { Text, View } from 'react-native';

import { Market } from '@/shared/types/entities';
import { formatDistance } from '@/shared/utils/formatters';

export function MarketCard({ market }: { market: Market }) {
  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-base font-semibold text-ink">{market.name}</Text>
        <Text className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase text-primary">{market.type}</Text>
      </View>
      <Text className="mt-2 text-sm text-muted">{market.address}</Text>
      <Text className="mt-2 text-sm font-semibold text-slate-700">{formatDistance(market.distanceKm)} de distancia</Text>
    </View>
  );
}
