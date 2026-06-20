import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { Header } from '@/shared/components/Header';
import { TrashSymbol } from '@/shared/components/IconSymbols';
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
  const [dismissedSefazProducts, setDismissedSefazProducts] = useState<string[]>([]);
  const [isSefazModalVisible, setIsSefazModalVisible] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<SefazProductPrice | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [isSefazLoading, setIsSefazLoading] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [pendingSefazProductKeys, setPendingSefazProductKeys] = useState<string[]>([]);
  const [productFilter, setProductFilter] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const scrollViewRef = useRef<ScrollView>(null);
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', quantity: 1, unit: 'un' },
  });

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const reloadScreen = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setSelectedProductIds((current) => current.filter((id) => products.some((product) => product.id === id)));
  }, [products]);

  const submit = form.handleSubmit(async (data) => {
    if (isSubmittingProduct || isSaving) {
      return;
    }

    const product = {
      id: editingProduct?.id ?? createId(),
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
    };

    try {
      setIsSubmittingProduct(true);
      if (editingProduct) {
        await updateProduct(product);
      } else {
        await addProduct(product);
      }

      setEditingProduct(null);
      form.reset({ name: '', quantity: 1, unit: 'un' });
    } catch {
      // The store keeps the user-facing error message.
    } finally {
      setIsSubmittingProduct(false);
    }
  });

  const startEdit = (product: ShoppingProduct) => {
    setEditingProduct(product);
    form.reset({ name: product.name, quantity: product.quantity, unit: product.unit });
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const filteredProducts = products.filter((product) => normalizeText(product.name).includes(normalizeText(productFilter)));
  const filteredProductIds = filteredProducts.map((product) => product.id);
  const isEveryFilteredProductSelected =
    filteredProductIds.length > 0 && filteredProductIds.every((id) => selectedProductIds.includes(id));

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };

  const toggleFilteredProductsSelection = () => {
    setSelectedProductIds((current) => {
      if (isEveryFilteredProductSelected) {
        return current.filter((id) => !filteredProductIds.includes(id));
      }

      return Array.from(new Set([...current, ...filteredProductIds]));
    });
  };

  const confirmRemoveSelectedProducts = () => {
    if (selectedProductIds.length === 0) {
      return;
    }

    Alert.alert('Remover produtos', `Deseja remover ${selectedProductIds.length} produto(s) selecionado(s)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(selectedProductIds.map((productId) => removeProduct(productId).catch(() => undefined)));
          setSelectedProductIds([]);
        },
      },
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
      setDismissedSefazProducts([]);
      setIsSefazModalVisible(true);
    } catch {
      setSefazError('Nao foi possivel consultar produtos na SEFAZ agora.');
    } finally {
      setIsSefazLoading(false);
    }
  };

  const addSefazProductToList = async (sefazProduct: SefazProductPrice) => {
    const productKey = getSefazProductKey(sefazProduct);

    if (pendingSefazProductKeys.includes(productKey) || isSaving) {
      return;
    }

    const name = normalizeSefazProductName(sefazProduct);
    const unit = normalizeSefazUnit(sefazProduct.unit);
    const alreadyExists = products.some((product) => normalizeText(product.name) === normalizeText(name));

    if (alreadyExists) {
      Alert.alert('Produto ja cadastrado', `${name} ja esta na sua lista de compras.`);
      return;
    }

    try {
      setPendingSefazProductKeys((current) => [...current, productKey]);
      await addProduct({
        id: createId(),
        name,
        quantity: 1,
        unit,
      });
      setDismissedSefazProducts((current) => [...current, productKey]);
      Alert.alert('Produto adicionado', `${name} foi adicionado a sua lista.`);
    } catch {
      // The store keeps the user-facing error message.
    } finally {
      setPendingSefazProductKeys((current) => current.filter((key) => key !== productKey));
    }
  };

  const dismissSefazProduct = (sefazProduct: SefazProductPrice) => {
    setDismissedSefazProducts((current) => [...current, getSefazProductKey(sefazProduct)]);
  };

  const openScanner = async () => {
    setBarcodeError(null);
    setBarcodeProduct(null);
    setScannedBarcode(null);

    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();

      if (!permission.granted) {
        setBarcodeError('Permita o uso da camera para escanear o codigo de barras.');
        setIsScannerVisible(true);
        return;
      }
    }

    setIsScannerVisible(true);
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (isBarcodeLoading || scannedBarcode) {
      return;
    }

    setScannedBarcode(data);
    lookupBarcode(data);
  };

  const lookupBarcode = async (code: string) => {
    try {
      setBarcodeError(null);
      setBarcodeProduct(null);
      setIsBarcodeLoading(true);
      const data = await sefazRepository.searchProductByBarcode(code);

      if (!data.product) {
        setBarcodeError('A SEFAZ nao retornou produto com preco real valido para este codigo.');
        return;
      }

      setBarcodeProduct(data.product);
    } catch {
      setBarcodeError('Nao foi possivel consultar este codigo de barras na SEFAZ agora.');
    } finally {
      setIsBarcodeLoading(false);
    }
  };

  const closeScanner = () => {
    setIsScannerVisible(false);
    setScannedBarcode(null);
    setBarcodeProduct(null);
    setBarcodeError(null);
    setIsBarcodeLoading(false);
  };

  if (isLoading && products.length === 0) {
    return <Loading label="Carregando produtos" />;
  }

  return (
    <ScreenContainer onRefresh={reloadScreen} scrollViewRef={scrollViewRef}>
        <Header title="Lista de compras" subtitle="Informe quantidade e unidade para consultar produtos reais na SEFAZ." />
        {error ? (
          <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-sm font-semibold text-red-700">{error}</Text>
              <Text className="text-sm font-bold text-red-700" onPress={clearError}>
                Fechar
              </Text>
            </View>
          </View>
        ) : null}
        <Card className="gap-4">
          <Text className="text-xs font-extrabold uppercase tracking-wide text-muted">
            {editingProduct ? 'Editar item' : 'Adicionar item'}
          </Text>
          {editingProduct ? (
            <View className="rounded-2xl border border-green-100 bg-green-50 p-3">
              <Text className="text-sm font-bold text-green-900">Editando produto</Text>
              <Text className="mt-1 text-xs text-green-800">{editingProduct.name}</Text>
            </View>
          ) : null}
          <View className="flex-row items-end gap-2">
            <View className="min-w-0 flex-1">
              <Controller control={form.control} name="name" render={({ field, fieldState }) => <Input label="Produto" placeholder="Ex: Arroz parboilizado" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            </View>
            <Pressable
              accessibilityLabel="Escanear produto"
              className="h-14 w-14 items-center justify-center rounded-xl bg-secondary active:opacity-80"
              onPress={openScanner}
            >
              <BarcodeIcon />
            </Pressable>
          </View>
          <View className="gap-3 sm:flex-row">
            <View className="flex-1">
              <Controller control={form.control} name="quantity" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Quantidade" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            </View>
            <View className="flex-1">
              <Controller control={form.control} name="unit" render={({ field, fieldState }) => <Input autoCapitalize="none" label="Unidade" placeholder="kg, un, l" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            </View>
          </View>
          <Button
            isLoading={isSaving || isSubmittingProduct}
            title={editingProduct ? 'Salvar alteracoes' : 'Adicionar produto'}
            variant="success"
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
          <View className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm font-semibold text-red-700">{sefazError}</Text>
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          <Text className="text-xl font-extrabold text-ink">Sua lista ({products.length} itens)</Text>
          {products.length > 0 ? (
            <View className="gap-3 rounded-2xl border border-line bg-white p-4">
              <Input
                label="Filtrar produtos"
                onChangeText={setProductFilter}
                placeholder="Buscar na sua lista"
                value={productFilter}
              />
              <View className="gap-2 sm:flex-row">
                <Pressable
                  className="min-h-12 flex-1 items-center justify-center rounded-xl border border-line bg-white px-4 active:opacity-80"
                  disabled={filteredProducts.length === 0}
                  onPress={toggleFilteredProductsSelection}
                >
                  <Text className="text-center text-sm font-bold text-ink">
                    {isEveryFilteredProductSelected ? 'Limpar selecao filtrada' : 'Selecionar filtrados'}
                  </Text>
                </Pressable>
                {selectedProductIds.length > 0 ? (
                  <Button
                    isLoading={isSaving}
                    title={`Excluir selecionados (${selectedProductIds.length})`}
                    variant="danger"
                    onPress={confirmRemoveSelectedProducts}
                  />
                ) : (
                  <View className="min-h-12 items-center justify-center rounded-xl bg-sand px-4">
                    <Text className="text-center text-sm font-bold text-muted">Selecione para excluir</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null}
          {products.length === 0 ? (
            <EmptyState title="Sua lista esta vazia" description="Adicione itens para calcular o melhor mercado." />
          ) : filteredProducts.length === 0 ? (
            <EmptyState title="Nenhum produto encontrado" description="Ajuste o filtro para visualizar outros itens da sua lista." />
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                isSelected={selectedProductIds.includes(product.id)}
                product={product}
                onEdit={() => startEdit(product)}
                onToggleSelect={() => toggleProductSelection(product.id)}
              />
            ))
          )}
        </View>
        <SefazResultsModal
          dismissedProductKeys={dismissedSefazProducts}
          isSaving={isSaving}
          pendingProductKeys={pendingSefazProductKeys}
          products={sefazProducts}
          visible={isSefazModalVisible}
          onAdd={addSefazProductToList}
          onDismissProduct={dismissSefazProduct}
          onClose={() => setIsSefazModalVisible(false)}
        />
        <BarcodeScannerModal
          barcode={scannedBarcode}
          error={barcodeError}
          isLoading={isBarcodeLoading}
          permissionGranted={Boolean(cameraPermission?.granted)}
          product={barcodeProduct}
          visible={isScannerVisible}
          isAddingProduct={barcodeProduct ? pendingSefazProductKeys.includes(getSefazProductKey(barcodeProduct)) || isSaving : false}
          onAdd={async (product) => {
            await addSefazProductToList(product);
            closeScanner();
          }}
          onClose={closeScanner}
          onRequestPermission={requestCameraPermission}
          onScan={handleBarcodeScanned}
          onScanAgain={() => {
            setScannedBarcode(null);
            setBarcodeProduct(null);
            setBarcodeError(null);
          }}
        />
    </ScreenContainer>
  );
}

function SefazResultsModal({
  dismissedProductKeys,
  isSaving,
  pendingProductKeys,
  products,
  visible,
  onAdd,
  onClose,
  onDismissProduct,
}: {
  dismissedProductKeys: string[];
  isSaving: boolean;
  pendingProductKeys: string[];
  products: SefazProductPrice[];
  visible: boolean;
  onAdd: (product: SefazProductPrice) => void;
  onClose: () => void;
  onDismissProduct: (product: SefazProductPrice) => void;
}) {
  const visibleProducts = products
    .filter((product) => !dismissedProductKeys.includes(getSefazProductKey(product)))
    .slice(0, 12);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/45">
        <View className="max-h-[86%] rounded-t-3xl bg-sand p-5">
          <View className="mb-4 flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className="text-2xl font-extrabold text-ink">Produtos encontrados</Text>
              <Text className="mt-1 text-sm text-muted">Toque em V para adicionar ou na lixeira para remover da selecao.</Text>
            </View>
            <Pressable className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-white" onPress={onClose}>
              <Text className="text-lg font-extrabold text-ink">X</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-3 pb-6">
            {visibleProducts.length === 0 ? (
              <Text className="rounded-2xl border border-line bg-white p-4 text-center text-sm text-muted">
                Nenhum produto pendente nesta consulta.
              </Text>
            ) : (
              visibleProducts.map((product) => (
                <SefazProductResultCard
                  key={getSefazProductKey(product)}
                  isSaving={isSaving || pendingProductKeys.includes(getSefazProductKey(product))}
                  product={product}
                  onAdd={() => onAdd(product)}
                  onDismiss={() => onDismissProduct(product)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function BarcodeScannerModal({
  barcode,
  error,
  isAddingProduct,
  isLoading,
  permissionGranted,
  product,
  visible,
  onAdd,
  onClose,
  onRequestPermission,
  onScan,
  onScanAgain,
}: {
  barcode: string | null;
  error: string | null;
  isAddingProduct: boolean;
  isLoading: boolean;
  permissionGranted: boolean;
  product: SefazProductPrice | null;
  visible: boolean;
  onAdd: (product: SefazProductPrice) => void;
  onClose: () => void;
  onRequestPermission: () => void;
  onScan: (result: BarcodeScanningResult) => void;
  onScanAgain: () => void;
}) {
  const scanLinePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || barcode) {
      scanLinePosition.stopAnimation();
      scanLinePosition.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [barcode, scanLinePosition, visible]);

  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 164],
  });

  return (
    <Modal animationType="slide" presentationStyle="fullScreen" statusBarTranslucent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-[#0B0F0E]">
        {permissionGranted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={barcode ? undefined : onScan}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
          />
        ) : (
          <ScanFallback />
        )}

        <View className="absolute inset-0 z-10 bg-black/20 px-5 pb-8 pt-10" style={styles.scanOverlay}>
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Fechar scanner"
              className="h-11 w-11 items-center justify-center rounded-full bg-white/25 active:opacity-80"
              hitSlop={12}
              onPress={onClose}
            >
              <Text className="text-xl font-extrabold text-white">X</Text>
            </Pressable>
            <Text className="text-base font-extrabold text-white">Escanear produto</Text>
            <View className="h-10 w-10" />
          </View>

          <View className="flex-1 items-center justify-center">
            <View className={`h-44 w-72 ${barcode ? 'opacity-45' : 'opacity-100'}`}>
              <ScanCorner className="left-0 top-0 rounded-tl-xl border-b-0 border-r-0" />
              <ScanCorner className="right-0 top-0 rounded-tr-xl border-b-0 border-l-0" />
              <ScanCorner className="bottom-0 left-0 rounded-bl-xl border-r-0 border-t-0" />
              <ScanCorner className="bottom-0 right-0 rounded-br-xl border-l-0 border-t-0" />
              <Animated.View
                className="absolute left-2 right-2 h-0.5 rounded-full bg-success"
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            </View>

            <Text className="mt-8 max-w-64 text-center text-sm font-semibold leading-5 text-white/85">
              {barcode ? 'Codigo lido. Consultando produto na SEFAZ.' : 'Aponte a camera para o codigo de barras do produto'}
            </Text>
          </View>
        </View>

        {!permissionGranted ? (
          <View className="absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-white p-6" style={styles.scanPanel}>
            <Text className="text-center text-lg font-extrabold text-ink">Camera sem permissao</Text>
            <Text className="mt-2 text-center text-sm leading-5 text-muted">
              Autorize a camera para ler o codigo de barras do produto.
            </Text>
            <View className="mt-4">
              <Button title="Permitir camera" variant="secondary" onPress={onRequestPermission} />
            </View>
          </View>
        ) : null}

        {barcode || isLoading || error || product ? (
          <View className="absolute bottom-0 left-0 right-0 z-20 rounded-t-3xl bg-white p-6" style={styles.scanPanel}>
            {barcode ? <Text className="text-center text-xs font-bold uppercase tracking-wide text-muted">Codigo lido: {barcode}</Text> : null}
            {isLoading ? <Text className="mt-2 text-center text-base font-extrabold text-ink">Consultando SEFAZ...</Text> : null}
            {error ? <Text className="mt-2 text-center text-sm font-bold text-red-700">{error}</Text> : null}
            {product ? (
              <>
                <Text className="mt-2 text-center text-lg font-extrabold text-ink">{normalizeSefazProductName(product)}</Text>
                <Text className="mt-1 text-center text-sm text-muted">{product.marketName}</Text>
                <Text className="mt-2 text-center text-2xl font-extrabold text-success">{formatCurrency(product.price)}</Text>
                <View className="mt-4">
                  <Button isLoading={isAddingProduct} title="Adicionar a lista" variant="success" onPress={() => onAdd(product)} />
                </View>
              </>
            ) : null}
            <View className="mt-2">
              <Button title="Escanear de novo" variant="ghost" onPress={onScanAgain} />
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function ScanFallback() {
  return (
    <View className="absolute inset-0 bg-[#0B0F0E]">
      <View className="absolute left-8 top-24 h-px w-72 bg-white/10" />
      <View className="absolute left-10 top-44 h-px w-64 bg-white/10" />
      <View className="absolute bottom-48 left-5 h-px w-80 bg-white/10" />
      <View className="absolute left-16 top-16 h-96 w-px bg-white/10" />
      <View className="absolute right-16 top-20 h-96 w-px bg-white/10" />
      <View className="absolute left-1/4 top-1/3 h-60 w-60 rounded-full bg-white/5" />
    </View>
  );
}

function ScanCorner({ className }: { className: string }) {
  return <View className={`absolute h-8 w-8 border-[3px] border-success ${className}`} />;
}

function SefazProductResultCard({
  isSaving,
  product,
  onAdd,
  onDismiss,
}: {
  isSaving: boolean;
  product: SefazProductPrice;
  onAdd: () => void;
  onDismiss: () => void;
}) {
  return (
    <View className="rounded-2xl border border-line bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-extrabold text-ink">{normalizeSefazProductName(product)}</Text>
          <Text className="mt-1 text-sm text-muted">{product.marketName}</Text>
          <Text className="mt-1 text-xs text-muted">
            {product.neighborhood}, {product.city}
          </Text>
          <Text className="mt-2 text-2xl font-extrabold text-success">{formatCurrency(product.price)}</Text>
        </View>
        <View className="gap-2">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-xl bg-green-50 active:opacity-80"
            disabled={isSaving}
            onPress={onAdd}
          >
            <Text className="text-lg font-extrabold text-success">V</Text>
          </Pressable>
          <Pressable className="h-11 w-11 items-center justify-center rounded-xl bg-red-50 active:opacity-80" onPress={onDismiss}>
            <TrashSymbol />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function normalizeSefazProductName(product: SefazProductPrice) {
  return (product.sefazDescription || product.productName).trim();
}

function BarcodeIcon() {
  return (
    <View className="h-6 w-6 justify-center">
      <View className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-white" />
      <View className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-white" />
      <View className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white" />
      <View className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white" />
      <View className="h-0.5 rounded-full bg-white" />
    </View>
  );
}

function getSefazProductKey(product: SefazProductPrice) {
  return `${product.cnpj}-${product.gtin ?? product.productName}-${product.saleDate}-${product.price}`;
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

const styles = StyleSheet.create({
  scanOverlay: {
    elevation: 10,
  },
  scanPanel: {
    elevation: 20,
  },
  scanLine: {
    shadowColor: '#2F8F5B',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});
