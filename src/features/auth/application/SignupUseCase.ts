// features/auth/application/SignUpUseCase.ts
import { AuthRepository } from "../infrastructure/AuthRepository";
import { AuthResult } from "../infrastructure/AuthTypes";

export class SignUpUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResult<{ message: string }>> {
    try {
      if (!email || password.length < 6) {
        return { success: false, error: { message: '入力が不正です', code: 'INVALID_PARAMETER' } };
      }
      await this.repository.signUp(email, password);
      return { success: true, data: { message: '確認メールを送信しました' } };
    } catch (error: any) {
      return { success: false, error: { message: error.message, code: 'SERVER_ERROR' } };
    }
  }
}