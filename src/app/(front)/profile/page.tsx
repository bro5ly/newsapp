// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClient } from '@/lib/supabase/browser';

// // --- 型定義 ---
// interface Profile {
//   id: string;
//   displayName: string;
//   avatarUrl: string | null;
// }

// interface Post {
//   id: string;
//   title: string;
//   videoUrl: string | null;
//   status: 'PENDING' | 'COMPLETED' | 'FAILED';
//   createdAt: string;
//   visibilityExpiresAt: string | null;
// }

// export default function ProfilePage() {
//   const router = useRouter();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editName, setEditName] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     init();
//   }, []);

//   const init = async () => {
//     try {
//       // 1. プロフィール取得 (GetMyProfileUseCase を通した GET API)
//       const profRes = await fetch('/api/profile');
//       const profData = await profRes.json();
//       if (profRes.ok) {
//         setProfile(profData);
//         setEditName(profData.displayName || '');
//       }

//       // 2. 自分の投稿取得
//       const postsRes = await fetch('/api/posts/me');
//       const postsData = await postsRes.json();
//       if (postsRes.ok) setPosts(postsData);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- ログアウト処理 (SignOutUseCase を利用した API 経由) ---
//   const handleLogout = async () => {
//     if (!confirm('ログアウトしますか？')) return;
    
//     try {
//       // /api/auth/signout エンドポイントがある想定、
//       // もしくは直接ブラウザクライアントでサインアウト
//       const supabase = createClient();
//       await supabase.auth.signOut();
      
//       router.push('/login');
//       router.refresh();
//     } catch (err) {
//       console.error('Logout failed', err);
//     }
//   };

//   // --- 名前更新処理 (UpdateProfileUseCase を通した PATCH API) ---
//   const handleUpdateName = async () => {
//     try {
//       const res = await fetch('/api/profile', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           display_name: editName,
//           // 他のフィールドは現状を維持
//           avatar_url: profile?.avatarUrl,
//           default_visibility_hours: 24 
//         }),
//       });

//       if (res.ok) {
//         setProfile(prev => prev ? { ...prev, displayName: editName } : null);
//         setIsEditing(false);
//       }
//     } catch (err) {
//       alert('更新に失敗しました');
//     }
//   };

//   if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* ユーザー設定セクション */}
//       <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//           <div className="flex items-center gap-6">
//             <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100">
//               {profile?.displayName?.slice(0, 1).toUpperCase() || '?'}
//             </div>
//             <div>
//               {isEditing ? (
//                 <div className="flex items-center gap-2">
//                   <input 
//                     type="text" 
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     className="border-2 border-blue-100 px-3 py-1 rounded-xl focus:border-blue-500 outline-none text-lg font-bold"
//                     autoFocus
//                   />
//                   <button onClick={handleUpdateName} className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition">保存</button>
//                   <button onClick={() => setIsEditing(false)} className="text-gray-400 text-sm hover:text-gray-600">キャンセル</button>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3">
//                   <h1 className="text-2xl font-black text-gray-900">{profile?.displayName || 'No Name'}</h1>
//                   <button onClick={() => setIsEditing(true)} className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
//                   </button>
//                 </div>
//               )}
//               <p className="text-gray-400 text-sm mt-1">UserID: {profile?.id.slice(0, 8)}...</p>
//             </div>
//           </div>

//           <button 
//             onClick={handleLogout}
//             className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-5 py-2.5 rounded-2xl transition-all border border-transparent hover:border-red-100"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
//             サインアウト
//           </button>
//         </div>
//       </div>

//       <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//         <span>Your Archive</span>
//         <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{posts.length}</span>
//       </h2>

//       {/* 投稿一覧 */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {posts.map(post => {
//            const isExpired = post.visibilityExpiresAt && new Date(post.visibilityExpiresAt) < new Date();
//            return (
//              <div key={post.id} className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 transition duration-300 ${isExpired ? 'opacity-60 grayscale-[0.4]' : 'hover:shadow-xl hover:-translate-y-1'}`}>
//                <div className="aspect-video bg-gray-900 relative">
//                   {post.videoUrl && <video src={post.videoUrl} className="w-full h-full object-cover" />}
//                   {isExpired && (
//                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
//                       <span className="text-[10px] text-white font-black bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg tracking-widest">ARCHIVED</span>
//                     </div>
//                   )}
//                </div>
//                <div className="p-4">
//                  <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{post.title}</h3>
//                  <div className="flex justify-between items-center mt-2">
//                     <p className="text-[10px] text-gray-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</p>
//                     {post.status !== 'COMPLETED' && (
//                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${post.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 animate-pulse'}`}>
//                          {post.status}
//                        </span>
//                     )}
//                  </div>
//                </div>
//              </div>
//            );
//         })}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { LogOut, Lock, ChevronDown, Play, X, UserCircle, Users, Trash2, Bell, Heart, MessageCircle, UserPlus, Check, Loader2 } from 'lucide-react';

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

