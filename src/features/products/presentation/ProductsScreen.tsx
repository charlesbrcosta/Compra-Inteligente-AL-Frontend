import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';
import { Loading } from '@/shared/components/Loading';
import { ProductCard } from '@/shared/components/ProductCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ApiSefazRepository } from '@/features/sefaz/infrastructure/ApiSefazRepository';
import { createId } from '@/shared/utils/id';
import { SefazProductPrice, ShoppingProduct, UnitType } from '@/shared/types/entities';
import { formatCurrency } from '@/shared/utils/formatters';
import { ProductFormData, productSchema } from '@/features/products/presentation/productSchemas';
import { useProductStore } from '@/features/products/store/productStore';

const sefazRepository = new ApiSefazRepository();

export function ProductsScreen() {
  const { products, addProduct, updateProduct, removeProduct, loadProducts, clearError, error, isLoading, isSaving } =
    useProductStore();
  const [editingProduct, setEditingProduct] = useState<ShoppingProduct | null>(null);
  const [sefazError, setSefazError] = useState<string | null>(null);
  const [sefazProducts, setSefazProducts] = useState<SefazProductPrice[]>([]);
  const [isSefazLoading, setIsSefazLoading] = useState(false);
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

    try {
      if (editingProduct) {
        await updateProduct(product);
      } else {
        await addProduct(product);
      }

      setEditingProduct(null);
      form.reset({ name: '', quantity: 1, unit: 'un' });
    } catch {
      // The store keeps the user-facing error message.
    }
  });

  const startEdit = (product: ShoppingProduct) => {
    setEditingProduct(product);
    form.reset({ name: product.name, quantity: product.quantity, unit: product.unit });
  };

  const confirmRemove = (product: ShoppingProduct) => {
    Alert.alert('Remover produto', `Deseja remover ${product.name} da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeProduct(product.id).catch(() => undefined) },
    ]);
  };

  const searchSefazProducts = async () => {
    const name = form.getValues('name');

    if (name.trim().length < 2) {
      setSefazError('Informe o nome do produto para consultar a SEFAZ.');
      return;
    }

    try {
      setSefazError(null);
      setIsSefazLoading(true);
      const data = await sefazRepository.searchProducts(name);
      setSefazProducts(data.products);
    } catch {
      setSefazError('Nao foi possivel consultar produtos na SEFAZ agora.');
    } finally {
      setIsSefazLoading(false);
    }
  };

  const addSefazProductToList = async (sefazProduct: SefazProductPrice) => {
    const name = normalizeSefazProductName(sefazProduct);
    const unit = normalizeSefazUnit(sefazProduct.unit);
    const alreadyExists = products.some((product) => normalizeText(product.name) === normalizeText(name));

    if (alreadyExists) {
      Alert.alert('Produto ja cadastrado', `${name} ja esta na sua lista de compras.`);
      return;
    }

    try {
      await addProduct({
        id: createId(),
        name,
        quantity: 1,
        unit,
      });
      Alert.alert('Produto adicionado', `${name} foi adicionado a sua lista.`);
    } catch {
      // The store keeps the user-facing error message.
    }
  };

  if (isLoading && products.length === 0) {
    return <Loading label="Carregando produtos" />;
  }

  return (
    <ScreenContainer>
        <Header title="Lista de compras" subtitle="Informe quantidade e unidade para comparar os mercados mockados." />
        {error ? (
          <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-sm font-semibold text-red-700">{error}</Text>
              <Text className="text-sm font-bold text-red-700" onPress={clearError}>
                Fechar
              </Text>
            </View>
          </View>
        ) : null}
        <Card className="gap-4">
          {editingProduct ? (
            <View className="rounded-lg border border-teal-200 bg-teal-50 p-3">
              <Text className="text-sm font-bold text-teal-900">Editando produto</Text>
              <Text className="mt-1 text-xs text-teal-800">{editingProduct.name}</Text>
            </View>
          ) : null}
          <Controller control={form.control} name="name" render={({ field, fieldState }) => <Input label="Produto" placeholder="Ex: Arroz parboilizado" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
          <View className="gap-3 sm:flex-row">
            <View className="flex-1">
              <Controller control={form.control} name="quantity" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Quantidade" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            </View>
            <View className="flex-1">
              <Controller control={form.control} name="unit" render={({ field, fieldState }) => <Input autoCapitalize="none" label="Unidade" placeholder="kg, un, l" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            </View>
          </View>
          <Button
            isLoading={isSaving}
            title={editingProduct ? 'Salvar alteracoes' : 'Adicionar produto'}
            onPress={submit}
          />
          <Button
            isLoading={isSefazLoading}
            title="Consultar precos reais na SEFAZ"
            variant="secondary"
            onPress={searchSefazProducts}
          />
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

        {sefazError ? (
          <View className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <Text className="text-sm font-semibold text-red-700">{sefazError}</Text>
          </View>
        ) : null}

        {sefazProducts.length > 0 ? (
          <View className="mt-5 gap-3">
            <Text className="text-lg font-bold text-ink">Precos reais da SEFAZ</Text>
            {sefazProducts.slice(0, 8).map((product) => (
              <View key={`${product.cnpj}-${product.productName}-${product.saleDate}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <View className="gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-bold text-ink">{product.productName}</Text>
                    <Text className="mt-1 text-sm text-muted">{product.marketName}</Text>
                    <Text className="mt-1 text-xs text-slate-600">
                      {product.neighborhood}, {product.city}
                    </Text>
                  </View>
                  <View className="items-stretch gap-2 sm:items-end">
                    <Text className="text-lg font-bold text-primary">{formatCurrency(product.price)}</Text>
                    <Button
                      title="Adicionar a lista"
                      variant="secondary"
                      isLoading={isSaving}
                      onPress={() => addSefazProductToList(product)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          <Text className="text-lg font-bold text-ink">Produtos cadastrados</Text>
          {products.length === 0 ? (
            <EmptyState title="Sua lista esta vazia" description="Adicione itens para calcular o melhor mercado." />
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => startEdit(product)}
                onRemove={() => confirmRemove(product)}
              />
            ))
          )}
        </View>
    </ScreenContainer>
  );
}

function normalizeSefazProductName(product: SefazProductPrice) {
  return (product.sefazDescription || product.productName).trim();
}

function normalizeSefazUnit(unit: string): UnitType {
  const normalizedUnit = unit.toLowerCase().trim();

  if (normalizedUnit.includes('kg')) {
    return 'kg';
  }

  if (normalizedUnit === 'g' || normalizedUnit.includes('grama')) {
    return 'g';
  }

  if (normalizedUnit === 'l' || normalizedUnit.includes('litro')) {
    return 'l';
  }

  if (normalizedUnit === 'ml') {
    return 'ml';
  }

  if (normalizedUnit.includes('pacote') || normalizedUnit === 'pct') {
    return 'pct';
  }

  if (normalizedUnit.includes('caixa') || normalizedUnit === 'cx') {
    return 'cx';
  }

  return 'un';
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
