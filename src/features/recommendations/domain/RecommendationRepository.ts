import { GeoLocation, Recommendation, RecommendationHistory } from '@/shared/types/entities';

export interface RecommendationRepository {
  list(currentLocation?: GeoLocation): Promise<Recommendation[]>;
  history(): Promise<RecommendationHistory[]>;
}
