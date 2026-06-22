import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserRepository } from '@/features/user/domain/UserRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { User } from '@/shared/types/entities';

export class ApiUserRepository implements UserRepository {
  async getCurrent(): Promise<User | null> {
    const user = await apiRequest<User>('/users/me', { authenticated: true });
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  }

  async save(user: User): Promise<User> {
    const saved = await apiRequest<User>('/users/me', {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(user),
    });

    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(saved));
    return saved;
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.user);
  }
}
