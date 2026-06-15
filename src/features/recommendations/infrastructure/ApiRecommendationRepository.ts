import { RecommendationRepository } from '@/features/recommendations/domain/RecommendationRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { Recommendation } from '@/shared/types/entities';

export class ApiRecommendationRepository implements RecommendationRepository {
  list(): Promise<Recommendation[]> {
    return apiRequest<Recommendation[]>('/recommendations', { authenticated: true });
  }
}
