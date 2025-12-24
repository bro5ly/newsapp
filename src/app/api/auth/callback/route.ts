// src/app/api/auth/callback/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseAuthRepository } from '@/features/auth/infrastructure/SupabaseAuthRepository';
import { SupabaseUserRepository } from '@/features/user/infrastructure/SupabaseUserRepository';
import { AuthCallbackUseCase } from '@/features/auth/application/AuthCallbackUseCase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  
  // 両方のリポジトリを用意
  const authRepository = new SupabaseAuthRepository(supabase);
  const userRepository = new SupabaseUserRepository(supabase);
  
  // UseCaseに注入
  const useCase = new AuthCallbackUseCase(authRepository, userRepository);

  const result = await useCase.execute(code);

  if (!result.success) {
    console.error("Callback error:", result.error);
    return NextResponse.redirect(`${origin}/login?error=${result.error?.code}`);
  }

  // 成功したら、プロフィール設定画面(/setup)へリダイレクト
  return NextResponse.redirect(`${origin}${result.data?.redirectTo}`);
}