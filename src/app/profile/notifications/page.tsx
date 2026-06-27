"use client";

import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

export default function NotificationsPage() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [settings, setSettings] = useState({
    emailPromotions: true,
    emailOrders: true,
    pushPromotions: false,
    pushOrders: true,
    smsPromotions: false,
  });

  useEffect(() => {
    if (profile?.settings) {
      try {
        const parsed = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // ignore invalid json
      }
    }
  }, [profile]);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // Save to backend immediately
    updateProfile.mutate({ settings: newSettings });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-xl font-medium text-foreground">Pengaturan Notifikasi</h1>
        <p className="text-sm text-muted-foreground mt-1">Atur preferensi notifikasi yang ingin Anda terima</p>
      </div>

      <div className="max-w-3xl space-y-8">
        
        {/* Email Notifs */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Notifikasi Email</h2>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Promo & Penawaran Spesial</p>
              <p className="text-sm text-muted-foreground mt-1">Terima email berisi diskon, voucher, dan promo eksklusif.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.emailPromotions} onChange={() => toggleSetting('emailPromotions')} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Status Pesanan</p>
              <p className="text-sm text-muted-foreground mt-1">Pembaruan penting mengenai status pesanan dan pengiriman Anda.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.emailOrders} onChange={() => toggleSetting('emailOrders')} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Push Notifs */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Notifikasi Push (Aplikasi)</h2>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Promo & Rekomendasi</p>
              <p className="text-sm text-muted-foreground mt-1">Dapatkan pemberitahuan langsung di layar HP Anda saat ada diskon kilat.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.pushPromotions} onChange={() => toggleSetting('pushPromotions')} />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
