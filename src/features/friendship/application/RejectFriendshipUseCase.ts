// features/friendship/application/RejectFriendshipUseCase.ts

import { FriendshipRepository } from "../domain/FriendshipRepository";

export class RejectFriendshipUseCase {
    constructor(private friendshipRepository: FriendshipRepository) { }

    async execute(friendshipId: string, currentUserId: string) {
        // 1. 対象の申請が存在するか確認
        const friendship = await this.friendshipRepository.findById(friendshipId);
        if (!friendship) {
            throw new Error("対象の申請が見つかりません。");
        }

        // 2. セキュリティチェック
        // 「申請した本人」または「申請された本人」以外は削除できない
        const isSender = friendship.userId === currentUserId;
        const isReceiver = friendship.friendId === currentUserId;

        if (!isSender && !isReceiver) {
            throw new Error("この操作を行う権限がありません。");
        }

        // 3. 削除実行
        await this.friendshipRepository.delete(friendshipId);

        return { success: true };
    }
}