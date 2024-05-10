'use client';

import { useDroppable } from '@dnd-kit/core';
import { BundleItem, DiscountTier } from '@/types/bundle';
import { useMemo } from 'react';

interface BundleDropZoneProps {
  items: BundleItem[];
  discountTiers: DiscountTier[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function BundleDropZone({
  items,
  discountTiers,
  onRemoveItem,
  onUpdateQuantity,
}: BundleDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'bundle-drop-zone',
  });

  const { subtotal, discount, total, appliedTier } = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Find the best applicable tier
    const applicableTiers = discountTiers
      .filter((tier) => totalItems >= tier.minItems)
      .sort((a, b) => b.discountPercentage - a.discountPercentage);

    const appliedTier = applicableTiers[0] || null;
    const discountPercentage = appliedTier?.discountPercentage || 0;
    const discount = subtotal * (discountPercentage / 100);
    const total = subtotal - discount;

    return { subtotal, discount, total, appliedTier };
  }, [items, discountTiers]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const nextTier = discountTiers.find((tier) => tier.minItems > totalItems);

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-xl p-6 min-h-[400px] transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Bundle</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg
            className="w-12 h-12 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p>Drag products here to build your bundle</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                {item.product.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {item.product.name}
                </p>
                <p className="text-gray-600 text-sm">
                  ${item.product.price.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))
                  }
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() =>
                    onUpdateQuantity(
                      item.product.id,
                      Math.min(item.product.stockQuantity, item.quantity + 1)
                    )
                  }
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.product.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Price Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({totalItems} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {appliedTier && (
            <div className="flex justify-between text-green-600">
              <span>Bundle Discount ({appliedTier.discountPercentage}%)</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {nextTier && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            Add {nextTier.minItems - totalItems} more item(s) to unlock{' '}
            <strong>{nextTier.discountPercentage}% off!</strong>
          </div>
        )}
      </div>
    </div>
  );
}
