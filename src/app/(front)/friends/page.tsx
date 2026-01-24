// 'use client';

// import { useState, useEffect, useCallback } from 'react';

// // --- Types ---
// interface SearchUser {
//   id: string;
//   displayName: string;
// }

// interface PendingRequest {
//   id: string;
//   userId: string; // 申請者のID
// }

// interface Friend {
//   id: string;
//   friendName: string;
//   friendId: string;
// }

// export default function FriendsPage() {
//   // --- States ---
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
//   const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
//   const [friends, setFriends] = useState<Friend[]>([]);
//   const [message, setMessage] = useState({ text: '', isError: false });
//   const [isLoading, setIsLoading] = useState({ search: false, list: true });

//   // --- Data Fetching ---

//   // 届いている申請とフレンド一覧を同時に更新
//   const refreshAllData = useCallback(async () => {
//     setIsLoading(prev => ({ ...prev, list: true }));
//     try {
//       const [pendingRes, friendsRes] = await Promise.all([
//         fetch('/api/friends/pending'),
//         fetch('/api/friends/list')
//       ]);

//       if (pendingRes.ok) setPendingRequests(await pendingRes.json());
//       if (friendsRes.ok) setFriends(await friendsRes.json());
//     } catch (err) {
//       console.error("データ取得エラー:", err);
//     } finally {
//       setIsLoading(prev => ({ ...prev, list: false }));
//     }
//   }, []);

//   useEffect(() => {
//     refreshAllData();
//   }, [refreshAllData]);

//   // --- Actions ---

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;
//     setIsLoading(prev => ({ ...prev, search: true }));
//     try {
//       const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
//       if (res.ok) {
//         setSearchResults(await res.json());
//       }
//     } catch (err) {
//       showMsg("検索に失敗しました", true);
//     } finally {
//       setIsLoading(prev => ({ ...prev, search: false }));
//     }
//   };

//   const sendRequest = async (toUserId: string) => {
//     try {
//       const res = await fetch('/api/friends/request', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ toUserId }),
//       });
//       if (res.ok) {
//         showMsg("申請を送信しました！");
//       } else {
//         const data = await res.json();
//         showMsg(data.error || "申請に失敗しました", true);
//       }
//     } catch (err) {
//       showMsg("通信エラー", true);
//     }
//   };

//   const acceptRequest = async (friendshipId: string) => {
//     try {
//       const res = await fetch('/api/friends/accept', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ friendshipId }),
//       });
//       if (res.ok) {
//         showMsg("フレンドを承認しました！");
//         refreshAllData();
//       }
//     } catch (err) {
//       showMsg("承認に失敗しました", true);
//     }
//   };

//   const rejectOrCancel = async (friendshipId: string, isUnfriend = false) => {
//     if (!confirm(isUnfriend ? "フレンドを解除しますか？" : "申請を取り消し/拒否しますか？")) return;
//     try {
//       const res = await fetch('/api/friends/reject', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ friendshipId }),
//       });
//       if (res.ok) {
//         showMsg(isUnfriend ? "フレンド解除しました" : "削除しました");
//         refreshAllData();
//       }
//     } catch (err) {
//       showMsg("処理に失敗しました", true);
//     }
//   };

//   const showMsg = (text: string, isError = false) => {
//     setMessage({ text, isError });
//     setTimeout(() => setMessage({ text: '', isError: false }), 3000);
//   };

//   // --- UI Components ---

//   return (
//     <div className="p-8 max-w-2xl mx-auto text-slate-800 bg-slate-50 min-h-screen">
//       <h1 className="text-3xl font-extrabold mb-8 text-slate-900">Friends</h1>

//       {message.text && (
//         <div className={`mb-6 p-4 rounded-lg border shadow-sm animate-in fade-in slide-in-from-top-2 ${
//           message.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
//         }`}>
//           {message.text}
//         </div>
//       )}

//       {/* 1. ユーザー検索 */}
//       <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//         <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
//           🔍 ユーザーを探す
//         </h2>
//         <div className="flex gap-2 mb-4">
//           <input
//             type="text"
//             className="flex-1 p-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
//             placeholder="名前で検索..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//           />
//           <button 
//             onClick={handleSearch}
//             disabled={isLoading.search}
//             className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
//           >
//             {isLoading.search ? '...' : '検索'}
//           </button>
//         </div>

