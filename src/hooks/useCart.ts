import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = '';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CartData {
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export const useCart = () => {
  return useQuery<CartData, Error>({
    queryKey: ['cart'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) return { userId: '', items: [], totalPrice: 0 };

      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
    refetchInterval: 3000,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('You must be logged in to add items to cart');

      const response = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('You must be logged in');

      const response = await fetch(`${API_URL}/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('You must be logged in');

      const response = await fetch(`${API_URL}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to remove item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productIds }: { productIds?: string[] } = {}) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('You must be logged in to checkout');

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds })
      });
      if (!response.ok) throw new Error('Checkout failed');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['cart'], (oldCart: any) => {
        if (!oldCart) return oldCart;
        if (variables?.productIds && variables.productIds.length > 0) {
          const newItems = oldCart.items.filter((item: any) => !variables.productIds!.includes(item.productId));
          const newTotal = newItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          return { ...oldCart, items: newItems, totalPrice: newTotal };
        }
        return { ...oldCart, items: [], totalPrice: 0 };
      });
      
      // Delay invalidation slightly to let async RabbitMQ events finish on backend
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }, 1000);
    },
  });
};
