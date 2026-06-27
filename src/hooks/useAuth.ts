import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = '';

export const useAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        window.dispatchEvent(new Event('auth_change'));
      }
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
