import { useCallback, useState } from 'react';

import { ApiRecommendationRepository } from '@/features/recommendations/infrastructure/ApiRecommendationRepository';
import { Recommendation } from '@/shared/types/entities';

const repository = new ApiRecommendationRepository();

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await repository.list();
      setRecommendations(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { recommendations, isLoading, loadRecommendations };
};
