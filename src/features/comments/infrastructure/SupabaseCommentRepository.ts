import { SupabaseClient } from '@supabase/supabase-js';
import { Database, TablesInsert } from '@/lib/database.types';
import { ICommentRepository } from '../domain/CommentRepository';
import { Comment } from '../domain/Comment';

export class SupabaseCommentRepository implements ICommentRepository {
    constructor(private client: SupabaseClient<Database>) { }

    async save(comment: TablesInsert<'comments'>): Promise<void> {
        const { error } = await this.client
            .from('comments')
            .insert(comment);
        if (error) throw error;
    }

    async delete(id: string, userId: string): Promise<void> {
        const { error } = await this.client
            .from('comments')
            .delete()
            .match({ id, user_id: userId });
        if (error) throw error;
    }

    async findByPostId(postId: string): Promise<Comment[]> {
        const { data, error } = await this.client
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }
}