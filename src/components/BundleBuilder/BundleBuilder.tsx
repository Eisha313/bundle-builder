'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Product, BundleItem, DiscountTier } from '@/types/bundle';
import { ProductCard } from './ProductCard';
import { BundleDropZone } from './BundleDropZone';
import { useBundle } from '@/context/BundleContext';

interface BundleBuilderProps {
  products: Product[];
  discountTiers: DiscountTier[];
}

export function BundleBuilder({ products, discountTiers }: BundleBuilderProps) {
  const { items, addItem, removeItem, updateItemQuantity } = useBundle();
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleDragStart(event: DragStartEvent) {
    const product = event.active.data.current as Product;
    setActiveProduct(product);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveProduct(null);

    if (event.over?.id === 'bundle-drop-zone') {
      const product = event.active.data.current as Product;
      const existingItem = items.find((item) => item.product.id === product.id);

      if (existingItem) {
        if (existingItem.quantity < product.stockQuantity) {
          updateItemQuantity(product.id, existingItem.quantity + 1);
        }
      } else {
        addItem(product);
      }
    }
  }

  function handleRemoveItem(productId: string) {
    removeItem(productId);
  }

  function handleUpdateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      updateItemQuantity(productId, quantity);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Products
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Discount Tiers Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Bundle Discounts</h3>
            <div className="flex flex-wrap gap-3">
              {discountTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="px-3 py-1 bg-white rounded-full text-sm shadow-sm"
                >
                  <span className="font-semibold text-blue-600">
                    {tier.discountPercentage}% off
                  </span>
                  <span className="text-gray-600"> - {tier.minItems}+ items</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isDragging={activeProduct?.id === product.id}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found matching your criteria.
            </div>
          )}
        </div>

        {/* Bundle Drop Zone */}
        <div className="lg:col-span-1">
          <BundleDropZone
            items={items}
            discountTiers={discountTiers}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>
      </div>

      <DragOverlay>
        {activeProduct ? (
          <div className="opacity-80">
            <ProductCard product={activeProduct} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
