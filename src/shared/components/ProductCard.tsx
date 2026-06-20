import { Pressable, Text, View } from 'react-native';

import { CheckboxSymbol, PencilLeftSymbol } from '@/shared/components/IconSymbols';
import { ShoppingProduct } from '@/shared/types/entities';

interface ProductCardProps {
  isSelected: boolean;
  product: ShoppingProduct;
  onEdit: () => void;
  onToggleSelect: () => void;
}

export function ProductCard({ isSelected, product, onEdit, onToggleSelect }: ProductCardProps) {
  return (
    <View className={`rounded-2xl border p-4 ${isSelected ? 'border-success bg-green-50' : 'border-line bg-white'}`}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-extrabold text-ink">{product.name}</Text>
          <Text className="mt-1 text-sm font-semibold text-muted">
            {product.quantity} {product.unit}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable className="h-8 w-8 items-center justify-center rounded-lg border border-line bg-white active:opacity-80" onPress={onEdit}>
            <PencilLeftSymbol />
          </Pressable>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            className="h-8 w-8 items-center justify-center rounded-lg border border-line bg-white active:opacity-80"
            onPress={onToggleSelect}
          >
            <CheckboxSymbol isChecked={isSelected} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
