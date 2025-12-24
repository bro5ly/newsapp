// src/middleware.ts (Next.js標準の場所)

import { NextResponse, type NextRequest } from 'next/server';
// こっちが「道具」としてのsupabase middleware
import { updateSession } from '@/lib/supabase/middleware'; 
import { createClient } from '@/lib/supabase/server'; // または middleware用のclient

export async function middleware(request: NextRequest) {
  // 1. まずSupabaseのセッションを更新する（公式の定型処理）
  // これにより、有効期限切れのトークンが自動で更新されます
  let response = await updateSession(request);

  // 2. 認証・認可のロジック（ここからが本番）
  const supabase = await createClient(); // サーバーサイドクライアント
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 1. APIルートへのリクエストは、一切の加工をせずそのまま通過させる
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // --- ガードのロジック ---
  
  // 未ログイン時の処理
  if (!user && !['/login', '/signup', '/api/auth'].some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ログイン済みなら status をチェック
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single();

    const status = profile?.status;

    // INITIALIZING なのに /setup 以外にいたら飛ばす
    if (status === 'INITIALIZING' && path !== '/setup') {
      return NextResponse.redirect(new URL('/setup', request.url));
    }
    
    // ACTIVE なのに /setup にいたらダッシュボードへ
    if (status === 'ACTIVE' && path === '/setup') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

// 静的ファイルなどには適用しない設定
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};