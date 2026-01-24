// 'use client';

// import { useEffect, useState } from 'react';
// import { createClient } from '@/lib/supabase/browser';

// // --- 型定義 ---
// interface Post {
//   id: string;
//   userId: string;
//   title: string;
//   content: string;
//   videoUrl: string | null;
//   status: 'PENDING' | 'COMPLETED' | 'FAILED';
//   privacyScope: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
//   sceneType: string;
//   createdAt: string;
//   visibilityExpiresAt: string | null;
// }

// export default function DashboardPage() {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [now, setNow] = useState(new Date());

//   // 1分ごとに現在時刻を更新してカウントダウンを動かす
//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   // 1. データの取得
//   const fetchTimeline = async () => {
//     try {
//       const res = await fetch('/api/posts/timeline');
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setPosts(data);
//         if (data.some(p => p.status === 'PENDING')) {
//           setIsGenerating(true);
//           startFakeProgress();
//         }
//       }
//     } catch (err) {
//       console.error("Timeline fetch error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchTimeline();
//   }, []);

//   // 2. Realtime 購読
//   useEffect(() => {
//     const supabase = createClient()
//     const channel = supabase
//       .channel('timeline-changes')
//       .on('postgres_changes', { 
//         event: 'UPDATE', 
//         schema: 'public', 
//         table: 'posts' 
//       }, (payload) => {
//         setPosts(current => current.map(p => p.id === payload.new.id ? {
//           ...p,
//           status: payload.new.generation_status,
//           videoUrl: payload.new.video_url,
//           // カラム名がスネークケースで届く可能性に注意
//           visibilityExpiresAt: payload.new.visibility_expires_at || p.visibilityExpiresAt
//         } : p));
        
//         if (payload.new.generation_status === 'COMPLETED') {
//           setProgress(100);
//           setTimeout(() => {
//             setIsGenerating(false);
//             setProgress(0);
//           }, 1000);
//         }
//       })
//       .subscribe();

//     return () => { supabase.removeChannel(channel); };
//   }, []);

//   const startFakeProgress = () => {
//     setProgress(10);
//     const timer = setInterval(() => {
//       setProgress(prev => (prev < 90 ? prev + 2 : prev));
//     }, 500);
//     return () => clearInterval(timer);
//   };

//   // --- ヘルパー関数: 残り時間の表示 ---
//   const getExpirationStatus = (post: Post) => {
//     if (!post.visibilityExpiresAt) return null;
//     const expiresAt = new Date(post.visibilityExpiresAt);
//     const diffMs = expiresAt.getTime() - now.getTime();
//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);

//     if (diffMs <= 0) {
//       return { label: '🔒 期限切れ', className: 'bg-gray-200 text-gray-600' };
//     }
//     const timeLabel = diffHrs > 0 ? `あと${diffHrs}時間` : `あと${diffMins}分`;
//     return { label: `⏳ ${timeLabel}`, className: 'bg-green-100 text-green-700' };
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-8">
//       {/* 進捗インジケーター */}
//       {isGenerating && (
//         <div className="fixed top-4 right-4 bg-white p-4 shadow-2xl rounded-2xl border-2 border-blue-500 w-72 z-50">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-bold text-sm text-blue-700 animate-pulse">🎥 動画を生成中...</span>
//             <span className="text-xs font-mono">{progress}%</span>
//           </div>
//           <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
//             <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${progress}%` }} />
//           </div>
//         </div>
//       )}

