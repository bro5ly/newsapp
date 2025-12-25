// src/app/api/friends/pending/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseFriendshipRepository } from '@/features/friendship/infrastructure/SupabaseFriendshipRepository';

export async function GET() {
    const supabase = await createClient();

    // 1. 現在ログインしている「自分」の情報を取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const repository = new SupabaseFriendshipRepository(supabase);

    try {
        // 2. 「friend_id」が「自分のID」かつ「PENDING」なものを探す
        // ※ ここを user_id で探すと「自分が送ったもの」になってしまいます
        const requests = await repository.findPendingRequests(user.id);

        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}