// features/friendship/application/AcceptFriendRequestUseCase.ts

import { FriendshipRepository } from "../domain/FriendshipRepository";

export class AcceptFriendRequestUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(friendshipId: string, currentUserId: string) {
    // 1. 既存の申請を取得
    const friendship = await this.friendshipRepository.findById(friendshipId);

    if (!friendship) {
      throw new Error("申請が見つかりません");
    }

    // 2. 権限チェック（承認できるのは「申請された側」だけ）
    if (friendship.friendId !== currentUserId) {
      throw new Error("他人のフレンド申請を承認することはできません");
    }

    // 3. ドメインモデルの振る舞いを実行（status を ACCEPTED へ）
    friendship.accept();

    // 4. 保存
    await this.friendshipRepository.save(friendship);

    return { success: true };
  }
}