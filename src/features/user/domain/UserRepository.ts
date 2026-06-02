import { User } from '@/shared/types/entities';

export interface UserRepository {
  getCurrent(): Promise<User | null>;
  save(user: User): Promise<User>;
  clear(): Promise<void>;
}
