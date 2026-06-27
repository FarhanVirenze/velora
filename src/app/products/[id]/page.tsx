"use client";

import { useParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { data: products, isLoading } = useProducts();
  const addToCartMutation = useAddToCart();

  const product = products?.find((p) => p.id === productId);

  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);

  const formattedPrice = product
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)
    : "";

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 flex justify-center items-center">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-32 flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
        <Link href="/" className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
          Back to Catalog
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      setShowOutOfStockModal(true);
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Out of Stock Modal */}
      {showOutOfStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-foreground mb-2">Stok Habis!</h3>
            <p className="text-center text-muted-foreground mb-8">
              Mohon maaf, stok untuk produk ini sedang kosong. Silakan cek kembali nanti atau cari produk serupa.
            </p>
            <button
              onClick={() => setShowOutOfStockModal(false)}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <Link href="/" className="inline-block mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
        &larr; Back to Catalog
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Section */}
        <div className="w-full lg:w-1/2">
          <div className="glass-card p-12 aspect-square flex items-center justify-center bg-muted">
            <img
              src={product.images[0] || "https://via.placeholder.com/600"}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <span className="px-4 py-1.5 text-xs font-semibold bg-primary/10 backdrop-blur-md rounded-full text-primary border border-primary/20 w-fit mb-6">
            {product.category}
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">{product.description}</p>

          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Price</span>
              <span className="text-3xl font-bold text-gradient">{formattedPrice}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stock</span>
              <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className={`w-full py-4 font-semibold rounded-xl transition-all flex justify-center items-center h-14 text-lg ${
              product.stock === 0 
                ? "bg-muted text-muted-foreground border border-border hover:bg-muted/80 cursor-not-allowed shadow-none" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-50"
            }`}
          >
            {addToCartMutation.isPending ? (
              <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            ) : (
              product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"
            )}
          </button>

          {addToCartMutation.isSuccess && (
            <p className="text-green-600 text-sm text-center mt-4 animate-pulse">✓ Added to cart successfully!</p>
          )}
        </div>
      </div>
    </main>
  );
}
