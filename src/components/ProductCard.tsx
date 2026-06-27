import { Product } from '@/hooks/useProducts';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Format price to IDR
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(product.price);

  // Use product.sold from backend, default to 0 if not exists
  const soldCount = product.sold || 0;
  const soldText = soldCount > 1000 ? `${Math.floor(soldCount / 1000)}RB+ terjual` : `${soldCount} terjual`;

  return (
    <Link href={`/products/${product.id}`} className="group bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col h-full hover:border-[#8B5CF6] hover:shadow-md transition-all cursor-pointer">
      {/* Image Container */}
      <div className="relative w-full aspect-square flex-none bg-gray-50 overflow-hidden">
        <img 
          src={product.images[0] || "https://via.placeholder.com/400x300"} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Card Body */}
      <div className="p-2 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight mb-1 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* Price & Sold */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-base font-medium text-[#EE4D2D] truncate max-w-[60%]">{formattedPrice}</span>
          <span className="text-[10px] text-gray-500 truncate">{soldText}</span>
        </div>
      </div>
    </Link>
  );
}
