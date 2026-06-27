"use client";

import { useMemo } from "react";
import { useAdminProducts } from "@/hooks/useAdminProducts";

export default function AdminDashboardPage() {
  const { data: products, isLoading, isError } = useAdminProducts();

  const stats = useMemo(() => {
    const totalProducts = products?.length ?? 0;
    const outOfStock = products?.filter((product) => product.stock <= 0).length ?? 0;
    const activeProducts = products?.filter((product) => product.stock > 0).length ?? 0;

    return {
      totalProducts,
      outOfStock,
      activeProducts,
    };
  }, [products]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-950">Welcome back, Superadmin</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Pantau performa produk marketplace secara cepat dan kelola inventaris dengan mudah.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:w-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Produk</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{stats.totalProducts}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Produk Aktif</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{stats.activeProducts}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stok Kosong</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Produk terbaru</h2>
          <p className="mt-2 text-sm text-slate-600">Seluruh daftar produk dapat dikelola di halaman Products.</p>

          {isLoading ? (
            <div className="mt-8 text-sm text-slate-500">Memuat produk...</div>
          ) : isError ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Gagal memuat produk.</div>
          ) : (
            <div className="mt-6 space-y-4">
              {products?.slice(0, 5).map((product) => (
                <div key={product.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    Stok: {product.stock} • Terjual: {product.sold}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Daily snapshot</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Marketplace status</p>
              <p className="mt-2">Semua produk tampil dengan informasi mutakhir. Gunakan produk panel untuk menambah, edit, atau hapus item.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Shop review</p>
              <p className="mt-2">Dashboard masih bersifat ringkas. Perluas dengan laporan toko atau pesanan bila dibutuhkan.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
