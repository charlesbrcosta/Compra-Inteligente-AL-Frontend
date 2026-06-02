import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';
import { ProductCard } from '@/shared/components/ProductCard';
import { createId } from '@/shared/utils/id';
import { ShoppingProduct } from '@/shared/types/entities';
import { ProductFormData, productSchema } from '@/features/products/presentation/productSchemas';
import { useProductStore } from '@/features/products/store/productStore';

export function ProductsScreen() {
  const { products, addProduct, updateProduct, removeProduct, loadProducts } = useProductStore();
  const [editingProduct, setEditingProduct] = useState<ShoppingProduct | null>(null);
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', quantity: 1, unit: 'un' },
  });

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const submit = form.handleSubmit(async (data) => {
    const product = {
      id: editingProduct?.id ?? createId(),
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
    };

    if (editingProduct) {
      await updateProduct(product);
    } else {
      await addProduct(product);
    }

    setEditingProduct(null);
    form.reset({ name: '', quantity: 1, unit: 'un' });
  });

  const startEdit = (product: ShoppingProduct) => {
    setEditingProduct(product);
    form.reset({ name: product.name, quantity: product.quantity, unit: product.unit });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="p-5 pb-8">
        <Header title="Lista de compras" subtitle="Informe quantidade e unidade para comparar os mercados mockados." />
        <Card className="gap-4">
          <Controller control={form.control} name="name" render={({ field, fieldState }) => <Input label="Produto" placeholder="Ex: Arroz parboilizado" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller control={form.control} name="quantity" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Quantidade" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            </View>
            <View className="flex-1">
              <Controller control={form.control} name="unit" render={({ field, fieldState }) => <Input autoCapitalize="none" label="Unidade" placeholder="kg, un, l" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            </View>
          </View>
          <Button title={editingProduct ? 'Salvar alteracoes' : 'Adicionar produto'} onPress={submit} />
          {editingProduct ? (
            <Button
              title="Cancelar edicao"
              variant="ghost"
              onPress={() => {
                setEditingProduct(null);
                form.reset({ name: '', quantity: 1, unit: 'un' });
              }}
            />
          ) : null}
        </Card>

        <View className="mt-5 gap-3">
          <Text className="text-lg font-bold text-ink">Produtos cadastrados</Text>
          {products.length === 0 ? (
            <EmptyState title="Sua lista esta vazia" description="Adicione itens para calcular o melhor mercado." />
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} onEdit={() => startEdit(product)} onRemove={() => removeProduct(product.id)} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
