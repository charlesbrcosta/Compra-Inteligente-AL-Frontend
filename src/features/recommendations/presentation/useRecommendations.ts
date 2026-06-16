import { useCallback, useState } from 'react';

import { ApiRecommendationRepository } from '@/features/recommendations/infrastructure/ApiRecommendationRepository';
import { GeoLocation, Recommendation, RecommendationHistory } from '@/shared/types/entities';

const repository = new ApiRecommendationRepository();

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<RecommendationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const loadRecommendations = useCallback(async (currentLocation?: GeoLocation) => {
    setIsLoading(true);

    try {
      const data = await repository.list(currentLocation);
      setRecommendations(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);

    try {
      const data = await repository.history();
      setHistory(data);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  return { recommendations, history, isHistoryLoading, isLoading, loadHistory, loadRecommendations };
};
