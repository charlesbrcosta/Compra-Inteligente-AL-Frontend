import { Text, View } from 'react-native';

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  const sizeClass = compact ? 'h-10 w-10 rounded-xl' : 'h-14 w-14 rounded-2xl';
  const bagClass = compact ? 'h-5 w-5 rounded-md' : 'h-7 w-7 rounded-lg';
  const lensClass = compact ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <View className={`${sizeClass} items-center justify-center bg-primary`}>
      <View className={`${bagClass} border-2 border-white`}>
        <View className="absolute -top-2 left-1/2 h-3 w-4 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-white" />
      </View>
      <View className={`absolute bottom-1.5 right-1.5 ${lensClass} rounded-full border-2 border-white bg-success`} />
    </View>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const wordClass = compact ? 'text-xl leading-6' : 'text-xl leading-6';
  const badgeClass = compact ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <View className="flex-row items-center gap-3">
      <BrandMark compact={compact} />
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-x-1">
          <Text className={`${wordClass} font-extrabold text-ink`}>Compra</Text>
          <Text className={`${wordClass} font-extrabold text-primary`}>Inteligente</Text>
          <Text className={`rounded-md bg-success font-extrabold text-white ${badgeClass}`}>AL</Text>
        </View>
      </View>
    </View>
  );
}
