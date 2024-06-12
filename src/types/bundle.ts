export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  inventory: number;
  eligible?: boolean;
}

export interface BundleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
}

export interface Bundle {
  id: string;
  name: string;
  items: BundleItem[];
  createdAt: Date;
  updatedAt: Date;
  customerId?: string;
}

export interface DiscountTier {
  minItems: number;
  discountPercent: number;
  label: string;
}

export interface BundleRules {
  minItems: number;
  maxItems?: number;
  minValue?: number;
  discountTiers: DiscountTier[];
  eligibleProductIds?: string[];
  requiredCategories?: string[];
}

export interface PriceBreakdown {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

export interface ValidationError {
  code: string;
  message: string;
  field: string;
  productId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  itemCount: number;
  totalValue: number;
}

export interface SavedBundle {
  id: string;
  name: string;
  items: BundleItem[];
  customerId: string;
  createdAt: Date;
  lastOrderedAt?: Date;
}

export interface BundleState {
  items: BundleItem[];
  name: string;
  error: string | null;
}
