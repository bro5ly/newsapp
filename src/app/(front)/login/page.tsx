"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error?.message || "予期せぬエラーが発生しました"
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Googleログイン処理
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("/api/auth/google", { method: "POST" });
      const result = await res.json();

      if (res.ok && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error(result.error?.message || "URLの取得に失敗しました");
      }
    } catch (err: any) {
      setError(err.message || "Googleログインを開始できませんでした");
    }
  };

  return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col shadow-2xl overflow-y-auto scrollbar-hide">
        
        {/* ヘッダー画像エリア */}
        <div className="relative h-64 w-full bg-black/5 flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40 grid grid-cols-3 gap-1 p-1">
             {[...Array(9)].map((_, i) => (
               <div key={i} className="bg-gray-300 rounded-sm aspect-video"></div>
             ))}
          </div>
          
          <div className="absolute top-10 right-6 z-10">
            <div className="w-16 h-16 rounded-full border-4 border-[#0066CC]/30 flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-bold text-black/60">入力</span>
            </div>
          </div>
        </div>

        {/* フォームエリア */}
        <div className="flex-1 px-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* メールアドレス */}
            <div className="space-y-2">
              <label className="block text-[#1A363E] text-sm font-medium border-l-2 border-[#1A363E] pl-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-transparent border-b border-[#0066CC] py-2 text-black focus:outline-none placeholder:text-gray-400"
                required
              />
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <label className="block text-[#1A363E] text-sm font-medium border-l-2 border-[#1A363E] pl-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="........"
                  className="w-full bg-transparent border-b border-[#0066CC] py-2 text-black focus:outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-[#1A363E]/60 hover:text-[#1A363E]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-start">
                <Link href="/signup" className="text-[11px] text-[#0066CC] hover:underline">
                  アカウントをお持ちでない方は こちら
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-3 text-[11px] text-red-500 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            {/* ログインボタン群 */}
            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A363E] text-white py-4 rounded-md font-bold text-[15px] tracking-widest shadow-lg active:scale-95 transition-transform disabled:bg-gray-400"
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </button>

              {/* 区切り線 */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#F5EFE0] px-2 text-gray-500 italic">or</span>
                </div>
              </div>

              {/* Googleログインボタン（以前のサインアップページのデザインを適用） */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-[#B1997A] text-white py-4 rounded-md shadow-md flex items-center justify-center gap-3 italic text-[15px] active:scale-95 transition-transform"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 bg-white rounded-full p-0.5"
                />
                Googleでログイン
              </button>
            </div>
          </form>
        </div>

        <div className="h-20 w-full flex-shrink-0"></div>
      </div>
    </div>
  );
}