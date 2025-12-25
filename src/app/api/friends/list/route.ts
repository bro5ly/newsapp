// src/app/api/friends/list/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseFriendshipRepository } from '@/features/friendship/infrastructure/SupabaseFriendshipRepository';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const repository = new SupabaseFriendshipRepository(supabase);

    try {
        const friends = await repository.findAcceptedFriends(user.id);
        return NextResponse.json(friends);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}