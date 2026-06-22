import { useCallback, useEffect, useState } from 'react';

import { MarketService } from '@/features/markets/application/MarketService';
import { ApiMarketRepository } from '@/features/markets/infrastructure/ApiMarketRepository';
import { Market } from '@/shared/types/entities';

const service = new MarketService(new ApiMarketRepository());

export const useMarkets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMarkets = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await service.list();
      setMarkets(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  return { markets, isLoading, loadMarkets };
};
