import { create } from 'zustand';

import { UserService } from '@/features/user/application/UserService';
import { AsyncStorageUserRepository } from '@/features/user/infrastructure/AsyncStorageUserRepository';
import { User } from '@/shared/types/entities';

interface UserState {
  user: User | null;
  loadUser: () => Promise<void>;
  saveUser: (user: User) => Promise<void>;
}

const service = new UserService(new AsyncStorageUserRepository());

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loadUser: async () => {
    const user = await service.getCurrent();
    set({ user });
  },
  saveUser: async (user) => {
    const saved = await service.save(user);
    set({ user: saved });
  },
}));
