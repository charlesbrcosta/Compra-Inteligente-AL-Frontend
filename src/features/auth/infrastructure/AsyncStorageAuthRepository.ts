import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { mockProducts, mockUser, mockVehicle } from '@/shared/constants/mockData';
import { createId } from '@/shared/utils/id';
import { AuthRepository, AuthSession } from '@/features/auth/domain/AuthRepository';
import { User } from '@/shared/types/entities';

export class AsyncStorageAuthRepository implements AuthRepository {
  async login(email: string, _password: string): Promise<AuthSession> {
    const persistedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);
    const user = persistedUser ? JSON.parse(persistedUser) : { ...mockUser, email };
    const session = { token: `mock-token-${createId()}`, user };

    await this.persistSession(session);
    await this.ensureDemoData(user);

    return session;
  }

  async register(user: User, _password: string): Promise<AuthSession> {
    const session = { token: `mock-token-${createId()}`, user };

    await this.persistSession(session);
    await this.ensureDemoData(user);

    return session;
  }

  async getSession(): Promise<AuthSession | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.auth);
    return raw ? JSON.parse(raw) : null;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.auth);
  }

  private async persistSession(session: AuthSession) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.auth, JSON.stringify(session)],
      [STORAGE_KEYS.user, JSON.stringify(session.user)],
    ]);
  }

  private async ensureDemoData(user: User) {
    const [vehicle, products] = await AsyncStorage.multiGet([STORAGE_KEYS.vehicle, STORAGE_KEYS.products]);

    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

    if (!vehicle[1]) {
      await AsyncStorage.setItem(STORAGE_KEYS.vehicle, JSON.stringify(mockVehicle));
    }

    if (!products[1]) {
      await AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify(mockProducts));
    }
  }
}
