/**
 * useFinance Hook Test Suite
 * Tests for finance-related hooks (accruals, deductions, journals)
 */

import { describe, it, expect, vi } from 'vitest';

// ══════════════════════════════════════════════════════════════════════════════
// Finance Data Types
// ══════════════════════════════════════════════════════════════════════════════

interface Accrual {
  id: string;
  promotionId: string;
  period: string;
  estimatedAmount: number;
  actualAmount: number | null;
  status: 'PENDING' | 'CALCULATED' | 'POSTED' | 'REVERSED';
}

interface Deduction {
  id: string;
  claimId: string;
  invoiceNumber: string;
  claimAmount: number;
  invoiceAmount: number;
  variance: number;
  status: 'PENDING' | 'MATCHED' | 'DISPUTED' | 'RESOLVED';
}

interface Journal {
  id: string;
  type: 'ACCRUAL' | 'REVERSAL' | 'SETTLEMENT';
  reference: string;
  debitAmount: number;
  creditAmount: number;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
}

// ══════════════════════════════════════════════════════════════════════════════
// Mock Data
// ══════════════════════════════════════════════════════════════════════════════

const mockAccruals: Accrual[] = [
  { id: 'acc-001', promotionId: 'promo-001', period: '2026-01', estimatedAmount: 30000000, actualAmount: null, status: 'PENDING' },
  { id: 'acc-002', promotionId: 'promo-001', period: '2026-02', estimatedAmount: 30000000, actualAmount: 28000000, status: 'CALCULATED' },
  { id: 'acc-003', promotionId: 'promo-002', period: '2026-01', estimatedAmount: 50000000, actualAmount: 50000000, status: 'POSTED' },
];

const mockDeductions: Deduction[] = [
  { id: 'ded-001', claimId: 'claim-001', invoiceNumber: 'INV-001', claimAmount: 5000000, invoiceAmount: 5000000, variance: 0, status: 'MATCHED' },
  { id: 'ded-002', claimId: 'claim-002', invoiceNumber: 'INV-002', claimAmount: 7500000, invoiceAmount: 7000000, variance: 500000, status: 'DISPUTED' },
];

const mockJournals: Journal[] = [
  { id: 'jnl-001', type: 'ACCRUAL', reference: 'ACC-2026-01', debitAmount: 30000000, creditAmount: 30000000, status: 'POSTED' },
  { id: 'jnl-002', type: 'SETTLEMENT', reference: 'SET-2026-01', debitAmount: 5000000, creditAmount: 5000000, status: 'DRAFT' },
];

// ══════════════════════════════════════════════════════════════════════════════
// Accrual Calculation Tests
// ══════════════════════════════════════════════════════════════════════════════

interface AccrualCalculationInput {
  promotionBudget: number;
  promotionDays: number;
  daysInPeriod: number;
  actualSpend?: number;
}

const calculateAccrualAmount = (input: AccrualCalculationInput): number => {
  const dailyRate = input.promotionBudget / input.promotionDays;
  const estimatedAmount = Math.round(dailyRate * input.daysInPeriod);

  // If actual spend is provided, use the lower of estimated or actual
  if (input.actualSpend !== undefined) {
    return Math.min(estimatedAmount, input.actualSpend);
  }

  return estimatedAmount;
};

