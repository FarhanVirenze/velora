"use client";

import { useMemo, useState } from "react";
import { useAdminShops, useUpdateAdminShopStatus } from "@/hooks/useAdminShops";

export default function AdminShopsPage() {
  const { data: shops, isLoading, isError } = useAdminShops();
  const updateShopStatus = useUpdateAdminShopStatus();
  const [notification, setNotification] = useState<string | null>(null);

  const pendingCount = useMemo(() => shops?.filter((shop) => shop.status === "PENDING").length ?? 0, [shops]);
  const activeCount = useMemo(() => shops?.filter((shop) => shop.status === "ACTIVE").length ?? 0, [shops]);

  const handleStatusChange = async (shopId: string, status: "ACTIVE" | "REJECTED") => {
    try {
      setNotification(null);
      await updateShopStatus.mutateAsync({ shopId, status });
      setNotification(`Shop ${status === "ACTIVE" ? "approved" : "rejected"} successfully.`);
    } catch (error: any) {
      setNotification(error.message || "Failed to update shop status.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Shops Management</p>
          <h1 className="text-3xl font-semibold text-slate-950">Manage seller shops</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Tinjau toko Penjual, setujui toko aktif, dan pastikan marketplace tetap berkualitas.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending Shops</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">{pendingCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active Shops</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">{activeCount}</p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Seller shops</h2>
            <p className="mt-1 text-sm text-slate-500">Filter and approve seller shops that meet marketplace standards.</p>
          </div>
          <div className="text-sm text-slate-500">Total stores: {shops?.length ?? 0}</div>
        </div>

        {notification && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 mb-4">
            {notification}
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-slate-500">Memuat daftar toko...</div>
        ) : isError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Gagal memuat toko.</div>
        ) : shops?.length ? (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div key={shop.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">{shop.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{shop.category} • {shop.status}</p>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{shop.description || "No description provided."}</p>
                    <p className="mt-3 text-sm text-slate-500">Owner: {shop.owner.name || shop.owner.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(shop.id, "ACTIVE")}
                      disabled={shop.status === "ACTIVE" || updateShopStatus.isPending}
                      className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(shop.id, "REJECTED")}
                      disabled={shop.status === "REJECTED" || updateShopStatus.isPending}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Tidak ada toko yang terdaftar saat ini.</div>
        )}
      </section>
    </div>
  );
}
