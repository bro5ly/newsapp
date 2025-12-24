// src/app/api/user/setup/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseUserRepository } from '@/features/user/infrastructure/SupabaseUserRepository';
import { SetupAccountUseCase } from '@/features/user/application/SetupAccountUseCase';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const supabase = await createClient();
    
    // 1. 現在のAuthユーザー(ID)を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 2. 依存関係の注入 (DI)
    const repository = new SupabaseUserRepository(supabase);
    const useCase = new SetupAccountUseCase(repository);

    // 3. ユースケース実行
    const result = await useCase.execute(user.id, name);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}