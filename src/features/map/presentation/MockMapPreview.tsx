import { Text, View } from 'react-native';

import { GeoLocation, Market } from '@/shared/types/entities';
import { formatDistance } from '@/shared/utils/formatters';

export function MockMapPreview({ currentLocation, markets }: { currentLocation: GeoLocation; markets: Market[] }) {
  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <Text className="text-base font-bold text-ink">Rota mockada por posicao atual</Text>
      <View className="mt-4 h-44 overflow-hidden rounded-lg bg-slate-100">
        <View className="absolute left-1/2 top-1/2 h-5 w-5 rounded-full bg-ink" />
        <View className="absolute left-10 top-8 h-4 w-4 rounded-full bg-primary" />
        <View className="absolute right-12 top-14 h-3 w-3 rounded-full bg-secondary" />
        <View className="absolute bottom-10 left-24 h-3 w-3 rounded-full bg-accent" />
        <View className="absolute bottom-8 right-20 h-4 w-4 rounded-full bg-red-500" />
        <View className="absolute left-6 right-6 top-20 h-1 rotate-6 rounded-full bg-slate-300" />
        <View className="absolute bottom-16 left-12 right-14 h-1 -rotate-12 rounded-full bg-slate-300" />
      </View>
      <Text className="mt-3 text-sm text-muted">
        {currentLocation.label}. Distancias simulam a rota que viria de um servico como Google Maps.
      </Text>
      {markets.slice(0, 3).map((market) => (
        <Text key={market.id} className="mt-2 text-xs text-slate-600">
          {market.name}: {formatDistance(market.distanceKm)}
        </Text>
      ))}
    </View>
  );
}