interface Friend {
  id: string;
  friendName: string;
  friendId: string;
  statusMessage?: string;
}

interface Notification {
  id: string;
  type: 'friend_request' | 'like' | 'comment';
  userId: string;
  userName: string;
  postTitle?: string;
  commentText?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCategory, setNotificationCategory] = useState<'all' | 'friend_request' | 'like' | 'comment'>('all');
  const [message, setMessage] = useState({ text: '', isError: false });

  const refreshFriends = useCallback(async () => {
    try {
      const friendsRes = await fetch('/api/friends/list');
      if (friendsRes.ok) setFriends(await friendsRes.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const pendingRes = await fetch('/api/friends/pending');
      if (pendingRes.ok) {
        const pendingRequests = await pendingRes.json();
        // フレンド申請を通知形式に変換
        const friendRequestNotifications: Notification[] = pendingRequests.map((req: any) => ({
          id: req.id,
          type: 'friend_request' as const,
          userId: req.userId,
          userName: req.userId, // 実際にはユーザー名を取得する必要がある
          createdAt: new Date().toISOString(),
        }));
        setNotifications(friendRequestNotifications);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const profRes = await fetch('/api/profile');
      const profData = await profRes.json();
      if (profRes.ok) {
        setProfile(profData);
        setEditName(profData.displayName || '');
      }

      const postsRes = await fetch('/api/posts/me');
      const postsData = await postsRes.json();
      if (postsRes.ok) setPosts(postsData);

      await refreshFriends();
      await refreshNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleUpdateName = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: editName }),
      });
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, displayName: editName } : null);
        setIsEditing(false);
      }
    } catch (err) {
      alert('更新に失敗しました');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm("フレンドを解除しますか？")) return;
    try {
      const res = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        showMsg("フレンド解除しました");
        refreshFriends();
      }
    } catch (err) {
      showMsg("処理に失敗しました", true);
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        showMsg("承認しました");
        refreshNotifications();
        refreshFriends();
      }
    } catch (err) {
      showMsg("エラーが発生しました", true);
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        showMsg("拒否しました");
        refreshNotifications();
      }
    } catch (err) {
      showMsg("処理に失敗しました", true);
    }
  };

  const showMsg = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 3000);
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col items-center justify-center shadow-2xl text-black">
        <Loader2 size={40} className="text-[#B5A184] animate-spin" />
        <p className="mt-4 text-sm text-gray-500 animate-pulse">読み込み中...</p>
      </div>
    </div>
  );

  const displayedPosts = showAll ? posts : posts.slice(0, 2);

  return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col shadow-2xl text-black overflow-hidden">

        {/* --- ヘッダー領域（簡素化） --- */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="w-full flex justify-end">
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 hover:bg-orange-50/50 rounded-full transition-all text-gray-400 hover:text-orange-500 relative"
              title="通知"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- プロフィール領域（縦並び） --- */}
        <div className="px-6 pb-6 flex flex-col items-center text-center">
          {/* プロフィール画像 */}
          <div className="relative flex-shrink-0 mb-4">
            <div className="w-24 h-24 bg-gray-200/50 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={60} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* 名前とボタン */}
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl font-bold text-gray-900">
              {profile?.displayName || 'No Name'}
            </h1>
            <button
              onClick={() => setShowFriends(true)}
              className="p-1.5 hover:bg-blue-50/50 rounded-full transition-all text-gray-400 hover:text-blue-500"
              title="フレンド一覧"
            >
              <Users size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-50/50 rounded-full transition-all text-gray-400 hover:text-red-500"
              title="ログアウト"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* プロフィール編集ボタン */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full max-w-[280px] bg-white/60 hover:bg-white/80 border border-gray-200/50 text-gray-800 text-xs font-bold py-2.5 rounded-lg transition"
          >
            プロフィールを編集
          </button>
        </div>

        {/* --- 投稿一覧領域 --- */}
        <div className="flex-1 px-6 overflow-y-auto scrollbar-hide pb-24">
          <div className="mb-4">
            <div className="w-full h-[1px] bg-gray-300/40 mb-6"></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                あなたのアーカイブ
              </h2>
              <span className="text-xs font-medium text-gray-400 bg-white/50 px-2 py-1 rounded">
                {posts.length}
              </span>
            </div>
          </div>

          {/* 投稿グリッド（2列） */}
          <div className="grid grid-cols-2 gap-2">
            {displayedPosts.map((post) => {
              const isExpired = post.visibilityExpiresAt && new Date(post.visibilityExpiresAt) < new Date();

              return (
                <div key={post.id} className="relative aspect-square bg-gray-900 overflow-hidden group cursor-pointer rounded-lg">
                  {post.videoUrl ? (
                    <video
                      src={post.videoUrl}
                      className={`w-full h-full object-cover transition-all duration-500 ${isExpired ? 'opacity-40 grayscale' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'}`}
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-[10px]">NO CONTENT</div>
                  )}

                  <div className="absolute top-2 right-2 text-white/70 group-hover:hidden">
                    <Play size={14} fill="currentColor" />
                  </div>

                  {isExpired && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90">
                      <Lock size={18} className="mb-1" />
                      <span className="text-[8px] font-bold tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded">Archived</span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-bold truncate">{post.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* もっと見る */}
          {!showAll && posts.length > 2 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors group"
              >
                <span className="text-[10px] font-bold tracking-widest">VIEW MORE</span>
                <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* --- 編集モーダル --- */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
            <div className="w-full max-w-sm bg-[#F5EFE0] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                <span className="font-bold text-sm">名前を変更</span>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/60 border border-gray-200 p-3 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  className="w-full mt-4 bg-[#1A363E] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#1A363E]/90 transition shadow-lg"
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- フレンドモーダル --- */}
        {showFriends && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
            <div className="w-full max-w-md bg-[#F5EFE0] rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-500" />
                  <span className="font-bold text-sm">フレンド一覧</span>
                  <span className="text-xs text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">{friends.length}</span>
                </div>
                <button onClick={() => setShowFriends(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {friends.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">フレンドがいません</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/30 rounded-lg transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {friend.friendName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{friend.friendName}</p>
                            {friend.statusMessage && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{friend.statusMessage}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition"
                          title="フレンド解除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 通知モーダル --- */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
            <div className="w-full max-w-md bg-[#F5EFE0] rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
              <div className="border-b border-gray-200/50 flex-shrink-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-orange-500" />
                    <span className="font-bold text-sm">通知</span>
                    <span className="text-xs text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
                </div>
                {/* カテゴリータブ */}
                <div className="flex gap-1 px-2 pb-2">
                  <button
                    onClick={() => setNotificationCategory('all')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      notificationCategory === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/30 text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    すべて
                  </button>
                  <button
                    onClick={() => setNotificationCategory('friend_request')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      notificationCategory === 'friend_request'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/30 text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    申請
                  </button>
                  <button
                    onClick={() => setNotificationCategory('like')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      notificationCategory === 'like'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/30 text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    いいね
                  </button>
                  <button
                    onClick={() => setNotificationCategory('comment')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      notificationCategory === 'comment'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/30 text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    コメント
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {notifications.filter(n => notificationCategory === 'all' || n.type === notificationCategory).length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">通知はありません</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.filter(n => notificationCategory === 'all' || n.type === notificationCategory).map((notif) => (
                      <div key={notif.id} className="p-3 bg-white/30 rounded-lg border border-gray-200/50">
                        {notif.type === 'friend_request' && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserPlus size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">フレンド申請</p>
                              <p className="text-xs text-gray-600 truncate">{notif.userName}さんからフレンド申請が届いています</p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => acceptFriendRequest(notif.id)}
                                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition"
                                >
                                  <Check size={14} />
                                  承認
                                </button>
                                <button
                                  onClick={() => rejectFriendRequest(notif.id)}
                                  className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-300 transition"
                                >
                                  <X size={14} />
                                  拒否
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {notif.type === 'like' && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Heart size={20} className="text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">いいね</p>
                              <p className="text-xs text-gray-600 truncate">{notif.userName}さんが「{notif.postTitle}」にいいねしました</p>
                            </div>
                          </div>
                        )}
                        {notif.type === 'comment' && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageCircle size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">コメント</p>
                              <p className="text-xs text-gray-600 truncate">{notif.userName}さんが「{notif.postTitle}」にコメントしました</p>
                              {notif.commentText && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{notif.commentText}"</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* トースト表示 */}
        {message.text && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded-full bg-black text-white text-xs font-bold shadow-xl">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}