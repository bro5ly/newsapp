// features/user/domain/UserRepository.ts
import { Account } from "./Account";

export interface UserRepository {
  // IDからAccountを取得する
  findById(id: string): Promise<Account | null>;
  
  // Accountの状態を保存（更新）する
  save(account: Account): Promise<void>;
}