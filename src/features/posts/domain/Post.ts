// features/post/domain/Post.ts
export type PrivacyScope = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type GenerationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export class Post {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        private _title: string,
        private _content: string,
        private _videoUrl: string | null,
        private _sceneType: string,
        private _privacyScope: PrivacyScope,
        private _generationStatus: GenerationStatus,
        public readonly createdAt: Date,
        // 追加：有効期限（nullの場合は無期限を許容する設計にしておくと柔軟です）
        private _visibilityExpiresAt: Date | null
    ) { }

    // Getter群
    get title() { return this._title; }
    get content() { return this._content; }
    get videoUrl() { return this._videoUrl; }
    get sceneType() { return this._sceneType; }
    get privacyScope() { return this._privacyScope; }
    get status() { return this._generationStatus; }
    get visibilityExpiresAt() { return this._visibilityExpiresAt; }

    // 24時間経過しているか判定するビジネスロジック
    public isExpired(now: Date = new Date()): boolean {
        if (!this._visibilityExpiresAt) return false;
        return now > this._visibilityExpiresAt;
    }

    // 状態遷移のメソッド（カプセル化）
    public complete(videoUrl: string): void {
        this._videoUrl = videoUrl;
        this._generationStatus = 'COMPLETED';
    }

    public fail(): void {
        this._generationStatus = 'FAILED';
    }
}