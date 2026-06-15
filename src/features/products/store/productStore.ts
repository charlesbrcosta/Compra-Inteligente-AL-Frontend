import { create } from 'zustand';

import { ProductService } from '@/features/products/application/ProductService';
import { ApiProductRepository } from '@/features/products/infrastructure/ApiProductRepository';
import { ShoppingProduct } from '@/shared/types/entities';

interface ProductState {
  products: ShoppingProduct[];
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  loadProducts: () => Promise<void>;
  addProduct: (product: ShoppingProduct) => Promise<void>;
  updateProduct: (product: ShoppingProduct) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearError: () => void;
}

const service = new ProductService(new ApiProductRepository());

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  error: null,
  isLoading: false,
  isSaving: false,
  loadProducts: async () => {
    try {
      set({ error: null, isLoading: true });
      const products = await service.list();
      set({ products });
    } catch {
      set({ error: 'Nao foi possivel carregar os produtos.' });
    } finally {
      set({ isLoading: false });
    }
  },
  addProduct: async (product) => {
    try {
      set({ error: null, isSaving: true });
      const savedProduct = await service.create(product);
      const products = [...get().products, savedProduct];
      set({ products });
    } catch {
      set({ error: 'Nao foi possivel adicionar o produto.' });
      throw new Error('Create product failed');
    } finally {
      set({ isSaving: false });
    }
  },
  updateProduct: async (product) => {
    try {
      set({ error: null, isSaving: true });
      const savedProduct = await service.update(product);
      const products = get().products.map((current) => (current.id === savedProduct.id ? savedProduct : current));
      set({ products });
    } catch {
      set({ error: 'Nao foi possivel atualizar o produto.' });
      throw new Error('Update product failed');
    } finally {
      set({ isSaving: false });
    }
  },
  removeProduct: async (id) => {
    try {
      set({ error: null, isSaving: true });
      await service.remove(id);
      const products = get().products.filter((product) => product.id !== id);
      set({ products });
    } catch {
      set({ error: 'Nao foi possivel remover o produto.' });
      throw new Error('Remove product failed');
    } finally {
      set({ isSaving: false });
    }
  },
  clearError: () => set({ error: null }),
}));
