import { Pressable, Text, View } from 'react-native';

import { ShoppingProduct } from '@/shared/types/entities';

interface ProductCardProps {
  product: ShoppingProduct;
  onEdit: () => void;
  onRemove: () => void;
}

export function ProductCard({ product, onEdit, onRemove }: ProductCardProps) {
  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink">{product.name}</Text>
          <Text className="mt-1 text-sm text-muted">
            {product.quantity} {product.unit}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable className="rounded-lg bg-slate-100 px-3 py-2 active:opacity-80" onPress={onEdit}>
            <Text className="text-sm font-semibold text-ink">Editar</Text>
          </Pressable>
          <Pressable className="rounded-lg bg-red-50 px-3 py-2 active:opacity-80" onPress={onRemove}>
            <Text className="text-sm font-semibold text-red-700">Remover</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
