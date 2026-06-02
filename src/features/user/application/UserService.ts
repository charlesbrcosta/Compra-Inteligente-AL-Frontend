import { User } from '@/shared/types/entities';
import { UserRepository } from '@/features/user/domain/UserRepository';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  getCurrent() {
    return this.repository.getCurrent();
  }

  save(user: User) {
    return this.repository.save(user);
  }
}
