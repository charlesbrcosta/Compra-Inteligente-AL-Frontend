import { Pressable, Text, View } from 'react-native';

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
            <Text className="text-xl font-extrabold text-success">✎</Text>
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 active:opacity-80" onPress={onRemove}>
            <TrashIcon />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function TrashIcon() {
  return (
    <View className="items-center">
      <View className="mb-0.5 h-0.5 w-4 rounded-full bg-red-700" />
      <View className="h-4 w-3 rounded-sm border-2 border-red-700" />
    </View>
  );
}
