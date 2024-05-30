export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inventory: number;
  eligible: boolean;
}

export interface BundleItem extends Product {
  quantity: number;
}

export interface DiscountTier {
  minItems: number;
  discount: number;
}

export interface TierDiscount {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  nextTier: DiscountTier | null;
  itemsUntilNextTier: number;
}

export interface Bundle {
  id: string;
  name: string;
  items: BundleItem[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface SavedBundle extends Bundle {
  userId: string;
  isFavorite: boolean;
}

export interface BundleRule {
  id: string;
  name: string;
  description: string;
  minItems: number;
  maxItems: number;
  eligibleCategories: string[];
  eligibleProductIds: string[];
  discountTiers: DiscountTier[];
  active: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PricingSummary {
  subtotal: number;
  discount: TierDiscount;
  total: number;
  currency: string;
}
