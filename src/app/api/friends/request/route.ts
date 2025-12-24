// src/app/api/friends/request/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseFriendshipRepository } from '@/features/friendship/infrastructure/SupabaseFriendshipRepository';
import { SendFriendRequestUseCase } from '@/features/friendship/application/SendFriendRequestUseCase';

export async function POST(request: Request) {
  const { toUserId } = await request.json();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repository = new SupabaseFriendshipRepository(supabase);
  const useCase = new SendFriendRequestUseCase(repository);

  try {
    const result = await useCase.execute(user.id, toUserId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}