'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';

const SCENES = [
  {
    id: 'newscaster',
    name: 'ニュースキャスター',
    icon: '🎙️',
    description: 'スタジオでニュースを伝えるスタイル',
    previewImage: '/templates/newscaster-preview.jpg',
    color: '#A89078'
  },
  {
    id: 'reporter',
    name: '現場レポーター',
    icon: '🎤',
    description: '現場から生中継するスタイル',
    previewImage: '/templates/reporter-preview.jpg',
    color: '#8B7355'
  },
  {
    id: 'documentary',
    name: 'ドキュメンタリー',
    icon: '🎥',
    description: '深掘りして伝えるスタイル',
    previewImage: '/templates/documentary-preview.jpg',
    color: '#9C8B75'
  },
];

type Step = 'category' | 'content';

export default function NewPostPage() {
  const [step, setStep] = useState<Step>('category');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedSceneData = SCENES.find(s => s.id === selectedScene);
  const currentStepNumber = step === 'category' ? 1 : 2;
  const totalSteps = 2;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title,
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

  const canProceedFromCategory = selectedScene !== '';
  const canProceedFromContent = title.trim().length > 0 && prompt.trim().length > 0;

  return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col shadow-2xl text-black">

        {/* ヘッダー */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {step !== 'category' ? (
              <button
                onClick={() => setStep('category')}
                className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <h1 className="text-lg font-bold text-gray-900">カテゴリーの選択</h1>
            {/* ステップインジケーター（円形） */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${(currentStepNumber / totalSteps) * 100.5} 100.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                {currentStepNumber}
              </span>
            </div>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* Step 1: カテゴリー選択 */}
          {step === 'category' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => setSelectedScene(scene.id)}
                    className={`w-full rounded-2xl transition-all overflow-hidden ${
                      selectedScene === scene.id
                        ? 'ring-4 ring-[#1A363E] ring-offset-2'
                        : 'hover:scale-[1.02]'
                    }`}
                    style={{ backgroundColor: scene.color }}
                  >
                    <div className="relative h-32 flex items-center justify-center">
                      {/* プレビュー画像またはプレースホルダー */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-white/40 rounded-lg flex items-center justify-center">
                          <ImageIcon size={32} className="text-white/60" />
                        </div>
                      </div>
                      {/* 選択時のオーバーレイ */}
                      {selectedScene === scene.id && (
                        <div className="absolute inset-0 bg-[#1A363E]/20 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-[#1A363E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3 bg-black/10">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{scene.icon}</span>
                        <div className="text-left">
                          <div className="font-bold text-white text-sm">{scene.name}</div>
                          <div className="text-xs text-white/70">{scene.description}</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('content')}
                disabled={!canProceedFromCategory}
                className="w-full mt-6 bg-[#1A363E] text-white py-4 rounded-xl text-sm font-bold hover:bg-[#1A363E]/90 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                次へ
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: 内容入力（プロンプト + 画像） */}
          {step === 'content' && (
            <div className="space-y-4">
              {/* 選択したカテゴリーのプレビュー */}
              {selectedSceneData && (
                <div
                  className="rounded-2xl overflow-hidden mb-4"
                  style={{ backgroundColor: selectedSceneData.color }}
                >
                  <div className="h-20 flex items-center justify-center relative">
                    <div className="w-12 h-12 border-2 border-white/40 rounded-lg flex items-center justify-center">
                      <ImageIcon size={24} className="text-white/60" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/30 px-2 py-1 rounded-md">
                      <span className="text-xs text-white flex items-center gap-1">
                        <span>{selectedSceneData.icon}</span>
                        {selectedSceneData.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* タイトル入力 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-700">タイトル</label>
                  <span className="text-xs text-orange-500 font-bold">必須</span>
                </div>
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
                  placeholder="例）今日の出来事"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* テキスト入力 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-700">投稿する内容を入力してください。</label>
                  <span className="text-xs text-orange-500 font-bold">必須</span>
                </div>
                <textarea
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="例）今日は学校で一発ギャグが受けたwwww"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                />
              </div>

              {/* 画像選択 */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">画像を選択</label>
                {!imagePreview ? (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                      <div className="relative">
                        <ImageIcon size={24} className="text-gray-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600">+</span>
                        </div>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* 生成ボタン */}
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceedFromContent}
                className="w-full mt-6 bg-[#1A363E] text-white py-4 rounded-xl text-sm font-bold hover:bg-[#1A363E]/90 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '生成中...' : '生成'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}