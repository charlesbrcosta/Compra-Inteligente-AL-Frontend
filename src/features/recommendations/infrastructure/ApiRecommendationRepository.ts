import { RecommendationRepository } from '@/features/recommendations/domain/RecommendationRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { GeoLocation, Recommendation, RecommendationHistory } from '@/shared/types/entities';

export class ApiRecommendationRepository implements RecommendationRepository {
  list(currentLocation?: GeoLocation): Promise<Recommendation[]> {
    if (currentLocation) {
      return apiRequest<Recommendation[]>('/recommendations', {
        method: 'POST',
        authenticated: true,
        body: JSON.stringify({ currentLocation }),
      });
    }

    return apiRequest<Recommendation[]>('/recommendations', { authenticated: true });
  }

  history(): Promise<RecommendationHistory[]> {
    return apiRequest<RecommendationHistory[]>('/recommendations/history', { authenticated: true });
  }
}
