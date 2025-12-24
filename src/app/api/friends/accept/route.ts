// src/app/api/friends/accept/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseFriendshipRepository } from '@/features/friendship/infrastructure/SupabaseFriendshipRepository';
import { AcceptFriendRequestUseCase } from '@/features/friendship/application/AcceptFriendRequestUseCase';

export async function POST(request: Request) {
  const { friendshipId } = await request.json();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repository = new SupabaseFriendshipRepository(supabase);
  const useCase = new AcceptFriendRequestUseCase(repository);

  try {
    const result = await useCase.execute(friendshipId, user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}