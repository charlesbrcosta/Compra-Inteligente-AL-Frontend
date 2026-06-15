import { Recommendation } from '@/shared/types/entities';

export interface RecommendationRepository {
  list(): Promise<Recommendation[]>;
}
