"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authMutation = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  return (
    <main className="min-h-screen flex">
      {/* Left Panel: Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-primary to-purple-600 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-lg">
          <h1 className="text-5xl font-bold text-white mb-6">
            Unlock the <span className="text-purple-200">Future</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Velora provides you with exclusive access to top-tier tech and lifestyle products. 
            Sign in to manage your orders, access your cart, and experience seamless shopping.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
            &larr; Back to Catalog
          </Link>
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder-muted-foreground"
                placeholder="••••••••"
              />
            </div>

            {authMutation.isError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive text-center">{authMutation.error?.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authMutation.isPending}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 flex justify-center items-center h-14"
            >
              {authMutation.isPending ? (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <a href="register" className="text-primary hover:text-primary/80 font-medium transition-colors">Create one now</a>
          </p>
        </div>
      </div>
    </main>
  );
}
