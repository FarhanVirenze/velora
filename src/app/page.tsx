"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import { useProducts } from "@/hooks/useProducts";

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const { data: products, isLoading, isError } = useProducts(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = new Set(products.map(p => p.category));
    return Array.from(uniqueCategories);
  }, [products]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <CategoryGrid 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />

        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-border bg-card text-foreground flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
              &lt;
            </button>
            <button className="w-10 h-10 rounded-full border border-border bg-card text-foreground flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
              &gt;
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
          </div>
        )}

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl text-center glass-card">
            <p>Gagal memuat produk. Pastikan API berjalan dengan benar.</p>
          </div>
        )}

        {!isLoading && !isError && filteredProducts && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                No products found in this category.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}