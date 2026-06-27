"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useCart, useCheckout } from "@/hooks/useCart";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function CheckoutContent() {
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: products, isLoading: isProductsLoading } = useProducts();
  const checkoutMutation = useCheckout();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const productIdsParam = searchParams.get('productIds');
  const productIds = productIdsParam ? productIdsParam.split(',') : [];
  
  const [selectedPayment, setSelectedPayment] = useState<string>("shopeepay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDropshipper, setIsDropshipper] = useState(false);
  const [hasProtection, setHasProtection] = useState(false);
  
  // Ongkir statis
  const shippingFee = 10000;
  // Biaya proteksi
  const protectionFee = 1700;

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });

  const mainAddress = useMemo(() => {
    if (!profile?.address) return null;
    try {
      const addresses = typeof profile.address === 'string' ? JSON.parse(profile.address) : profile.address;
      if (Array.isArray(addresses)) {
        return addresses.find(a => a.isMain) || addresses[0]; // fallback to first if no main
      }
    } catch {
      return null;
    }
    return null;
  }, [profile]);

  const isProfileIncomplete = !isProfileLoading && profile && (!profile.phone || !mainAddress);

  const itemsToCheckout = useMemo(() => {
    if (!cart) return [];
    if (productIds.length > 0) {
      return cart.items.filter(item => productIds.includes(item.productId));
    }
    return cart.items;
  }, [cart, productIds]);

  const itemsWithDetails = useMemo(() => {
    if (!products || itemsToCheckout.length === 0) {
      return itemsToCheckout.map(item => ({ ...item, product: undefined as any }));
    }
    return itemsToCheckout.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    });
  }, [itemsToCheckout, products]);

  const subtotalProduk = useMemo(() => {
    return itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [itemsToCheckout]);

  const totalPayment = subtotalProduk + shippingFee + (hasProtection ? protectionFee : 0);

  const handlePayment = () => {
    setIsProcessing(true);
    checkoutMutation.mutate({ productIds: productIds.length > 0 ? productIds : undefined }, {
      onSuccess: () => {
        setIsProcessing(false);
        router.push("/checkout/success");
      },
      onError: (err) => {
        setIsProcessing(false);
        alert(`Checkout failed: ${err.message}`);
      }
    });
  };

  const isLoading = isCartLoading || isProfileLoading || isProductsLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex justify-center items-center bg-[#F5F5F5]">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </main>
    );
  }

  if (!cart || itemsToCheckout.length === 0) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto text-center bg-[#F5F5F5]">
        <h1 className="text-2xl font-bold text-foreground mb-4">Checkout Error</h1>
        <p className="text-muted-foreground mb-8">Tidak ada produk yang dipilih untuk dicheckout.</p>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-[#8B5CF6] text-white rounded-sm hover:bg-[#7C3AED] transition-colors">Kembali Belanja</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-40 bg-[#F5F5F5]">
      
      {/* Modal Kelengkapan Profil */}
      {isProfileIncomplete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Data Identitas Belum Lengkap</h2>
            <p className="text-gray-600 text-sm text-center mb-6">
              Untuk dapat melanjutkan pesanan, Anda wajib melengkapi Nomor HP dan Alamat Pengiriman di halaman profil Anda.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => router.push("/")}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-sm transition-colors text-sm w-full"
              >
                Batal
              </button>
              <button 
                onClick={() => router.push("/profile")}
                className="px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-sm transition-colors text-sm w-full"
              >
                Lengkapi Profil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Alamat Pengiriman Section */}
        <div className="bg-white rounded-sm shadow-sm mb-4 relative overflow-hidden">
          {/* Garis batas alamat ala Shopee */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIzIj48cGF0aCBkPSJNMCAwIEwxMCAwIEwxMCAzIEwwIDMgWiIgZmlsbD0iIzNGNzhERSIvPjxwYXRoIGQ9Ik0xMCAwIEwyMCAwIEwyMCAzIEwxMCAzIFoiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMjAgMCBMMzAgMCBMMzAgMyBMMjAgMyBaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTMwIDAgTDQwIDAgTDQwIDMgTDMwIDMgWiIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==')] bg-repeat-x"></div>
          
          <div className="p-6 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#8B5CF6]">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <h2 className="text-[#8B5CF6] font-medium text-lg">Alamat Pengiriman</h2>
            </div>
            
            <div className="flex items-start md:items-center flex-col md:flex-row justify-between gap-4">
              <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 text-gray-800">
                <div className="font-bold whitespace-nowrap">
                  {profile?.name || "Nama Tidak Diatur"} <br className="hidden md:block" /> {profile?.phone ? `(+62) ${profile.phone}` : "(+62) -"}
                </div>
                <div className="text-gray-600 leading-relaxed max-w-3xl">
                  {mainAddress ? (
                    <>
                      {mainAddress.name}, {mainAddress.street}, {mainAddress.subdistrict}, {mainAddress.city}, {mainAddress.province}, {mainAddress.postalCode}
                    </>
                  ) : (
                    <span className="text-red-500 italic">Belum ada alamat pengiriman diatur.</span>
                  )}
                  {mainAddress?.isMain && (
                    <span className="ml-3 px-2 py-0.5 border border-[#8B5CF6] text-[#8B5CF6] text-[10px] rounded uppercase font-medium">
                      Utama
                    </span>
                  )}
                </div>
              </div>
              
              <Link href="/profile/address" className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap">
                Ubah
              </Link>
            </div>

            <div className="mt-6 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#8B5CF6] border-gray-300 rounded focus:ring-[#8B5CF6]"
                  checked={isDropshipper}
                  onChange={(e) => setIsDropshipper(e.target.checked)}
                />
                <span className="text-sm text-gray-600">Kirim sebagai Dropshipper</span>
              </label>
            </div>
          </div>
        </div>

        {/* Produk Dipesan Section */}
        <div className="bg-white rounded-sm shadow-sm mb-4">
          <div className="p-6">
            <div className="hidden md:grid grid-cols-6 gap-4 text-gray-500 text-sm mb-4 pb-4 border-b border-gray-100">
              <div className="col-span-3 text-gray-800 text-lg font-medium">Produk Dipesan</div>
              <div className="text-center">Harga Satuan</div>
              <div className="text-center">Jumlah</div>
              <div className="text-right">Subtotal Produk</div>
            </div>

            <div className="md:hidden text-gray-800 text-lg font-medium mb-4">Produk Dipesan</div>

            {/* Shop Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#8B5CF6] text-white text-[10px] px-1 py-0.5 rounded-sm font-bold">Star+</span>
              <span className="font-bold text-gray-800">VELORA OFFICIAL SHOP</span>
              <button className="flex items-center gap-1 text-[#00bfa5] text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 2c-5.523 0-10 3.582-10 8 0 2.505 1.408 4.75 3.58 6.134.13.083.22.217.243.368l.29 1.834c.05.312.383.473.65.315l2.253-1.332a.49.49 0 01.38-.035c.82.302 1.696.466 2.604.466 5.523 0 10-3.582 10-8s-4.477-8-10-8zm0 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.5 1.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                </svg>
                chat sekarang
              </button>
            </div>

            {/* Products List */}
            <div className="space-y-6">
              {itemsWithDetails.map((item) => (
                <div key={item.productId} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="col-span-3 flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0 relative">
                      {item.product?.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm line-clamp-2">{item.product?.name || "Produk Tidak Diketahui"}</p>
                    </div>
                  </div>
                  <div className="hidden md:block text-center text-gray-800 text-sm">
                    {currencyFormatter.format(item.price)}
                  </div>
                  <div className="hidden md:block text-center text-gray-800 text-sm">
                    {item.quantity}
                  </div>
                  <div className="text-right text-gray-800 font-medium text-sm flex justify-between md:block">
                    <span className="md:hidden text-gray-500">Subtotal:</span>
                    {currencyFormatter.format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-dashed border-gray-200 pt-4 bg-[#fafdff] -mx-6 px-6 pb-2">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#8B5CF6] border-gray-300 rounded focus:ring-[#8B5CF6]"
                    checked={hasProtection}
                    onChange={(e) => setHasProtection(e.target.checked)}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-800 group-hover:text-[#8B5CF6] transition-colors">Proteksi Kerusakan +</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">Dapatkan kompensasi 100% jika barang rusak total atau dicuri dalam 6 bulan. <span className="text-blue-600">Pelajari</span></p>
                  </div>
                </div>
                <div className="text-sm text-gray-800">
                  {currencyFormatter.format(protectionFee)}
                </div>
              </label>
            </div>
            
            {/* Opsi Pengiriman */}
            <div className="border-t border-gray-100 pt-6 mt-4 flex flex-col md:flex-row justify-between gap-4">
              <div className="text-gray-800 font-medium md:w-1/3">Opsi Pengiriman:</div>
              <div className="flex-1 max-w-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Reguler</div>
                    <div className="text-gray-500 text-xs mt-1">Akan diterima pada tanggal 25 Jun - 27 Jun</div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">{currencyFormatter.format(shippingFee)}</div>
                </div>
              </div>
            </div>

            {/* Total Pesanan Line */}
            <div className="border-t border-gray-100 pt-4 mt-6 flex justify-end">
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm">Total Pesanan ({itemsToCheckout.length} Produk):</span>
                <span className="text-[#8B5CF6] text-xl font-medium">{currencyFormatter.format(subtotalProduk + shippingFee + (hasProtection ? protectionFee : 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-sm shadow-sm mb-20 p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 md:w-1/4">Metode Pembayaran</h2>
            <div className="flex flex-wrap gap-3 flex-1">
              <button 
                onClick={() => setSelectedPayment('shopeepay')}
                className={`px-4 py-2 border text-sm rounded-sm transition-all ${selectedPayment === 'shopeepay' ? 'border-[#8B5CF6] text-[#8B5CF6] relative' : 'border-gray-300 text-gray-800 hover:border-[#8B5CF6]'}`}
              >
                ShopeePay
                {selectedPayment === 'shopeepay' && (
                  <svg viewBox="0 0 16 16" fill="none" className="absolute bottom-0 right-0 w-4 h-4 text-[#8B5CF6]">
                    <path d="M16 0L16 16L0 16L16 0Z" fill="currentColor"/>
                    <path d="M11 11L7 13L9 9L11 11Z" fill="white"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setSelectedPayment('transfer')}
                className={`px-4 py-2 border text-sm rounded-sm transition-all ${selectedPayment === 'transfer' ? 'border-[#8B5CF6] text-[#8B5CF6] relative' : 'border-gray-300 text-gray-800 hover:border-[#8B5CF6]'}`}
              >
                Transfer Bank
                {selectedPayment === 'transfer' && (
                  <svg viewBox="0 0 16 16" fill="none" className="absolute bottom-0 right-0 w-4 h-4 text-[#8B5CF6]">
                    <path d="M16 0L16 16L0 16L16 0Z" fill="currentColor"/>
                    <path d="M11 11L7 13L9 9L11 11Z" fill="white"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setSelectedPayment('cod')}
                className={`px-4 py-2 border text-sm rounded-sm transition-all ${selectedPayment === 'cod' ? 'border-[#8B5CF6] text-[#8B5CF6] relative' : 'border-gray-300 text-gray-800 hover:border-[#8B5CF6]'}`}
              >
                COD (Bayar di Tempat)
                {selectedPayment === 'cod' && (
                  <svg viewBox="0 0 16 16" fill="none" className="absolute bottom-0 right-0 w-4 h-4 text-[#8B5CF6]">
                    <path d="M16 0L16 16L0 16L16 0Z" fill="currentColor"/>
                    <path d="M11 11L7 13L9 9L11 11Z" fill="white"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-end items-end sm:items-center">
          
          <div className="flex flex-col items-end pr-6 py-4 sm:border-r border-gray-200 min-w-[300px]">
            <div className="flex justify-between w-full mb-1">
              <span className="text-gray-500 text-sm">Subtotal untuk Produk</span>
              <span className="text-gray-600 text-sm">{currencyFormatter.format(subtotalProduk)}</span>
            </div>
            <div className="flex justify-between w-full mb-1">
              <span className="text-gray-500 text-sm">Total Ongkos Kirim</span>
              <span className="text-gray-600 text-sm">{currencyFormatter.format(shippingFee)}</span>
            </div>
            {hasProtection && (
              <div className="flex justify-between w-full mb-1">
                <span className="text-gray-500 text-sm">Biaya Proteksi</span>
                <span className="text-gray-600 text-sm">{currencyFormatter.format(protectionFee)}</span>
              </div>
            )}
            <div className="flex justify-between w-full mt-3 items-center">
              <span className="text-gray-800 text-base">Total Pembayaran:</span>
              <span className="text-[#8B5CF6] text-3xl font-medium">{currencyFormatter.format(totalPayment)}</span>
            </div>
          </div>
          
          <button 
            onClick={handlePayment}
            disabled={isProcessing || isProfileIncomplete}
            className="w-full sm:w-[210px] h-full sm:h-[135px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            ) : (
              "Buat Pesanan"
            )}
          </button>

        </div>
      </div>

    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-center bg-[#F5F5F5]">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
