"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDeleteAccount, useUpdateProfile, useProfile } from "@/hooks/useProfile";

export default function PrivacyPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const updateProfile = useUpdateProfile();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (profile?.settings) {
      try {
        const parsed = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;
        if (parsed.hideOnlineStatus !== undefined) setHideOnlineStatus(parsed.hideOnlineStatus);
      } catch (e) {}
    }
  }, [profile]);

  const toggleOnlineStatus = () => {
    const newVal = !hideOnlineStatus;
    setHideOnlineStatus(newVal);
    updateProfile.mutate({ settings: { ...(profile?.settings || {}), hideOnlineStatus: newVal } });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText !== "HAPUS AKUN SAYA") {
      alert("Teks konfirmasi tidak sesuai!");
      return;
    }

    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("auth_token");
        window.dispatchEvent(new Event("auth_change"));
        alert("Akun Anda berhasil dihapus secara permanen.");
        router.push("/");
      },
      onError: (err: any) => {
        alert(err.message || "Gagal menghapus akun");
      }
    });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-xl font-medium text-foreground">Pengaturan Privasi</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola data dan keamanan privasi akun Anda</p>
      </div>

      <div className="max-w-3xl space-y-8">
        
        {/* Aktivitas Akun */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Aktivitas Akun</h2>
          <div className="p-4 border border-border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sembunyikan Status Online</p>
              <p className="text-sm text-muted-foreground mt-1">Pengguna lain tidak dapat melihat saat Anda sedang aktif di aplikasi.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={hideOnlineStatus} onChange={toggleOnlineStatus} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Zona Bahaya */}
        <div className="space-y-4 pt-6 mt-6 border-t border-border">
          <h2 className="text-lg font-medium text-red-500">Zona Bahaya</h2>
          <div className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Hapus Akun Permanen</p>
              <p className="text-sm text-red-500/80 mt-1 max-w-lg">
                Perhatian: Semua data pesanan, saldo koin, dan alamat akan terhapus secara permanen. 
                Tindakan ini tidak dapat dibatalkan atau dipulihkan kembali.
              </p>
            </div>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium rounded transition-colors whitespace-nowrap"
            >
              Hapus Akun
            </button>
          </div>
        </div>

      </div>

      {/* Modal Hapus Akun */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-lg w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-center text-foreground mb-2">Konfirmasi Hapus Akun</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Ketik <span className="font-bold text-foreground select-all">HAPUS AKUN SAYA</span> di bawah ini untuk mengonfirmasi bahwa Anda mengerti risikonya.
            </p>
            
            <input 
              type="text"
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder="Ketik HAPUS AKUN SAYA"
              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-red-500 transition-colors mb-6 text-center"
            />

            <div className="flex justify-center gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText("");
                }}
                className="px-6 py-2 border border-border hover:bg-muted text-foreground font-medium rounded transition-colors text-sm w-full"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending || deleteConfirmationText !== "HAPUS AKUN SAYA"}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors text-sm disabled:opacity-50 w-full"
              >
                {deleteAccount.isPending ? "Memproses..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
