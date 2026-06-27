"use client";

import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const maskEmail = (email: string) => {
  if (!email) return "";
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.substring(0, 2)}${'*'.repeat(8)}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (!phone) return "";
  if (phone.length <= 2) return phone;
  return `${'*'.repeat(phone.length - 2)}${phone.slice(-2)}`;
};

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    avatar: "",
    storeName: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
        avatar: profile.avatar || "",
        storeName: profile.name || "" // fallback as we don't have storeName in schema right now
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 1 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We omit storeName since it might not be in our backend schema, just send the rest
    const { storeName, ...submitData } = formData;
    updateMutation.mutate(submitData as any, {
      onSuccess: () => {
        setIsEditingEmail(false);
        setIsEditingPhone(false);
        alert("Profil berhasil diperbarui!");
        window.dispatchEvent(new Event('auth_change'));
      },
      onError: (err) => {
        alert(`Gagal memperbarui profil: ${err.message}`);
      }
    });
  };

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push("/login");
    }
  }, [profile, isLoading, router]);

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-xl font-medium text-foreground">Profil Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun</p>
      </div>

      {!profile.phone && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start sm:items-center gap-3 animate-in fade-in">
          <div className="text-red-500 shrink-0 mt-0.5 sm:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-red-700 font-medium">Isilah profil Anda dengan lengkap! Nomor Telepon wajib diisi untuk melakukan pesanan.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16">
        {/* Left: Form */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Username</label>
            <div className="sm:w-2/3 text-sm text-foreground font-medium">
              {profile.name?.replace(/\s+/g, '_').toLowerCase() || "user_" + profile.id.substring(0, 5)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Nama</label>
            <div className="sm:w-2/3">
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Email</label>
            <div className="sm:w-2/3 text-sm text-foreground flex items-center gap-2">
              {isEditingEmail ? (
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              ) : (
                <>
                  {maskEmail(profile.email)}
                  <button type="button" onClick={() => setIsEditingEmail(true)} className="text-blue-500 hover:underline ml-2">Ubah</button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Nomor Telepon</label>
            <div className="sm:w-2/3 text-sm text-foreground flex items-center gap-2">
              {isEditingPhone ? (
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              ) : (
                <>
                  {formData.phone ? maskPhone(formData.phone) : "Belum diatur"}
                  <button type="button" onClick={() => setIsEditingPhone(true)} className="text-blue-500 hover:underline ml-2">Ubah</button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Nama Toko</label>
            <div className="sm:w-2/3">
              <input 
                type="text" 
                name="storeName"
                value={formData.storeName} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Jenis Kelamin</label>
            <div className="sm:w-2/3 flex gap-4 text-sm">
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} className="accent-primary" />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} className="accent-primary" />
                Perempuan
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input type="radio" name="gender" value="Other" checked={formData.gender === 'Other'} onChange={handleChange} className="accent-primary" />
                Lainnya
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm text-muted-foreground sm:w-1/3 sm:text-right font-medium">Tanggal lahir</label>
            <div className="sm:w-2/3 flex items-center gap-3">
              <input 
                type="date" 
                name="dob"
                value={formData.dob} 
                onChange={handleChange}
                className="px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-4">
            <div className="sm:w-1/3"></div>
            <div className="sm:w-2/3">
              <button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 bg-[#EE4D2D] hover:bg-[#D73211] text-white font-medium rounded transition-colors disabled:opacity-50 min-w-[120px]"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Avatar Upload */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-start lg:border-l border-border lg:pl-10">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-5 bg-muted">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>

          <input 
            type="file" 
            accept="image/jpeg, image/png" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden" 
          />

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-border hover:bg-muted text-foreground text-sm font-medium rounded transition-colors"
          >
            Pilih Gambar
          </button>
          
          <div className="text-muted-foreground text-xs text-center mt-4 space-y-1">
            <p>Ukuran gambar: maks. 1 MB</p>
            <p>Format gambar: .JPEG, .PNG</p>
          </div>
        </div>
      </form>
    </div>
  );
}
