import { useQuery } from '@tanstack/react-query';

const API_URL = '';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const useOrders = () => {
  return useQuery<OrderData[], Error>({
    queryKey: ['orders'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) return [];

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
    // Real-time polling: refetch data automatically every 3 seconds
    refetchInterval: 3000,
  });
};
