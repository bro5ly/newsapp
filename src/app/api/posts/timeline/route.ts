// app/api/posts/timeline/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabasePostRepository } from '@/features/posts/infrastructure/SupabasePostRepository';
import { SupabaseFriendshipRepository } from '@/features/friendship/infrastructure/SupabaseFriendshipRepository';
import { GetTimelineUseCase } from '@/features/posts/application/GetTimelineUseCase';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 依存関係の注入
    const postRepo = new SupabasePostRepository(supabase);
    const friendshipRepo = new SupabaseFriendshipRepository(supabase);
    const useCase = new GetTimelineUseCase(postRepo, friendshipRepo);

    try {
        const posts = await useCase.execute(user.id);

        // 各投稿のコメント数とdisplay_nameを取得
        const postsWithCommentCount = await Promise.all(
            posts.map(async (post) => {
                const [commentResult, profileResult] = await Promise.all([
                    supabase
                        .from('comments')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', post.id),
                    supabase
                        .from('profiles')
                        .select('display_name')
                        .eq('id', post.userId)
                        .single()
                ]);

                return {
                    id: post.id,
                    userId: post.userId,
                    displayName: profileResult.data?.display_name || null,
                    title: post.title,
                    content: post.content,
                    videoUrl: post.videoUrl,
                    sceneType: post.sceneType,
                    privacyScope: post.privacyScope,
                    status: post.status,
                    createdAt: post.createdAt,
                    commentCount: commentResult.count ?? 0,
                };
            })
        );

        return NextResponse.json(postsWithCommentCount);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}