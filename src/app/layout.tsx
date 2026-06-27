import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import PageShell from "@/components/PageShell";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velora | Premium Tech & Lifestyle",
  description: "Next-gen e-commerce experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <QueryProvider>
          <PageShell>{children}</PageShell>
        </QueryProvider>
      </body>
    </html>
  );
}