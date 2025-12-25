'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

// --- 型定義 ---
interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  privacyScope: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  sceneType: string;
  createdAt: string;
  visibilityExpiresAt: string | null;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [now, setNow] = useState(new Date());

  // 1分ごとに現在時刻を更新してカウントダウンを動かす
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. データの取得
  const fetchTimeline = async () => {
    try {
      const res = await fetch('/api/posts/timeline');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
        if (data.some(p => p.status === 'PENDING')) {
          setIsGenerating(true);
          startFakeProgress();
        }
      }
    } catch (err) {
      console.error("Timeline fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  // 2. Realtime 購読
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('timeline-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'posts' 
      }, (payload) => {
        setPosts(current => current.map(p => p.id === payload.new.id ? {
          ...p,
          status: payload.new.generation_status,
          videoUrl: payload.new.video_url,
          // カラム名がスネークケースで届く可能性に注意
          visibilityExpiresAt: payload.new.visibility_expires_at || p.visibilityExpiresAt
        } : p));
        
        if (payload.new.generation_status === 'COMPLETED') {
          setProgress(100);
          setTimeout(() => {
            setIsGenerating(false);
            setProgress(0);
          }, 1000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const startFakeProgress = () => {
    setProgress(10);
    const timer = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 2 : prev));
    }, 500);
    return () => clearInterval(timer);
  };

  // --- ヘルパー関数: 残り時間の表示 ---
  const getExpirationStatus = (post: Post) => {
    if (!post.visibilityExpiresAt) return null;
    const expiresAt = new Date(post.visibilityExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);

    if (diffMs <= 0) {
      return { label: '🔒 期限切れ', className: 'bg-gray-200 text-gray-600' };
    }
    const timeLabel = diffHrs > 0 ? `あと${diffHrs}時間` : `あと${diffMins}分`;
    return { label: `⏳ ${timeLabel}`, className: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* 進捗インジケーター */}
      {isGenerating && (
        <div className="fixed top-4 right-4 bg-white p-4 shadow-2xl rounded-2xl border-2 border-blue-500 w-72 z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-blue-700 animate-pulse">🎥 動画を生成中...</span>
            <span className="text-xs font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">タイムライン</h1>
        <button 
          onClick={() => window.location.href = '/posts/new'}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          ＋ 新規投稿
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length > 0 ? (
          posts.map(post => {
            const exp = getExpirationStatus(post);
            return (
              <article key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {post.userId.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-700">User_{post.userId.slice(0, 4)}</span>
                  </div>
                  <div className="flex gap-2">
                    {exp && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${exp.className}`}>{exp.label}</span>}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase">{post.privacyScope}</span>
                  </div>
                </div>
                
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative group-hover:bg-black transition-colors">
                  {post.status === 'COMPLETED' && post.videoUrl ? (
                    <video src={post.videoUrl} controls className="w-full h-full object-contain" />
                  ) : post.status === 'FAILED' ? (
                    <div className="text-center p-4">
                      <span className="text-3xl">⚠️</span>
                      <p className="text-white text-xs mt-2 font-medium">生成に失敗しました</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-white text-[10px] font-medium tracking-widest uppercase animate-pulse">Generating...</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{post.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-medium">{new Date(post.createdAt).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{post.sceneType}</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">表示できる投稿がありません。</p>
            <p className="text-gray-400 text-sm mt-1">新しい動画を作成して共有してみましょう！</p>
          </div>
        )}
      </div>
    </div>
  );
}