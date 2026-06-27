"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: profile } = useProfile();

  const isPhoneIncomplete = profile && !profile.phone;
  const isAddressIncomplete = (() => {
    if (!profile) return false;
    try {
      const addresses = typeof profile.address === 'string' ? JSON.parse(profile.address) : profile.address;
      if (!addresses || (Array.isArray(addresses) && addresses.length === 0)) return true;
    } catch {
      return true;
    }
    return false;
  })();

  const menuItems = [
    {
      title: "Akun Saya",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      subItems: [
        { name: "Profil", path: "/profile", hasWarning: isPhoneIncomplete },
        { name: "Alamat", path: "/profile/address", hasWarning: isAddressIncomplete },
        { name: "Ubah Password", path: "/profile/password" },
        { name: "Pengaturan Notifikasi", path: "/profile/notifications" },
        { name: "Pengaturan Privasi", path: "/profile/privacy" },
      ]
    },
    {
      title: "Pesanan Saya",
      path: "/orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    },
    {
      title: "Notifikasi",
      path: "/profile/notifications-list",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      )
    },
    {
      title: "Voucher Saya",
      path: "/profile/vouchers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      )
    },
    {
      title: "Koin Velora Saya",
      path: "/profile/coins",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto bg-background/50">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="flex items-center gap-4 p-4 mb-4 border-b border-border md:border-none">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border border-border">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-muted-foreground">{profile?.name?.charAt(0).toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-foreground truncate">{profile?.name || "User"}</h3>
              <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                Ubah Profil
              </Link>
            </div>
          </div>

          <nav className="space-y-4 hidden md:block">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.path ? (
                  <Link 
                    href={item.path} 
                    className={`flex items-center gap-3 py-1 font-medium hover:text-primary transition-colors ${pathname === item.path ? 'text-primary' : 'text-foreground'}`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-1 font-medium text-foreground">
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </div>
                )}
                
                {item.subItems && (
                  <div className="ml-8 mt-2 space-y-2">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link 
                        key={subIndex} 
                        href={subItem.path} 
                        className={`text-sm py-1 transition-colors flex items-center justify-between ${pathname === subItem.path ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        <span>{subItem.name}</span>
                        {(subItem as any).hasWarning && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-4" title="Data belum lengkap!"></div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow min-w-0">
          <div className="bg-card border border-border shadow-sm rounded-lg min-h-[500px]">
            {children}
          </div>
        </div>

      </div>
    </main>
  );
}
