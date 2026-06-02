import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { User } from '@/shared/types/entities';
import { UserRepository } from '@/features/user/domain/UserRepository';

export class AsyncStorageUserRepository implements UserRepository {
  async getCurrent(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  }

  async save(user: User): Promise<User> {
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.user);
  }
}
