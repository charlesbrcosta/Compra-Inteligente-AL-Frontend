import { Text, View } from 'react-native';

import { Market } from '@/shared/types/entities';
import { formatDistance } from '@/shared/utils/formatters';

export function MarketCard({ market }: { market: Market }) {
  return (
    <View className="rounded-2xl border border-line bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-green-50">
          <Text className="text-lg font-extrabold text-success">M</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-extrabold text-ink">{market.name}</Text>
          <Text className="mt-1 text-base text-muted">{market.neighborhood}, {market.city}</Text>
        </View>
        <Text className="text-sm font-extrabold text-primary">{formatDistance(market.distanceKm)}</Text>
      </View>
      <Text className="mt-3 text-base leading-6 text-muted">{market.address}</Text>
    </View>
  );
}
