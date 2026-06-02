import { MarketRepository } from '@/features/markets/domain/MarketRepository';

export class MarketService {
  constructor(private readonly repository: MarketRepository) {}

  list() {
    return this.repository.list();
  }
}
