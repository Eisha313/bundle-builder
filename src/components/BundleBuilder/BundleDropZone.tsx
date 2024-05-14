'use client';

import React from 'react';
import { useBundleContext } from '@/context/BundleContext';

export default function BundleDropZone() {
  const {
    state,
    removeItem,
    updateQuantity,
    clearBundle,
    totalItems,
    subtotal,
    currentDiscount,
    discountAmount,
    finalPrice,
  } = useBundleContext();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Drop handling is managed by the parent BundleBuilder component
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getNextDiscountTier = () => {
    if (!state.discountTiers.length) return null;
    
    const nextTier = state.discountTiers
      .filter((tier) => tier.minItems > totalItems)
      .sort((a, b) => a.minItems - b.minItems)[0];
    
    return nextTier || null;
  };

  const nextTier = getNextDiscountTier();
  const itemsNeededForNextTier = nextTier ? nextTier.minItems - totalItems : 0;

  return (
    <div
      className="bundle-drop-zone bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[400px]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Bundle</h2>
        {state.items.length > 0 && (
          <button
            onClick={clearBundle}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {state.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg
            className="w-16 h-16 mb-4"
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
          <p className="text-center">
            Drag products here to start building your bundle
          </p>
          <p className="text-sm mt-2">
            Add 2+ items to unlock discounts!
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 mb-6">
            {state.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {nextTier && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                🎉 Add {itemsNeededForNextTier} more item{itemsNeededForNextTier !== 1 ? 's' : ''} to unlock {nextTier.discountPercent}% off!
              </p>
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Items ({totalItems})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {currentDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({currentDiscount.discountPercent}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(finalPrice)}</span>
            </div>
          </div>

          <button
            className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={totalItems < 2}
          >
            {totalItems < 2 ? 'Add at least 2 items' : 'Proceed to Checkout'}
          </button>
        </>
      )}
    </div>
  );
}
