import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { MapHtmlView } from '@/features/map/presentation/MapHtmlView';
import { apiRequest } from '@/shared/api/apiClient';
import { GeoLocation, Market, Recommendation } from '@/shared/types/entities';
import { formatCurrency, formatDistance } from '@/shared/utils/formatters';

interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface RouteResponse {
  coordinates: RoutePoint[];
  distanceKm: number | null;
  durationMinutes: number | null;
  source: 'openrouteservice' | 'osrm';
}

export function RouteMapPreview({
  currentLocation,
  market,
  recommendations = [],
}: {
  currentLocation: GeoLocation;
  market?: Market;
  recommendations?: Recommendation[];
}) {
  const targetMarket = market?.location.latitude !== 0 && market?.location.longitude !== 0 ? market : undefined;
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isExpandedMapVisible, setIsExpandedMapVisible] = useState(false);
  const [mapResetVersion, setMapResetVersion] = useState(0);
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
    () => buildLeafletHtml(currentLocation, targetMarket, route, recommendations, mapResetVersion),
    [currentLocation, mapResetVersion, recommendations, route, targetMarket],
  );

  return (
    <View className="rounded-2xl border border-line bg-white p-4">
      <View className="gap-1 sm:flex-row sm:items-center sm:justify-between">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-extrabold text-ink">Mapa interativo da rota</Text>
          <Text className="mt-1 text-xs text-muted">OpenStreetMap com zoom, pan e rota do mercado recomendado.</Text>
        </View>
        {targetMarket ? <Text className="text-sm font-extrabold text-primary">{formatDistance(targetMarket.distanceKm)}</Text> : null}
      </View>

      <View className="relative mt-4 h-80 overflow-hidden rounded-2xl border border-line">
        <MapHtmlView html={html} />
        <View className="absolute right-3 top-3 gap-2">
          <MapControlButton accessibilityLabel="Expandir mapa" onPress={() => setIsExpandedMapVisible(true)}>
            <ExpandIcon />
          </MapControlButton>
          <MapControlButton accessibilityLabel="Centralizar na sua localizacao" onPress={() => setMapResetVersion((current) => current + 1)}>
            <LocationTargetIcon />
          </MapControlButton>
        </View>
      </View>

      <ExpandedMapModal
        html={html}
        visible={isExpandedMapVisible}
        onClose={() => setIsExpandedMapVisible(false)}
        onRecenter={() => setMapResetVersion((current) => current + 1)}
      />

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
          <Text className="text-sm text-amber-800">
            Dados de congestionamento, acidentes e bloqueios em tempo real ainda nao estao integrados.
          </Text>
        )}
      </View>
    </View>
  );
}

