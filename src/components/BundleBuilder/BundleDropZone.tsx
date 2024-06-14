'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useBundleContext } from '@/context/BundleContext';
import { useBundlePricing } from '@/hooks/useBundlePricing';
import CheckoutModal from './CheckoutModal';

export default function BundleDropZone() {
  const { items, removeItem, updateQuantity, clearBundle } = useBundleContext();
  const [showCheckout, setShowCheckout] = useState(false);
  const {
    priceBreakdown,
    formattedSubtotal,
    formattedDiscount,
    formattedTotal,
    nextTier,
    hasDiscount,
    savingsMessage,
  } = useBundlePricing(items);

  const { setNodeRef, isOver } = useDroppable({ id: 'bundle-drop-zone' });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[500px] flex flex-col
        ${isOver
          ? 'border-indigo-400 bg-indigo-50/60 shadow-lg shadow-indigo-100'
          : items.length > 0
            ? 'border-gray-200 bg-white shadow-sm'
            : 'border-gray-200 bg-gray-50/50'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Your Bundle</h2>
            {items.length > 0 && (
              <p className="text-xs text-gray-400">{priceBreakdown.itemCount} item{priceBreakdown.itemCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearBundle}
            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5">
        {items.length === 0 ? (
          <div className={`
            flex flex-col items-center justify-center h-80 text-center transition-all duration-300
            ${isOver ? 'scale-105' : ''}
          `}>
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all
              ${isOver ? 'bg-indigo-100' : 'bg-gray-100'}
            `}>
              <svg
                className={`w-8 h-8 transition-colors ${isOver ? 'text-indigo-500' : 'text-gray-300'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className={`font-medium transition-colors ${isOver ? 'text-indigo-600' : 'text-gray-400'}`}>
              {isOver ? 'Drop it here!' : 'Drag products here'}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              or click &quot;Add to Bundle&quot; on any product
            </p>
          </div>
        ) : (
          <>
            {/* Items List */}
            <ul className="space-y-2 mb-4 max-h-[320px] overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-3 py-2.5 rounded-xl transition-colors group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                  </div>

                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors text-sm"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-gray-700 tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Next tier nudge */}
            {nextTier && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-3 mb-4">
                <p className="text-xs font-medium text-indigo-700">
                  {savingsMessage}
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>

              {hasDiscount && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Discount ({priceBreakdown.discountPercent}%)</span>
                  <span>-{formattedDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full mt-4 py-3 text-sm font-bold rounded-xl transition-all
                bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm
                disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
              disabled={priceBreakdown.itemCount < 2}
            >
              {priceBreakdown.itemCount < 2 ? 'Add at least 2 items' : 'Proceed to Checkout'}
            </button>
          </>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          onClose={() => setShowCheckout(false)}
          onConfirm={() => {
            setShowCheckout(false);
            clearBundle();
          }}
        />
      )}
    </div>
  );
}
