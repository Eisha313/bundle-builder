export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sku: string;
  inventory: number;
  eligibleForBundle: boolean;
}

export interface BundleItem {
  product: Product;
  quantity: number;
}

export interface DiscountTier {
  id: string;
  minItems: number;
  maxItems: number;
  discountPercent: number;
  discountType: 'percentage' | 'fixed';
  fixedDiscount?: number;
}

export interface BundleRule {
  id: string;
  name: string;
  description: string;
  minProducts: number;
  maxProducts: number;
  eligibleCategories: string[];
  discountTiers: DiscountTier[];
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface Bundle {
  id: string;
  userId?: string;
  name: string;
  items: BundleItem[];
  subtotal: number;
  discount: number;
  total: number;
  appliedTier?: DiscountTier;
  createdAt: Date;
  updatedAt: Date;
  isSaved: boolean;
}

export interface BundleState {
  currentBundle: Bundle | null;
  availableProducts: Product[];
  activeRules: BundleRule[];
  isLoading: boolean;
  error: string | null;
}

export type DragItem = {
  type: 'product';
  product: Product;
};
