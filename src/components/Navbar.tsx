"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";

export default function Navbar() {
  const { data: cart } = useCart();
  const { data: profile } = useProfile();
  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const isProfileIncomplete = (() => {
    if (!profile) return false;
    if (!profile.phone) return true;
    try {
      const addresses = typeof profile.address === 'string' ? JSON.parse(profile.address) : profile.address;
      if (!addresses || (Array.isArray(addresses) && addresses.length === 0)) return true;
    } catch {
      return true; // invalid json means no address
    }
    return false;
  })();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const prevTotalItems = useRef(totalItems);
  const router = useRouter();
  const pathname = usePathname();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (totalItems > prevTotalItems.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevTotalItems.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevTotalItems.current = totalItems;
  }, [totalItems]);

  // Check login status on mount
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("auth_token");
      setIsLoggedIn(!!token);

      // Global Auth Guard
      const publicPaths = ['/login', '/register'];
      if (!token && !publicPaths.includes(pathname)) {
        setShowAuthWarning(true);
        setTimeout(() => {
          setShowAuthWarning(false);
          router.push("/login");
        }, 5000); // Wait 5 seconds before redirecting
      }
    };
    checkLogin();
    // Optional: listen to storage changes for multi-tab sync
    window.addEventListener("storage", checkLogin);
    window.addEventListener("auth_change", checkLogin);
    
    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("auth_change", checkLogin);
    };
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setShowDropdown(false);
    queryClient.clear();
    window.dispatchEvent(new Event("auth_change"));
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground">
          VELORA<span className="text-primary">.</span>
        </Link>
        <div className="flex flex-1 max-w-md mx-8">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.target as any).search.value;
              router.push(`/?q=${encodeURIComponent(q)}`);
            }}
            className="w-full relative"
          >
            <input 
              type="text" 
              name="search"
              placeholder="Cari produk di Velora..." 
              className="w-full bg-muted border border-border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cart">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-300 ${isAnimating ? 'scale-125 text-primary' : 'scale-100'}`}
            >
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {totalItems > 0 && (
              <span className={`absolute 0 right-0 translate-x-1/4 -translate-y-1/4 bg-primary text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-background transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 relative"
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-border" />
                ) : (
                  <span>{profile?.name ? profile.name.split(' ')[0] : "Profile"}</span>
                )}
                {isProfileIncomplete && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" title="Profil belum lengkap"></div>
                )}
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-4 w-56 bg-card border border-border rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {isProfileIncomplete && (
                    <div className="px-4 py-2 mb-1 bg-red-50 border-l-2 border-red-500">
                      <p className="text-[10px] text-red-600 font-medium">Data Identitas Belum Lengkap!</p>
                      <Link href="/profile" onClick={() => setShowDropdown(false)} className="text-[10px] text-red-700 font-bold hover:underline">
                        Lengkapi Sekarang &rarr;
                      </Link>
                    </div>
                  )}
                  <Link 
                    href="/profile" 
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    My Orders
                  </Link>
                  <div className="h-px bg-border my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all border border-primary/20">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {showAuthWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-md w-[90%] text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Akses Terkunci</h2>
            <p className="text-muted-foreground mb-6">
              Anda harus login ke akun Anda terlebih dahulu untuk menjelajahi halaman ini.
            </p>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[progress_5s_ease-in-out_forwards]"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Mengalihkan ke halaman login...</p>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}} />
        </div>
      )}
    </nav>
  );
}
