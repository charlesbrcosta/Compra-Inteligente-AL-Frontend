import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { ShoppingProduct } from '@/shared/types/entities';
import { ProductRepository } from '@/features/products/domain/ProductRepository';

export class AsyncStorageProductRepository implements ProductRepository {
  async list(): Promise<ShoppingProduct[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.products);
    return raw ? JSON.parse(raw) : [];
  }

  async save(products: ShoppingProduct[]): Promise<ShoppingProduct[]> {
    await AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    return products;
  }

  async create(product: ShoppingProduct): Promise<ShoppingProduct> {
    const products = await this.list();
    await this.save([...products, product]);
    return product;
  }

  async update(product: ShoppingProduct): Promise<ShoppingProduct> {
    const products = await this.list();
    await this.save(products.map((currentProduct) => (currentProduct.id === product.id ? product : currentProduct)));
    return product;
  }

  async remove(id: string): Promise<void> {
    const products = await this.list();
    await this.save(products.filter((product) => product.id !== id));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.products);
  }
}
