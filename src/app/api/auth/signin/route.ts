// src/app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseAuthRepository } from '@/features/auth/infrastructure/SupabaseAuthRepository';
import { LoginUseCase } from '@/features/auth/application/LoginUseCase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();
    const repository = new SupabaseAuthRepository(supabase);
    const useCase = new LoginUseCase(repository);

    const result = await useCase.execute(email, password);

    if (!result.success) {
      const status = result.error.code === 'AUTH_AUTHENTICATION_FAILED' ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ data: result.data });
  } catch (err) {
    return NextResponse.json(
      { error: { message: '内部エラー', code: 'SERVER_ERROR' } }, 
      { status: 500 }
    );
  }
}