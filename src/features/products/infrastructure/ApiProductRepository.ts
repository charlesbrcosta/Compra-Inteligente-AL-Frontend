import { ProductRepository } from '@/features/products/domain/ProductRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { ShoppingProduct } from '@/shared/types/entities';

export class ApiProductRepository implements ProductRepository {
  list(): Promise<ShoppingProduct[]> {
    return apiRequest<ShoppingProduct[]>('/products', { authenticated: true });
  }

  async save(products: ShoppingProduct[]): Promise<ShoppingProduct[]> {
    const savedProducts: ShoppingProduct[] = [];

    for (const product of products) {
      savedProducts.push(await this.create(product));
    }

    return savedProducts;
  }

  create(product: ShoppingProduct): Promise<ShoppingProduct> {
    return apiRequest<ShoppingProduct>('/products', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify(product),
    });
  }

  update(product: ShoppingProduct): Promise<ShoppingProduct> {
    return apiRequest<ShoppingProduct>(`/products/${product.id}`, {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(product),
    });
  }

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
      authenticated: true,
    });
  }

  async clear(): Promise<void> {
    return undefined;
  }
}
