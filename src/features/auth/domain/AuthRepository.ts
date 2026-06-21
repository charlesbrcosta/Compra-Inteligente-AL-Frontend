import { User } from '@/shared/types/entities';

export interface AuthSession {
  token: string;
  user: User;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  register(user: User, password: string): Promise<AuthSession>;
  getSession(): Promise<AuthSession | null>;
  getLastEmail(): Promise<string>;
  logout(): Promise<void>;
}
