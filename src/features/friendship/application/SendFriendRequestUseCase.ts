// features/friendship/application/SendFriendRequestUseCase.ts

import { FriendshipRepository } from "../domain/FriendshipRepository";
import { Friendship } from "../domain/friendhip";

export class SendFriendRequestUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(fromUserId: string, toUserId: string) {
    // 1. 既に関係が存在するか確認
    const existing = await this.friendshipRepository.findBetween(fromUserId, toUserId);
    
    if (existing) {
      throw new Error(`既に申請済み、またはフレンド状態です (Status: ${existing.status})`);
    }

    // 2. エンティティの作成 (PENDING状態で開始)
    const newFriendship = new Friendship(
      crypto.randomUUID(),
      fromUserId,
      toUserId,
      'PENDING',
      new Date()
    );

    // 3. 保存
    await this.friendshipRepository.save(newFriendship);

    return { success: true, friendshipId: newFriendship.id };
  }
}