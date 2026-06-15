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

  create(product: ShoppingProduct) {
    return this.repository.create(product);
  }

  update(product: ShoppingProduct) {
    return this.repository.update(product);
  }

  remove(id: string) {
    return this.repository.remove(id);
  }
}
