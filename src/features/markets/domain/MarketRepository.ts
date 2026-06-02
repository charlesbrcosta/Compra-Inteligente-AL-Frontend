import { Market } from '@/shared/types/entities';

export interface MarketRepository {
  list(): Promise<Market[]>;
}
