'use client';

import { Product } from '@/types/bundle';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ProductCardProps {
  product: Product;
  isDragging?: boolean;
}

export function ProductCard({ product, isDragging }: ProductCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: product.id,
    data: product,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full rounded-md"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>
      <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
      <p className="text-gray-600 text-sm mt-1">${product.price.toFixed(2)}</p>
      {product.stockQuantity <= 5 && (
        <span className="text-xs text-orange-600 mt-1 block">
          Only {product.stockQuantity} left
        </span>
      )}
    </div>
  );
}
