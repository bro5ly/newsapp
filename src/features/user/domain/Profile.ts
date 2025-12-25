// features/user/domain/Profile.ts

export class Profile {
    constructor(
        public readonly id: string,
        public readonly displayName: string | null,
        public readonly avatarUrl: string | null,
        public readonly updatedAt: Date
    ) { }

    /**
     * ビジネスルール：投稿の有効期限を一律で24時間後に設定する
     * 開発者が固定しているため、引数やDBの設定に依存しない
     */
    static calculateDefaultExpiration(baseDate: Date = new Date()): Date {
        const expireDate = new Date(baseDate);
        expireDate.setHours(expireDate.getHours() + 24);
        return expireDate;
    }
}