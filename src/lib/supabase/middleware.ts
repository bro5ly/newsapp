// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. レスポンスの初期化
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Supabaseクライアントの初期化（クッキー管理を含む）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. セッションのリフレッシュとユーザー取得
  const { data: { user } } = await supabase.auth.getUser()

  // 4. ガード処理（リダイレクトロジック）
  const url = request.nextUrl.clone()

  // 未ログインで保護ページ（/dashboard）にアクセスした場合
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ログイン済みで認証ページ（/login, /signup）にアクセスした場合
  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}