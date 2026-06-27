"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart, useCheckout, useUpdateQuantity, useRemoveFromCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: products } = useProducts();
  const checkoutMutation = useCheckout();
  const updateQuantityMutation = useUpdateQuantity();
  const removeMutation = useRemoveFromCart();
  const router = useRouter();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    router.push(`/checkout?productIds=${selectedItems.join(",")}`);
  };

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });

  const handleSelectAll = (checked: boolean) => {
    if (!cart) return;
    if (checked) {
      setSelectedItems(cart.items.map(item => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, productId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== productId));
    }
  };

  const selectedTotal = useMemo(() => {
    if (!cart) return 0;
    return cart.items
      .filter(item => selectedItems.includes(item.productId))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart, selectedItems]);

  const selectedCount = selectedItems.length;
  const isAllSelected = (cart?.items?.length ?? 0) > 0 && selectedCount === cart?.items?.length;

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      router.push('/login');
    }
  }, [router]);

  if (isCartLoading || (typeof window !== 'undefined' && !localStorage.getItem('auth_token'))) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex justify-center items-center bg-background">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </main>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <main className="min-h-screen pt-28 pb-40 px-6 max-w-5xl mx-auto bg-background">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Shopping Cart</h1>

      {!hasItems ? (
        <div className="border border-border bg-card p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Keranjang Anda kosong</h2>
          <p className="text-muted-foreground mb-8 max-w-md">Belum ada produk yang ditambahkan. Yuk, cari barang impianmu sekarang!</p>
          <Link href="/" className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-sm">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header Row (Shopee style) */}
          <div className="hidden md:flex items-center bg-card border border-border p-4 rounded-xl shadow-sm text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-4 w-1/2">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span>Product</span>
            </div>
            <div className="w-1/6 text-center">Unit Price</div>
            <div className="w-1/6 text-center">Quantity</div>
            <div className="w-1/6 text-center">Total Price</div>
            <div className="w-[10%] text-center">Action</div>
          </div>

          {/* Cart Items List */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {cart.items.map((item, idx) => {
              const product = products?.find((p) => p.id === item.productId);
              const isSelected = selectedItems.includes(item.productId);
              
              return (
                <div key={idx} className={`flex flex-col md:flex-row items-start md:items-center p-4 border-b border-border last:border-b-0 gap-4 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-4 w-full md:w-1/2">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer flex-shrink-0"
                      checked={isSelected}
                      onChange={(e) => handleSelectItem(item.productId, e.target.checked)}
                    />
                    <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center p-2 border border-border">
                      <img 
                        src={product?.images[0] || "https://via.placeholder.com/150"} 
                        alt={product?.name || "Product"} 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2">
                        {product?.name || "Unknown Product"}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{product?.category}</p>
                    </div>
                  </div>

                  {/* Mobile: Price & Actions under title. Desktop: Columns */}
                  <div className="flex w-full md:w-1/2 items-center justify-between md:justify-end gap-2 md:gap-0 pl-9 md:pl-0">
                    <div className="md:w-1/3 text-left md:text-center text-sm font-medium text-foreground">
                      {currencyFormatter.format(item.price)}
                    </div>
                    
                    <div className="md:w-1/3 flex justify-center">
                      <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                        <button 
                          onClick={() => updateQuantityMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
                          disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-50"
                        >
                          -
                        </button>
                        <div className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x border-border">
                          {updateQuantityMutation.isPending && updateQuantityMutation.variables?.productId === item.productId ? (
                             <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                          ) : item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantityMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                          disabled={updateQuantityMutation.isPending}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="hidden md:block md:w-1/3 text-center text-sm font-bold text-primary">
                      {currencyFormatter.format(item.price * item.quantity)}
                    </div>

                    <div className="md:w-[15%] flex justify-end md:justify-center">
                      <button 
                        onClick={() => removeMutation.mutate(item.productId)}
                        disabled={removeMutation.isPending}
                        className="text-sm text-destructive hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Bar (Shopee style) */}
          <div className="fixed bottom-0 left-0 w-full bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  id="selectAllBottom"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label htmlFor="selectAllBottom" className="text-sm font-medium cursor-pointer hidden sm:block">
                  Select All ({cart.items.length})
                </label>
                <button 
                  onClick={() => {
                    selectedItems.forEach(id => removeMutation.mutate(id));
                  }}
                  disabled={selectedCount === 0 || removeMutation.isPending}
                  className="text-sm text-destructive hover:text-red-700 font-medium disabled:opacity-50 ml-2"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    Total ({selectedCount} product):
                    <span className="text-xl font-bold text-primary">{currencyFormatter.format(selectedTotal)}</span>
                  </p>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending || selectedCount === 0}
                  className="px-8 md:px-12 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center h-12"
                >
                  {checkoutMutation.isPending ? (
                    <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                  ) : (
                    "Checkout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
