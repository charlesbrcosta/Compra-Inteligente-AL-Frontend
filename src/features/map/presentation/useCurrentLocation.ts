import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { GeoLocation } from '@/shared/types/entities';

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const ensureLocationAccess = useCallback(async () => {
    try {
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
      setLocationError('Nao foi possivel verificar a permissao de localizacao agora.');
      return false;
    }
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    try {
      setIsLocating(true);
      const hasLocationAccess = await ensureLocationAccess();

      if (!hasLocationAccess) {
        return;
      }

      if (Platform.OS === 'android') {
        const hasEnabledServices = await Location.hasServicesEnabledAsync();

        if (!hasEnabledServices) {
          await Location.enableNetworkProviderAsync().catch(() => undefined);
        }
      }

      const location =
        (await Location.getLastKnownPositionAsync({
          maxAge: 5 * 60 * 1000,
          requiredAccuracy: 5000,
        }).catch(() => null)) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        }));

      setCurrentLocation(mapExpoLocation(location));
      setLocationError(null);
    } catch {
      setCurrentLocation(null);
      setLocationError('Nao conseguimos ler sua localizacao agora. Confira se a localizacao esta ativa para o Expo Go.');
    } finally {
      setIsLocating(false);
    }
  }, [ensureLocationAccess]);

  const startWatchingLocation = useCallback(async () => {
    if (subscriptionRef.current) {
      return;
    }

    try {
      setIsLocating(true);
      const hasLocationAccess = await ensureLocationAccess();

      if (!hasLocationAccess) {
        return;
      }

      setIsWatchingLocation(true);
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
          mayShowUserSettingsDialog: true,
        },
        (location) => {
          setCurrentLocation(mapExpoLocation(location));
          setLocationError(null);
        },
      );
    } catch {
      setIsWatchingLocation(false);
      await loadCurrentLocation();
    } finally {
      setIsLocating(false);
    }
  }, [ensureLocationAccess, loadCurrentLocation]);

  const restartLocation = useCallback(async () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsWatchingLocation(false);
    await loadCurrentLocation();
    await startWatchingLocation();
  }, [loadCurrentLocation, startWatchingLocation]);

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
    isLocating,
    isWatchingLocation,
    loadCurrentLocation,
    locationError,
    openLocationSettings,
    restartLocation,
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
