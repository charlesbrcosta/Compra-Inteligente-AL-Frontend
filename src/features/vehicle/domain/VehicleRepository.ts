import { Vehicle } from '@/shared/types/entities';

export interface VehicleRepository {
  getCurrent(): Promise<Vehicle | null>;
  save(vehicle: Vehicle): Promise<Vehicle>;
  clear(): Promise<void>;
}
