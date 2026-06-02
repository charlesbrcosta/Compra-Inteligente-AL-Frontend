import { ShoppingProduct } from '@/shared/types/entities';

export interface ProductRepository {
  list(): Promise<ShoppingProduct[]>;
  save(products: ShoppingProduct[]): Promise<ShoppingProduct[]>;
  clear(): Promise<void>;
}
