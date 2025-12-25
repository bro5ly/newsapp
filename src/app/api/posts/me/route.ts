// app/api/posts/me/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabasePostRepository } from '@/features/posts/infrastructure/SupabasePostRepository';
import { GetMyPostsUseCase } from '@/features/posts/application/GetMyPostsUseCase';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const postRepo = new SupabasePostRepository(supabase);
    const useCase = new GetMyPostsUseCase(postRepo);

    try {
        const posts = await useCase.execute(user.id);
        const responseData = posts.map(post => ({
            id: post.id,
            title: post.title,
            videoUrl: post.videoUrl,
            privacyScope: post.privacyScope,
            status: post.status,
            createdAt: post.createdAt,
        }));

        return NextResponse.json(responseData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}