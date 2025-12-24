// features/auth/application/GoogleSignInUseCase.ts
import { AuthRepository } from "../infrastructure/AuthRepository";
import { AuthResult } from "../infrastructure/AuthTypes";

export class GoogleSignInUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(): Promise<AuthResult<{ url: string }>> {
    try {
      const { url } = await this.repository.signInWithGoogle();
      return { success: true, data: { url } };
    } catch (error: any) {
      return { success: false, error: { message: 'Googleログインの開始に失敗', code: 'GOOGLE_AUTH_INIT_FAILED' } };
    }
  }
}