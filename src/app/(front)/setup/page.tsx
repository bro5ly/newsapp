"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "設定に失敗しました");
      }

      // 成功したらダッシュボードへ
      // Middlewareが次から「ACTIVE」として認識し、アクセスを許可します
      router.push("/dashboard");
      router.refresh(); // Middlewareの状態を再計算させるためにリフレッシュ
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
          プロフィール設定
        </h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          アプリを始める前に、あなたの表示名を教えてください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="例：タロウ"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-white bg-red-500 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold transition-colors"
          >
            {isSubmitting ? "保存中..." : "利用を開始する"}
          </button>
        </form>
      </div>
    </div>
  );
}
