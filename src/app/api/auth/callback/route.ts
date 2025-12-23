import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  // URLについている ?code=... を取得
  const code = searchParams.get('code')
  // ログイン後に飛ばしたい先
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // 【重要】ここで「コード」を「セッション（ログイン状態）」に交換します
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ログイン成功！ダッシュボードへリダイレクト
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // エラーが起きた場合はログインページへ戻す
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}