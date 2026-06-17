import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GeoLocation } from '@/shared/types/entities';

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const loadCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setCurrentLocation(null);
        setLocationError('Ative o GPS para calcular rotas e recomendacoes pela sua localizacao real.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation(mapExpoLocation(location));
      setLocationError(null);
    } catch {
      setCurrentLocation(null);
      setLocationError('Nao foi possivel obter sua localizacao real agora. Verifique o GPS do aparelho.');
    }
  }, []);

  const startWatchingLocation = useCallback(async () => {
    if (subscriptionRef.current) {
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setCurrentLocation(null);
        setLocationError('Ative o GPS para calcular rotas e recomendacoes pela sua localizacao real.');
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
