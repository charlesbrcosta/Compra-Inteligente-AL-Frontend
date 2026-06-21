import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthRepository, AuthSession } from '@/features/auth/domain/AuthRepository';
import { apiRequest } from '@/shared/api/apiClient';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { User } from '@/shared/types/entities';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface StoredAuthSession extends AuthSession {
  lastAccessAt: number;
}

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

    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as StoredAuthSession;

      if (isSessionExpired(session.lastAccessAt)) {
        await this.clearSession();
        return null;
      }

      const validatedSession = await apiRequest<AuthSession>('/auth/session', {
        authenticated: true,
      });

      await this.persistSession({ ...validatedSession, token: session.token });
      return { ...validatedSession, token: session.token };
    } catch {
      await this.clearSession();
      return null;
    }
  }

  async logout(): Promise<void> {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      authenticated: true,
    }).catch(() => undefined);

    await this.clearSession();
  }

  async getLastEmail() {
    return (await AsyncStorage.getItem(STORAGE_KEYS.lastLoginEmail)) ?? '';
  }

  private async persistSession(session: AuthSession) {
    const storedSession: StoredAuthSession = {
      ...session,
      lastAccessAt: Date.now(),
    };

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.auth, JSON.stringify(storedSession)],
      [STORAGE_KEYS.lastLoginEmail, session.user.email],
      [STORAGE_KEYS.user, JSON.stringify(session.user)],
    ]);
  }

  private async clearSession() {
    await AsyncStorage.multiRemove([STORAGE_KEYS.auth, STORAGE_KEYS.user]);
  }
}

function isSessionExpired(lastAccessAt?: number) {
  if (!lastAccessAt) {
    return true;
  }

  return Date.now() - lastAccessAt > SESSION_TIMEOUT_MS;
}
