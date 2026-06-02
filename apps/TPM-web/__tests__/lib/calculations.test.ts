/**
 * Calculations Test Suite
 * Tests for business calculation functions
 */

import { describe, it, expect } from 'vitest';

// ══════════════════════════════════════════════════════════════════════════════
// ROI Calculation
// ══════════════════════════════════════════════════════════════════════════════

const calculateROI = (revenue: number, investment: number): number => {
  if (investment === 0) return 0;
  return ((revenue - investment) / investment) * 100;
};

describe('calculateROI', () => {
  it('should calculate positive ROI correctly', () => {
    // Revenue 150M, Investment 50M => ROI = (150-50)/50 * 100 = 200%
    expect(calculateROI(150000000, 50000000)).toBe(200);
  });

  it('should handle zero investment', () => {
    expect(calculateROI(100000, 0)).toBe(0);
  });

  it('should calculate negative ROI', () => {
    // Revenue 30M, Investment 50M => ROI = (30-50)/50 * 100 = -40%
    expect(calculateROI(30000000, 50000000)).toBe(-40);
  });

  it('should handle break-even', () => {
    expect(calculateROI(100000000, 100000000)).toBe(0);
  });

  it('should handle small numbers', () => {
    expect(calculateROI(150, 100)).toBe(50);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Sell-Through Calculation
// ══════════════════════════════════════════════════════════════════════════════

const calculateSellThrough = (sellIn: number, sellOut: number): number => {
  if (sellIn === 0) return 0;
  return Math.round((sellOut / sellIn) * 100);
};

describe('calculateSellThrough', () => {
  it('should calculate sell-through rate correctly', () => {
    expect(calculateSellThrough(1000, 850)).toBe(85);
  });

  it('should handle zero sell-in', () => {
    expect(calculateSellThrough(0, 0)).toBe(0);
  });

  it('should handle 100% sell-through', () => {
    expect(calculateSellThrough(1000, 1000)).toBe(100);
  });

  it('should handle over 100% (stock replenished)', () => {
    expect(calculateSellThrough(1000, 1200)).toBe(120);
  });

  it('should round to nearest integer', () => {
    expect(calculateSellThrough(1000, 857)).toBe(86);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Budget Utilization
// ══════════════════════════════════════════════════════════════════════════════

const calculateBudgetUtilization = (spent: number, budget: number): number => {
  if (budget === 0) return 0;
  return Math.round((spent / budget) * 100);
};

describe('calculateBudgetUtilization', () => {
  it('should calculate utilization percentage', () => {
    expect(calculateBudgetUtilization(30000000, 100000000)).toBe(30);
  });

  it('should handle zero budget', () => {
    expect(calculateBudgetUtilization(1000, 0)).toBe(0);
  });

  it('should handle overspending', () => {
    expect(calculateBudgetUtilization(150000000, 100000000)).toBe(150);
  });

  it('should handle zero spent', () => {
    expect(calculateBudgetUtilization(0, 100000000)).toBe(0);
  });

  it('should round to nearest integer', () => {
    expect(calculateBudgetUtilization(33333333, 100000000)).toBe(33);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Projected Spending
// ══════════════════════════════════════════════════════════════════════════════

const projectSpending = (currentSpent: number, daysElapsed: number, totalDays: number): number => {
  if (daysElapsed === 0) return 0;
  const dailyRate = currentSpent / daysElapsed;
  return Math.round(dailyRate * totalDays);
};

describe('projectSpending', () => {
  it('should project end-of-period spending', () => {
    // Spent 30M in 10 days, total 30 days => projected 90M
    expect(projectSpending(30000000, 10, 30)).toBe(90000000);
  });

  it('should handle zero days elapsed', () => {
    expect(projectSpending(0, 0, 30)).toBe(0);
  });

  it('should handle one day elapsed', () => {
    expect(projectSpending(1000000, 1, 30)).toBe(30000000);
  });

  it('should handle completed period', () => {
    expect(projectSpending(90000000, 30, 30)).toBe(90000000);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Variance Calculation
// ══════════════════════════════════════════════════════════════════════════════

const calculateVariance = (actual: number, target: number): { amount: number; percent: number } => {
  const amount = actual - target;
  const percent = target === 0 ? 0 : Math.round((amount / target) * 100);
  return { amount, percent };
};

describe('calculateVariance', () => {
  it('should calculate positive variance', () => {
    const result = calculateVariance(120, 100);
    expect(result.amount).toBe(20);
    expect(result.percent).toBe(20);
  });

  it('should calculate negative variance', () => {
    const result = calculateVariance(80, 100);
    expect(result.amount).toBe(-20);
    expect(result.percent).toBe(-20);
  });

  it('should handle zero target', () => {
    const result = calculateVariance(100, 0);
    expect(result.amount).toBe(100);
    expect(result.percent).toBe(0);
  });

  it('should handle exact match', () => {
    const result = calculateVariance(100, 100);
    expect(result.amount).toBe(0);
    expect(result.percent).toBe(0);
  });

  it('should round percentage to integer', () => {
    const result = calculateVariance(133, 100);
    expect(result.percent).toBe(33);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Accrual Calculation
// ══════════════════════════════════════════════════════════════════════════════

interface AccrualInput {
  promotionBudget: number;
  startDate: string;
  endDate: string;
  currentDate: string;
  actualSpend?: number;
}

const calculateAccrual = (input: AccrualInput): { monthlyAccrual: number; totalAccrued: number } => {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const current = new Date(input.currentDate);

  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  const monthlyAccrual = Math.round(input.promotionBudget / totalMonths);

  const monthsElapsed = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth()) + 1;
  const totalAccrued = Math.min(monthsElapsed * monthlyAccrual, input.promotionBudget);

  return { monthlyAccrual, totalAccrued };
};

describe('calculateAccrual', () => {
  it('should calculate monthly accrual for 3-month period', () => {
    const result = calculateAccrual({
      promotionBudget: 90000000,
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      currentDate: '2026-01-31',
    });

    expect(result.monthlyAccrual).toBe(30000000);
    expect(result.totalAccrued).toBe(30000000);
  });

  it('should calculate accrued amount for 2 months elapsed', () => {
    const result = calculateAccrual({
      promotionBudget: 90000000,
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      currentDate: '2026-02-28',
    });

    expect(result.totalAccrued).toBe(60000000);
  });

  it('should not exceed total budget', () => {
    const result = calculateAccrual({
      promotionBudget: 90000000,
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      currentDate: '2026-12-31',
    });

    expect(result.totalAccrued).toBe(90000000);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Deduction Matching
// ══════════════════════════════════════════════════════════════════════════════

interface DeductionMatchInput {
  claimAmount: number;
  invoiceAmount: number;
  tolerance?: number;
}

const calculateDeductionMatch = (input: DeductionMatchInput): { matched: boolean; variance: number; variancePercent: number } => {
  const tolerance = input.tolerance ?? 0;
  const variance = Math.abs(input.claimAmount - input.invoiceAmount);
  const variancePercent = input.claimAmount === 0 ? 0 : Math.round((variance / input.claimAmount) * 100);
  const matched = variance <= tolerance;

  return { matched, variance, variancePercent };
};

describe('calculateDeductionMatch', () => {
  it('should match when amounts are equal', () => {
    const result = calculateDeductionMatch({
      claimAmount: 5000000,
      invoiceAmount: 5000000,
    });

    expect(result.matched).toBe(true);
    expect(result.variance).toBe(0);
  });

  it('should detect mismatch when no tolerance', () => {
    const result = calculateDeductionMatch({
      claimAmount: 5000000,
      invoiceAmount: 4500000,
    });

    expect(result.matched).toBe(false);
    expect(result.variance).toBe(500000);
    expect(result.variancePercent).toBe(10);
  });

  it('should match within tolerance', () => {
    const result = calculateDeductionMatch({
      claimAmount: 5000000,
      invoiceAmount: 4990000,
      tolerance: 100000,
    });

    expect(result.matched).toBe(true);
  });

  it('should not match beyond tolerance', () => {
    const result = calculateDeductionMatch({
      claimAmount: 5000000,
      invoiceAmount: 4800000,
      tolerance: 100000,
    });

    expect(result.matched).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Days Remaining Calculation
// ══════════════════════════════════════════════════════════════════════════════

const calculateDaysRemaining = (endDate: string, fromDate?: string): number => {
  const end = new Date(endDate);
  const from = fromDate ? new Date(fromDate) : new Date();
  const diff = end.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

describe('calculateDaysRemaining', () => {
  it('should calculate days remaining', () => {
    const result = calculateDaysRemaining('2026-01-31', '2026-01-01');
    expect(result).toBe(30);
  });

  it('should return 0 for same day', () => {
    const result = calculateDaysRemaining('2026-01-15', '2026-01-15');
    expect(result).toBe(0);
  });

  it('should return negative for past date', () => {
    const result = calculateDaysRemaining('2026-01-01', '2026-01-15');
    expect(result).toBeLessThan(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Promotion Performance Score
// ══════════════════════════════════════════════════════════════════════════════

interface PerformanceInput {
  actualSales: number;
  targetSales: number;
  budgetSpent: number;
  budgetAllocated: number;
}

const calculatePerformanceScore = (input: PerformanceInput): number => {
  const salesAchievement = input.targetSales === 0 ? 0 : (input.actualSales / input.targetSales) * 100;
  const budgetEfficiency = input.budgetSpent === 0 ? 100 : (input.budgetAllocated / input.budgetSpent) * (input.actualSales / input.targetSales) * 100;

  // Weighted score: 70% sales achievement, 30% budget efficiency
  const score = Math.round(salesAchievement * 0.7 + budgetEfficiency * 0.3);
  return Math.min(150, Math.max(0, score)); // Cap between 0-150
};

describe('calculatePerformanceScore', () => {
  it('should calculate score for good performance', () => {
    const score = calculatePerformanceScore({
      actualSales: 120000000,
      targetSales: 100000000,
      budgetSpent: 10000000,
      budgetAllocated: 10000000,
    });

    expect(score).toBeGreaterThan(100);
  });

  it('should calculate score for under-performance', () => {
    const score = calculatePerformanceScore({
      actualSales: 80000000,
      targetSales: 100000000,
      budgetSpent: 10000000,
      budgetAllocated: 10000000,
    });

    expect(score).toBeLessThan(100);
  });

  it('should cap score at 150', () => {
    const score = calculatePerformanceScore({
      actualSales: 300000000,
      targetSales: 100000000,
      budgetSpent: 5000000,
      budgetAllocated: 10000000,
    });

    expect(score).toBe(150);
  });

  it('should not go below 0', () => {
    const score = calculatePerformanceScore({
      actualSales: 0,
      targetSales: 100000000,
      budgetSpent: 10000000,
      budgetAllocated: 10000000,
    });

    expect(score).toBeGreaterThanOrEqual(0);
  });
});
