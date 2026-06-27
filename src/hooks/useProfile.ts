import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = '';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  dob: string | null;
  settings: any | null;
}

export const useProfile = () => {
  return useQuery<UserProfile | null, Error>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) return null;

      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      return response.json();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('Not logged in');

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`${API_URL}/api/users/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        if (res.status === 409) throw new Error("Password saat ini salah");
        throw new Error("Gagal mengubah password");
      }
      return res.json();
    }
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Gagal menghapus akun");
      return res.json();
    }
  });
};
