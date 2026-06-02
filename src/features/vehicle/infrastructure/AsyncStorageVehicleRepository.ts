import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { Vehicle } from '@/shared/types/entities';
import { VehicleRepository } from '@/features/vehicle/domain/VehicleRepository';

export class AsyncStorageVehicleRepository implements VehicleRepository {
  async getCurrent(): Promise<Vehicle | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.vehicle);
    return raw ? JSON.parse(raw) : null;
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    await AsyncStorage.setItem(STORAGE_KEYS.vehicle, JSON.stringify(vehicle));
    return vehicle;
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.vehicle);
  }
}