function ExpandedMapModal({
  html,
  visible,
  onClose,
  onRecenter,
}: {
  html: string;
  visible: boolean;
  onClose: () => void;
  onRecenter: () => void;
}) {
  return (
    <Modal animationType="slide" presentationStyle="fullScreen" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-line bg-white px-4 pb-3 pt-12">
          <Text className="text-base font-extrabold text-ink">Mapa da rota</Text>
          <Pressable
            accessibilityLabel="Fechar mapa expandido"
            className="h-11 w-11 items-center justify-center rounded-xl bg-primary active:opacity-80"
            onPress={onClose}
          >
            <Text className="text-lg font-extrabold text-white">X</Text>
          </Pressable>
        </View>
        <View className="relative flex-1">
          <MapHtmlView html={html} />
          <View className="absolute right-4 top-4">
            <MapControlButton accessibilityLabel="Centralizar na sua localizacao" onPress={onRecenter}>
              <LocationTargetIcon />
            </MapControlButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MapControlButton({
  accessibilityLabel,
  children,
  onPress,
}: {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-white/95 active:opacity-80"
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

function ExpandIcon() {
  return (
    <View className="h-5 w-5">
      <View className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-secondary" />
      <View className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-secondary" />
      <View className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-secondary" />
      <View className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-secondary" />
    </View>
  );
}

function LocationTargetIcon() {
  return (
    <View className="h-5 w-5 items-center justify-center">
      <View className="h-4 w-4 rounded-full border-2 border-secondary" />
      <View className="absolute h-1.5 w-1.5 rounded-full bg-secondary" />
      <View className="absolute -top-0.5 h-1.5 w-0.5 rounded-full bg-secondary" />
      <View className="absolute -bottom-0.5 h-1.5 w-0.5 rounded-full bg-secondary" />
      <View className="absolute -left-0.5 h-0.5 w-1.5 rounded-full bg-secondary" />
      <View className="absolute -right-0.5 h-0.5 w-1.5 rounded-full bg-secondary" />
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

  return 'Rota por ruas';
}

function buildLeafletHtml(
  currentLocation: GeoLocation,
  targetMarket?: Market,
  route?: RouteResponse | null,
  recommendations: Recommendation[] = [],
  mapResetVersion = 0,
) {
  const destination = targetMarket?.location ?? currentLocation;
  const establishmentMarkers = recommendations
    .filter((recommendation) => hasValidLocation(recommendation.market))
    .map((recommendation) => ({
      id: recommendation.market.id,
      name: recommendation.market.name,
      address: recommendation.market.address,
      city: recommendation.market.city,
      neighborhood: recommendation.market.neighborhood,
      latitude: recommendation.market.location.latitude,
      longitude: recommendation.market.location.longitude,
      totalLabel: formatCurrency(recommendation.finalTotal),
      productsLabel: formatCurrency(recommendation.productsTotal),
      isBest: recommendation.market.id === targetMarket?.id,
    }));
  const routeCoordinates =
    route?.coordinates?.length
      ? route.coordinates.map((point) => [point.latitude, point.longitude])
      : [];

  const bounds = [
    [currentLocation.latitude, currentLocation.longitude],
    [destination.latitude, destination.longitude],
    ...routeCoordinates,
    ...establishmentMarkers.map((marker) => [marker.latitude, marker.longitude]),
  ];

  return `
<!doctype html>
<html>
  <head>
    <!-- reset:${mapResetVersion} -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      onerror="this.onerror=null;this.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';"
    />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; width: 100%; }
      .leaflet-control-attribution { font-size: 10px; }
      .map-loading,
      .map-error {
        align-items: center;
        background: #f8fafc;
        color: #475569;
        display: flex;
        font: 700 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        height: 100%;
        justify-content: center;
        padding: 16px;
        text-align: center;
      }
      .current-location {
        background: #2563eb;
        border: 3px solid white;
        border-radius: 999px;
        box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.18);
        height: 20px;
        width: 20px;
      }
      .market-marker {
        align-items: center;
        display: flex;
        flex-direction: column;
      }
      .market-pin {
        align-items: center;
        background: #0f766e;
        border: 3px solid white;
        border-radius: 999px 999px 999px 2px;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
        display: flex;
        height: 28px;
        justify-content: center;
        transform: rotate(-45deg);
        width: 28px;
      }
      .market-pin span {
        background: white;
        border-radius: 999px;
        display: block;
        height: 8px;
        width: 8px;
      }
      .market-marker.best .market-pin {
        background: #f59e0b;
        height: 32px;
        width: 32px;
      }
      .popup-badge {
        background: #fef3c7;
        border-radius: 999px;
        color: #92400e;
        display: inline-block;
        font: 700 11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin-bottom: 6px;
        padding: 3px 8px;
      }
    </style>
  </head>
  <body>
    <div id="map"><div class="map-loading">Carregando mapa...</div></div>
    <script>
      const leafletSources = [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
      ];
      const origin = ${JSON.stringify([currentLocation.latitude, currentLocation.longitude])};
      const destination = ${JSON.stringify([destination.latitude, destination.longitude])};
      const routeCoordinates = ${JSON.stringify(routeCoordinates)};
      const bounds = ${JSON.stringify(bounds)};
      const establishmentMarkers = ${JSON.stringify(establishmentMarkers)};

      loadLeaflet(0);

      function loadLeaflet(index) {
        if (window.L) {
          initializeMap();
          return;
        }

        if (index >= leafletSources.length) {
          showMapError();
          return;
        }

        const script = document.createElement('script');
        script.src = leafletSources[index];
        script.async = true;
        script.onload = initializeMap;
        script.onerror = function () {
          loadLeaflet(index + 1);
        };
        document.head.appendChild(script);
      }

      function initializeMap() {
        const mapElement = document.getElementById('map');
        mapElement.innerHTML = '';

        const map = L.map('map', { zoomControl: true }).setView(origin, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const currentLocationIcon = L.divIcon({
          className: '',
          html: '<div class="current-location"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker(origin, { icon: currentLocationIcon }).addTo(map).bindPopup('Voce esta aqui');

        establishmentMarkers.forEach(function (establishment) {
          const icon = L.divIcon({
            className: '',
            html:
              '<div class="market-marker ' + (establishment.isBest ? 'best' : '') + '">' +
                '<div class="market-pin"><span></span></div>' +
              '</div>',
            iconSize: establishment.isBest ? [32, 32] : [28, 28],
            iconAnchor: establishment.isBest ? [16, 30] : [14, 26]
          });
          const popup =
            (establishment.isBest ? '<div class="popup-badge">Melhor recomendacao</div><br />' : '') +
            '<strong>' + escapeHtml(establishment.name) + '</strong><br />' +
            'Total final: ' + escapeHtml(establishment.totalLabel) + '<br />' +
            'Produtos: ' + escapeHtml(establishment.productsLabel) + '<br />' +
            escapeHtml(establishment.neighborhood + ', ' + establishment.city);

          L.marker([establishment.latitude, establishment.longitude], { icon: icon })
            .addTo(map)
            .bindPopup(popup);
        });

        if (routeCoordinates.length > 0) {
          L.polyline(routeCoordinates, { color: '#0f766e', weight: 5, opacity: 0.9 }).addTo(map);
        }

        map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28] });
        setTimeout(function () {
          map.invalidateSize();
          map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28] });
        }, 300);
      }

      function showMapError() {
        document.getElementById('map').innerHTML =
          '<div class="map-error">Nao foi possivel carregar o mapa agora. Verifique a internet e tente atualizar.</div>';
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
    </script>
  </body>
</html>`;
}

function hasValidLocation(market: Market) {
  return market.location.latitude !== 0 && market.location.longitude !== 0;
}