//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-extrabold text-gray-900">タイムライン</h1>
//         <button 
//           onClick={() => window.location.href = '/posts/new'}
//           className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
//         >
//           ＋ 新規投稿
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {posts.length > 0 ? (
//           posts.map(post => {
//             const exp = getExpirationStatus(post);
//             return (
//               <article key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
//                 <div className="p-4 border-b border-gray-50 flex justify-between items-center">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
//                       {post.userId.slice(0, 2).toUpperCase()}
//                     </div>
//                     <span className="text-xs font-bold text-gray-700">User_{post.userId.slice(0, 4)}</span>
//                   </div>
//                   <div className="flex gap-2">
//                     {exp && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${exp.className}`}>{exp.label}</span>}
//                     <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase">{post.privacyScope}</span>
//                   </div>
//                 </div>
                
//                 <div className="aspect-video bg-gray-900 flex items-center justify-center relative group-hover:bg-black transition-colors">
//                   {post.status === 'COMPLETED' && post.videoUrl ? (
//                     <video src={post.videoUrl} controls className="w-full h-full object-contain" />
//                   ) : post.status === 'FAILED' ? (
//                     <div className="text-center p-4">
//                       <span className="text-3xl">⚠️</span>
//                       <p className="text-white text-xs mt-2 font-medium">生成に失敗しました</p>
//                     </div>
//                   ) : (
//                     <div className="text-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
//                       <p className="text-white text-[10px] font-medium tracking-widest uppercase animate-pulse">Generating...</p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-4">
//                   <h2 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{post.title}</h2>
//                   <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{post.content}</p>
//                   <div className="mt-4 flex items-center justify-between">
//                     <span className="text-[10px] text-gray-400 font-medium">{new Date(post.createdAt).toLocaleString()}</span>
//                     <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{post.sceneType}</span>
//                   </div>
//                 </div>
//               </article>
//             );
//           })
//         ) : (
//           <div className="col-span-full py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//             <div className="text-4xl mb-4">📭</div>
//             <p className="text-gray-500 font-medium">表示できる投稿がありません。</p>
//             <p className="text-gray-400 text-sm mt-1">新しい動画を作成して共有してみましょう！</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// 'use client';

// import { useEffect, useState } from 'react';
// import { createClient } from '@/lib/supabase/browser';
// import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Clock, Lock, AlertCircle } from 'lucide-react';

// // --- 型定義は既存を維持 ---
// // --- 型定義 ---
// interface Post {
//   id: string;
//   userId: string;
//   title: string;
//   content: string;
//   videoUrl: string | null;
//   status: 'PENDING' | 'COMPLETED' | 'FAILED';
//   privacyScope: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
//   sceneType: string;
//   createdAt: string;
//   visibilityExpiresAt: string | null;
// }

// export default function DashboardPage() {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [now, setNow] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchTimeline = async () => {
//     try {
//       const res = await fetch('/api/posts/timeline');
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setPosts(data);
//         if (data.some(p => p.status === 'PENDING')) {
//           setIsGenerating(true);
//           startFakeProgress();
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => { fetchTimeline(); }, []);

//   // Realtime 購読 (既存のロジックを維持)
//   useEffect(() => {
//     const supabase = createClient();
//     const channel = supabase
//       .channel('timeline-changes')
//       .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
//         setPosts(current => current.map(p => p.id === payload.new.id ? {
//           ...p,
//           status: payload.new.generation_status,
//           videoUrl: payload.new.video_url,
//           visibilityExpiresAt: payload.new.visibility_expires_at || p.visibilityExpiresAt
//         } : p));
//         if (payload.new.generation_status === 'COMPLETED') {
//           setProgress(100);
//           setTimeout(() => { setIsGenerating(false); setProgress(0); }, 1000);
//         }
//       })
//       .subscribe();
//     return () => { supabase.removeChannel(channel); };
//   }, []);

//   const startFakeProgress = () => {
//     setProgress(10);
//     const timer = setInterval(() => { setProgress(prev => (prev < 90 ? prev + 2 : prev)); }, 500);
//     return () => clearInterval(timer);
//   };

//   const getExpirationStatus = (post: Post) => {
//     if (!post.visibilityExpiresAt) return null;
//     const expiresAt = new Date(post.visibilityExpiresAt);
//     const diffMs = expiresAt.getTime() - now.getTime();
//     if (diffMs <= 0) return { label: 'Expired', isExpired: true };
//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     return { label: `${diffHrs}h left`, isExpired: false };
//   };

//   return (
//     <div className="max-w-[470px] mx-auto bg-white min-h-screen pb-20">
      
//       {/* --- 上部ナビゲーション --- */}
//       <header className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
//         <h1 className="text-xl font-bold tracking-tighter italic">Timeline</h1>
//         <button 
//           onClick={() => window.location.href = '/posts/new'}
//           className="text-blue-500 font-bold text-sm hover:text-blue-700 transition"
//         >
//           新規投稿
//         </button>
//       </header>

//       {/* --- 生成中ステータス（ストーリー風に上部に配置） --- */}
//       {isGenerating && (
//         <div className="p-4 border-b border-gray-50 bg-blue-50/30">
//           <div className="flex items-center gap-3">
//             <div className="relative w-12 h-12">
//               <svg className="w-full h-full -rotate-90">
//                 <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-200" />
//                 <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="transparent" 
//                   className="text-blue-500 transition-all duration-700"
//                   strokeDasharray={138}
//                   strokeDashoffset={138 - (138 * progress) / 100}
//                 />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <span className="text-[10px] font-bold">{progress}%</span>
//               </div>
//             </div>
//             <div>
//               <p className="text-xs font-bold text-blue-600 animate-pulse">動画を生成中...</p>
//               <p className="text-[10px] text-gray-400">まもなくタイムラインに表示されます</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- フィード投稿一覧 --- */}
//       <main className="divide-y divide-gray-100">
//         {posts.length > 0 ? (
//           posts.map(post => {
//             const exp = getExpirationStatus(post);
//             return (
//               <article key={post.id} className="py-4">
//                 {/* 投稿者ヘッダー */}
//                 <div className="flex items-center justify-between px-4 mb-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[1.5px]">
//                       <div className="w-full h-full bg-white rounded-full p-0.5">
//                         <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
//                           {post.userId.slice(0, 1).toUpperCase()}
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold leading-none">user_{post.userId.slice(0, 5)}</p>
//                       <p className="text-[10px] text-gray-400 mt-1">{post.sceneType}</p>
//                     </div>
//                   </div>
//                   <MoreHorizontal size={18} className="text-gray-400" />
//                 </div>

//                 {/* メインコンテンツ（動画エリア） */}
//                 <div className="relative aspect-square bg-black w-full flex items-center justify-center">
//                   {post.status === 'COMPLETED' && post.videoUrl ? (
//                     <video 
//                       src={post.videoUrl} 
//                       className={`w-full h-full object-cover ${exp?.isExpired ? 'opacity-30 grayscale' : ''}`} 
//                       loop muted playsInline controls
//                     />
//                   ) : post.status === 'FAILED' ? (
//                     <div className="text-center text-white p-6">
//                       <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
//                       <p className="text-xs font-bold">Failed to generate video</p>
//                     </div>
//                   ) : (
//                     <div className="text-center">
//                       <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//                       <p className="text-white text-[10px] tracking-widest uppercase font-bold animate-pulse">Processing</p>
//                     </div>
//                   )}

//                   {/* 期限切れ・限定公開ラベル */}
//                   <div className="absolute top-3 right-3 flex flex-col gap-2">
//                     {exp && (
//                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md flex items-center gap-1 ${exp.isExpired ? 'bg-black/60 text-white' : 'bg-white/80 text-black'}`}>
//                         {exp.isExpired ? <Lock size={10} /> : <Clock size={10} />}
//                         {exp.label}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* アクションボタン */}
//                 <div className="px-4 py-3 flex justify-between items-center">
//                   <div className="flex items-center gap-4">
//                     <Heart size={24} className="hover:text-red-500 cursor-pointer transition" />
//                     <MessageCircle size={24} className="hover:text-gray-500 cursor-pointer transition" />
//                     <Send size={24} className="hover:text-blue-500 cursor-pointer transition" />
//                   </div>
//                   <Bookmark size={24} className="hover:text-yellow-500 cursor-pointer transition" />
//                 </div>

//                 {/* キャプション・本文 */}
//                 <div className="px-4 space-y-1">
//                   <p className="text-sm">
//                     <span className="font-bold mr-2">user_{post.userId.slice(0, 5)}</span>
//                     <span className="font-bold text-blue-600">#{post.title}</span>
//                   </p>
//                   <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
//                     {post.content}
//                   </p>
//                   <p className="text-[10px] text-gray-400 uppercase mt-2">
//                     {new Date(post.createdAt).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
//                   </p>
//                 </div>
//               </article>
//             );
//           })
//         ) : (
//           <div className="flex flex-col items-center justify-center py-40 text-gray-400">
//             <p className="text-sm">投稿がありません</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import { createClient } from '@/lib/supabase/browser';
// import { 
//   MoreHorizontal, Heart, MessageCircle, Send, 
//   Bookmark, Clock, Lock, AlertCircle, X, Trash2 
// } from 'lucide-react';
// import { Tables } from '@/lib/database.types';

// // --- 型定義 ---
// interface Post {
//   id: string;
//   userId: string;
//   title: string;
//   content: string;
//   videoUrl: string | null;
//   status: 'PENDING' | 'COMPLETED' | 'FAILED';
//   privacyScope: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
//   sceneType: string;
//   createdAt: string;
//   visibilityExpiresAt: string | null;
// }

// export default function DashboardPage() {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [now, setNow] = useState(new Date());

//   // --- コメント機能用のステート ---
//   const [isCommentOpen, setIsCommentOpen] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
//   const [comments, setComments] = useState<Tables<'comments'>[]>([]);
//   const [commentInput, setCommentInput] = useState('');
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   // 初回ロード: ユーザーセッションとタイムライン取得
//   useEffect(() => {
//     const supabase = createClient();
//     supabase.auth.getSession().then(({ data }) => {
//       setCurrentUserId(data.session?.user.id || null);
//     });
//     fetchTimeline();

//     const timer = setInterval(() => setNow(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   const fetchTimeline = async () => {
//     try {
//       const res = await fetch('/api/posts/timeline');
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setPosts(data);
//         if (data.some(p => p.status === 'PENDING')) {
//           setIsGenerating(true);
//           startFakeProgress();
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Realtime 購読
//   useEffect(() => {
//     const supabase = createClient();
//     const channel = supabase
//       .channel('timeline-changes')
//       .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
//         setPosts(current => current.map(p => p.id === payload.new.id ? {
//           ...p,
//           status: payload.new.generation_status,
//           videoUrl: payload.new.video_url,
//           visibilityExpiresAt: payload.new.visibility_expires_at || p.visibilityExpiresAt
//         } : p));
//         if (payload.new.generation_status === 'COMPLETED') {
//           setProgress(100);
//           setTimeout(() => { setIsGenerating(false); setProgress(0); }, 1000);
//         }
//       })
//       .subscribe();
//     return () => { supabase.removeChannel(channel); };
//   }, []);

//   // --- コメント操作用関数 ---
//  // コメント取得
// const handleOpenComments = async (postId: string) => {
//   // ここでガードを入れる
//   if (!postId || postId === 'undefined') {
//     console.error("Post ID is missing");
//     return;
//   }

//   setSelectedPostId(postId);
//   setIsCommentOpen(true);
  
//   try {
//     const res = await fetch(`/api/posts/${postId}/comments`);
//     if (!res.ok) {
//       const errorData = await res.json();
//       console.log('ポストの中身',postId)
//       throw new Error(errorData.error);
//     }
//     const data = await res.json();
//     setComments(data);
//   } catch (err) {
//     console.error('Failed to fetch comments:', err);
//     setComments([]); // エラー時は空にする
//   }
// };

//   const handleAddComment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!commentInput.trim() || !selectedPostId) return;

//     try {
//       const res = await fetch(`/api/posts/${selectedPostId}/comments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ content: commentInput }),
//       });

//       if (res.ok) {
//         setCommentInput('');
//         // 一覧を再取得
//         const updatedRes = await fetch(`/api/posts/${selectedPostId}/comments`);
//         const updatedData = await updatedRes.json();
//         setComments(updatedData);
//       }
//     } catch (err) {
//       console.error('Failed to add comment:', err);
//     }
//   };

//   const handleDeleteComment = async (commentId: string) => {
//     if (!confirm('コメントを削除しますか？')) return;

//     try {
//       const res = await fetch(`/api/comments/${commentId}`, {
//         method: 'DELETE',
//       });

//       if (res.ok) {
//         setComments(prev => prev.filter(c => c.id !== commentId));
//       }
//     } catch (err) {
//       console.error('Failed to delete comment:', err);
//     }
//   };

//   const startFakeProgress = () => {
//     setProgress(10);
//     const timer = setInterval(() => { setProgress(prev => (prev < 90 ? prev + 2 : prev)); }, 500);
//     return () => clearInterval(timer);
//   };

//   const getExpirationStatus = (post: Post) => {
//     if (!post.visibilityExpiresAt) return null;
//     const expiresAt = new Date(post.visibilityExpiresAt);
//     const diffMs = expiresAt.getTime() - now.getTime();
//     if (diffMs <= 0) return { label: 'Expired', isExpired: true };
//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     return { label: `${diffHrs}h left`, isExpired: false };
//   };

//   return (
//     <div className="max-w-[470px] mx-auto bg-white min-h-screen pb-20 relative">
      
//       {/* --- ヘッダー --- */}
//       <header className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
//         <h1 className="text-xl font-bold tracking-tighter italic">Timeline</h1>
//         <button 
//           onClick={() => window.location.href = '/posts/new'}
//           className="text-blue-500 font-bold text-sm hover:text-blue-700 transition"
//         >
//           新規投稿
//         </button>
//       </header>

//       {/* --- 生成ステータス表示 --- */}
//       {isGenerating && (
//         <div className="p-4 border-b border-gray-50 bg-blue-50/30">
//           <div className="flex items-center gap-3">
//             <div className="relative w-12 h-12">
//               <svg className="w-full h-full -rotate-90">
//                 <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-200" />
//                 <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="transparent" 
//                   className="text-blue-500 transition-all duration-700"
//                   strokeDasharray={138}
//                   strokeDashoffset={138 - (138 * progress) / 100}
//                 />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <span className="text-[10px] font-bold">{progress}%</span>
//               </div>
//             </div>
//             <div>
//               <p className="text-xs font-bold text-blue-600 animate-pulse">動画を生成中...</p>
//               <p className="text-[10px] text-gray-400">まもなくタイムラインに表示されます</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- 投稿フィード --- */}
//       <main className="divide-y divide-gray-100">
//         {posts.length > 0 ? (
//           posts.map(post => {
//             const exp = getExpirationStatus(post);
//             return (
//               <article key={post.id} className="py-4">
//                 <div className="flex items-center justify-between px-4 mb-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[1.5px]">
//                       <div className="w-full h-full bg-white rounded-full p-0.5">
//                         <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
//                           {post.userId.slice(0, 1)}
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold leading-none">user_{post.userId.slice(0, 5)}</p>
//                       <p className="text-[10px] text-gray-400 mt-1">{post.sceneType}</p>
//                     </div>
//                   </div>
//                   <MoreHorizontal size={18} className="text-gray-400" />
//                 </div>

//                 <div className="relative aspect-square bg-black w-full flex items-center justify-center">
//                   {post.status === 'COMPLETED' && post.videoUrl ? (
//                     <video 
//                       src={post.videoUrl} 
//                       className={`w-full h-full object-cover ${exp?.isExpired ? 'opacity-30 grayscale' : ''}`} 
//                       loop muted playsInline controls
//                     />
//                   ) : post.status === 'FAILED' ? (
//                     <div className="text-center text-white p-6">
//                       <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
//                       <p className="text-xs font-bold">Failed to generate video</p>
//                     </div>
//                   ) : (
//                     <div className="text-center">
//                       <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//                       <p className="text-white text-[10px] tracking-widest uppercase font-bold animate-pulse">Processing</p>
//                     </div>
//                   )}

//                   <div className="absolute top-3 right-3 flex flex-col gap-2">
//                     {exp && (
//                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md flex items-center gap-1 ${exp.isExpired ? 'bg-black/60 text-white' : 'bg-white/80 text-black'}`}>
//                         {exp.isExpired ? <Lock size={10} /> : <Clock size={10} />}
//                         {exp.label}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="px-4 py-3 flex justify-between items-center">
//                   <div className="flex items-center gap-4">
//                     <Heart size={24} className="hover:text-red-500 cursor-pointer transition" />
//                     <MessageCircle 
//                       size={24} 
//                       className="hover:text-gray-500 cursor-pointer transition" 
//                       onClick={() => handleOpenComments(post.id)}
//                     />
//                     <Send size={24} className="hover:text-blue-500 cursor-pointer transition" />
//                   </div>
//                   <Bookmark size={24} className="hover:text-yellow-500 cursor-pointer transition" />
//                 </div>

//                 <div className="px-4 space-y-1">
//                   <p className="text-sm">
//                     <span className="font-bold mr-2">user_{post.userId.slice(0, 5)}</span>
//                     <span className="font-bold text-blue-600">#{post.title}</span>
//                   </p>
//                   <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
//                     {post.content}
//                   </p>
//                   <p className="text-[10px] text-gray-400 uppercase mt-2">
//                     {new Date(post.createdAt).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
//                   </p>
//                 </div>
//               </article>
//             );
//           })
//         ) : (
//           <div className="flex flex-col items-center justify-center py-40 text-gray-400">
//             <p className="text-sm">投稿がありません</p>
//           </div>
//         )}
//       </main>

//       {/* --- TikTok風ハーフモーダルコメント一覧 --- */}
//       {isCommentOpen && (
//         <>
//           {/* 背景の暗幕 */}
//           <div 
//             className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
//             onClick={() => setIsCommentOpen(false)}
//           />
          
//           {/* モーダル本体 */}
//           <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
//             <div className="w-full max-w-[470px] bg-white rounded-t-2xl h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 transition-transform">
              
//               {/* モーダルヘッダー */}
//               <div className="px-4 py-3 border-b flex items-center justify-between">
//                 <div className="w-10"></div>
//                 <h3 className="text-sm font-bold">{comments.length}件のコメント</h3>
//                 <button 
//                   onClick={() => setIsCommentOpen(false)}
//                   className="p-1 hover:bg-gray-100 rounded-full transition"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               {/* コメントリストエリア */}
//               <div className="flex-1 overflow-y-auto p-4 space-y-5">
//                 {comments.length > 0 ? (
//                   comments.map((comment) => (
//                     <div key={comment.id} className="flex gap-3 group">
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
//                         {comment.user_id.slice(0, 1).toUpperCase()}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <span className="text-[12px] font-bold text-gray-500">user_{comment.user_id.slice(0, 5)}</span>
//                         </div>
//                         <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
//                         <div className="flex items-center gap-3 mt-1">
//                           <span className="text-[10px] text-gray-400">
//                             {new Date(comment.created_at || '').toLocaleDateString('ja-JP')}
//                           </span>
//                           {/* 自分のコメントのみ削除ボタンを表示 */}
//                           {currentUserId === comment.user_id && (
//                             <button 
//                               onClick={() => handleDeleteComment(comment.id)}
//                               className="text-[10px] text-red-400 font-bold opacity-0 group-hover:opacity-100 transition"
//                             >
//                               削除
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                       <Heart size={14} className="text-gray-300 mt-2" />
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-20 text-gray-400 text-sm">
//                     最初のコメントを残しましょう
//                   </div>
//                 )}
//               </div>

//               {/* 下部入力フォーム */}
//               <div className="p-4 border-t bg-white pb-10">
//                 <form onSubmit={handleAddComment} className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
//                   <input 
//                     type="text" 
//                     placeholder="コメントを追加..."
//                     className="flex-1 bg-transparent text-sm focus:outline-none"
//                     value={commentInput}
//                     onChange={(e) => setCommentInput(e.target.value)}
//                   />
//                   <button 
//                     type="submit"
//                     disabled={!commentInput.trim()}
//                     className="text-blue-500 font-bold text-sm disabled:text-blue-300 transition"
//                   >
//                     投稿
//                   </button>
//                 </form>
//               </div>

//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Heart, MessageCircle, X, User, Trash2 } from 'lucide-react';
import { Tables } from '@/lib/database.types';

interface Post {
  id: string;
  userId: string;
  displayName: string | null;
  title: string;
  content: string;
  videoUrl: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  privacyScope: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  sceneType: string;
  createdAt: string;
  visibilityExpiresAt: string | null;
  commentCount?: number;
}

// リアクション用の絵文字リスト
const REACTIONS = [
  { emoji: '❤️', label: 'ハート' },
  { emoji: '😂', label: '笑い' },
  { emoji: '😮', label: '驚き' },
  { emoji: '😢', label: '悲しい' },
  { emoji: '👏', label: '拍手' },
  { emoji: '🔥', label: '炎' },
];

// モックユーザー名リスト
const MOCK_USERS = [
  'ゆうき', 'さくら', 'けんた', 'みさき', 'たくや',
  'あおい', 'りょうた', 'ひなた', 'そうた', 'ゆい',
  'はると', 'めい', 'こうき', 'あかり', 'れん'
];

// 湧き出るリアクションアニメーション用コンポーネント
interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
  y: number;
  userName?: string;
}

