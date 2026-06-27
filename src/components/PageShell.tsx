"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
