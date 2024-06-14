'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { BundleItem } from '@/types/bundle';
import { useBundlePricing } from '@/hooks/useBundlePricing';

interface CheckoutModalProps {
  items: BundleItem[];
  onClose: () => void;
  onConfirm: () => void;
}

export default function CheckoutModal({ items, onClose, onConfirm }: CheckoutModalProps) {
  const {
    priceBreakdown,
    formattedSubtotal,
    formattedDiscount,
    formattedTotal,
    hasDiscount,
  } = useBundlePricing(items);

  const [step, setStep] = useState<'review' | 'details' | 'confirmed'>('review');
  const [form, setForm] = useState({ name: '', email: '', address: '' });

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  const handleSubmit = () => {
    setStep('confirmed');
    setTimeout(() => {
      onConfirm();
    }, 3000);
  };

  const isFormValid = form.name.trim() && form.email.trim() && form.address.trim();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">

        {step === 'confirmed' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-1">Your bundle of {priceBreakdown.itemCount} items is on its way.</p>
            <p className="text-lg font-bold text-indigo-600">{formattedTotal}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting back to shop...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {step === 'review' ? 'Review Your Bundle' : 'Shipping Details'}
                </h2>
                <p className="text-xs text-gray-400">
                  {step === 'review' ? `${priceBreakdown.itemCount} items` : 'Step 2 of 2'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 'review' ? (
                <>
                  <ul className="space-y-3 mb-6">
                    {items.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formattedSubtotal}</span>
                    </div>
                    {hasDiscount && (
                      <div className="flex justify-between text-sm text-emerald-600 font-medium">
                        <span>Bundle Discount ({priceBreakdown.discountPercent}%)</span>
                        <span>-{formattedDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                      <span>Total</span>
                      <span>{formattedTotal}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="123 Main St, City, State, ZIP"
                      rows={3}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Order Total</span>
                    <span className="text-lg font-bold text-gray-900">{formattedTotal}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {step === 'review' ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Keep Shopping
                  </button>
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStep('review')}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all
                      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
