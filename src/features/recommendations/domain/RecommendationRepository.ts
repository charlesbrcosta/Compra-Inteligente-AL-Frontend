import { Recommendation, RecommendationHistory } from '@/shared/types/entities';

export interface RecommendationRepository {
  list(): Promise<Recommendation[]>;
  history(): Promise<RecommendationHistory[]>;
}
