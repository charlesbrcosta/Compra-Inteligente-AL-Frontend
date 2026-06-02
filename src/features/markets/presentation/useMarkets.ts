import { useEffect, useState } from 'react';

import { MarketService } from '@/features/markets/application/MarketService';
import { MockMarketRepository } from '@/features/markets/infrastructure/MockMarketRepository';
import { Market } from '@/shared/types/entities';

const service = new MarketService(new MockMarketRepository());

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
