import { useEffect, useState } from 'react';

import { MarketService } from '@/features/markets/application/MarketService';
import { ApiMarketRepository } from '@/features/markets/infrastructure/ApiMarketRepository';
import { Market } from '@/shared/types/entities';

const service = new MarketService(new ApiMarketRepository());

export const useMarkets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    service
      .list()
      .then(setMarkets)
      .finally(() => setIsLoading(false));
  }, []);

  return { markets, isLoading };
};
