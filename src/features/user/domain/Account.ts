// features/user/domain/Account.ts

export type AccountStatus = 'INITIALIZING' | 'ACTIVE' | 'LOCKED';

export class Account {
  // コンストラクタで private readonly を使うことで、
  // フィールド宣言と初期化を同時に行うのがモダンな書き方です。
  constructor(
    private readonly _id: string,
    private _name: string,
    private _status: AccountStatus,
    private readonly _email: string
  ) {}

  // Getterの正しい構文（ () => は不要です ）
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get status(): AccountStatus {
    return this._status;
  }

  get email(): string {
    return this._email;
  }

  /**
   * 振る舞い：プロフィール完了
   * ルールをドメイン層に閉じ込めます。
   */
  public completeProfile(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("名前は1文字以上である必要があります");
    }
    
    // 既に凍結されている場合は変更できない等のビジネスルールを追加可能
    if (this._status === 'LOCKED') {
      throw new Error("凍結されたアカウントのプロフィールは更新できません");
    }

    this._name = name;
    this._status = 'ACTIVE';
  }

  /**
   * 振る舞い：アクション可能判定
   * 他のBC（NewsやFriendship）から、このユーザーが活動可能か確認するために使います。
   */
  public canPerformAction(): boolean {
    return this._status === 'ACTIVE';
  }

  /**
   * 振る舞い：凍結
   */
  public lock(): void {
    this._status = 'LOCKED';
  }
}