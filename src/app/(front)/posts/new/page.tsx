'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SCENES = [
  { id: 'newscaster', name: 'ニュースキャスター', icon: '🎙️' },
  { id: 'reporter', name: '現場レポーター', icon: '🎤' },
  { id: 'documentary', name: 'ドキュメンタリー', icon: '🎥' },
];

export default function NewPostPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedScene, setSelectedScene] = useState(SCENES[0].id);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          sceneType: selectedScene,
          privacyScope: 'PUBLIC',
        }),
      });

      const data = await res.json();
      if (data.postId) {
        alert("動画生成を開始しました！ダッシュボードで確認してください。");
        router.push('/dashboard');
      }
    } catch (err) {
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">新しい動画を作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* シーン選択 */}
        <div>
          <label className="block text-sm font-medium mb-2">シーンを選択</label>
          <div className="grid grid-cols-3 gap-4">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedScene(scene.id)}
                className={`p-4 border rounded-lg text-center ${
                  selectedScene === scene.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="text-2xl">{scene.icon}</div>
                <div className="text-sm">{scene.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 詳細プロンプト */}
        <div>
          <label className="block text-sm font-medium mb-2">詳細な内容</label>
          <textarea
            className="w-full border p-3 rounded-lg h-32"
            placeholder="例：今日起きたニュースについて、情熱的に語ってください..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-400"
        >
          {loading ? '生成リクエスト中...' : '動画を生成する'}
        </button>
      </form>
    </div>
  );
}