//         {searchResults.length > 0 && (
//           <ul className="divide-y divide-slate-100 border-t mt-4">
//             {searchResults.map(user => (
//               <li key={user.id} className="py-3 flex justify-between items-center">
//                 <span className="font-medium text-slate-700">{user.displayName}</span>
//                 <button 
//                   onClick={() => sendRequest(user.id)}
//                   className="text-sm bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition"
//                 >
//                   申請を送る
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       {/* 2. 届いている申請 */}
//       <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//         <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
//           📩 届いている申請
//         </h2>
//         {pendingRequests.length === 0 ? (
//           <p className="text-slate-400 text-sm italic">新しい申請はありません</p>
//         ) : (
//           <ul className="space-y-3">
//             {pendingRequests.map(req => (
//               <li key={req.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
//                 <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]">From: {req.userId}</span>
//                 <div className="flex gap-2">
//                   <button 
//                     onClick={() => acceptRequest(req.id)}
//                     className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition"
//                   >
//                     承認
//                   </button>
//                   <button 
//                     onClick={() => rejectOrCancel(req.id)}
//                     className="bg-white text-slate-400 border border-slate-200 px-4 py-1.5 rounded-lg text-sm hover:text-red-500 transition"
//                   >
//                     拒否
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       {/* 3. フレンド一覧 */}
//       <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//         <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-900">
//           👥 フレンド一覧
//         </h2>
//         {friends.length === 0 ? (
//           <p className="text-slate-400 text-sm italic">まだフレンドがいません</p>
//         ) : (
//           <ul className="divide-y divide-slate-50">
//             {friends.map(f => (
//               <li key={f.id} className="py-4 flex justify-between items-center group">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
//                     {f.friendName[0]}
//                   </div>
//                   <span className="font-semibold text-slate-700">{f.friendName}</span>
//                 </div>
//                 <button 
//                   onClick={() => rejectOrCancel(f.id, true)}
//                   className="text-xs text-slate-300 hover:text-red-500 font-medium transition-colors"
//                 >
//                   解除
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, UserCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types ---
interface SearchUser {
  id: string;
  displayName: string;
}

// モックデータ
const MOCK_USERS: SearchUser[] = [
  { id: 'mock-1', displayName: '田中太郎' },
  { id: 'mock-2', displayName: '佐藤花子' },
  { id: 'mock-3', displayName: '鈴木一郎' },
  { id: 'mock-4', displayName: '高橋美咲' },
  { id: 'mock-5', displayName: '渡辺健太' },
];

export default function FriendsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // プロフィールモーダル管理
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  // 初期ロード
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) setSearchResults(await res.json());
    } catch (err) {
      showMsg("検索に失敗しました", true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = async (toUserId: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId }),
      });
      if (res.ok) {
        showMsg("リクエストを送信しました");
        setSearchResults([]);
        setSearchQuery('');
        setSelectedUser(null);
        setHasSearched(false);
      }
    } catch (err) {
      showMsg("通信エラー", true);
    }
  };

  const showMsg = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 3000);
  };

  // 表示するユーザーリスト（検索前はモック、検索後は結果）
  const displayUsers = hasSearched ? searchResults : MOCK_USERS;

  // 初期ロード画面
  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
        <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col items-center justify-center shadow-2xl text-black">
          <Loader2 size={40} className="text-[#B5A184] animate-spin" />
          <p className="mt-4 text-sm text-gray-500 animate-pulse">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col shadow-2xl text-black overflow-hidden">

        {/* --- 検索バー --- */}
        <div className="px-6 pt-14 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="w-full bg-white border border-blue-200 rounded-lg py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#B5A184] transition-all"
              placeholder="フレンドを検索、userIDの入力"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* --- 検索結果・モックユーザー一覧 --- */}
        <div className="flex-1 px-6 overflow-y-auto scrollbar-hide pb-24">
          <div className="space-y-0">
            <h2 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">
              {hasSearched ? '検索結果' : 'おすすめユーザー'}
            </h2>

            {/* ローディング中 */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="text-[#B5A184] animate-spin" />
                <p className="mt-3 text-sm text-gray-400">検索中...</p>
              </div>
            ) : displayUsers.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8 animate-in fade-in duration-300">検索結果がありません</p>
            ) : (
              displayUsers.map((user, index) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="border-b border-gray-300/60 py-4 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400">
                      <UserCircle2 size={32} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-gray-500 leading-tight">user-name</span>
                      <span className="text-[15px] font-bold leading-tight">{user.displayName}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- プロフィールモーダル --- */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 animate-in fade-in duration-200">
            <div className="w-full bg-[#F5EFE0] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative">
              {/* モーダル内ヘッダー */}
              <div className="p-6 flex justify-between items-start animate-in fade-in duration-300" style={{ animationDelay: '100ms' }}>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><ChevronLeft size={28} /></button>
              </div>

              {/* モーダルコンテンツ */}
              <div className="px-8 pb-12 flex flex-col items-center text-center">
                <div className="w-28 h-28 bg-gray-200 rounded-full mb-4 flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-50 duration-300" style={{ animationDelay: '150ms' }}>
                  <UserCircle2 size={70} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '200ms' }}>{selectedUser.displayName}</h3>
                <p className="text-[10px] text-gray-400 font-bold mb-6 italic tracking-widest animate-in fade-in duration-300" style={{ animationDelay: '250ms' }}>user-name</p>

                <p className="text-[13px] leading-relaxed text-gray-700 mb-8 max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '300ms' }}>
                  よろしくお願いします！
                </p>

                {/* リクエストボタン */}
                <button
                  onClick={() => sendRequest(selectedUser.id)}
                  className="w-full bg-[#1A363E] text-white py-4 rounded-md font-bold text-[15px] tracking-[0.2em] shadow-lg active:scale-95 transition-transform animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: '350ms' }}
                >
                  リクエスト
                </button>
              </div>
            </div>
          </div>
        )}

        {/* トースト表示 */}
        {message.text && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 rounded-full bg-black text-white text-[11px] font-bold shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}