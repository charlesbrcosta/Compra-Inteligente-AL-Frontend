import { useMemo } from 'react';

import { RecommendationService } from '@/features/recommendations/application/RecommendationService';
import { GeoLocation, Market, ShoppingProduct, Vehicle } from '@/shared/types/entities';

const service = new RecommendationService();

export const useRecommendations = (
  products: ShoppingProduct[],
  markets: Market[],
  vehicle: Vehicle | null,
  currentLocation?: GeoLocation,
) =>
  useMemo(
    () => service.buildRecommendations(products, markets, vehicle, currentLocation),
    [products, markets, vehicle, currentLocation],
  );
