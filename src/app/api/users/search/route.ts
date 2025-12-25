// src/app/api/users/search/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseUserRepository } from '@/features/user/infrastructure/SupabaseUserRepository';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q'); // ?q=名前

    if (!query) return NextResponse.json([]);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const repository = new SupabaseUserRepository(supabase);

    try {
        const users = await repository.searchByName(query, user.id);
        // クライアントに返すデータを整形
        const result = users.map(u => ({
            id: u.id,
            displayName: u.name,
        }));

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}