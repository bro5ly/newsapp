// features/post/domain/Comment.ts
export class Comment {
    constructor(
        public readonly id: string,
        public readonly postId: string,
        public readonly userId: string,
        public readonly content: string,
        public readonly createdAt: Date,
        public readonly displayName?: string, // 表示用（任意）
        public readonly avatarUrl?: string    // 表示用（任意）
    ) { }
}