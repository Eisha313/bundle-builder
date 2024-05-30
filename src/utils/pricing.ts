import { BundleItem, DiscountTier, TierDiscount } from '@/types/bundle';

export const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { minItems: 2, discount: 5 },
  { minItems: 3, discount: 10 },
  { minItems: 4, discount: 15 },
  { minItems: 5, discount: 20 },
];

export function calculateSubtotal(items: BundleItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getTotalItemCount(items: BundleItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function getApplicableTier(
  itemCount: number,
  tiers: DiscountTier[] = DEFAULT_DISCOUNT_TIERS
): DiscountTier | null {
  const sortedTiers = [...tiers].sort((a, b) => b.minItems - a.minItems);
  return sortedTiers.find((tier) => itemCount >= tier.minItems) || null;
}

export function calculateTierDiscount(
  items: BundleItem[],
  tiers: DiscountTier[] = DEFAULT_DISCOUNT_TIERS
): TierDiscount {
  const subtotal = calculateSubtotal(items);
  const itemCount = getTotalItemCount(items);
  const applicableTier = getApplicableTier(itemCount, tiers);

  if (!applicableTier) {
    return {
      subtotal,
      discountPercentage: 0,
      discountAmount: 0,
      total: subtotal,
      itemCount,
      nextTier: tiers.length > 0 ? tiers[0] : null,
      itemsUntilNextTier: tiers.length > 0 ? tiers[0].minItems - itemCount : 0,
    };
  }

  const discountAmount = subtotal * (applicableTier.discount / 100);
  const total = subtotal - discountAmount;

  const sortedTiers = [...tiers].sort((a, b) => a.minItems - b.minItems);
  const currentTierIndex = sortedTiers.findIndex(
    (t) => t.minItems === applicableTier.minItems
  );
  const nextTier = sortedTiers[currentTierIndex + 1] || null;
  const itemsUntilNextTier = nextTier ? nextTier.minItems - itemCount : 0;

  return {
    subtotal,
    discountPercentage: applicableTier.discount,
    discountAmount,
    total,
    itemCount,
    nextTier,
    itemsUntilNextTier,
  };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDiscount(percentage: number): string {
  return `${percentage}% OFF`;
}
