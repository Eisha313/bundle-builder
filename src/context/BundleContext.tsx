'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Bundle, BundleItem, BundleState } from '@/types/bundle';
import { validateBundleItem } from '@/utils/pricing';

type BundleAction =
  | { type: 'ADD_ITEM'; payload: BundleItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_BUNDLE' }
  | { type: 'LOAD_BUNDLE'; payload: Bundle }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

interface BundleContextValue extends BundleState {
  addItem: (item: BundleItem) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearBundle: () => void;
  loadBundle: (bundle: Bundle) => void;
  setBundleName: (name: string) => void;
  getItemByProductId: (productId: string) => BundleItem | undefined;
  hasItem: (productId: string) => boolean;
}

const initialState: BundleState = {
  items: [],
  name: '',
  error: null,
};

const MAX_BUNDLE_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;

function bundleReducer(state: BundleState, action: BundleAction): BundleState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );

      if (existingIndex >= 0) {
        const existingItem = state.items[existingIndex];
        const newQuantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          MAX_ITEM_QUANTITY
        );

        const updatedItems = [...state.items];
        updatedItems[existingIndex] = { ...existingItem, quantity: newQuantity };

        return { ...state, items: updatedItems, error: null };
      }

      if (state.items.length >= MAX_BUNDLE_ITEMS) {
        return { ...state, error: `Bundle cannot contain more than ${MAX_BUNDLE_ITEMS} unique items` };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: Math.min(action.payload.quantity, MAX_ITEM_QUANTITY) }],
        error: null,
      };
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.productId !== action.payload);
      if (filteredItems.length === state.items.length) {
        return state;
      }
      return { ...state, items: filteredItems, error: null };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      if (quantity < 1) {
        return bundleReducer(state, { type: 'REMOVE_ITEM', payload: productId });
      }

      const clampedQuantity = Math.min(quantity, MAX_ITEM_QUANTITY);
      const itemIndex = state.items.findIndex(item => item.productId === productId);

      if (itemIndex < 0) {
        return { ...state, error: 'Item not found in bundle' };
      }

      const updatedItems = [...state.items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity: clampedQuantity };

      return { ...state, items: updatedItems, error: null };
    }

    case 'CLEAR_BUNDLE':
      return { ...initialState };

    case 'LOAD_BUNDLE':
      return {
        items: action.payload.items || [],
        name: action.payload.name || '',
        error: null,
      };

    case 'SET_NAME':
      return { ...state, name: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const BundleContext = createContext<BundleContextValue | undefined>(undefined);

export function BundleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bundleReducer, initialState);

  const addItem = useCallback((item: BundleItem): boolean => {
    const errors = validateBundleItem(item);
    if (errors.length > 0) {
      dispatch({ type: 'SET_ERROR', payload: errors[0] });
      return false;
    }
    dispatch({ type: 'ADD_ITEM', payload: item });
    return true;
  }, []);

  const removeItem = useCallback((productId: string) => {
    if (!productId || typeof productId !== 'string') return;
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number): boolean => {
    if (!productId || typeof productId !== 'string') {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid product ID' });
      return false;
    }
    if (!Number.isInteger(quantity)) {
      dispatch({ type: 'SET_ERROR', payload: 'Quantity must be a whole number' });
      return false;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    return true;
  }, []);

  const clearBundle = useCallback(() => {
    dispatch({ type: 'CLEAR_BUNDLE' });
  }, []);

  const loadBundle = useCallback((bundle: Bundle) => {
    if (!bundle || !Array.isArray(bundle.items)) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid bundle data' });
      return;
    }
    dispatch({ type: 'LOAD_BUNDLE', payload: bundle });
  }, []);

  const setBundleName = useCallback((name: string) => {
    dispatch({ type: 'SET_NAME', payload: name || '' });
  }, []);

  const getItemByProductId = useCallback((productId: string): BundleItem | undefined => {
    return state.items.find(item => item.productId === productId);
  }, [state.items]);

  const hasItem = useCallback((productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  }, [state.items]);

  const value: BundleContextValue = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearBundle,
    loadBundle,
    setBundleName,
    getItemByProductId,
    hasItem,
  };

  return (
    <BundleContext.Provider value={value}>
      {children}
    </BundleContext.Provider>
  );
}

export function useBundleContext(): BundleContextValue {
  const context = useContext(BundleContext);
  if (context === undefined) {
    throw new Error('useBundleContext must be used within a BundleProvider');
  }
  return context;
}

export default BundleContext;
