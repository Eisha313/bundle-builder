'use client';

import { BundleBuilder } from '@/components/BundleBuilder/BundleBuilder';
import { Product, DiscountTier } from '@/types/bundle';

const sampleProducts: Product[] = [
  { id: '1', name: 'Organic Coffee Beans', price: 14.99, image: '/products/coffee.jpg', category: 'Beverages', inventory: 25 },
  { id: '2', name: 'Artisan Chocolate Bar', price: 8.99, image: '/products/chocolate.jpg', category: 'Sweets', inventory: 40 },
  { id: '3', name: 'Raw Honey Jar', price: 12.99, image: '/products/honey.jpg', category: 'Pantry', inventory: 18 },
  { id: '4', name: 'Crunchy Granola Mix', price: 9.99, image: '/products/granola.jpg', category: 'Breakfast', inventory: 30 },
  { id: '5', name: 'Extra Virgin Olive Oil', price: 18.99, image: '/products/olive-oil.jpg', category: 'Pantry', inventory: 15 },
  { id: '6', name: 'Premium Tea Collection', price: 16.99, image: '/products/tea.jpg', category: 'Beverages', inventory: 22 },
  { id: '7', name: 'Dried Mango Slices', price: 6.99, image: '/products/mango.jpg', category: 'Snacks', inventory: 50 },
  { id: '8', name: 'Almond Butter', price: 11.49, image: '/products/almond-butter.jpg', category: 'Pantry', inventory: 20 },
  { id: '9', name: 'Matcha Powder', price: 22.99, image: '/products/matcha.jpg', category: 'Beverages', inventory: 12 },
  { id: '10', name: 'Trail Mix', price: 7.49, image: '/products/trail-mix.jpg', category: 'Snacks', inventory: 35 },
  { id: '11', name: 'Maple Syrup', price: 13.99, image: '/products/maple-syrup.jpg', category: 'Breakfast', inventory: 28 },
  { id: '12', name: 'Dark Chocolate Truffles', price: 15.99, image: '/products/truffles.jpg', category: 'Sweets', inventory: 3 },
];

const discountTiers: DiscountTier[] = [
  { minItems: 3, discountPercent: 10, label: '10% off' },
  { minItems: 5, discountPercent: 15, label: '15% off' },
  { minItems: 8, discountPercent: 20, label: '20% off' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Build &amp; Save
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Create Your Bundle
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
            Drag products into your bundle. The more you add, the more you save.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {discountTiers.map((tier) => (
              <div
                key={tier.minItems}
                className="flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-sm border border-gray-100"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  {tier.minItems}+
                </span>
                <span className="text-sm font-semibold text-gray-700">{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        <BundleBuilder products={sampleProducts} discountTiers={discountTiers} />
      </div>
    </main>
  );
}
