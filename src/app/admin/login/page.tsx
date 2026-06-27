"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authMutation = useAuth();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    authMutation.mutate(
      { email, password },
      {
        onSuccess: (data: any) => {
          const role = data?.user?.role;
          if (role !== 'SUPERADMIN') {
            localStorage.removeItem('auth_token');
            setError('Hanya akun SUPERADMIN yang dapat mengakses admin panel.');
            return;
          }
          router.push('/admin/dashboard');
        },
        onError: (err: any) => {
          setError(err.message || 'Login gagal.');
        },
      }
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <section className="hidden lg:flex flex-col justify-center gap-6 bg-gradient-to-br from-slate-900 to-slate-700 p-12 text-white">
            <div>
              <h1 className="text-4xl font-semibold mb-3">Velora Admin</h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Masuk sebagai administrator untuk mengelola produk marketplace, meninjau toko, dan mengamankan operasi.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Quick note</p>
              <p className="mt-3 text-sm text-slate-200 leading-relaxed">Gunakan admin@velora.com / admin123 setelah menjalankan seed.</p>
            </div>
          </section>

          <section className="p-10">
            <div className="mb-8">
              <p className="text-sm text-slate-500">Admin Access</p>
              <h2 className="text-3xl font-bold text-slate-950">Login Admin</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="admin@velora.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="********"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={authMutation.isPending}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {authMutation.isPending ? 'Memproses...' : 'Masuk ke Admin'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
