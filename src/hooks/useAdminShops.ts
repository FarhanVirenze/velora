import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = '';

export interface AdminShop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  logo: string | null;
  banner: string | null;
  rating: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
}

const getAuthHeaders = () => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

export const useAdminShops = () => {
  return useQuery<AdminShop[], Error>({
    queryKey: ['adminShops'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/shops`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load shops');
      }
      return response.json();
    },
  });
};

export const useUpdateAdminShopStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string; status: 'PENDING' | 'ACTIVE' | 'REJECTED' }) => {
      const response = await fetch(`${API_URL}/api/admin/shops`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ shopId, status }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to update shop status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminShops'] });
    },
  });
};
