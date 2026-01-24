"use client"; // パス判定を行うためにクライアントコンポーネントにする必要があります

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layouts/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ナビバーを表示したくないパスのリスト
  const noNavbarPaths = ["/login", "/signup", "/setup"];
  
  // 現在のパスがリストに含まれているかチェック
  const showNavbar = !noNavbarPaths.includes(pathname);

  return (
    <html lang="ja">
      <body>
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* 認証ページ以外の場合のみ Navbar を表示 */}
          {showNavbar && <Navbar />}

          {/* コンテンツをずらすための余白も、Navbar があるときだけ適用する */}
          <main className={`flex-1 ${showNavbar ? "pb-20 md:pb-0 md:pl-64" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}