import { useMemo, useCallback } from 'react';
import { BundleItem, BundleRules, ValidationResult } from '@/types/bundle';
import { 
  validateBundleItems, 
  validateInventory, 
  mergeValidationResults,
  getErrorsByField,
  hasErrorCode,
  VALIDATION_ERRORS,
  ValidationErrorCode
} from '@/utils/validation';

interface UseBundleValidationProps {
  items: BundleItem[];
  rules: BundleRules;
  inventory?: Record<string, number>;
}

interface UseBundleValidationResult {
  validation: ValidationResult;
  isValid: boolean;
  errors: ValidationResult['errors'];
  getFieldErrors: (field: string) => ValidationResult['errors'];
  hasError: (code: ValidationErrorCode) => boolean;
  canCheckout: boolean;
  validationSummary: string | null;
}

export function useBundleValidation({
  items,
  rules,
  inventory,
}: UseBundleValidationProps): UseBundleValidationResult {
  const validation = useMemo(() => {
    const bundleValidation = validateBundleItems(items, rules);
    
    if (inventory) {
      const inventoryValidation = validateInventory(items, inventory);
      return mergeValidationResults(bundleValidation, inventoryValidation);
    }
    
    return bundleValidation;
  }, [items, rules, inventory]);

  const getFieldErrors = useCallback(
    (field: string) => getErrorsByField(validation.errors, field),
    [validation.errors]
  );

  const hasError = useCallback(
    (code: ValidationErrorCode) => hasErrorCode(validation.errors, code),
    [validation.errors]
  );

  const canCheckout = useMemo(() => {
    // Can checkout if valid OR if only non-blocking errors exist
    if (validation.isValid) return true;
    
    // Block checkout for critical errors
    const blockingErrors: ValidationErrorCode[] = [
      VALIDATION_ERRORS.MIN_ITEMS,
      VALIDATION_ERRORS.OUT_OF_STOCK,
      VALIDATION_ERRORS.INVALID_PRODUCT,
    ];

    return !validation.errors.some(error =>
      blockingErrors.includes(error.code as ValidationErrorCode)
    );
  }, [validation]);

  const validationSummary = useMemo(() => {
    if (validation.isValid) return null;
    
    const errorCount = validation.errors.length;
    if (errorCount === 1) {
      return validation.errors[0].message;
    }
    
    return `${errorCount} issues need to be resolved before checkout.`;
  }, [validation]);

  return {
    validation,
    isValid: validation.isValid,
    errors: validation.errors,
    getFieldErrors,
    hasError,
    canCheckout,
    validationSummary,
  };
}

export { VALIDATION_ERRORS } from '@/utils/validation';
export type { ValidationErrorCode } from '@/utils/validation';