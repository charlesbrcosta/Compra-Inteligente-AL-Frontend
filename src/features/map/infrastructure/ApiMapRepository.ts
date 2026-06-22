import { MapRepository } from '@/features/map/domain/MapRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { GeoLocation } from '@/shared/types/entities';

export class ApiMapRepository implements MapRepository {
  getCurrentLocation(): Promise<GeoLocation> {
    return apiRequest<GeoLocation>('/map/current-location');
  }
}
