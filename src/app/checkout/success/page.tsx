"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = "ORD-" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    setOrderId(id);
  }, []);

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex items-center justify-center">
      <div className="glass-card p-12 max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">Thank you for your purchase. Your order has been processed and is currently being prepared for shipment.</p>
        
        <div className="bg-muted border border-border rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-muted-foreground mb-1">Order Tracking Number</p>
          <p className="font-mono text-lg text-foreground font-bold">{orderId}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/orders" className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-center">
            View Order Status
          </Link>
          <Link href="/" className="w-full py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors border border-border text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
