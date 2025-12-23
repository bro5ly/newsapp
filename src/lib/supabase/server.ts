import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
// 型定義（Database）がある場合はこちらを有効にしてください。なければ削除しても動作します。
// import { Database } from "@/lib/supabase/database.types" 

export async function createClient() {
  const cookieStore = await cookies()

  // <Database> の型指定は、型定義ファイルがある場合のみ追加してください
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component から呼び出された場合、cookieStore.set は失敗することがあります。
            // これは Middleware でセッション更新を行うため、ここでは無視して問題ありません。
          }
        },
      },
    }
  )
}