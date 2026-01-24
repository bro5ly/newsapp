"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusSquare, Users, User, Home } from "lucide-react";

const navItems = [
  { name: "ホーム", href: "/dashboard", icon: Home },
  { name: "フレンド", href: "/friends", icon: Users },
  { name: "作成", href: "/posts/new", icon: PlusSquare },
  { name: "プロフィール", href: "/profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] h-16 bg-[#B5A184] rounded-2xl flex items-center justify-around px-2 shadow-xl z-50 md:top-0 md:left-0 md:translate-x-0 md:w-64 md:h-screen md:rounded-none md:flex-col md:justify-start md:pt-10 md:max-w-none">
      <ul className="flex justify-around items-center w-full md:flex-col md:gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href} className="md:w-full flex justify-center">
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive 
                    ? "bg-[#0066CC] text-white shadow-lg" 
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={22} fill={isActive ? "white" : "none"} />
                <span className={`text-[13px] font-bold ${isActive ? "block" : "hidden md:block"}`}>
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}