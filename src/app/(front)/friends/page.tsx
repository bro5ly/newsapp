'use client';

import { useState, useEffect, useCallback } from 'react';

// --- Types ---
interface SearchUser {
  id: string;
  displayName: string;
}

interface PendingRequest {
  id: string;
  userId: string; // 申請者のID
}

interface Friend {
  id: string;
  friendName: string;
  friendId: string;
}

export default function FriendsPage() {
  // --- States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState({ search: false, list: true });

  // --- Data Fetching ---

  // 届いている申請とフレンド一覧を同時に更新
  const refreshAllData = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, list: true }));
    try {
      const [pendingRes, friendsRes] = await Promise.all([
        fetch('/api/friends/pending'),
        fetch('/api/friends/list')
      ]);

      if (pendingRes.ok) setPendingRequests(await pendingRes.json());
      if (friendsRes.ok) setFriends(await friendsRes.json());
    } catch (err) {
      console.error("データ取得エラー:", err);
    } finally {
      setIsLoading(prev => ({ ...prev, list: false }));
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // --- Actions ---

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(prev => ({ ...prev, search: true }));
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      showMsg("検索に失敗しました", true);
    } finally {
      setIsLoading(prev => ({ ...prev, search: false }));
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
        showMsg("申請を送信しました！");
      } else {
        const data = await res.json();
        showMsg(data.error || "申請に失敗しました", true);
      }
    } catch (err) {
      showMsg("通信エラー", true);
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        showMsg("フレンドを承認しました！");
        refreshAllData();
      }
    } catch (err) {
      showMsg("承認に失敗しました", true);
    }
  };

  const rejectOrCancel = async (friendshipId: string, isUnfriend = false) => {
    if (!confirm(isUnfriend ? "フレンドを解除しますか？" : "申請を取り消し/拒否しますか？")) return;
    try {
      const res = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        showMsg(isUnfriend ? "フレンド解除しました" : "削除しました");
        refreshAllData();
      }
    } catch (err) {
      showMsg("処理に失敗しました", true);
    }
  };

  const showMsg = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 3000);
  };

  // --- UI Components ---

  return (
    <div className="p-8 max-w-2xl mx-auto text-slate-800 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-900">Friends</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border shadow-sm animate-in fade-in slide-in-from-top-2 ${
          message.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* 1. ユーザー検索 */}
      <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          🔍 ユーザーを探す
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 p-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            placeholder="名前で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading.search}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isLoading.search ? '...' : '検索'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <ul className="divide-y divide-slate-100 border-t mt-4">
            {searchResults.map(user => (
              <li key={user.id} className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-700">{user.displayName}</span>
                <button 
                  onClick={() => sendRequest(user.id)}
                  className="text-sm bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition"
                >
                  申請を送る
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. 届いている申請 */}
      <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          📩 届いている申請
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="text-slate-400 text-sm italic">新しい申請はありません</p>
        ) : (
          <ul className="space-y-3">
            {pendingRequests.map(req => (
              <li key={req.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]">From: {req.userId}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptRequest(req.id)}
                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition"
                  >
                    承認
                  </button>
                  <button 
                    onClick={() => rejectOrCancel(req.id)}
                    className="bg-white text-slate-400 border border-slate-200 px-4 py-1.5 rounded-lg text-sm hover:text-red-500 transition"
                  >
                    拒否
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. フレンド一覧 */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-900">
          👥 フレンド一覧
        </h2>
        {friends.length === 0 ? (
          <p className="text-slate-400 text-sm italic">まだフレンドがいません</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {friends.map(f => (
              <li key={f.id} className="py-4 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {f.friendName[0]}
                  </div>
                  <span className="font-semibold text-slate-700">{f.friendName}</span>
                </div>
                <button 
                  onClick={() => rejectOrCancel(f.id, true)}
                  className="text-xs text-slate-300 hover:text-red-500 font-medium transition-colors"
                >
                  解除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}