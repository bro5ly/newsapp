"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, inviteCode }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "登録に失敗しました");

      // サインアップ成功時の処理
      alert("アカウントを作成しました。続けてプロフィールを設定してください。");
      
      // 指示通り SetupPage (/setup) へ飛ばす
      router.push("/setup"); 
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#8E8E93] flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[430px] h-full bg-[#F5EFE0] flex flex-col shadow-2xl overflow-y-auto scrollbar-hide">
        
        {/* ヘッダー装飾エリア */}
        <div className="relative h-48 w-full bg-black/5 flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-40 grid grid-cols-3 gap-1 p-1">
             {[...Array(9)].map((_, i) => (
               <div key={i} className="bg-gray-300 rounded-sm aspect-video"></div>
             ))}
          </div>
          
          <div className="absolute top-10 left-6 right-6 flex justify-between items-start z-10">
            <button onClick={() => router.back()} className="p-1 hover:bg-black/5 rounded-full transition">
              <ChevronLeft size={32} className="text-black" />
            </button>
            <div className="w-16 h-16 rounded-full border-4 border-[#0066CC]/30 flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-bold text-black/60">入力</span>
            </div>
          </div>
        </div>

        {/* フォームエリア */}
        <div className="flex-1 px-8 pt-8 pb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="block text-[#1A363E] text-sm font-medium border-l-2 border-blue-400 pl-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスの入力"
                className="w-full bg-white/50 border border-blue-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[#1A363E] text-sm font-medium border-l-2 border-blue-400 pl-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードの入力"
                  className="w-full bg-white/50 border border-blue-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[#1A363E] text-sm font-medium border-l-2 border-blue-400 pl-2">
                パスワードの確認
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワードの確認"
                className="w-full bg-white/50 border border-blue-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[#1A363E] text-sm font-medium border-l-2 border-blue-400 pl-2">
                招待コード
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-white/50 border border-blue-300 rounded-md py-3 px-4 text-black focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400"
              />
            </div>

            {error && (
              <div className="text-[11px] text-red-500 bg-red-50 p-2 rounded border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A363E] text-white py-4 rounded-md font-bold text-[15px] shadow-lg active:scale-95 transition-transform disabled:bg-gray-400"
              >
                {isLoading ? "処理中..." : "登録して設定へ"}
              </button>
            </div>
          </form>
        </div>

        <div className="h-10 w-full flex-shrink-0"></div>
      </div>
    </div>
  );
}