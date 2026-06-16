import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, LayoutChangeEvent, Text, View } from 'react-native';

import { GeoLocation, Market } from '@/shared/types/entities';
import { formatDistance } from '@/shared/utils/formatters';

const tileSize = 256;

interface MapPoint {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  color: string;
  size: number;
}

interface ProjectedPoint extends MapPoint {
  x: number;
  y: number;
}

export function MockMapPreview({ currentLocation, markets }: { currentLocation: GeoLocation; markets: Market[] }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [layout, setLayout] = useState({ height: 0, width: 0 });
  const visibleMarkets = markets.filter((market) => market.location.latitude !== 0 && market.location.longitude !== 0).slice(0, 4);
  const targetMarket = visibleMarkets[0];
  const zoom = targetMarket && targetMarket.distanceKm > 50 ? 8 : targetMarket && targetMarket.distanceKm > 15 ? 11 : 13;

  const points = useMemo<MapPoint[]>(
    () => [
      {
        id: 'origin',
        label: currentLocation.label,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        color: '#0f172a',
        size: 18,
      },
      ...visibleMarkets.map((market, index) => ({
        id: market.id,
        label: market.name,
        latitude: market.location.latitude,
        longitude: market.location.longitude,
        color: index === 0 ? '#0f766e' : '#2563eb',
        size: index === 0 ? 18 : 13,
      })),
    ],
    [currentLocation.label, currentLocation.latitude, currentLocation.longitude, visibleMarkets],
  );

  const center = useMemo(() => {
    if (!targetMarket) {
      return { latitude: currentLocation.latitude, longitude: currentLocation.longitude };
    }

    return {
      latitude: (currentLocation.latitude + targetMarket.location.latitude) / 2,
      longitude: (currentLocation.longitude + targetMarket.location.longitude) / 2,
    };
  }, [currentLocation.latitude, currentLocation.longitude, targetMarket]);

  const centerWorld = useMemo(() => latLngToWorldPixel(center.latitude, center.longitude, zoom), [center, zoom]);
  const centerTile = {
    x: Math.floor(centerWorld.x / tileSize),
    y: Math.floor(centerWorld.y / tileSize),
  };

  const projectedPoints = useMemo<ProjectedPoint[]>(() => {
    if (!layout.width || !layout.height) {
      return [];
    }

    return points.map((point) => {
      const world = latLngToWorldPixel(point.latitude, point.longitude, zoom);

      return {
        ...point,
        x: layout.width / 2 + (world.x - centerWorld.x),
        y: layout.height / 2 + (world.y - centerWorld.y),
      };
    });
  }, [centerWorld.x, centerWorld.y, layout.height, layout.width, points, zoom]);

  const originPoint = projectedPoints.find((point) => point.id === 'origin');
  const targetPoint = targetMarket ? projectedPoints.find((point) => point.id === targetMarket.id) : undefined;
  const route = originPoint && targetPoint ? getRouteLine(originPoint, targetPoint) : null;
  const routeConditions = targetMarket?.routeConditions ?? [];

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: 5200,
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.delay(700),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [progress, targetMarket?.id]);

  const onMapLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setLayout({ height, width });
  };

  const trackerStyle =
    originPoint && targetPoint
      ? {
          left: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [originPoint.x - 9, targetPoint.x - 9],
          }),
          top: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [originPoint.y - 9, targetPoint.y - 9],
          }),
        }
      : undefined;

  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <View className="gap-1 sm:flex-row sm:items-center sm:justify-between">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-ink">Mapa da rota</Text>
          <Text className="mt-1 text-xs text-muted">OpenStreetMap gratuito com rota e alertas do percurso.</Text>
        </View>
        {targetMarket ? <Text className="text-sm font-semibold text-primary">{formatDistance(targetMarket.distanceKm)}</Text> : null}
      </View>

      <View className="mt-4 h-72 overflow-hidden rounded-lg bg-slate-100" onLayout={onMapLayout}>
        {layout.width && layout.height
          ? [-1, 0, 1].flatMap((row) =>
              [-1, 0, 1].map((column) => {
                const tileX = centerTile.x + column;
                const tileY = centerTile.y + row;
                const left = layout.width / 2 + (tileX * tileSize - centerWorld.x);
                const top = layout.height / 2 + (tileY * tileSize - centerWorld.y);

                return (
                  <Image
                    key={`${tileX}-${tileY}`}
                    className="absolute h-64 w-64"
                    source={{ uri: `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png` }}
                    style={{ left, top }}
                  />
                );
              }),
            )
          : null}

        <View className="absolute inset-0 bg-white/10" />

        {route ? (
          <View
            className="absolute h-1.5 rounded-full bg-primary"
            style={{
              left: route.left,
              top: route.top,
              transform: [{ rotate: `${route.angle}deg` }],
              width: route.length,
            }}
          />
        ) : null}

        {projectedPoints.map((point) => (
          <View
            key={point.id}
            className="absolute items-center"
            style={{
              left: point.x - point.size / 2,
              top: point.y - point.size / 2,
            }}
          >
            <View
              className="rounded-full border-2 border-white"
              style={{
                backgroundColor: point.color,
                height: point.size,
                width: point.size,
              }}
            />
          </View>
        ))}

        {trackerStyle ? (
          <Animated.View
            className="absolute h-5 w-5 rounded-full border-2 border-white bg-accent"
            style={trackerStyle}
          />
        ) : null}
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1">
          <Text className="min-w-0 flex-1 text-sm font-semibold text-ink">{targetMarket?.name ?? currentLocation.label}</Text>
          <Text className="text-xs font-semibold text-muted">Atualizado agora</Text>
        </View>

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

function latLngToWorldPixel(latitude: number, longitude: number, zoom: number) {
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);
  const scale = tileSize * 2 ** zoom;

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
}

function getRouteLine(origin: ProjectedPoint, target: ProjectedPoint) {
  const deltaX = target.x - origin.x;
  const deltaY = target.y - origin.y;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return {
    angle,
    left: origin.x,
    length,
    top: origin.y,
  };
}
