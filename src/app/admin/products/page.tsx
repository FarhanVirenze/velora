"use client";

import { useMemo, useState } from "react";
import { useAdminProducts, useCreateAdminProduct, useUpdateAdminProduct, useDeleteAdminProduct, AdminProduct } from "@/hooks/useAdminProducts";
import { useAdminShops } from "@/hooks/useAdminShops";

type AdminProductFormState = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  shopId: string;
  images: string[];
};

const emptyForm: AdminProductFormState = {
  id: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  shopId: '',
  images: [''],
};

export default function AdminProductsPage() {
  const { data: products, isLoading, isError } = useAdminProducts();
  const { data: shops } = useAdminShops();
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();

  const [formState, setFormState] = useState(emptyForm);
  const [editingMode, setEditingMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleReset = () => {
    setFormState(emptyForm);
    setEditingMode(false);
  };

  const handleSelectProduct = (product: AdminProduct) => {
    setFormState({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      shopId: product.shopId ?? '',
      images: product.images.length ? product.images : [''],
    });
    setEditingMode(true);
    setNotification(null);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    setFormState((current) => {
      const images = [...current.images];
      images[index] = value;
      return { ...current, images };
    });
  };

  const handleAddImage = () => {
    setFormState((current) => ({ ...current, images: [...current.images, ''] }));
  };

  const handleRemoveImage = (index: number) => {
    setFormState((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotification(null);

    const payload = {
      name: formState.name,
      description: formState.description,
      price: Number(formState.price),
      stock: Number(formState.stock),
      category: formState.category,
      shopId: formState.shopId || null,
      images: formState.images.filter(Boolean),
    };

    try {
      if (editingMode && formState.id) {
        await updateProduct.mutateAsync({ id: formState.id, ...payload });
        setNotification('Produk berhasil diperbarui.');
      } else {
        await createProduct.mutateAsync(payload);
        setNotification('Produk baru berhasil dibuat.');
      }
      handleReset();
    } catch (error: any) {
      setNotification(error.message || 'Terjadi kesalahan saat menyimpan produk.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      setNotification('Produk berhasil dihapus.');
      if (editingMode && formState.id === id) handleReset();
    } catch (error: any) {
      setNotification(error.message || 'Terjadi kesalahan saat menghapus produk.');
    }
  };

  const productCount = products?.length ?? 0;
  const stockSummary = useMemo(
    () => products?.reduce((acc, product) => acc + product.stock, 0) ?? 0,
    [products]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Products Management</p>
          <h1 className="text-3xl font-semibold text-slate-950">Manage inventory</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">Tambah, edit, dan hapus produk marketplace secara langsung di panel admin.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Produk</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">{productCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Stok</p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">{stockSummary}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Daftar Produk</h2>
              <p className="mt-1 text-sm text-slate-500">Klik produk untuk mengedit informasi.</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Buat Produk Baru
            </button>
          </div>

          {isLoading ? (
            <div className="text-sm text-slate-500">Memuat produk admin…</div>
          ) : isError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Gagal memuat daftar produk.</div>
          ) : (
            <div className="space-y-4">
              {products?.map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 p-4 hover:border-primary/50 hover:bg-slate-50 transition">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {product.category} • {product.shopId ? `Shop ${product.shopId.slice(0, 8)}` : 'Marketplace Default'} • ID {product.id.slice(0, 8)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span>Rp{product.price.toLocaleString()}</span>
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">Stock {product.stock}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-950">{editingMode ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Isi semua detail produk untuk membuat atau memperbarui inventaris. Gunakan URL gambar lengkap untuk koleksi produk.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nama Produk</label>
              <input
                value={formState.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Deskripsi</label>
              <textarea
                value={formState.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Harga</label>
                <input
                  type="number"
                  min={0}
                  value={formState.price}
                  onChange={(e) => handleFormChange('price', Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Stok</label>
                <input
                  type="number"
                  min={0}
                  value={formState.stock}
                  onChange={(e) => handleFormChange('stock', Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <input
                value={formState.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Shop</label>
              <select
                value={formState.shopId}
                onChange={(e) => handleFormChange('shopId', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Marketplace Default</option>
                {shops?.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">Gambar Produk</p>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Tambah URL gambar
                </button>
              </div>

              <div className="space-y-3">
                {formState.images.map((image, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_90px] items-center">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {notification && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{notification}</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-60"
              >
                {editingMode ? 'Perbarui Produk' : 'Buat Produk'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Reset Form
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
