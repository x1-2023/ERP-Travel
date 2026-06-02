/**
 * Zod Validation Schema Tests
 * Tests REAL schemas from src/lib/validations.ts
 */

import { describe, it, expect } from 'vitest';
import { promotionFormSchema, claimFormSchema, fundFormSchema } from '@/lib/validations';

// ══════════════════════════════════════════════════════════════════════════════
// promotionFormSchema
// ══════════════════════════════════════════════════════════════════════════════

describe('promotionFormSchema', () => {
  const validPromotion = {
    code: 'PROMO-2024-001',
    name: 'Summer Sale',
    description: 'Summer promotional campaign',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    budget: 100000000,
    customerId: 'cust-1',
    fundId: 'fund-1',
    promotionType: 'TRADE_PROMOTION' as const,
    mechanicType: 'DISCOUNT' as const,
  };

  it('should pass for valid promotion data', () => {
    const result = promotionFormSchema.safeParse(validPromotion);
    expect(result.success).toBe(true);
  });

  it('should fail when code is empty', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, code: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when code has lowercase', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, code: 'promo-001' });
    expect(result.success).toBe(false);
  });

  it('should fail when code exceeds 50 characters', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, code: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('should fail when code has special characters', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, code: 'PROMO@2024' });
    expect(result.success).toBe(false);
  });

  it('should pass code with hyphens and numbers', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, code: 'PROMO-2024-001' });
    expect(result.success).toBe(true);
  });

  it('should fail when name is empty', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, name: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when name exceeds 200 characters', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, name: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should pass when description is optional', () => {
    const { description, ...withoutDesc } = validPromotion;
    const result = promotionFormSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it('should fail when budget is negative', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, budget: -1000 });
    expect(result.success).toBe(false);
  });

  it('should fail when budget is zero', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, budget: 0 });
    expect(result.success).toBe(false);
  });

  it('should fail when budget is not a number', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, budget: 'abc' });
    expect(result.success).toBe(false);
  });

  it('should fail when customerId is empty', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, customerId: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when fundId is empty', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, fundId: '' });
    expect(result.success).toBe(false);
  });

  it('should fail for invalid promotionType', () => {
    const result = promotionFormSchema.safeParse({ ...validPromotion, promotionType: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid promotionTypes', () => {
    const types = ['TRADE_PROMOTION', 'CONSUMER_PROMOTION', 'SHOPPER_MARKETING', 'DISPLAY', 'LISTING_FEE'];
    types.forEach((type) => {
      const result = promotionFormSchema.safeParse({ ...validPromotion, promotionType: type });
      expect(result.success).toBe(true);
    });
  });

  it('should accept all valid mechanicTypes', () => {
    const types = ['DISCOUNT', 'REBATE', 'FREE_GOODS', 'BOGO', 'BUNDLE', 'LOYALTY_POINTS'];
    types.forEach((type) => {
      const result = promotionFormSchema.safeParse({ ...validPromotion, mechanicType: type });
      expect(result.success).toBe(true);
    });
  });

  it('should pass when mechanicType is optional', () => {
    const { mechanicType, ...withoutMechanic } = validPromotion;
    const result = promotionFormSchema.safeParse(withoutMechanic);
    expect(result.success).toBe(true);
  });

  it('should fail when endDate is before startDate', () => {
    const result = promotionFormSchema.safeParse({
      ...validPromotion,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-01-01'),
    });
    expect(result.success).toBe(false);
  });

  it('should fail when dates are equal', () => {
    const sameDate = new Date('2024-01-01');
    const result = promotionFormSchema.safeParse({
      ...validPromotion,
      startDate: sameDate,
      endDate: sameDate,
    });
    expect(result.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// claimFormSchema
// ══════════════════════════════════════════════════════════════════════════════

describe('claimFormSchema', () => {
  const validClaim = {
    promotionId: 'promo-1',
    claimDate: new Date('2024-02-15'),
    claimAmount: 5000000,
    description: 'Monthly claim',
    invoiceNumber: 'INV-001',
    evidenceUrls: ['https://example.com/evidence1.pdf'],
  };

  it('should pass for valid claim data', () => {
    const result = claimFormSchema.safeParse(validClaim);
    expect(result.success).toBe(true);
  });

  it('should fail when promotionId is empty', () => {
    const result = claimFormSchema.safeParse({ ...validClaim, promotionId: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when claimAmount is negative', () => {
    const result = claimFormSchema.safeParse({ ...validClaim, claimAmount: -1000 });
    expect(result.success).toBe(false);
  });

  it('should fail when claimAmount is zero', () => {
    const result = claimFormSchema.safeParse({ ...validClaim, claimAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('should pass when description is optional', () => {
    const { description, ...withoutDesc } = validClaim;
    const result = claimFormSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it('should pass when invoiceNumber is optional', () => {
    const { invoiceNumber, ...withoutInvoice } = validClaim;
    const result = claimFormSchema.safeParse(withoutInvoice);
    expect(result.success).toBe(true);
  });

  it('should pass when evidenceUrls is optional', () => {
    const { evidenceUrls, ...withoutEvidence } = validClaim;
    const result = claimFormSchema.safeParse(withoutEvidence);
    expect(result.success).toBe(true);
  });

  it('should fail for invalid evidence URLs', () => {
    const result = claimFormSchema.safeParse({ ...validClaim, evidenceUrls: ['not-a-url'] });
    expect(result.success).toBe(false);
  });

  it('should pass for valid evidence URLs', () => {
    const result = claimFormSchema.safeParse({
      ...validClaim,
      evidenceUrls: ['https://example.com/file1.pdf', 'https://example.com/file2.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('should pass for empty evidence array', () => {
    const result = claimFormSchema.safeParse({ ...validClaim, evidenceUrls: [] });
    expect(result.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// fundFormSchema
// ══════════════════════════════════════════════════════════════════════════════

describe('fundFormSchema', () => {
  const validFund = {
    code: 'FUND-2024-001',
    name: 'Q1 Trade Fund',
    description: 'First quarter trade fund',
    totalBudget: 500000000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    fundType: 'TRADE_FUND' as const,
  };

  it('should pass for valid fund data', () => {
    const result = fundFormSchema.safeParse(validFund);
    expect(result.success).toBe(true);
  });

  it('should fail when code is empty', () => {
    const result = fundFormSchema.safeParse({ ...validFund, code: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when code has lowercase', () => {
    const result = fundFormSchema.safeParse({ ...validFund, code: 'fund-001' });
    expect(result.success).toBe(false);
  });

  it('should fail when name is empty', () => {
    const result = fundFormSchema.safeParse({ ...validFund, name: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when totalBudget is negative', () => {
    const result = fundFormSchema.safeParse({ ...validFund, totalBudget: -100 });
    expect(result.success).toBe(false);
  });

  it('should fail when totalBudget is zero', () => {
    const result = fundFormSchema.safeParse({ ...validFund, totalBudget: 0 });
    expect(result.success).toBe(false);
  });

  it('should accept all valid fundTypes', () => {
    const types = ['TRADE_FUND', 'MARKETING_FUND', 'PROMOTIONAL_FUND', 'CO_OP_FUND'];
    types.forEach((type) => {
      const result = fundFormSchema.safeParse({ ...validFund, fundType: type });
      expect(result.success).toBe(true);
    });
  });

  it('should fail for invalid fundType', () => {
    const result = fundFormSchema.safeParse({ ...validFund, fundType: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should fail when endDate is before startDate', () => {
    const result = fundFormSchema.safeParse({
      ...validFund,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-01-01'),
    });
    expect(result.success).toBe(false);
  });

  it('should pass when description is optional', () => {
    const { description, ...withoutDesc } = validFund;
    const result = fundFormSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it('should fail when code exceeds 50 characters', () => {
    const result = fundFormSchema.safeParse({ ...validFund, code: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('should fail when name exceeds 200 characters', () => {
    const result = fundFormSchema.safeParse({ ...validFund, name: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });
});
