import { BundleBuilder } from '@/components/BundleBuilder';
import { Header } from '@/components/Header';

// Sample products - in production, fetch from database/API
const sampleProducts = [
  { id: '1', name: 'Organic Coffee Beans', price: 14.99, image: '/products/coffee.jpg', category: 'beverages' },
  { id: '2', name: 'Artisan Chocolate Bar', price: 8.99, image: '/products/chocolate.jpg', category: 'sweets' },
  { id: '3', name: 'Honey Jar', price: 12.99, image: '/products/honey.jpg', category: 'pantry' },
  { id: '4', name: 'Granola Mix', price: 9.99, image: '/products/granola.jpg', category: 'breakfast' },
  { id: '5', name: 'Olive Oil', price: 18.99, image: '/products/olive-oil.jpg', category: 'pantry' },
  { id: '6', name: 'Tea Collection', price: 16.99, image: '/products/tea.jpg', category: 'beverages' },
];

// Tiered discount configuration
const discountTiers = [
  { minItems: 3, discount: 10, label: '10% off' },
  { minItems: 5, discount: 15, label: '15% off' },
  { minItems: 7, discount: 20, label: '20% off' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Custom Bundle
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mix and match your favorite products to create a personalized bundle.
            The more you add, the more you save!
          </p>
          
          {/* Discount Tiers Display */}
          <div className="flex justify-center gap-4 mt-6">
            {discountTiers.map((tier) => (
              <div
                key={tier.minItems}
                className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200"
              >
                <span className="text-sm text-gray-500">{tier.minItems}+ items:</span>
                <span className="ml-2 font-semibold text-green-600">{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        <BundleBuilder
          products={sampleProducts}
          discountTiers={discountTiers}
        />
      </div>
    </main>
  );
}