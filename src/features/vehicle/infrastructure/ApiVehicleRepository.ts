import { VehicleRepository } from '@/features/vehicle/domain/VehicleRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { Vehicle } from '@/shared/types/entities';

export class ApiVehicleRepository implements VehicleRepository {
  getCurrent(): Promise<Vehicle | null> {
    return apiRequest<Vehicle | null>('/vehicles/me', { authenticated: true });
  }

  save(vehicle: Vehicle): Promise<Vehicle> {
    return apiRequest<Vehicle>('/vehicles/me', {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(vehicle),
    });
  }

  async clear(): Promise<void> {
    return undefined;
  }
}
