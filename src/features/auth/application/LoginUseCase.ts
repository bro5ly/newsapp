// features/auth/application/LoginUseCase.ts
import { AuthRepository } from "../infrastructure/AuthRepository";
import { AuthResult } from "../infrastructure/AuthTypes";

export class LoginUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResult<{ message: string }>> {
    try {
      // 簡易バリデーション（クラス化せずここでやる）
      if (!email || !password) {
        return { success: false, error: { message: '入力が足りません', code: 'INVALID_PARAMETER' } };
      }

      await this.repository.signIn(email, password);
      return { success: true, data: { message: 'ログインに成功しました' } };
    } catch (error: any) {
      return { 
        success: false, 
        error: { message: '認証に失敗しました', code: 'AUTH_AUTHENTICATION_FAILED' } 
      };
    }
  }
}