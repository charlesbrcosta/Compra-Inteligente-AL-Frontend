import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Text, View } from 'react-native';

import { GeoLocation, Market } from '@/shared/types/entities';
import { formatDistance } from '@/shared/utils/formatters';

interface Point {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  color: string;
  size: number;
}

export function MockMapPreview({ currentLocation, markets }: { currentLocation: GeoLocation; markets: Market[] }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [layout, setLayout] = useState({ height: 0, width: 0 });
  const visibleMarkets = markets.filter((market) => market.location.latitude !== 0 && market.location.longitude !== 0).slice(0, 4);
  const targetMarket = visibleMarkets[0];

  const points = useMemo<Point[]>(
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
        size: index === 0 ? 16 : 12,
      })),
    ],
    [currentLocation.label, currentLocation.latitude, currentLocation.longitude, visibleMarkets],
  );

  const projectedPoints = useMemo(() => {
    if (!layout.width || !layout.height) {
      return [];
    }

    return points.map((point) => ({
      ...point,
      ...projectPoint(point, points, layout.width, layout.height),
    }));
  }, [layout.height, layout.width, points]);

  const originPoint = projectedPoints.find((point) => point.id === 'origin');
  const targetPoint = targetMarket ? projectedPoints.find((point) => point.id === targetMarket.id) : undefined;
  const route = originPoint && targetPoint ? getRouteLine(originPoint, targetPoint) : null;

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: 4200,
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.delay(600),
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
            outputRange: [originPoint.x - 7, targetPoint.x - 7],
          }),
          top: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [originPoint.y - 7, targetPoint.y - 7],
          }),
        }
      : undefined;

  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <View className="gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Text className="text-base font-bold text-ink">Trajetoria da compra</Text>
        {targetMarket ? <Text className="text-sm font-semibold text-primary">{formatDistance(targetMarket.distanceKm)}</Text> : null}
      </View>
      <View className="mt-4 h-56 overflow-hidden rounded-lg bg-slate-100" onLayout={onMapLayout}>
        <View className="absolute inset-x-5 top-12 h-1 rounded-full bg-slate-200" />
        <View className="absolute inset-x-10 top-32 h-1 -rotate-6 rounded-full bg-slate-200" />
        <View className="absolute bottom-10 left-6 right-8 h-1 rotate-3 rounded-full bg-slate-200" />

        {route ? (
          <View
            className="absolute h-1 rounded-full bg-primary"
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
            className="absolute rounded-full border-2 border-white"
            style={{
              backgroundColor: point.color,
              height: point.size,
              left: point.x - point.size / 2,
              top: point.y - point.size / 2,
              width: point.size,
            }}
          />
        ))}

        {trackerStyle ? (
          <Animated.View
            className="absolute h-4 w-4 rounded-full border-2 border-white bg-accent"
            style={trackerStyle}
          />
        ) : null}
      </View>

      <View className="mt-3 gap-2">
        <Text className="text-sm font-semibold text-ink">{targetMarket?.name ?? currentLocation.label}</Text>
        {visibleMarkets.slice(0, 3).map((market) => (
          <View key={market.id} className="flex-row flex-wrap justify-between gap-x-3 gap-y-1">
            <Text className="min-w-0 flex-1 text-xs text-slate-600">{market.name}</Text>
            <Text className="text-xs font-semibold text-slate-700">{formatDistance(market.distanceKm)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function projectPoint(point: Point, points: Point[], width: number, height: number) {
  const padding = 28;
  const latitudes = points.map((currentPoint) => currentPoint.latitude);
  const longitudes = points.map((currentPoint) => currentPoint.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeRange = maxLatitude - minLatitude || 0.01;
  const longitudeRange = maxLongitude - minLongitude || 0.01;

  return {
    x: padding + ((point.longitude - minLongitude) / longitudeRange) * (width - padding * 2),
    y: padding + ((maxLatitude - point.latitude) / latitudeRange) * (height - padding * 2),
  };
}

function getRouteLine(origin: Point & { x: number; y: number }, target: Point & { x: number; y: number }) {
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
