import { User } from "../domain/User";
import { UserId } from "../domain/UserId";

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
