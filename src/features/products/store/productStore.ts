import { create } from 'zustand';

import { ProductService } from '@/features/products/application/ProductService';
import { ApiProductRepository } from '@/features/products/infrastructure/ApiProductRepository';
import { ShoppingProduct } from '@/shared/types/entities';

interface ProductState {
  products: ShoppingProduct[];
  loadProducts: () => Promise<void>;
  addProduct: (product: ShoppingProduct) => Promise<void>;
  updateProduct: (product: ShoppingProduct) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

const service = new ProductService(new ApiProductRepository());

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loadProducts: async () => {
    const products = await service.list();
    set({ products });
  },
  addProduct: async (product) => {
    const savedProduct = await service.create(product);
    const products = [...get().products, savedProduct];
    set({ products });
  },
  updateProduct: async (product) => {
    const savedProduct = await service.update(product);
    const products = get().products.map((current) => (current.id === savedProduct.id ? savedProduct : current));
    set({ products });
  },
  removeProduct: async (id) => {
    await service.remove(id);
    const products = get().products.filter((product) => product.id !== id);
    set({ products });
  },
}));
