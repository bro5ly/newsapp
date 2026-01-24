// features/post/infrastructure/SupabasePostRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Post, PrivacyScope, GenerationStatus } from '../domain/Post';
import { PostRepository } from '../domain/PostRepository';

export class SupabasePostRepository implements PostRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * DBの生データを Post エンティティに変換する内部メソッド
     * 引数の順番間違いや型の不整合を一箇所で管理します
     */
    private mapToEntity(item: any): Post {
        return new Post(
            item.id,
            item.user_id,
            item.title,
            item.content,
            item.video_url,
            item.scene_type,
            item.privacy_scope as PrivacyScope,
            item.generation_status as GenerationStatus,
            new Date(item.created_at),
            // 追加: DBの文字列(またはnull)をDateオブジェクトに変換
            item.visibility_expires_at ? new Date(item.visibility_expires_at) : null
        );
    }

    async save(post: Post): Promise<void> {
        const { error } = await this.supabase
            .from('posts')
            .upsert({
                id: post.id,
                user_id: post.userId,
                title: post.title,
                content: post.content,
                video_url: post.videoUrl,
                scene_type: post.sceneType,
                privacy_scope: post.privacyScope,
                generation_status: post.status,
                created_at: post.createdAt.toISOString(),
                // 追加: 有効期限を保存（nullも許容）
                visibility_expires_at: post.visibilityExpiresAt?.toISOString() || null,
            });

        if (error) throw new Error(`Supabase save error: ${error.message}`);
    }

    async findById(id: string): Promise<Post | null> {
        const { data, error } = await this.supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .maybeSingle(); // single() より安全（0件でエラーにならない）

        if (error || !data) return null;

        return this.mapToEntity(data);
    }

    async findByUserId(userId: string): Promise<Post[]> {
        const { data, error } = await this.supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(item => this.mapToEntity(item));
    }

    async findTimelinePosts(targetUserIds: string[], currentUserId: string): Promise<Post[]> {
        const now = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('posts')
            .select('*')
            .in('user_id', targetUserIds)
            /**
             * フィルタリングのロジック:
             * 1. 自分の投稿 (user_id = currentUserId) は常に表示
             * 2. 他人の投稿は PRIVATE ではない、かつ (期限が設定されていない OR 現在時刻より先)
             */
            // .or(`user_id.eq.${currentUserId},and(privacy_scope.neq.PRIVATE,or(visibility_expires_at.is.null,visibility_expires_at.gt.${now}))`)
            // .or(`user_id.eq.${currentUserId},and(privacy_scope.neq.PRIVATE,or(visibility_expires_at.is.null,visibility_expires_at.gt.${now}))`)
            // .order('created_at', { ascending: false });

            .or(`visibility_expires_at.is.null,visibility_expires_at.gt.${now}`)
            // 2. 次に「自分のもの」か「公開されている他人のもの」か
            .or(`user_id.eq.${currentUserId},privacy_scope.neq.PRIVATE`)
            .order('created_at', { ascending: false });
        if (error || !data) return [];

        return data.map(item => this.mapToEntity(item));
    }
}