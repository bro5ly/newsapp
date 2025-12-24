// features/friendship/domain/Friendship.ts

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export class Friendship {
  constructor(
    public readonly id: string,
    public readonly userId: string,   // 申請者
    public readonly friendId: string, // 相手
    private _status: FriendshipStatus,
    public readonly createdAt: Date
  ) {
    // 自分自身には申請できないというドメインルール
    if (userId === friendId) {
      throw new Error("自分自身をフレンドに追加することはできません");
    }
  }

  get status(): FriendshipStatus {
    return this._status;
  }

  // 承認する振る舞い
  public accept(): void {
    if (this._status !== 'PENDING') {
      throw new Error("待機中の申請のみ承認できます");
    }
    this._status = 'ACCEPTED';
  }

  // ブロックする振る舞い
  public block(): void {
    this._status = 'BLOCKED';
  }
}