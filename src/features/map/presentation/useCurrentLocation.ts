import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiMapRepository } from '@/features/map/infrastructure/ApiMapRepository';
import { GeoLocation } from '@/shared/types/entities';

const repository = new ApiMapRepository();

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const loadCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        const fallbackLocation = await repository.getCurrentLocation();
        setCurrentLocation(fallbackLocation);
        setLocationError('Permissao de localizacao negada. Usando localizacao demonstrativa.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation(mapExpoLocation(location));
      setLocationError(null);
    } catch {
      const fallbackLocation = await repository.getCurrentLocation();
      setCurrentLocation(fallbackLocation);
      setLocationError('Nao foi possivel obter GPS agora. Usando localizacao demonstrativa.');
    }
  }, []);

  const startWatchingLocation = useCallback(async () => {
    if (subscriptionRef.current) {
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        await loadCurrentLocation();
        return;
      }

      setIsWatchingLocation(true);
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 20,
          timeInterval: 5000,
        },
        (location) => {
          setCurrentLocation(mapExpoLocation(location));
          setLocationError(null);
        },
      );
    } catch {
      setIsWatchingLocation(false);
      await loadCurrentLocation();
    }
  }, [loadCurrentLocation]);

  const stopWatchingLocation = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsWatchingLocation(false);
  }, []);

  useEffect(() => stopWatchingLocation, [stopWatchingLocation]);

  return {
    currentLocation,
    isWatchingLocation,
    loadCurrentLocation,
    locationError,
    startWatchingLocation,
    stopWatchingLocation,
  };
};

function mapExpoLocation(location: Location.LocationObject): GeoLocation {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    label: 'Sua localizacao atual por GPS',
  };
}
