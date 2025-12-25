'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

// --- 型定義 ---
interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface Post {
  id: string;
  title: string;
  videoUrl: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  visibilityExpiresAt: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      // 1. プロフィール取得 (GetMyProfileUseCase を通した GET API)
      const profRes = await fetch('/api/profile');
      const profData = await profRes.json();
      if (profRes.ok) {
        setProfile(profData);
        setEditName(profData.displayName || '');
      }

      // 2. 自分の投稿取得
      const postsRes = await fetch('/api/posts/me');
      const postsData = await postsRes.json();
      if (postsRes.ok) setPosts(postsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- ログアウト処理 (SignOutUseCase を利用した API 経由) ---
  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return;
    
    try {
      // /api/auth/signout エンドポイントがある想定、
      // もしくは直接ブラウザクライアントでサインアウト
      const supabase = createClient();
      await supabase.auth.signOut();
      
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // --- 名前更新処理 (UpdateProfileUseCase を通した PATCH API) ---
  const handleUpdateName = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          display_name: editName,
          // 他のフィールドは現状を維持
          avatar_url: profile?.avatarUrl,
          default_visibility_hours: 24 
        }),
      });

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, displayName: editName } : null);
        setIsEditing(false);
      }
    } catch (err) {
      alert('更新に失敗しました');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ユーザー設定セクション */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100">
              {profile?.displayName?.slice(0, 1).toUpperCase() || '?'}
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border-2 border-blue-100 px-3 py-1 rounded-xl focus:border-blue-500 outline-none text-lg font-bold"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition">保存</button>
                  <button onClick={() => setIsEditing(false)} className="text-gray-400 text-sm hover:text-gray-600">キャンセル</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-gray-900">{profile?.displayName || 'No Name'}</h1>
                  <button onClick={() => setIsEditing(true)} className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                </div>
              )}
              <p className="text-gray-400 text-sm mt-1">UserID: {profile?.id.slice(0, 8)}...</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-5 py-2.5 rounded-2xl transition-all border border-transparent hover:border-red-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            サインアウト
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>Your Archive</span>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{posts.length}</span>
      </h2>

      {/* 投稿一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => {
           const isExpired = post.visibilityExpiresAt && new Date(post.visibilityExpiresAt) < new Date();
           return (
             <div key={post.id} className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 transition duration-300 ${isExpired ? 'opacity-60 grayscale-[0.4]' : 'hover:shadow-xl hover:-translate-y-1'}`}>
               <div className="aspect-video bg-gray-900 relative">
                  {post.videoUrl && <video src={post.videoUrl} className="w-full h-full object-cover" />}
                  {isExpired && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-[10px] text-white font-black bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg tracking-widest">ARCHIVED</span>
                    </div>
                  )}
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{post.title}</h3>
                 <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</p>
                    {post.status !== 'COMPLETED' && (
                       <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${post.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 animate-pulse'}`}>
                         {post.status}
                       </span>
                    )}
                 </div>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}