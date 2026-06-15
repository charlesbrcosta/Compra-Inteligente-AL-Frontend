import { GeoLocation } from '@/shared/types/entities';

export interface MapRepository {
  getCurrentLocation(): Promise<GeoLocation>;
}
