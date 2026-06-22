import { ShoppingProduct } from '@/shared/types/entities';

export interface ProductRepository {
  list(): Promise<ShoppingProduct[]>;
  save(products: ShoppingProduct[]): Promise<ShoppingProduct[]>;
  create(product: ShoppingProduct): Promise<ShoppingProduct>;
  update(product: ShoppingProduct): Promise<ShoppingProduct>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}
