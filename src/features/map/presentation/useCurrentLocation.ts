import { useCallback, useState } from 'react';

import { ApiMapRepository } from '@/features/map/infrastructure/ApiMapRepository';
import { GeoLocation } from '@/shared/types/entities';

const repository = new ApiMapRepository();

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);

  const loadCurrentLocation = useCallback(async () => {
    const location = await repository.getCurrentLocation();
    setCurrentLocation(location);
  }, []);

  return { currentLocation, loadCurrentLocation };
};
