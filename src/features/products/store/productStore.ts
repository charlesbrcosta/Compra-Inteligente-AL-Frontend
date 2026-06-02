import { create } from 'zustand';

import { ProductService } from '@/features/products/application/ProductService';
import { AsyncStorageProductRepository } from '@/features/products/infrastructure/AsyncStorageProductRepository';
import { ShoppingProduct } from '@/shared/types/entities';

interface ProductState {
  products: ShoppingProduct[];
  loadProducts: () => Promise<void>;
  addProduct: (product: ShoppingProduct) => Promise<void>;
  updateProduct: (product: ShoppingProduct) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

const service = new ProductService(new AsyncStorageProductRepository());

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loadProducts: async () => {
    const products = await service.list();
    set({ products });
  },
  addProduct: async (product) => {
    const products = [...get().products, product];
    await service.save(products);
    set({ products });
  },
  updateProduct: async (product) => {
    const products = get().products.map((current) => (current.id === product.id ? product : current));
    await service.save(products);
    set({ products });
  },
  removeProduct: async (id) => {
    const products = get().products.filter((product) => product.id !== id);
    await service.save(products);
    set({ products });
  },
}));