// 画面下部から湧き出るリアクション（アイコン+吹き出し）
const FloatingReactions = ({ reactions }: { reactions: FloatingReaction[] }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute flex items-end gap-1"
          style={{
            left: r.x,
            bottom: 120,
            animation: 'floatUpSlow 4s ease-out forwards',
          }}
        >
          {/* ユーザーアイコン */}
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
            {r.userName?.[0] || '?'}
          </div>
          {/* 吹き出し */}
          <div className="relative bg-white rounded-2xl px-3 py-2 shadow-lg mb-1">
            <div className="absolute -left-1 bottom-2 w-2 h-2 bg-white transform rotate-45"></div>
            <span className="text-2xl">{r.emoji}</span>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes floatUpSlow {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          15% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(-200px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-250px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Tables<'comments'>[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // リアクション関連
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // 動画生成の進捗
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // SSRハイドレーションエラー防止用
  const [isMounted, setIsMounted] = useState(false);

  // 他ユーザーのリアクション演出（ランダム・画面下部から湧き出る）
  const triggerRandomReaction = useCallback(() => {
    const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const randomEmoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)].emoji;

    // 画面下部から湧き出るリアクション（アイコン+吹き出し）
    const floatingEmoji: FloatingReaction = {
      id: Date.now(),
      emoji: randomEmoji,
      userName: randomUser,
      x: Math.random() * 280 + 40, // 画面内に収まるように
      y: 0,
    };
    setFloatingReactions(prev => [...prev, floatingEmoji]);

    // 4秒後に削除（アニメーション時間に合わせる）
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== floatingEmoji.id));
    }, 4000);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id || null);
    });
    fetchTimeline();
  }, []);

  // 初回表示時とランダムなタイミングでリアクション演出（クライアントのみ）
  useEffect(() => {
    if (!isMounted) return;

    // 初回表示時に少し遅れてリアクション
    const initialTimer = setTimeout(() => {
      triggerRandomReaction();
    }, 2000);

    // ランダムなタイミングで継続的にリアクション（8秒間隔）
    const randomInterval = setInterval(() => {
      if (Math.random() > 0.5) { // 50%の確率で発生
        triggerRandomReaction();
      }
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(randomInterval);
    };
  }, [isMounted, triggerRandomReaction]);

  // スクロール時にリアクション演出（クライアントのみ）
  useEffect(() => {
    if (!isMounted) return;

    let lastScrollTime = 0;
    const handleScroll = () => {
      const currentTime = Date.now();
      // 2秒に1回まで
      if (currentTime - lastScrollTime > 2000) {
        if (Math.random() > 0.6) { // 40%の確率
          triggerRandomReaction();
        }
        lastScrollTime = currentTime;
      }
    };

    const scrollContainer = document.querySelector('.snap-y');
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [isMounted, triggerRandomReaction]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch('/api/posts/timeline');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
        // PENDING状態の投稿があれば進捗表示を開始
        if (data.some((p: Post) => p.status === 'PENDING')) {
          setIsGenerating(true);
          startFakeProgress();
        }
      }
    } catch (err) { console.error(err); }
  };

  // Realtime 購読（動画生成完了時の通知）
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('timeline-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        setPosts(current => current.map(p => p.id === payload.new.id ? {
          ...p,
          status: payload.new.generation_status,
          videoUrl: payload.new.video_url,
        } : p));
        if (payload.new.generation_status === 'COMPLETED') {
          setProgress(100);
          setTimeout(() => { setIsGenerating(false); setProgress(0); }, 1000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const startFakeProgress = () => {
    setProgress(10);
    const timer = setInterval(() => { setProgress(prev => (prev < 90 ? prev + 2 : prev)); }, 500);
    return () => clearInterval(timer);
  };

  // リアクション選択時の処理
  const handleReaction = useCallback((postId: string, emoji: string) => {
    setShowReactionPicker(null);
    setLikedPosts(prev => new Set(prev).add(postId));

    // ランダムな位置から湧き出るリアクション
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const reaction: FloatingReaction = {
          id: Date.now() + i,
          emoji,
          x: Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2,
          y: Math.random() * 100,
        };
        setFloatingReactions(prev => [...prev, reaction]);

        // 2秒後に削除
        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 2000);
      }, i * 100);
    }
  }, []);

  const handleOpenComments = async (postId: string) => {
    if (!postId || postId === 'undefined') return;
    setSelectedPostId(postId);
    setIsCommentOpen(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      setComments(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedPostId) return;
    try {
      const res = await fetch(`/api/posts/${selectedPostId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentInput }),
      });
      if (res.ok) {
        setCommentInput('');
        const updatedRes = await fetch(`/api/posts/${selectedPostId}/comments`);
        setComments(await updatedRes.json());
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      {/* 画面下部から湧き出るリアクションアニメーション（クライアントのみ） */}
      {isMounted && <FloatingReactions reactions={floatingReactions} />}

      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">

        {/* ヘッダー */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[90] px-4 pt-12 pb-6 bg-gradient-to-b from-black/30 via-black/10 to-transparent">
          <div className="flex items-center justify-center gap-6">
            <button className="text-[#B5A184] font-bold text-base">おすすめ</button>
            <div className="relative">
              <button className="text-[#1A363E] font-bold text-base border-b-2 border-[#1A363E] pb-1">フレンド</button>
              {posts.length > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {posts.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 動画生成中の進捗インジケーター */}
        {isGenerating && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[95] bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#E5E7EB" strokeWidth="3" fill="none" />
                <circle
                  cx="20" cy="20" r="16"
                  stroke="#3B82F6" strokeWidth="3" fill="none"
                  strokeDasharray={100.5}
                  strokeDashoffset={100.5 - (100.5 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">{progress}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 animate-pulse">動画を生成中...</p>
              <p className="text-[10px] text-gray-400">まもなく表示されます</p>
            </div>
          </div>
        )}

        {posts.length > 0 ? (
          posts.map(post => {
            return (
              <article key={post.id} className="relative h-screen w-full snap-start flex flex-col bg-[#F5EFE0]">
                
                {/* 1. 上部の余白: さらに広げて配置を下げました */}
                <div className="flex-[1.5] w-full" />

                {/* TikTokニュース風テロップ（タイトル） */}
                <div className="absolute top-56 left-0 right-0 z-[85] px-3 flex justify-center">
                  <div className="bg-black px-6 py-3 w-[90%] rounded-lg">
                    <h2 className="text-white text-xl font-bold leading-snug text-center">
                      {post.title}
                    </h2>
                  </div>
                </div>

                {/* 2. 動画エリア */}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden z-10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                  {post.status === 'COMPLETED' && post.videoUrl ? (
                    <video src={post.videoUrl} className="max-h-full max-w-full object-contain" loop muted playsInline autoPlay />
                  ) : (
                    <div className="text-white/30 text-[10px] uppercase font-bold animate-pulse">Processing...</div>
                  )}
                </div>

                {/* 3. 下部エリア: ここに「いいね」ボタンを配置 */}
                <div className="flex-1 p-6 relative bg-[#F5EFE0] shadow-[0_-30px_40px_rgba(0,0,0,0.5)] z-20">

                  {/* アクションボタン群: 確実に前面(z-50)に出るように設定 */}
                  <div className="absolute right-6 top-6 flex flex-col gap-5 z-50">
                    {/* いいねボタン（リアクション選択付き） */}
                    <div className="relative">
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
                        onDoubleClick={() => handleReaction(post.id, '❤️')}
                        className={`w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${likedPosts.has(post.id) ? 'ring-2 ring-red-400' : ''}`}
                      >
                        <Heart
                          size={30}
                          className={likedPosts.has(post.id) ? "text-[#E54D42]" : "text-gray-400"}
                          fill={likedPosts.has(post.id) ? "#E54D42" : "none"}
                          strokeWidth={likedPosts.has(post.id) ? 0 : 2}
                        />
                      </button>
                      {likedPosts.has(post.id) && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-bold whitespace-nowrap">
                          いいね済
                        </span>
                      )}

                      {/* リアクションピッカー */}
                      {showReactionPicker === post.id && (
                        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-2xl px-3 py-2 flex gap-1 animate-in slide-in-from-right duration-200">
                          {REACTIONS.map((r) => (
                            <button
                              key={r.emoji}
                              onClick={() => handleReaction(post.id, r.emoji)}
                              className="text-2xl hover:scale-125 active:scale-95 transition-transform p-1"
                              title={r.label}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* コメントボタン（件数バッジ付き） */}
                    <div className="relative">
                      <button
                        onClick={() => handleOpenComments(post.id)}
                        className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                      >
                        <MessageCircle size={30} className="text-[#007AFF]" fill="#007AFF" strokeWidth={0} />
                      </button>
                      {(post.commentCount ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 shadow-md">
                          {post.commentCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-[18px] font-bold text-gray-800 mb-2 leading-tight">{post.title}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center border border-gray-100">
                        {post.displayName ? (
                          <span className="text-white text-sm font-bold">{post.displayName[0]}</span>
                        ) : (
                          <User size={18} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700 leading-none">{post.displayName || `user_${post.userId.slice(0, 5)}`}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{isMounted ? new Date(post.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                      </div>
                    </div>
                    <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-3">{post.content}</p>
                  </div>
                </div>

              </article>
            );
          })
        ) : (
          <div className="h-screen flex flex-col items-center justify-center text-gray-400 px-8">
            <p className="text-center text-sm mb-2">コンテンツがありません</p>
            <p className="text-center text-xs text-gray-300">新しい投稿を作成してみましょう</p>
          </div>
        )}

        {/* --- コメントハーフモーダル --- */}
        {isCommentOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-[2px]" onClick={() => setIsCommentOpen(false)} />
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[110]">
              <div className="bg-white rounded-t-[32px] h-[70vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <span className="font-bold text-gray-800">{comments.length}件のコメント</span>
                  <X size={24} className="text-gray-400 cursor-pointer" onClick={() => setIsCommentOpen(false)} />
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {comments.length > 0 ? comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 flex-shrink-0">
                        {comment.user_id.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-bold text-gray-500">user_{comment.user_id.slice(0, 5)}</span>
                          <span className="text-[10px] text-gray-400">
                            {isMounted && new Date(comment.created_at || '').toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-[14px] text-gray-700 leading-relaxed">{comment.content}</p>
                        {/* 削除ボタン（自分のコメントのみ表示） */}
                        {currentUserId === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="mt-2 flex items-center gap-1 text-[11px] text-red-500 font-bold hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={12} />
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <MessageCircle size={48} className="mb-3 text-gray-200" />
                      <p className="text-sm">まだコメントはありません</p>
                      <p className="text-xs mt-1">最初のコメントを残しましょう</p>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-gray-50 border-t pb-10">
                  <form onSubmit={handleAddComment} className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <input 
                      type="text" placeholder="コメントを追加..." className="flex-1 bg-transparent text-[14px] focus:outline-none"
                      value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
                    />
                    <button type="submit" disabled={!commentInput.trim()} className="text-[#007AFF] font-bold">投稿</button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}