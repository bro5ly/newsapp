"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 通常のメール・パスワード登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "登録に失敗しました");
      }

      // 成功時（Supabaseの設定によってはメール確認待ちになる場合があります）
      alert("確認メールを送信しました。メールを確認してください。");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Googleログイン（リダイレクト処理）
  const handleGoogleLogin = async () => {
    try {
      // API経由でSupabaseのOAuth URLを取得
      const res = await fetch("/api/auth/google", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      setError("Googleログインを開始できませんでした");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">アカウント作成</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded border-gray-300"
            placeholder="example@mail.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded border-gray-300"
            placeholder="8文字以上"
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
          disabled={isLoading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-bold"
        >
          {isLoading ? "登録中..." : "メールアドレスで登録"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">または</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded hover:bg-gray-50 transition-colors"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Googleで続行
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        すでにアカウントをお持ちですか？{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          ログイン
        </a>
      </p>
    </div>
  );
}
