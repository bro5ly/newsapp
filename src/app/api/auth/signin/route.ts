import { LoginUseCase } from "@/features/auth/application/LoginUseCase";
import { SupabaseAuthRepository } from "@/features/auth/infrastructure/SupabaseAuthRepository";
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        //扱える形式に変換
        const body = await request.json()
        
        //supabaseクライアントの作成とリポジトリへの注入、それを元にしたユースケースの作成
        const supabase = await createClient()
        const repository = new SupabaseAuthRepository(supabase)
        const useCase = new LoginUseCase(repository)

        //ユースケースの実行
        const result = await useCase.execute({
            email: body.email,
            password: body.password
        })

        if(!result.success){
            const status = result.error.code === 'AUTH_AUTHENTICATION_FAILED' ? 401 : 400
            return NextResponse.json({ error: result.error }, { status })
        }

        return NextResponse.json({ data: result.data }, { status: 200 })
    } catch (err) {
        console.error('API_FATAL_ERROR:', err)
        return NextResponse.json({ error: { message: 'サーバー内でエラーが発生しました', code: 'SERVER_ERROR' } }, {status: 500})
    }
    
    
}