import { BundleItem, DiscountTier, PriceBreakdown } from '@/types/bundle';

export const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { minItems: 2, discountPercent: 5 },
  { minItems: 3, discountPercent: 10 },
  { minItems: 5, discountPercent: 15 },
  { minItems: 8, discountPercent: 20 },
];

export function getApplicableDiscount(
  itemCount: number,
  tiers: DiscountTier[] = DEFAULT_DISCOUNT_TIERS
): number {
  if (itemCount < 0 || !Number.isFinite(itemCount)) {
    return 0;
  }

  const sortedTiers = [...tiers].sort((a, b) => b.minItems - a.minItems);
  
  for (const tier of sortedTiers) {
    if (itemCount >= tier.minItems) {
      return Math.max(0, Math.min(100, tier.discountPercent));
    }
  }
  
  return 0;
}

export function calculateSubtotal(items: BundleItem[]): number {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    
    if (price < 0 || quantity < 0) {
      return total;
    }
    
    return total + (price * quantity);
  }, 0);
}

export function getTotalItemCount(items: BundleItem[]): number {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((count, item) => {
    const quantity = Number(item.quantity) || 0;
    return count + Math.max(0, quantity);
  }, 0);
}

export function calculateBundlePrice(
  items: BundleItem[],
  tiers: DiscountTier[] = DEFAULT_DISCOUNT_TIERS
): PriceBreakdown {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const subtotal = calculateSubtotal(items);
  const itemCount = getTotalItemCount(items);
  const discountPercent = getApplicableDiscount(itemCount, tiers);
  const discountAmount = roundToTwoDecimals((subtotal * discountPercent) / 100);
  const total = roundToTwoDecimals(Math.max(0, subtotal - discountAmount));

  return {
    subtotal: roundToTwoDecimals(subtotal),
    discountPercent,
    discountAmount,
    total,
    itemCount,
  };
}

export function roundToTwoDecimals(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!Number.isFinite(amount)) {
    amount = 0;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getNextDiscountTier(
  currentItemCount: number,
  tiers: DiscountTier[] = DEFAULT_DISCOUNT_TIERS
): { itemsNeeded: number; discountPercent: number } | null {
  if (currentItemCount < 0 || !Number.isFinite(currentItemCount)) {
    currentItemCount = 0;
  }

  const sortedTiers = [...tiers].sort((a, b) => a.minItems - b.minItems);
  
  for (const tier of sortedTiers) {
    if (tier.minItems > currentItemCount) {
      return {
        itemsNeeded: tier.minItems - currentItemCount,
        discountPercent: tier.discountPercent,
      };
    }
  }
  
  return null;
}

export function validateBundleItem(item: Partial<BundleItem>): string[] {
  const errors: string[] = [];

  if (!item.id || typeof item.id !== 'string') {
    errors.push('Item must have a valid ID');
  }

  if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
    errors.push('Item must have a valid name');
  }

  if (typeof item.price !== 'number' || item.price < 0 || !Number.isFinite(item.price)) {
    errors.push('Item must have a valid non-negative price');
  }

  if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
    errors.push('Item quantity must be a positive integer');
  }

  return errors;
}

export function validateBundle(items: BundleItem[], minItems: number = 2): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(items)) {
    return { valid: false, errors: ['Bundle items must be an array'] };
  }

  const totalItems = getTotalItemCount(items);

  if (totalItems < minItems) {
    errors.push(`Bundle must contain at least ${minItems} items`);
  }

  items.forEach((item, index) => {
    const itemErrors = validateBundleItem(item);
    itemErrors.forEach(err => errors.push(`Item ${index + 1}: ${err}`));
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}