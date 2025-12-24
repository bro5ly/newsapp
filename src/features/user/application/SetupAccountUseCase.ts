// features/user/application/SetupAccountUseCase.ts

import { UserRepository } from "../domain/UserRepository";

export class SetupAccountUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, name: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. リポジトリから既存のアカウントを取得
      const account = await this.userRepository.findById(id);

      if (!account) {
        return { success: false, message: "アカウントが見つかりません" };
      }

      // 2. ドメインモデルのメソッドを呼び出して状態を更新
      // ここで「名前は1文字以上」などのドメインルールが実行されます
      account.completeProfile(name);

      // 3. 更新された状態をリポジトリ経由で保存
      await this.userRepository.save(account);

      return { success: true, message: "プロフィールの設定が完了しました" };
    } catch (error: any) {
      // ドメインモデルが投げたエラー（名前が空など）をここでキャッチ
      return { success: false, message: error.message };
    }
  }
}