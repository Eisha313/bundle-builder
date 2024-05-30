import { useMemo } from 'react';
import { BundleItem, DiscountTier, TierDiscount } from '@/types/bundle';
import {
  calculateTierDiscount,
  DEFAULT_DISCOUNT_TIERS,
  formatCurrency,
  formatDiscount,
} from '@/utils/pricing';

interface UseBundlePricingOptions {
  items: BundleItem[];
  tiers?: DiscountTier[];
  currency?: string;
}

interface UseBundlePricingResult extends TierDiscount {
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;
  discountLabel: string;
  hasDiscount: boolean;
  savingsMessage: string | null;
  nextTierMessage: string | null;
}

export function useBundlePricing({
  items,
  tiers = DEFAULT_DISCOUNT_TIERS,
  currency = 'USD',
}: UseBundlePricingOptions): UseBundlePricingResult {
  return useMemo(() => {
    const pricing = calculateTierDiscount(items, tiers);

    const formattedSubtotal = formatCurrency(pricing.subtotal, currency);
    const formattedDiscount = formatCurrency(pricing.discountAmount, currency);
    const formattedTotal = formatCurrency(pricing.total, currency);
    const discountLabel = formatDiscount(pricing.discountPercentage);
    const hasDiscount = pricing.discountPercentage > 0;

    const savingsMessage = hasDiscount
      ? `You're saving ${formattedDiscount} with your bundle!`
      : null;

    const nextTierMessage = pricing.nextTier
      ? `Add ${pricing.itemsUntilNextTier} more item${pricing.itemsUntilNextTier !== 1 ? 's' : ''} to unlock ${pricing.nextTier.discount}% off!`
      : null;

    return {
      ...pricing,
      formattedSubtotal,
      formattedDiscount,
      formattedTotal,
      discountLabel,
      hasDiscount,
      savingsMessage,
      nextTierMessage,
    };
  }, [items, tiers, currency]);
}

export default useBundlePricing;
