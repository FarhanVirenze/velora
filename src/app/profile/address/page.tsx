"use client";

import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";

interface AddressItem {
  id: string;
  name: string;
  phone: string;
  detail: string;
  isMain: boolean;
}

export default function AddressPage() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    detail: "",
    isMain: false
  });

  // Parse existing address
  useEffect(() => {
    if (profile?.address) {
      try {
        const parsed = JSON.parse(profile.address);
        if (Array.isArray(parsed)) {
          setAddresses(parsed);
          return;
        }
      } catch (e) {
        // Legacy simple string address
        setAddresses([{
          id: Date.now().toString(),
          name: profile.name || "",
          phone: profile.phone || "",
          detail: profile.address,
          isMain: true
        }]);
      }
    } else {
      setAddresses([]);
    }
  }, [profile]);

  const handleOpenAdd = () => {
    setFormData({ name: "", phone: "", detail: "", isMain: addresses.length === 0 });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: AddressItem) => {
    setFormData({ name: addr.name, phone: addr.phone, detail: addr.detail, isMain: addr.isMain });
    setEditingId(addr.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    let newAddresses = addresses.filter(a => a.id !== deleteConfirmId);
    if (addresses.find(a => a.id === deleteConfirmId)?.isMain && newAddresses.length > 0) {
      newAddresses[0].isMain = true;
    }
    saveAddresses(newAddresses);
    setDeleteConfirmId(null);
  };

  const handleSetMain = (id: string) => {
    const newAddresses = addresses.map(a => ({
      ...a,
      isMain: a.id === id
    }));
    saveAddresses(newAddresses);
  };

  const saveAddresses = (newAddresses: AddressItem[]) => {
    updateMutation.mutate({ address: JSON.stringify(newAddresses) }, {
      onSuccess: () => {
        setIsModalOpen(false);
        // Refresh handled by react query automatically due to mutation invalidation
      },
      onError: (err) => alert("Gagal menyimpan alamat: " + err.message)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newAddresses = [...addresses];
    
    // If setting as main, un-main others
    if (formData.isMain) {
      newAddresses = newAddresses.map(a => ({ ...a, isMain: false }));
    }

    if (editingId) {
      // Edit existing
      newAddresses = newAddresses.map(a => 
        a.id === editingId ? { ...formData, id: editingId } : a
      );
    } else {
      // Add new
      newAddresses.push({
        ...formData,
        id: Date.now().toString()
      });
    }

    // Ensure at least one is main
    if (newAddresses.length > 0 && !newAddresses.find(a => a.isMain)) {
      newAddresses[0].isMain = true;
    }

    saveAddresses(newAddresses);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-2 h-6 bg-[#8B5CF6] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="w-2 h-10 bg-[#7C3AED] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-2 h-6 bg-[#6D28D9] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
        <div>
          <h1 className="text-xl font-medium text-foreground">Alamat Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola daftar alamat pengiriman Anda</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#EE4D2D] hover:bg-[#D73211] text-white font-medium rounded transition-colors text-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Alamat Baru
        </button>
      </div>

      {addresses.length === 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start sm:items-center gap-3 animate-in fade-in">
          <div className="text-red-500 shrink-0 mt-0.5 sm:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-red-700 font-medium">Isilah alamat lengkap Anda! Alamat pengiriman wajib ditambahkan agar Anda dapat melakukan pesanan.</p>
        </div>
      )}

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map(addr => (
            <div key={addr.id} className="border-b border-border pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
              <div className="flex justify-between items-start">
                <div className="pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">{addr.name}</span>
                    <span className="text-muted-foreground text-sm border-l border-border pl-2">{addr.phone}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{addr.detail}</p>
                  
                  {addr.isMain && (
                    <div className="mt-3">
                      <span className="text-xs px-2 py-1 border border-[#EE4D2D] text-[#EE4D2D] rounded-sm bg-[#EE4D2D]/5 font-medium">Utama</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <button onClick={() => handleOpenEdit(addr)} className="hover:text-blue-500 transition-colors" aria-label="Ubah Alamat" title="Ubah Alamat">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="hover:text-red-500 transition-colors" aria-label="Hapus Alamat" title="Hapus Alamat">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  {!addr.isMain && (
                    <button 
                      onClick={() => handleSetMain(addr.id)}
                      className="px-3 py-1.5 border border-border hover:bg-muted text-foreground text-sm rounded transition-colors mt-2"
                    >
                      Atur sebagai Utama
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">Anda belum menambahkan alamat.</p>
          </div>
        )}
      </div>

      {/* Modal Tambah/Ubah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border shadow-2xl rounded-lg w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                {editingId ? "Ubah Alamat" : "Alamat Baru"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Nama Lengkap" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      placeholder="Nomor Telepon" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <textarea 
                    placeholder="Alamat Lengkap (Nama Jalan, Gedung, No. Rumah)" 
                    required
                    rows={3}
                    value={formData.detail}
                    onChange={e => setFormData({...formData, detail: e.target.value})}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="setMain" 
                    checked={formData.isMain}
                    onChange={e => setFormData({...formData, isMain: e.target.checked})}
                    disabled={editingId ? addresses.find(a => a.id === editingId)?.isMain : addresses.length === 0}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="setMain" className="text-sm text-foreground cursor-pointer select-none">
                    Atur sebagai Alamat Utama
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border border-border hover:bg-muted text-foreground font-medium rounded transition-colors text-sm"
                  >
                    Nanti Saja
                  </button>
                  <button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="px-6 py-2 bg-[#EE4D2D] hover:bg-[#D73211] text-white font-medium rounded transition-colors text-sm disabled:opacity-50 min-w-[100px]"
                  >
                    {updateMutation.isPending ? "Menyimpan..." : "OK"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-lg w-full max-w-sm text-center p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">Hapus Alamat?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-6 py-2 border border-border hover:bg-muted text-foreground font-medium rounded transition-colors text-sm w-full"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors text-sm disabled:opacity-50 w-full"
              >
                {updateMutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
