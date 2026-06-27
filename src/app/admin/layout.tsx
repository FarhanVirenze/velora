"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (pathname.startsWith("/admin/login")) {
      setIsChecking(false);
      return;
    }

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!isProfileLoading) {
      if (!profile || profile.role !== "SUPERADMIN") {
        router.replace("/admin/login");
        return;
      }
      setIsChecking(false);
    }
  }, [pathname, router, profile, isProfileLoading]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-8 shadow-xl">Loading admin…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="min-h-screen grid grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="px-6 py-8 border-b border-slate-200">
            <div className="text-2xl font-bold tracking-tight text-slate-900">Velora Admin</div>
            <p className="text-sm text-slate-500 mt-1">Marketplace control panel</p>
          </div>
          <nav className="px-6 py-6 space-y-1 flex-1">
            <Link href="/admin/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
              Dashboard
            </Link>
            <Link href="/admin/shops" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
              Shops
            </Link>
            <Link href="/admin/users" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
              Users
            </Link>
            <Link href="/admin/products" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
              Products
            </Link>
          </nav>
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("auth_token");
                router.replace("/admin/login");
              }}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
