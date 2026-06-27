import { useQuery } from '@tanstack/react-query';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  sold?: number;
}
const API_URL = '';

const fetchProducts = async (searchQuery?: string): Promise<Product[]> => {
  const url = searchQuery && searchQuery.trim() !== '' 
    ? `${API_URL}/api/products?q=${encodeURIComponent(searchQuery)}`
    : `${API_URL}/api/products`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useProducts = (searchQuery?: string) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', searchQuery],
    queryFn: () => fetchProducts(searchQuery),
  });
};
