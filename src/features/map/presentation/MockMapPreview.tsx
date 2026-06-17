import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { MapHtmlView } from '@/features/map/presentation/MapHtmlView';
import { apiRequest } from '@/shared/api/apiClient';
import { GeoLocation, Market } from '@/shared/types/entities';
import { formatDistance } from '@/shared/utils/formatters';

interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface RouteResponse {
  coordinates: RoutePoint[];
  distanceKm: number | null;
  durationMinutes: number | null;
  source: 'openrouteservice' | 'osrm' | 'local_estimate';
}

export function MockMapPreview({ currentLocation, market }: { currentLocation: GeoLocation; market?: Market }) {
  const targetMarket = market?.location.latitude !== 0 && market?.location.longitude !== 0 ? market : undefined;
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const routeConditions = targetMarket?.routeConditions ?? [];

  useEffect(() => {
    let isMounted = true;

    if (!targetMarket) {
      setRoute(null);
      setRouteError(null);
      return;
    }

    setRouteError(null);
    apiRequest<RouteResponse>('/map/route', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify({
        origin: currentLocation,
        destination: targetMarket.location,
      }),
    })
      .then((data) => {
        if (isMounted) {
          setRoute(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRoute(null);
          setRouteError('Nao foi possivel carregar uma rota real agora.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentLocation, targetMarket]);

  const html = useMemo(
    () => buildLeafletHtml(currentLocation, targetMarket, route),
    [currentLocation, route, targetMarket],
  );

  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <View className="gap-1 sm:flex-row sm:items-center sm:justify-between">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-ink">Mapa interativo da rota</Text>
          <Text className="mt-1 text-xs text-muted">OpenStreetMap com zoom, pan e rota do mercado recomendado.</Text>
        </View>
        {targetMarket ? <Text className="text-sm font-semibold text-primary">{formatDistance(targetMarket.distanceKm)}</Text> : null}
      </View>

      <View className="mt-4 h-80 overflow-hidden rounded-lg border border-slate-200">
        <MapHtmlView html={html} />
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1">
          <Text className="min-w-0 flex-1 text-sm font-semibold text-ink">{targetMarket?.name ?? currentLocation.label}</Text>
          <Text className="text-xs font-semibold text-muted">
            {getRouteSourceLabel(route?.source, routeError)}
          </Text>
        </View>

        {route?.durationMinutes ? (
          <Text className="text-xs text-muted">Tempo estimado sem trafego real: {route.durationMinutes} min</Text>
        ) : null}

        {routeError ? <Text className="text-xs font-semibold text-amber-800">{routeError}</Text> : null}

        {routeConditions.length > 0 ? (
          <View className="gap-2">
            {routeConditions.map((condition) => (
              <View key={`${condition.type}-${condition.label}`} className="rounded-md bg-amber-50 p-3">
                <Text className="text-sm font-bold text-amber-900">
                  {condition.label}: +{Math.round(condition.impactPercent * 100)}%
                </Text>
                <Text className="mt-1 text-xs text-amber-800">{condition.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-sm text-emerald-700">Sem congestionamento, acidente ou bloqueio mockado para esta rota.</Text>
        )}
      </View>
    </View>
  );
}

function getRouteSourceLabel(source?: RouteResponse['source'], routeError?: string | null) {
  if (routeError) {
    return 'Rota indisponivel';
  }

  if (!source) {
    return 'Calculando rota';
  }

  return source === 'local_estimate' ? 'Estimativa local' : 'Rota por ruas';
}

function buildLeafletHtml(currentLocation: GeoLocation, targetMarket?: Market, route?: RouteResponse | null) {
  const destination = targetMarket?.location ?? currentLocation;
  const routeCoordinates =
    route?.coordinates?.length
      ? route.coordinates.map((point) => [point.latitude, point.longitude])
      : [];

  const bounds = [
    [currentLocation.latitude, currentLocation.longitude],
    [destination.latitude, destination.longitude],
    ...routeCoordinates,
  ];

  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; width: 100%; }
      .leaflet-control-attribution { font-size: 10px; }
      .current-location {
        background: #2563eb;
        border: 3px solid white;
        border-radius: 999px;
        box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.18);
        height: 20px;
        width: 20px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const origin = ${JSON.stringify([currentLocation.latitude, currentLocation.longitude])};
      const destination = ${JSON.stringify([destination.latitude, destination.longitude])};
      const routeCoordinates = ${JSON.stringify(routeCoordinates)};
      const bounds = ${JSON.stringify(bounds)};

      const map = L.map('map', { zoomControl: true }).setView(origin, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const destinationIcon = L.divIcon({
        className: '',
        html: '<div style="height:20px;width:20px;border-radius:999px;background:#0f766e;border:3px solid white;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      const currentLocationIcon = L.divIcon({
        className: '',
        html: '<div class="current-location"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker(origin, { icon: currentLocationIcon }).addTo(map).bindPopup('Voce esta aqui');
      L.marker(destination, { icon: destinationIcon }).addTo(map).bindPopup(${JSON.stringify(targetMarket?.name ?? 'Destino')});

      if (routeCoordinates.length > 0) {
        L.polyline(routeCoordinates, { color: '#0f766e', weight: 5, opacity: 0.9 }).addTo(map);
      }

      map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28] });
    </script>
  </body>
</html>`;
}
