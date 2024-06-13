'use client';

import { Product } from '@/types/bundle';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ProductCardProps {
  product: Product;
  isDragging?: boolean;
  inBundle?: boolean;
  onAdd?: () => void;
}

export function ProductCard({ product, isDragging, inBundle, onAdd }: ProductCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: product.id,
    data: product,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const categoryColors: Record<string, string> = {
    Beverages: 'bg-amber-50 text-amber-700',
    Sweets: 'bg-pink-50 text-pink-700',
    Pantry: 'bg-emerald-50 text-emerald-700',
    Breakfast: 'bg-orange-50 text-orange-700',
    Snacks: 'bg-violet-50 text-violet-700',
  };

  const colorClass = categoryColors[product.category] || 'bg-gray-50 text-gray-700';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative bg-white border rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-40 scale-95 border-indigo-300 shadow-lg' : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'}
        ${inBundle ? 'ring-2 ring-indigo-100' : ''}
      `}
    >
      {inBundle && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        <span className="text-3xl">
          {getCategoryEmoji(product.category)}
        </span>
      </div>

      <div className="space-y-1.5">
        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass}`}>
          {product.category}
        </span>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-indigo-600 font-bold text-sm">${product.price.toFixed(2)}</p>
          {product.inventory <= 5 && (
            <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
              {product.inventory} left
            </span>
          )}
        </div>
      </div>

      {onAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-2.5 w-full py-1.5 text-xs font-semibold rounded-lg transition-all
            bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-[0.98]"
        >
          {inBundle ? 'Add Another' : 'Add to Bundle'}
        </button>
      )}
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Beverages: '\u2615',
    Sweets: '\uD83C\uDF6B',
    Pantry: '\uD83C\uDF3F',
    Breakfast: '\uD83E\uDD5E',
    Snacks: '\uD83C\uDF3E',
  };
  return map[category] || '\uD83D\uDCE6';
}
