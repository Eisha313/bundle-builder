'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { Bundle, BundleItem, BundleState, Product, DiscountTier, BundleRule } from '@/types/bundle';

type BundleAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_BUNDLE' }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_RULES'; payload: BundleRule[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_SAVED_BUNDLE'; payload: Bundle };

interface BundleContextType extends BundleState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBundle: () => void;
  loadSavedBundle: (bundle: Bundle) => void;
  getTotalItems: () => number;
  getApplicableTier: () => DiscountTier | null;
}

const BundleContext = createContext<BundleContextType | undefined>(undefined);

function calculateBundleTotals(
  items: BundleItem[],
  rules: BundleRule[]
): { subtotal: number; discount: number; total: number; appliedTier?: DiscountTier } {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  let appliedTier: DiscountTier | undefined;
  let discount = 0;

  // Find the best applicable discount tier from active rules
  for (const rule of rules) {
    if (!rule.isActive) continue;
    if (totalItems < rule.minProducts) continue;
    if (rule.maxProducts && totalItems > rule.maxProducts) continue;

    for (const tier of rule.discountTiers) {
      if (totalItems >= tier.minItems && totalItems <= tier.maxItems) {
        const tierDiscount =
          tier.discountType === 'percentage'
            ? subtotal * (tier.discountPercent / 100)
            : tier.fixedDiscount || 0;

        if (tierDiscount > discount) {
          discount = tierDiscount;
          appliedTier = tier;
        }
      }
    }
  }

  return {
    subtotal,
    discount,
    total: subtotal - discount,
    appliedTier,
  };
}

function createEmptyBundle(): Bundle {
  return {
    id: crypto.randomUUID(),
    name: 'My Bundle',
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isSaved: false,
  };
}

function bundleReducer(state: BundleState, action: BundleAction): BundleState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const currentBundle = state.currentBundle || createEmptyBundle();
      const existingItemIndex = currentBundle.items.findIndex(
        (item) => item.product.id === action.payload.id
      );

      let newItems: BundleItem[];
      if (existingItemIndex >= 0) {
        newItems = currentBundle.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...currentBundle.items, { product: action.payload, quantity: 1 }];
      }

      const totals = calculateBundleTotals(newItems, state.activeRules);

      return {
        ...state,
        currentBundle: {
          ...currentBundle,
          items: newItems,
          ...totals,
          updatedAt: new Date(),
        },
      };
    }

    case 'REMOVE_ITEM': {
      if (!state.currentBundle) return state;

      const newItems = state.currentBundle.items.filter(
        (item) => item.product.id !== action.payload
      );
      const totals = calculateBundleTotals(newItems, state.activeRules);

      return {
        ...state,
        currentBundle: {
          ...state.currentBundle,
          items: newItems,
          ...totals,
          updatedAt: new Date(),
        },
      };
    }

    case 'UPDATE_QUANTITY': {
      if (!state.currentBundle) return state;

      const newItems = state.currentBundle.items
        .map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);

      const totals = calculateBundleTotals(newItems, state.activeRules);

      return {
        ...state,
        currentBundle: {
          ...state.currentBundle,
          items: newItems,
          ...totals,
          updatedAt: new Date(),
        },
      };
    }

    case 'CLEAR_BUNDLE':
      return {
        ...state,
        currentBundle: createEmptyBundle(),
      };

    case 'SET_PRODUCTS':
      return {
        ...state,
        availableProducts: action.payload,
      };

    case 'SET_RULES':
      return {
        ...state,
        activeRules: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'LOAD_SAVED_BUNDLE':
      return {
        ...state,
        currentBundle: action.payload,
      };

    default:
      return state;
  }
}

const initialState: BundleState = {
  currentBundle: null,
  availableProducts: [],
  activeRules: [],
  isLoading: false,
  error: null,
};

export function BundleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bundleReducer, initialState);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearBundle = useCallback(() => {
    dispatch({ type: 'CLEAR_BUNDLE' });
  }, []);

  const loadSavedBundle = useCallback((bundle: Bundle) => {
    dispatch({ type: 'LOAD_SAVED_BUNDLE', payload: bundle });
  }, []);

  const getTotalItems = useCallback(() => {
    return state.currentBundle?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [state.currentBundle]);

  const getApplicableTier = useCallback(() => {
    return state.currentBundle?.appliedTier || null;
  }, [state.currentBundle]);

  const value = useMemo(
    () => ({
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearBundle,
      loadSavedBundle,
      getTotalItems,
      getApplicableTier,
    }),
    [state, addItem, removeItem, updateQuantity, clearBundle, loadSavedBundle, getTotalItems, getApplicableTier]
  );

  return <BundleContext.Provider value={value}>{children}</BundleContext.Provider>;
}

export function useBundleContext() {
  const context = useContext(BundleContext);
  if (context === undefined) {
    throw new Error('useBundleContext must be used within a BundleProvider');
  }
  return context;
}
