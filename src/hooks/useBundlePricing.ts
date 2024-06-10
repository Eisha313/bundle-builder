import { useMemo, useCallback } from 'react';
import { BundleItem, DiscountTier, PriceBreakdown } from '@/types/bundle';
import {
  calculateBundlePrice,
  getNextDiscountTier,
  formatCurrency,
  DEFAULT_DISCOUNT_TIERS,
  validateBundle,
} from '@/utils/pricing';

interface UseBundlePricingOptions {
  discountTiers?: DiscountTier[];
  currency?: string;
  minBundleItems?: number;
}

interface UseBundlePricingReturn {
  priceBreakdown: PriceBreakdown;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;
  nextTier: { itemsNeeded: number; discountPercent: number } | null;
  isValidBundle: boolean;
  validationErrors: string[];
  hasDiscount: boolean;
  savingsMessage: string;
}

export function useBundlePricing(
  items: BundleItem[],
  options: UseBundlePricingOptions = {}
): UseBundlePricingReturn {
  const {
    discountTiers = DEFAULT_DISCOUNT_TIERS,
    currency = 'USD',
    minBundleItems = 2,
  } = options;

  const safeItems = useMemo(() => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.filter(item => 
      item && 
      typeof item.id === 'string' && 
      typeof item.price === 'number' && 
      Number.isFinite(item.price) &&
      item.price >= 0
    );
  }, [items]);

  const priceBreakdown = useMemo(
    () => calculateBundlePrice(safeItems, discountTiers),
    [safeItems, discountTiers]
  );

  const validation = useMemo(
    () => validateBundle(safeItems, minBundleItems),
    [safeItems, minBundleItems]
  );

  const nextTier = useMemo(
    () => getNextDiscountTier(priceBreakdown.itemCount, discountTiers),
    [priceBreakdown.itemCount, discountTiers]
  );

  const formattedSubtotal = useMemo(
    () => formatCurrency(priceBreakdown.subtotal, currency),
    [priceBreakdown.subtotal, currency]
  );

  const formattedDiscount = useMemo(
    () => formatCurrency(priceBreakdown.discountAmount, currency),
    [priceBreakdown.discountAmount, currency]
  );

  const formattedTotal = useMemo(
    () => formatCurrency(priceBreakdown.total, currency),
    [priceBreakdown.total, currency]
  );

  const hasDiscount = priceBreakdown.discountPercent > 0;

  const savingsMessage = useMemo(() => {
    if (hasDiscount) {
      return `You're saving ${priceBreakdown.discountPercent}% (${formattedDiscount})`;
    }
    if (nextTier) {
      const itemWord = nextTier.itemsNeeded === 1 ? 'item' : 'items';
      return `Add ${nextTier.itemsNeeded} more ${itemWord} to get ${nextTier.discountPercent}% off!`;
    }
    return 'Add items to start building your bundle';
  }, [hasDiscount, priceBreakdown.discountPercent, formattedDiscount, nextTier]);

  return {
    priceBreakdown,
    formattedSubtotal,
    formattedDiscount,
    formattedTotal,
    nextTier,
    isValidBundle: validation.valid,
    validationErrors: validation.errors,
    hasDiscount,
    savingsMessage,
  };
}

export default useBundlePricing;