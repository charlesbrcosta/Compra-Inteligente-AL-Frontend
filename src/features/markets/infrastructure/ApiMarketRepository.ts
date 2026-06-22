import { MarketRepository } from '@/features/markets/domain/MarketRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { Market } from '@/shared/types/entities';

export class ApiMarketRepository implements MarketRepository {
  list(): Promise<Market[]> {
    return apiRequest<Market[]>('/markets');
  }
}
