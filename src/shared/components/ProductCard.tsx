import { Pressable, Text, View } from 'react-native';

import { PencilLeftSymbol, TrashSymbol } from '@/shared/components/IconSymbols';
import { ShoppingProduct } from '@/shared/types/entities';

interface ProductCardProps {
  product: ShoppingProduct;
  onEdit: () => void;
  onRemove: () => void;
}

export function ProductCard({ product, onEdit, onRemove }: ProductCardProps) {
  return (
    <View className="rounded-2xl border border-line bg-white p-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-extrabold text-ink">{product.name}</Text>
          <Text className="mt-1 text-sm font-semibold text-muted">
            {product.quantity} {product.unit}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable className="h-10 w-10 items-center justify-center rounded-xl bg-green-50 active:opacity-80" onPress={onEdit}>
            <PencilLeftSymbol />
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 active:opacity-80" onPress={onRemove}>
            <TrashSymbol />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
