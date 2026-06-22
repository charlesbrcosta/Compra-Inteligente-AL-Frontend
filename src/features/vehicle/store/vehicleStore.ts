import { create } from 'zustand';

import { VehicleService } from '@/features/vehicle/application/VehicleService';
import { ApiVehicleRepository } from '@/features/vehicle/infrastructure/ApiVehicleRepository';
import { Vehicle } from '@/shared/types/entities';

interface VehicleState {
  vehicle: Vehicle | null;
  loadVehicle: () => Promise<void>;
  saveVehicle: (vehicle: Vehicle) => Promise<void>;
}

const service = new VehicleService(new ApiVehicleRepository());

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicle: null,
  loadVehicle: async () => {
    const vehicle = await service.getCurrent();
    set({ vehicle });
  },
  saveVehicle: async (vehicle) => {
    const saved = await service.save(vehicle);
    set({ vehicle: saved });
  },
}));
