import { create } from 'zustand';

import { ApiAuthRepository } from '@/features/auth/infrastructure/ApiAuthRepository';
import { AuthSession } from '@/features/auth/domain/AuthRepository';
import { User } from '@/shared/types/entities';

interface AuthState {
  session: AuthSession | null;
  lastEmail: string;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (user: User, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const repository = new ApiAuthRepository();

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  lastEmail: '',
  isLoading: true,
  checkSession: async () => {
    if (!get().session) {
      return;
    }

    const session = await repository.getSession();
    const lastEmail = await repository.getLastEmail();
    set({ session, lastEmail });
  },
  hydrate: async () => {
    const lastEmail = await repository.getLastEmail();
    set({ session: null, lastEmail, isLoading: false });
  },
  login: async (email, password) => {
    const session = await repository.login(email, password);
    set({ session, lastEmail: session.user.email });
  },
  register: async (user, password) => {
    const session = await repository.register(user, password);
    set({ session, lastEmail: session.user.email });
  },
  logout: async () => {
    await repository.logout();
    set({ session: null });
  },
}));
