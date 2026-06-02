import { GeoLocation, Market } from '@/shared/types/entities';

export class DistanceService {
  private readonly roadRouteFactor = 1.25;

  calculateOneWayKm(origin: GeoLocation, destination: GeoLocation) {
    const earthRadiusKm = 6371;
    const deltaLatitude = this.toRadians(destination.latitude - origin.latitude);
    const deltaLongitude = this.toRadians(destination.longitude - origin.longitude);

    const originLatitude = this.toRadians(origin.latitude);
    const destinationLatitude = this.toRadians(destination.latitude);

    const haversine =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(deltaLongitude / 2) ** 2;

    const straightLineKm = 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));

    return Number((straightLineKm * this.roadRouteFactor).toFixed(1));
  }

  applyCurrentLocationDistance(market: Market, currentLocation: GeoLocation): Market {
    return {
      ...market,
      distanceKm: this.calculateOneWayKm(currentLocation, market.location),
    };
  }

  private toRadians(value: number) {
    return (value * Math.PI) / 180;
  }
}
