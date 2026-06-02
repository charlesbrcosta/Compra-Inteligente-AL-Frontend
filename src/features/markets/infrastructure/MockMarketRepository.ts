import { mockMarkets } from '@/shared/constants/mockData';
import { Market } from '@/shared/types/entities';
import { MarketRepository } from '@/features/markets/domain/MarketRepository';

export class MockMarketRepository implements MarketRepository {
  async list(): Promise<Market[]> {
    return mockMarkets;
  }
}
