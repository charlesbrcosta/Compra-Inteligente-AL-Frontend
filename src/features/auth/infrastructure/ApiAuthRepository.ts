import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthRepository, AuthSession } from '@/features/auth/domain/AuthRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { User } from '@/shared/types/entities';

export class ApiAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await this.persistSession(session);
    return session;
  }

  async register(user: User, password: string): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...user, password }),
    });

    await this.persistSession(session);
    return session;
  }

  async getSession(): Promise<AuthSession | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.auth);
    return raw ? JSON.parse(raw) : null;
  }

  async logout(): Promise<void> {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      authenticated: true,
    }).catch(() => undefined);

    await AsyncStorage.multiRemove([STORAGE_KEYS.auth, STORAGE_KEYS.user]);
  }

  private async persistSession(session: AuthSession) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.auth, JSON.stringify(session)],
      [STORAGE_KEYS.user, JSON.stringify(session.user)],
    ]);
  }
}
