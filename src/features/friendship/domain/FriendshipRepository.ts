// features/friendship/domain/FriendshipRepository.ts

import { Friendship } from "./friendhip";

export interface FriendshipRepository {
  findById(id: string): Promise<Friendship | null>

  delete(id: string): Promise<void>;

  // 二人の間の現在の関係を取得する
  findBetween(userId: string, friendId: string): Promise<Friendship | null>;

  // 新規申請の保存や更新
  save(friendship: Friendship): Promise<void>;

  // フレンド一覧（ACCEPTEDな人たち）を取得する
  findAllFriends(userId: string): Promise<string[]>; // IDのリストを返す
}