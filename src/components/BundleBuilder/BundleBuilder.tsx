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
import { Product, DiscountTier } from '@/types/bundle';
import { ProductCard } from './ProductCard';
import BundleDropZone from './BundleDropZone';
import { useBundleContext } from '@/context/BundleContext';
import { productToBundleItem } from '@/utils/pricing';

interface BundleBuilderProps {
  products: Product[];
  discountTiers: DiscountTier[];
}

export function BundleBuilder({ products, discountTiers }: BundleBuilderProps) {
  const { items, addItem, hasItem, getItemByProductId, updateQuantity } = useBundleContext();
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleDragStart(event: DragStartEvent) {
    const product = products.find(p => p.id === event.active.id);
    setActiveProduct(product || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveProduct(null);

    if (event.over?.id === 'bundle-drop-zone') {
      const product = products.find(p => p.id === event.active.id);
      if (!product) return;

      const existingItem = getItemByProductId(product.id);
      if (existingItem) {
        if (existingItem.quantity < product.inventory) {
          updateQuantity(product.id, existingItem.quantity + 1);
        }
      } else {
        addItem(productToBundleItem(product));
      }
    }
  }

  function handleAddToBundle(product: Product) {
    const existingItem = getItemByProductId(product.id);
    if (existingItem) {
      if (existingItem.quantity < product.inventory) {
        updateQuantity(product.id, existingItem.quantity + 1);
      }
    } else {
      addItem(productToBundleItem(product));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
        {/* Product Selection */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-grow">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isDragging={activeProduct?.id === product.id}
                  inBundle={hasItem(product.id)}
                  onAdd={() => handleAddToBundle(product)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium">No products found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            )}
          </div>
        </div>

        {/* Bundle Drop Zone */}
        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <BundleDropZone />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeProduct ? (
          <div className="opacity-90 rotate-3 scale-105">
            <ProductCard product={activeProduct} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
