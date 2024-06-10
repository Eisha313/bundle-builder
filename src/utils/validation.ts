import { Bundle, BundleItem, BundleRules, ValidationResult, ValidationError } from '@/types/bundle';

export const VALIDATION_ERRORS = {
  MIN_ITEMS: 'MINIMUM_ITEMS_NOT_MET',
  MAX_ITEMS: 'MAXIMUM_ITEMS_EXCEEDED',
  MIN_VALUE: 'MINIMUM_VALUE_NOT_MET',
  INVALID_PRODUCT: 'INVALID_PRODUCT_IN_BUNDLE',
  OUT_OF_STOCK: 'PRODUCT_OUT_OF_STOCK',
  CATEGORY_REQUIREMENT: 'CATEGORY_REQUIREMENT_NOT_MET',
} as const;

export type ValidationErrorCode = typeof VALIDATION_ERRORS[keyof typeof VALIDATION_ERRORS];

export function validateBundleItems(
  items: BundleItem[],
  rules: BundleRules
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check minimum items
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalQuantity < rules.minItems) {
    errors.push({
      code: VALIDATION_ERRORS.MIN_ITEMS,
      message: `Bundle requires at least ${rules.minItems} items. Currently have ${totalQuantity}.`,
      field: 'items',
    });
  }

  // Check maximum items
  if (rules.maxItems && totalQuantity > rules.maxItems) {
    errors.push({
      code: VALIDATION_ERRORS.MAX_ITEMS,
      message: `Bundle cannot exceed ${rules.maxItems} items. Currently have ${totalQuantity}.`,
      field: 'items',
    });
  }

  // Check minimum value
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (rules.minValue && totalValue < rules.minValue) {
    errors.push({
      code: VALIDATION_ERRORS.MIN_VALUE,
      message: `Bundle value must be at least $${rules.minValue.toFixed(2)}. Current value: $${totalValue.toFixed(2)}.`,
      field: 'value',
    });
  }

  // Check eligible products
  if (rules.eligibleProductIds && rules.eligibleProductIds.length > 0) {
    const invalidItems = items.filter(
      item => !rules.eligibleProductIds!.includes(item.productId)
    );
    
    invalidItems.forEach(item => {
      errors.push({
        code: VALIDATION_ERRORS.INVALID_PRODUCT,
        message: `Product "${item.name}" is not eligible for this bundle.`,
        field: 'items',
        productId: item.productId,
      });
    });
  }

  // Check required categories
  if (rules.requiredCategories && rules.requiredCategories.length > 0) {
    const itemCategories = new Set(items.map(item => item.category).filter(Boolean));
    const missingCategories = rules.requiredCategories.filter(
      cat => !itemCategories.has(cat)
    );
    
    if (missingCategories.length > 0) {
      errors.push({
        code: VALIDATION_ERRORS.CATEGORY_REQUIREMENT,
        message: `Bundle must include items from: ${missingCategories.join(', ')}.`,
        field: 'categories',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    itemCount: totalQuantity,
    totalValue,
  };
}

export function validateInventory(
  items: BundleItem[],
  inventory: Record<string, number>
): ValidationResult {
  const errors: ValidationError[] = [];

  items.forEach(item => {
    const available = inventory[item.productId] ?? 0;
    if (item.quantity > available) {
      errors.push({
        code: VALIDATION_ERRORS.OUT_OF_STOCK,
        message: `"${item.name}" has only ${available} in stock. Requested: ${item.quantity}.`,
        field: 'inventory',
        productId: item.productId,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  };
}

export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  const lastResult = results[results.length - 1];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    itemCount: lastResult?.itemCount ?? 0,
    totalValue: lastResult?.totalValue ?? 0,
  };
}

export function getErrorsByField(errors: ValidationError[], field: string): ValidationError[] {
  return errors.filter(error => error.field === field);
}

export function hasErrorCode(errors: ValidationError[], code: ValidationErrorCode): boolean {
  return errors.some(error => error.code === code);
}