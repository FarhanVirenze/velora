"use client";

import { useState } from "react";
import { useChangePassword } from "@/hooks/useProfile";

export default function PasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const changePassword = useChangePassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    
    changePassword.mutate(
      { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
      {
        onSuccess: () => {
          alert("Password berhasil diubah!");
          setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (err: any) => {
          alert(err.message || "Gagal mengubah password");
        }
      }
    );
  };

  return (
    <div className="p-6 md:p-8">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-xl font-medium text-foreground">Ubah Password</h1>
        <p className="text-sm text-muted-foreground mt-1">Untuk keamanan akun Anda, mohon untuk tidak menyebarkan password Anda kepada orang lain.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Password Saat Ini</label>
          <div className="sm:w-2/3">
            <input 
              type="password" 
              name="currentPassword"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Password Baru</label>
          <div className="sm:w-2/3">
            <input 
              type="password" 
              name="newPassword"
              required
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Konfirmasi Password Baru</label>
          <div className="sm:w-2/3">
            <input 
              type="password" 
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-4">
          <div className="sm:w-1/3"></div>
          <div className="sm:w-2/3">
            <button 
              type="submit" 
              disabled={changePassword.isPending}
              className="px-6 py-2.5 bg-[#EE4D2D] hover:bg-[#D73211] text-white font-medium rounded transition-colors disabled:opacity-50 min-w-[120px]"
            >
              {changePassword.isPending ? "Menyimpan..." : "Konfirmasi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
