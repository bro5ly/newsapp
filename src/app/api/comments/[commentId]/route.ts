import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { SupabaseCommentRepository } from '@/features/comments/infrastructure/SupabaseCommentRepository';
import { DeleteCommentUsecase } from '@/features/comments/application/DeleteCommentUseCase';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ commentId: string }> } // 1. Promise型にする
) {
    // 2. params を await して取り出す
    const { commentId } = await params;

    const supabase = await createClient();

    // 認証チェック (sessionより安全なgetUserを推奨)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new SupabaseCommentRepository(supabase);
    const usecase = new DeleteCommentUsecase(repository);

    try {
        // デバッグ用ログ: サーバー側で ID が取れているか確認
        console.log("Deleting Comment ID:", commentId);

        if (!commentId || commentId === 'undefined') {
            throw new Error("Invalid Comment ID");
        }

        // 自身の userId を渡すことで、他人のコメントを消せないようガード
        await usecase.execute(commentId, user.id);

        return NextResponse.json({ message: 'Deleted' });
    } catch (error: any) {
        console.error("Delete Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}