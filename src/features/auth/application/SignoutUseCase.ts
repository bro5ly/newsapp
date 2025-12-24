// features/auth/application/SignOutUseCase.ts
import { AuthRepository } from "../infrastructure/AuthRepository";

export class SignOutUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.repository.signOut();
  }
}