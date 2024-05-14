'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { BundleItem, DiscountTier, Bundle } from '@/types/bundle';

interface BundleState {
  items: BundleItem[];
  discountTiers: DiscountTier[];
  isLoading: boolean;
  error: string | null;
}

type BundleAction =
  | { type: 'ADD_ITEM'; payload: BundleItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_BUNDLE' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { minItems: 2, maxItems: 3, discountPercent: 5 },
  { minItems: 4, maxItems: 5, discountPercent: 10 },
  { minItems: 6, maxItems: 10, discountPercent: 15 },
  { minItems: 11, maxItems: Infinity, discountPercent: 20 },
];

const initialState: BundleState = {
  items: [],
  discountTiers: DEFAULT_DISCOUNT_TIERS,
  isLoading: false,
  error: null,
};

function bundleReducer(state: BundleState, action: BundleAction): BundleState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems, error: null };
      }

      return { ...state, items: [...state.items, action.payload], error: null };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
        error: null,
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity < 1) {
        return {
          ...state,
          items: state.items.filter((item) => item.productId !== action.payload.productId),
          error: null,
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        error: null,
      };
    }

    case 'CLEAR_BUNDLE':
      return { ...state, items: [], error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

interface BundleContextValue {
  state: BundleState;
  addItem: (item: BundleItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBundle: () => void;
  totalItems: number;
  subtotal: number;
  currentDiscount: DiscountTier | null;
  discountAmount: number;
  finalPrice: number;
}

const BundleContext = createContext<BundleContextValue | undefined>(undefined);

export function BundleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bundleReducer, initialState);

  const addItem = useCallback((item: BundleItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
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

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 0;
        return sum + itemPrice * itemQuantity;
      }, 0),
    [state.items]
  );

  const currentDiscount = useMemo(() => {
    if (totalItems < 2) return null;
    
    const applicableTier = state.discountTiers
      .filter((tier) => totalItems >= tier.minItems && totalItems <= tier.maxItems)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0];
    
    return applicableTier || null;
  }, [totalItems, state.discountTiers]);

  const discountAmount = useMemo(() => {
    if (!currentDiscount) return 0;
    return Math.round((subtotal * currentDiscount.discountPercent) / 100 * 100) / 100;
  }, [subtotal, currentDiscount]);

  const finalPrice = useMemo(() => {
    return Math.round((subtotal - discountAmount) * 100) / 100;
  }, [subtotal, discountAmount]);

  const value: BundleContextValue = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearBundle,
    totalItems,
    subtotal,
    currentDiscount,
    discountAmount,
    finalPrice,
  };

  return (
    <BundleContext.Provider value={value}>
      {children}
    </BundleContext.Provider>
  );
}

export function useBundleContext() {
  const context = useContext(BundleContext);
  if (context === undefined) {
    throw new Error('useBundleContext must be used within a BundleProvider');
  }
  return context;
}
