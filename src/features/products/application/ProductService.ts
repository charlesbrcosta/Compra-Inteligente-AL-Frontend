import { ShoppingProduct } from '@/shared/types/entities';
import { ProductRepository } from '@/features/products/domain/ProductRepository';

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  list() {
    return this.repository.list();
  }

  save(products: ShoppingProduct[]) {
    return this.repository.save(products);
  }
}
