// features/auth/application/AuthCallbackUseCase.ts

import { AuthRepository } from "../infrastructure/AuthRepository";
import { UserRepository } from "../../user/domain/UserRepository"; // Userリポジトリを呼ぶ
import { Account } from "../../user/domain/Account";

export class AuthCallbackUseCase {
  constructor(
    private authRepository: AuthRepository,
    private userRepository: UserRepository // 追加
  ) {}

  async execute(code: string) {
    try {
      // 1. セッション確立
      await this.authRepository.exchangeCodeForSession(code);

      // 2. ログインしたユーザー情報を取得
      const authUser = await this.authRepository.getCurrentUser();
      if (!authUser) throw new Error("User not found");

      // 3. プロフィールが存在するか確認し、なければ作成
      const existingAccount = await this.userRepository.findById(authUser.id);
      if (!existingAccount) {
        const newAccount = new Account(
          authUser.id,
          "", // 名前はまだ空
          "INITIALIZING",
          authUser.email
        );
        await this.userRepository.save(newAccount);
      }

      return { success: true, data: { redirectTo: "/setup" } }; // 設定画面へ
    } catch (error) {
      return { success: false, error: { message: "Callback failed", code: "CALLBACK_ERROR" } };
    }
  }
}