import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = '';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'BUYER' | 'SELLER' | 'SUPERADMIN';
  createdAt: string;
  updatedAt: string;
}

const getAuthHeaders = () => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

export const useAdminUsers = () => {
  return useQuery<AdminUser[], Error>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      return response.json();
    },
  });
};

export const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'BUYER' | 'SELLER' | 'SUPERADMIN' }) => {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ userId, role }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to update user role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};