describe('calculateAccrualAmount', () => {
  it('should calculate monthly accrual for 90-day promotion', () => {
    const result = calculateAccrualAmount({
      promotionBudget: 90000000,
      promotionDays: 90,
      daysInPeriod: 30,
    });

    expect(result).toBe(30000000); // 90M / 90 days * 30 days
  });

  it('should calculate accrual for partial month', () => {
    const result = calculateAccrualAmount({
      promotionBudget: 90000000,
      promotionDays: 90,
      daysInPeriod: 15,
    });

    expect(result).toBe(15000000);
  });

  it('should use actual spend when lower than estimated', () => {
    const result = calculateAccrualAmount({
      promotionBudget: 90000000,
      promotionDays: 90,
      daysInPeriod: 30,
      actualSpend: 25000000,
    });

    expect(result).toBe(25000000);
  });

  it('should use estimated when lower than actual spend', () => {
    const result = calculateAccrualAmount({
      promotionBudget: 90000000,
      promotionDays: 90,
      daysInPeriod: 30,
      actualSpend: 50000000,
    });

    expect(result).toBe(30000000);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Deduction Matching Tests
// ══════════════════════════════════════════════════════════════════════════════

interface ThreeWayMatchResult {
  matched: boolean;
  matchDetails: {
    claimToInvoice: boolean;
    invoiceToReceipt: boolean;
    receiptToClaim: boolean;
  };
  variance: number;
  variancePercent: number;
}

const performThreeWayMatch = (
  claimAmount: number,
  invoiceAmount: number,
  receiptAmount: number,
  tolerancePercent: number = 5
): ThreeWayMatchResult => {
  const avgAmount = (claimAmount + invoiceAmount + receiptAmount) / 3;
  const tolerance = avgAmount * (tolerancePercent / 100);

  const claimToInvoice = Math.abs(claimAmount - invoiceAmount) <= tolerance;
  const invoiceToReceipt = Math.abs(invoiceAmount - receiptAmount) <= tolerance;
  const receiptToClaim = Math.abs(receiptAmount - claimAmount) <= tolerance;

  const maxVariance = Math.max(
    Math.abs(claimAmount - invoiceAmount),
    Math.abs(invoiceAmount - receiptAmount),
    Math.abs(receiptAmount - claimAmount)
  );

  return {
    matched: claimToInvoice && invoiceToReceipt && receiptToClaim,
    matchDetails: { claimToInvoice, invoiceToReceipt, receiptToClaim },
    variance: maxVariance,
    variancePercent: avgAmount > 0 ? Math.round((maxVariance / avgAmount) * 100) : 0,
  };
};

describe('performThreeWayMatch', () => {
  it('should match when all amounts are equal', () => {
    const result = performThreeWayMatch(5000000, 5000000, 5000000);

    expect(result.matched).toBe(true);
    expect(result.variance).toBe(0);
    expect(result.matchDetails.claimToInvoice).toBe(true);
    expect(result.matchDetails.invoiceToReceipt).toBe(true);
    expect(result.matchDetails.receiptToClaim).toBe(true);
  });

  it('should match within tolerance', () => {
    // 5% of 5M = 250K tolerance
    const result = performThreeWayMatch(5000000, 5100000, 4950000);

    expect(result.matched).toBe(true);
  });

  it('should not match when variance exceeds tolerance', () => {
    const result = performThreeWayMatch(5000000, 6000000, 5000000);

    expect(result.matched).toBe(false);
    expect(result.matchDetails.claimToInvoice).toBe(false);
  });

  it('should calculate variance percentage', () => {
    const result = performThreeWayMatch(5000000, 5500000, 5000000);

    expect(result.variancePercent).toBeGreaterThan(0);
  });

  it('should accept custom tolerance', () => {
    const result = performThreeWayMatch(5000000, 5400000, 5000000, 10);

    expect(result.matched).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Journal Entry Validation Tests
// ══════════════════════════════════════════════════════════════════════════════

interface JournalEntry {
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalValidation {
  valid: boolean;
  balanced: boolean;
  errors: string[];
}

const validateJournalEntries = (entries: JournalEntry[]): JournalValidation => {
  const errors: string[] = [];

  if (entries.length === 0) {
    errors.push('Journal must have at least one entry');
    return { valid: false, balanced: false, errors };
  }

  // Check for entries with both debit and credit
  entries.forEach((entry, index) => {
    if (entry.debit > 0 && entry.credit > 0) {
      errors.push(`Entry ${index + 1}: Cannot have both debit and credit`);
    }
    if (entry.debit === 0 && entry.credit === 0) {
      errors.push(`Entry ${index + 1}: Must have either debit or credit`);
    }
    if (entry.debit < 0 || entry.credit < 0) {
      errors.push(`Entry ${index + 1}: Amounts cannot be negative`);
    }
    if (!entry.accountCode) {
      errors.push(`Entry ${index + 1}: Account code is required`);
    }
  });

  // Check balance
  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const balanced = totalDebit === totalCredit;

  if (!balanced) {
    errors.push(`Journal is not balanced: Debit ${totalDebit} != Credit ${totalCredit}`);
  }

  return {
    valid: errors.length === 0,
    balanced,
    errors,
  };
};

describe('validateJournalEntries', () => {
  it('should validate balanced journal', () => {
    const entries: JournalEntry[] = [
      { accountCode: '6100', debit: 5000000, credit: 0, description: 'Trade Expense' },
      { accountCode: '2100', debit: 0, credit: 5000000, description: 'Accrued Liability' },
    ];

    const result = validateJournalEntries(entries);

    expect(result.valid).toBe(true);
    expect(result.balanced).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject unbalanced journal', () => {
    const entries: JournalEntry[] = [
      { accountCode: '6100', debit: 5000000, credit: 0, description: 'Trade Expense' },
      { accountCode: '2100', debit: 0, credit: 4000000, description: 'Accrued Liability' },
    ];

    const result = validateJournalEntries(entries);

    expect(result.valid).toBe(false);
    expect(result.balanced).toBe(false);
    expect(result.errors.some(e => e.includes('not balanced'))).toBe(true);
  });

  it('should reject entry with both debit and credit', () => {
    const entries: JournalEntry[] = [
      { accountCode: '6100', debit: 5000000, credit: 5000000, description: 'Invalid Entry' },
    ];

    const result = validateJournalEntries(entries);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('both debit and credit'))).toBe(true);
  });

  it('should reject entry with no amounts', () => {
    const entries: JournalEntry[] = [
      { accountCode: '6100', debit: 0, credit: 0, description: 'Empty Entry' },
    ];

    const result = validateJournalEntries(entries);

    expect(result.valid).toBe(false);
  });

  it('should reject negative amounts', () => {
    const entries: JournalEntry[] = [
      { accountCode: '6100', debit: -5000000, credit: 0, description: 'Negative' },
    ];

    const result = validateJournalEntries(entries);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('negative'))).toBe(true);
  });

  it('should require account code', () => {
    const entries: JournalEntry[] = [
      { accountCode: '', debit: 5000000, credit: 0, description: 'No Account' },
    ];

    const result = validateJournalEntries(entries);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Account code'))).toBe(true);
  });

  it('should reject empty journal', () => {
    const result = validateJournalEntries([]);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('at least one entry'))).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Finance Statistics Tests
// ══════════════════════════════════════════════════════════════════════════════

interface FinanceStats {
  totalAccrued: number;
  totalPaid: number;
  pendingAmount: number;
  disputedAmount: number;
  matchRate: number;
}

const calculateFinanceStats = (accruals: Accrual[], deductions: Deduction[]): FinanceStats => {
  const totalAccrued = accruals
    .filter(a => a.status === 'POSTED')
    .reduce((sum, a) => sum + (a.actualAmount || a.estimatedAmount), 0);

  const matchedDeductions = deductions.filter(d => d.status === 'MATCHED');
  const totalPaid = matchedDeductions.reduce((sum, d) => sum + d.claimAmount, 0);

  const pendingAmount = accruals
    .filter(a => a.status === 'PENDING' || a.status === 'CALCULATED')
    .reduce((sum, a) => sum + a.estimatedAmount, 0);

  const disputedAmount = deductions
    .filter(d => d.status === 'DISPUTED')
    .reduce((sum, d) => sum + d.variance, 0);

  const matchRate = deductions.length > 0
    ? Math.round((matchedDeductions.length / deductions.length) * 100)
    : 0;

  return { totalAccrued, totalPaid, pendingAmount, disputedAmount, matchRate };
};

describe('calculateFinanceStats', () => {
  it('should calculate total accrued from posted accruals', () => {
    const stats = calculateFinanceStats(mockAccruals, mockDeductions);

    expect(stats.totalAccrued).toBe(50000000); // Only acc-003 is POSTED
  });

  it('should calculate total paid from matched deductions', () => {
    const stats = calculateFinanceStats(mockAccruals, mockDeductions);

    expect(stats.totalPaid).toBe(5000000); // Only ded-001 is MATCHED
  });

  it('should calculate pending amount', () => {
    const stats = calculateFinanceStats(mockAccruals, mockDeductions);

    expect(stats.pendingAmount).toBe(60000000); // acc-001 (30M) + acc-002 (30M)
  });

  it('should calculate disputed amount', () => {
    const stats = calculateFinanceStats(mockAccruals, mockDeductions);

    expect(stats.disputedAmount).toBe(500000); // ded-002 variance
  });

  it('should calculate match rate', () => {
    const stats = calculateFinanceStats(mockAccruals, mockDeductions);

    expect(stats.matchRate).toBe(50); // 1 of 2 deductions matched
  });
});
