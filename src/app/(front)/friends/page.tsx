'use client';

import { useState, useEffect } from 'react';

export default function FriendsPage() {
  const [targetUserId, setTargetUserId] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  // 1. 届いている申請一覧を取得（本来は専用のAPIが必要ですが、今回は直接取得を想定）
  const fetchRequests = async () => {
    // ここで /api/friends/pending などのエンドポイントを叩く想定
    // 今回は簡易的にコンソールや手動更新で確認する流れでもOKです
  };

  // 2. フレンド申請を送る
  const sendRequest = async () => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: targetUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('申請を送信しました！');
        setTargetUserId('');
      } else {
        setMessage(`エラー: ${data.error}`);
      }
    } catch (err) {
      setMessage('通信エラーが発生しました');
    }
  };

  // 3. 申請を承認する
  const acceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        setMessage('フレンドを承認しました！');
        // リストを更新
        setPendingRequests(prev => prev.filter(req => req.id !== friendshipId));
      }
    } catch (err) {
      setMessage('承認に失敗しました');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">フレンド管理</h1>

      {/* 申請フォーム */}
      <div className="mb-10 p-4 border rounded-lg bg-gray-50">
        <h2 className="font-semibold mb-2">新規フレンド申請</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="相手のユーザーID (UUID)"
            className="flex-1 p-2 border rounded text-black"
          />
          <button
            onClick={sendRequest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            申請を送る
          </button>
        </div>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
          {message}
        </div>
      )}

      {/* 届いている申請リスト（仮のUI） */}
      <div>
        <h2 className="font-semibold mb-2">届いている申請</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">新しい申請はありません</p>
        ) : (
          <ul className="space-y-2">
            {pendingRequests.map((req) => (
              <li key={req.id} className="flex justify-between items-center p-3 border rounded">
                <span>ユーザー: {req.user_id}</span>
                <button
                  onClick={() => acceptRequest(req.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  承認する
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}