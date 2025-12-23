// app/api/auth/signup/route.ts
import { SignUpUseCase } from '@/features/auth/application/SignupUseCase';
import { SupabaseAuthRepository } from '@/features/auth/infrastructure/SupabaseAuthRepository';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
// ...インポート省略

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = await createClient();
        const useCase = new SignUpUseCase(new SupabaseAuthRepository(supabase));

        const result = await useCase.execute(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ data: result.data }, { status: 201 }); // 201: Created

    } catch (err) {
        return NextResponse.json({ error: { message: "通信エラー" } }, { status: 500 });
    }
}