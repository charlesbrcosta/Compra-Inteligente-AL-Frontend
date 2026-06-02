import { Vehicle } from '@/shared/types/entities';
import { VehicleRepository } from '@/features/vehicle/domain/VehicleRepository';

export class VehicleService {
  constructor(private readonly repository: VehicleRepository) {}

  getCurrent() {
    return this.repository.getCurrent();
  }

  save(vehicle: Vehicle) {
    return this.repository.save(vehicle);
  }
}
