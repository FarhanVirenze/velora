"use client";

import { useState } from "react";
import { useAdminUsers, AdminUser, useUpdateAdminUserRole } from "@/hooks/useAdminUsers";

export default function AdminUsersPage() {
  const { data: users, isLoading, isError } = useAdminUsers();
  const updateUserRole = useUpdateAdminUserRole();
  const [notification, setNotification] = useState<string | null>(null);

  const handleRoleChange = async (user: AdminUser, role: AdminUser['role']) => {
    setNotification(null);
    try {
      await updateUserRole.mutateAsync({ userId: user.id, role });
      setNotification(`Role ${role} berhasil disimpan untuk ${user.email}.`);
    } catch (error: any) {
      setNotification(error.message || 'Gagal memperbarui role pengguna.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Users Management</p>
          <h1 className="text-3xl font-semibold text-slate-950">Manage platform users</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Kelola akun Buyer, Seller, dan Superadmin dari satu panel pusat.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {notification && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 mb-4">
            {notification}
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-slate-500">Memuat daftar pengguna...</div>
        ) : isError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Gagal memuat pengguna.</div>
        ) : users?.length ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">{user.name || user.email}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <p className="mt-2 text-sm text-slate-600">Created at {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {['BUYER', 'SELLER', 'SUPERADMIN'].map((roleOption) => (
                      <button
                        type="button"
                        key={roleOption}
                        onClick={() => handleRoleChange(user, roleOption as AdminUser['role'])}
                        disabled={user.role === roleOption || updateUserRole.isPending}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          user.role === roleOption
                            ? 'bg-slate-950 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        } disabled:opacity-60`}
                      >
                        {roleOption}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Tidak ada pengguna yang terdaftar.</div>
        )}
      </section>
    </div>
  );
}
