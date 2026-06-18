import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { GeoLocation } from '@/shared/types/entities';

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const ensureLocationAccess = useCallback(async () => {
    try {
      const hasEnabledServices = await Location.hasServicesEnabledAsync();

      if (!hasEnabledServices && Platform.OS === 'android') {
        await Location.enableNetworkProviderAsync().catch(() => undefined);
      }

      const hasEnabledServicesAfterPrompt = await Location.hasServicesEnabledAsync();

      if (!hasEnabledServicesAfterPrompt) {
        setCurrentLocation(null);
        setLocationError('O GPS do aparelho esta desligado. Ative a localizacao para calcular mercados proximos.');
        return false;
      }

      const currentPermission = await Location.getForegroundPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setCurrentLocation(null);
        setLocationError(
          permission.canAskAgain
            ? 'Permita o acesso a localizacao para calcular rotas e recomendacoes reais.'
            : 'A permissao de localizacao foi negada. Abra as configuracoes do app e permita o acesso ao GPS.',
        );
        return false;
      }

      return true;
    } catch {
      setCurrentLocation(null);
      setLocationError('Nao foi possivel ativar a localizacao agora. Verifique o GPS e as permissoes do aparelho.');
      return false;
    }
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    try {
      const hasLocationAccess = await ensureLocationAccess();

      if (!hasLocationAccess) {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation(mapExpoLocation(location));
      setLocationError(null);
    } catch {
      setCurrentLocation(null);
      setLocationError('Nao foi possivel obter sua localizacao real agora. Verifique o GPS do aparelho.');
    }
  }, [ensureLocationAccess]);

  const startWatchingLocation = useCallback(async () => {
    if (subscriptionRef.current) {
      return;
    }

    try {
      const hasLocationAccess = await ensureLocationAccess();

      if (!hasLocationAccess) {
        return;
      }

      setIsWatchingLocation(true);
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
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
  }, [ensureLocationAccess, loadCurrentLocation]);

  const openLocationSettings = useCallback(async () => {
    await Linking.openSettings().catch(() => undefined);
  }, []);

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
    openLocationSettings,
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
