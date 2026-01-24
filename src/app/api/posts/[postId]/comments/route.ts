import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/browser';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { SupabaseCommentRepository } from '@/features/comments/infrastructure/SupabaseCommentRepository';
import { GetCommentsUsecase } from '@/features/comments/application/GetCommentUseCase';
import { AddCommentUsecase } from '@/features/comments/application/AddCommentUseCase';

// GET: コメント一覧取得
export async function GET(
    req: Request,
    { params }: { params: Promise<{ postId: string }> } // Promise型に変更
) {
    // 1. params を await する
    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    // 2. デバッグ用にサーバーログを出す
    console.log("Resolved Post ID:", postId);

    if (!postId || postId === 'undefined') {
        return NextResponse.json({
            error: 'Invalid Post ID',
            debug: { received: postId }
        }, { status: 400 });
    }

    const supabase = createClient();
    const usecase = new GetCommentsUsecase(new SupabaseCommentRepository(supabase));

    try {
        const data = await usecase.execute(postId);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// app/api/posts/[postId]/comments/route.ts

export async function POST(
    request: Request,
    { params }: { params: Promise<{ postId: string }> } // Promise型に変更
) {
    // 1. params を await する
    const { postId } = await params;

    // 2. Supabase クライアントの取得
    // createServerClient 自体が内部で await cookies() をしているか確認してください
    const supabase = await createServerClient();

    // 3. 認証チェック
    // getSession よりも getUser の方がセキュリティ的に推奨されます（偽造防止のため）
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. リクエストボディの取得
    const { content } = await request.json();

    // 5. DI (依存性注入)
    const repository = new SupabaseCommentRepository(supabase);
    const usecase = new AddCommentUsecase(repository);

    try {
        // postId が正しく渡っていることを確認
        await usecase.execute(postId, user.id, content);
        return NextResponse.json({ message: 'Success' }, { status: 201 });
    } catch (error: any) {
        console.error("AddComment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}