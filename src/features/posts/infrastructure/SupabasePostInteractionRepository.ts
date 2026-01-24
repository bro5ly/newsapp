// features/post/infrastructure/SupabasePostInteractionRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { PostInteractionRepository } from '../domain/PostInteractionRepository';
import { Like } from '../domain/Like';
import { Comment } from '../domain/Comment';

export class SupabasePostInteractionRepository implements PostInteractionRepository {
    constructor(private supabase: SupabaseClient) { }

    // --- いいね (Likes) ---
    async saveLike(like: Like): Promise<void> {
        const { error } = await this.supabase
            .from('post_likes')
            .upsert({
                post_id: like.postId,
                user_id: like.userId,
                created_at: like.createdAt.toISOString()
            });

        if (error) throw new Error(`Like failed: ${error.message}`);
    }

    async deleteLike(postId: string, userId: string): Promise<void> {
        const { error } = await this.supabase
            .from('post_likes')
            .delete()
            .match({ post_id: postId, user_id: userId });

        if (error) throw new Error(`Unlike failed: ${error.message}`);
    }

    async getLikeCount(postId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (error) return 0;
        return count || 0;
    }

    async isLikedByUser(postId: string, userId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('post_likes')
            .select('post_id')
            .match({ post_id: postId, user_id: userId })
            .maybeSingle();

        return !!data;
    }

    // --- コメント (Comments) ---
    async saveComment(comment: Comment): Promise<void> {
        const { error } = await this.supabase
            .from('post_comments')
            .insert({
                id: comment.id,
                post_id: comment.postId,
                user_id: comment.userId,
                content: comment.content,
                created_at: comment.createdAt.toISOString()
            });

        if (error) throw new Error(`Comment save failed: ${error.message}`);
    }

    async getCommentsByPostId(postId: string): Promise<Comment[]> {
        const { data, error } = await this.supabase
            .from('post_comments')
            .select(`
                *,
                profiles:user_id ( display_name, avatar_url )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error || !data) return [];

        return data.map(item => new Comment(
            item.id,
            item.post_id,
            item.user_id,
            item.content,
            new Date(item.created_at),
            item.profiles?.display_name,
            item.profiles?.avatar_url
        ));
    }

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const { error } = await this.supabase
            .from('post_comments')
            .delete()
            .match({ id: commentId, user_id: userId });

        if (error) throw new Error(`Comment delete failed: ${error.message}`);
    }
}