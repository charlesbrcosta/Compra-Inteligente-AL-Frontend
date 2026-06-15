import { create } from 'zustand';

import { ApiAuthRepository } from '@/features/auth/infrastructure/ApiAuthRepository';
import { AuthSession } from '@/features/auth/domain/AuthRepository';
import { User } from '@/shared/types/entities';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (user: User, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const repository = new ApiAuthRepository();

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  hydrate: async () => {
    const session = await repository.getSession();
    set({ session, isLoading: false });
  },
  login: async (email, password) => {
    const session = await repository.login(email, password);
    set({ session });
  },
  register: async (user, password) => {
    const session = await repository.register(user, password);
    set({ session });
  },
  logout: async () => {
    await repository.logout();
    set({ session: null });
  },
}));
