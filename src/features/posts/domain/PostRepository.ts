// features/post/domain/PostRepository.ts
import { Post } from "./Post";

export interface PostRepository {
    save(post: Post): Promise<void>;
    findById(id: string): Promise<Post | null>;

    // 特定ユーザー群の投稿を、表示期限などのルールを適用して取得する
    findTimelinePosts(targetUserIds: string[], currentUserId: string): Promise<Post[]>;

    // 自分の投稿をすべて取得する（プロフィール用）
    findByUserId(userId: string): Promise<Post[]>;
}