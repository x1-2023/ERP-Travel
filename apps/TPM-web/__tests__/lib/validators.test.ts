/**
 * Validators Test Suite
 * Tests for validation functions and schemas
 */

import { describe, it, expect } from 'vitest';

// ══════════════════════════════════════════════════════════════════════════════
// Email Validation
// ══════════════════════════════════════════════════════════════════════════════

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

describe('validateEmail', () => {
  it('should pass for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should pass for email with subdomain', () => {
    expect(validateEmail('user.name@company.co.vn')).toBe(true);
  });

  it('should pass for email with plus sign', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should fail for invalid email without domain', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  it('should fail for email without local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('should fail for email without @ symbol', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  it('should fail for email with spaces', () => {
    expect(validateEmail('test @example.com')).toBe(false);
  });

  it('should fail for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Phone Validation (Vietnam)
// ══════════════════════════════════════════════════════════════════════════════

const validatePhone = (phone: string): boolean => {
  const re = /^(0|84|\+84)?[0-9]{9,10}$/;
  return re.test(phone.replace(/[\s-]/g, ''));
};

describe('validatePhone', () => {
  it('should pass for valid Vietnamese mobile number', () => {
    expect(validatePhone('0901234567')).toBe(true);
  });

  it('should pass for number with country code', () => {
    expect(validatePhone('84901234567')).toBe(true);
  });

  it('should pass for number with plus country code', () => {
    expect(validatePhone('+84901234567')).toBe(true);
  });

  it('should pass for number with dashes', () => {
    expect(validatePhone('090-123-4567')).toBe(true);
  });

  it('should pass for number with spaces', () => {
    expect(validatePhone('090 123 4567')).toBe(true);
  });

  it('should fail for too short number', () => {
    expect(validatePhone('123')).toBe(false);
  });

  it('should fail for letters in phone', () => {
    expect(validatePhone('090abc1234')).toBe(false);
  });

  it('should fail for empty string', () => {
    expect(validatePhone('')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Tax Code Validation (Vietnam)
// ══════════════════════════════════════════════════════════════════════════════

const validateTaxCode = (taxCode: string): boolean => {
  const re = /^\d{10}(-\d{3})?$/;
  return re.test(taxCode);
};

describe('validateTaxCode', () => {
  it('should pass for valid 10-digit tax code', () => {
    expect(validateTaxCode('0301234567')).toBe(true);
  });

  it('should pass for tax code with branch number', () => {
    expect(validateTaxCode('0301234567-001')).toBe(true);
  });

  it('should fail for short tax code', () => {
    expect(validateTaxCode('123')).toBe(false);
  });

  it('should fail for tax code with letters', () => {
    expect(validateTaxCode('abc1234567')).toBe(false);
  });

  it('should fail for empty string', () => {
    expect(validateTaxCode('')).toBe(false);
  });

  it('should fail for tax code with invalid branch format', () => {
    expect(validateTaxCode('0301234567-1')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Date Range Validation
// ══════════════════════════════════════════════════════════════════════════════

const validateDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(startDate) <= new Date(endDate);
};

describe('validateDateRange', () => {
  it('should pass when end date is after start date', () => {
    expect(validateDateRange('2026-01-01', '2026-12-31')).toBe(true);
  });

  it('should pass when dates are equal', () => {
    expect(validateDateRange('2026-01-01', '2026-01-01')).toBe(true);
  });

  it('should fail when end date is before start date', () => {
    expect(validateDateRange('2026-12-31', '2026-01-01')).toBe(false);
  });

  it('should handle full ISO datetime strings', () => {
    expect(validateDateRange('2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z')).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Budget Validation
// ══════════════════════════════════════════════════════════════════════════════

const validateBudget = (budget: number): { valid: boolean; error?: string } => {
  if (budget < 0) return { valid: false, error: 'Budget cannot be negative' };
  if (budget > 10000000000) return { valid: false, error: 'Budget exceeds maximum (10 billion)' };
  return { valid: true };
};

describe('validateBudget', () => {
  it('should pass for valid budget', () => {
    expect(validateBudget(1000000).valid).toBe(true);
  });

  it('should pass for zero budget', () => {
    expect(validateBudget(0).valid).toBe(true);
  });

  it('should pass for large but valid budget', () => {
    expect(validateBudget(9999999999).valid).toBe(true);
  });

  it('should fail for negative budget', () => {
    const result = validateBudget(-1000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('negative');
  });

  it('should fail for budget exceeding maximum', () => {
    const result = validateBudget(99999999999);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Promotion Code Validation
// ══════════════════════════════════════════════════════════════════════════════

const validatePromotionCode = (code: string): { valid: boolean; error?: string } => {
  if (!code || code.length === 0) return { valid: false, error: 'Code is required' };
  if (code.length > 50) return { valid: false, error: 'Code must be 50 characters or less' };
  if (!/^[A-Z0-9-]+$/.test(code)) return { valid: false, error: 'Code must be uppercase letters, numbers, and hyphens only' };
  return { valid: true };
};

describe('validatePromotionCode', () => {
  it('should pass for valid uppercase code', () => {
    expect(validatePromotionCode('PROMO-2026-001').valid).toBe(true);
  });

  it('should pass for code with numbers', () => {
    expect(validatePromotionCode('PROMO123').valid).toBe(true);
  });

  it('should fail for empty code', () => {
    const result = validatePromotionCode('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should fail for lowercase letters', () => {
    const result = validatePromotionCode('promo-001');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('uppercase');
  });

  it('should fail for special characters', () => {
    const result = validatePromotionCode('PROMO@2026');
    expect(result.valid).toBe(false);
  });

  it('should fail for code exceeding max length', () => {
    const longCode = 'A'.repeat(51);
    const result = validatePromotionCode(longCode);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('50 characters');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Claim Amount Validation
// ══════════════════════════════════════════════════════════════════════════════

const validateClaimAmount = (
  amount: number,
  promotionBudget: number,
  usedBudget: number
): { valid: boolean; error?: string } => {
  if (amount <= 0) return { valid: false, error: 'Amount must be positive' };
  const availableBudget = promotionBudget - usedBudget;
  if (amount > availableBudget) {
    return { valid: false, error: `Amount exceeds available budget (${availableBudget.toLocaleString()})` };
  }
  return { valid: true };
};

describe('validateClaimAmount', () => {
  it('should pass when amount is within budget', () => {
    expect(validateClaimAmount(5000000, 100000000, 50000000).valid).toBe(true);
  });

  it('should pass when amount equals remaining budget', () => {
    expect(validateClaimAmount(50000000, 100000000, 50000000).valid).toBe(true);
  });

  it('should fail for negative amount', () => {
    const result = validateClaimAmount(-1000, 100000000, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('positive');
  });

  it('should fail for zero amount', () => {
    const result = validateClaimAmount(0, 100000000, 0);
    expect(result.valid).toBe(false);
  });

  it('should fail when amount exceeds available budget', () => {
    const result = validateClaimAmount(60000000, 100000000, 50000000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds available budget');
  });
});
