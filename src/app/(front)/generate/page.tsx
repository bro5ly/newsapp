'use client';

import { useState } from 'react';

export default function NewsGeneratorPage() {
  const [text, setText] = useState('世田谷区で犯人を確保');
  const [imageName, setImageName] = useState('oki.png'); // テスト用の初期値
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setVideoUrl('');

    try {
      const response = await fetch('/api/generate-caster-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            textToDisplay: text,
            imageName: imageName 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '動画の生成に失敗しました');
      }

      setVideoUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold border-l-4 border-red-600 pl-4 mb-8">
          ニュース動画ジェネレーター
        </h1>

        <div className="space-y-6">
          {/* テロップ入力 */}
          <div>
    <label className="block text-sm font-semibold mb-2 text-gray-700">テロップ（15文字以内）</label>
    <input
      type="text"
      maxLength={15} // 入力制限を追加
      className="w-full p-3 border rounded-lg text-black outline-none focus:border-red-500"
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
    <p className="text-right text-xs text-gray-400 mt-1">{text.length} / 15</p>
  </div>

          {/* 画像名入力（本来はアップロード機能と連携） */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              顔写真ファイル名 (public/uploads/内のファイル)
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="example.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              ※現在はテスト用として、public/uploadsフォルダに実在する名前を入力してください。
            </p>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full p-4 rounded-lg font-bold text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? '動画生成中（10秒ほどかかります）...' : 'ニュース動画を生成する'}
          </button>

          {/* エラー表示 */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* 結果表示 */}
          {videoUrl && (
            <div className="mt-8 animate-in fade-in duration-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-red-600 animate-pulse"></span>
                生成されたプレビュー
              </h2>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-4 border-gray-800 shadow-2xl">
                <video src={videoUrl} controls autoPlay className="w-full h-full" />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded text-xs break-all text-gray-600">
                保存先: {videoUrl}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}