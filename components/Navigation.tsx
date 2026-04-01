"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/dashboard", label: "ダッシュボード" },
    { href: "/expenses", label: "支出管理" },
    { href: "/budgets", label: "予算管理" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          家計簿
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ログアウト
            </button>
          )}
        </div>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-gray-100">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
              pathname === link.href
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
