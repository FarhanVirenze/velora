"use client";

import { useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { data: orders, isLoading: isOrdersLoading } = useOrders();
  const { data: products } = useProducts();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      router.push('/login');
    }
  }, [router]);

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });

  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isOrdersLoading || (typeof window !== 'undefined' && !localStorage.getItem('auth_token'))) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex justify-center items-center">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </main>
    );
  }

  const hasOrders = orders && orders.length > 0;

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-foreground">Order History</h1>

      {!hasOrders ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md">You haven't placed any orders. Start shopping to see your history here.</p>
          <Link href="/" className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="glass-card overflow-hidden">
              <div className="bg-muted px-6 py-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-foreground font-semibold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-foreground font-semibold">{dateFormatter.format(new Date(order.createdAt))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20 mt-1">
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-primary font-bold text-lg">{currencyFormatter.format(order.totalAmount)}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4 bg-card">
                {order.items.map((item) => {
                  const product = products?.find(p => p.id === item.productId);
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center p-2">
                        <img 
                          src={product?.images[0] || "https://via.placeholder.com/150"} 
                          alt={product?.name || "Product"} 
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-foreground font-semibold line-clamp-1">{product?.name || "Unknown Product"}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="text-foreground font-medium">{currencyFormatter.format(item.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
