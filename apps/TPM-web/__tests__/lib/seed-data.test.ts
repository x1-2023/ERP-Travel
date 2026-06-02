// =============================================================================
// Seed Data Integrity Tests
// Note: src/lib/seed/ directory does not exist in this project.
// These tests exercise the mock data modules that serve as seed data,
// verifying cross-module referential integrity and data consistency.
// This provides additional coverage on the mock data exports.
// =============================================================================

import { describe, it, expect } from 'vitest';

// Import all mock data modules (same data that would be used for seeding)
import {
  mockGeographicUnits,
  mockBudgetsForAllocation,
  mockTargetsForAllocation,
  mockBudgetAllocations,
  mockTargetAllocations,
} from '@/mocks/data/budget-target';

import {
  mockCustomers,
  mockProducts,
  mockUsers,
} from '@/mocks/data/master-data';

import {
  mockPromotions,
  mockPromotionStats,
} from '@/mocks/data/promotions';

import {
  mockClaims,
  mockClaimStats,
} from '@/mocks/data/claims';

import {
  mockAccruals,
  mockDeductions,
  mockJournals,
  mockCheques,
  mockFinanceStats,
} from '@/mocks/data/finance';

import {
  mockDeliveries,
  mockSellData,
  mockInventory,
  mockERPSyncs,
  mockDMSSyncs,
  mockWebhooks,
  mockInsights,
  mockRecommendations,
  mockReports,
  mockDashboardKPIs,
  mockChartData,
} from '@/mocks/data/operations-ai-bi';

// =============================================================================
// REFERENTIAL INTEGRITY: BUDGET-TARGET DATA
// =============================================================================

describe('seed data integrity: budget-target', () => {
  it('budget allocations should reference valid budgetIds', () => {
    const budgetIds = new Set(mockBudgetsForAllocation.map(b => b.id));
    mockBudgetAllocations.forEach((alloc: any) => {
      expect(budgetIds.has(alloc.budgetId)).toBe(true);
    });
  });

  it('target allocations should reference valid targetIds', () => {
    const targetIds = new Set(mockTargetsForAllocation.map(t => t.id));
    mockTargetAllocations.forEach((alloc: any) => {
      expect(targetIds.has(alloc.targetId)).toBe(true);
    });
  });

  it('budget allocations should reference valid geographic unit IDs', () => {
    const geoIds = new Set(mockGeographicUnits.map(g => g.id));
    mockBudgetAllocations.forEach((alloc: any) => {
      expect(geoIds.has(alloc.geographicUnitId)).toBe(true);
    });
  });

  it('target allocations should reference valid geographic unit IDs', () => {
    const geoIds = new Set(mockGeographicUnits.map(g => g.id));
    mockTargetAllocations.forEach((alloc: any) => {
      expect(geoIds.has(alloc.geographicUnitId)).toBe(true);
    });
  });

  it('all budget allocation parentIds should reference valid allocation IDs or be null', () => {
    const allIds = new Set(mockBudgetAllocations.map((a: any) => a.id));
    mockBudgetAllocations.forEach((alloc: any) => {
      if (alloc.parentId !== null) {
        expect(allIds.has(alloc.parentId)).toBe(true);
      }
    });
  });

  it('all target allocation parentIds should reference valid allocation IDs or be null', () => {
    const allIds = new Set(mockTargetAllocations.map((a: any) => a.id));
    mockTargetAllocations.forEach((alloc: any) => {
      if (alloc.parentId !== null) {
        expect(allIds.has(alloc.parentId)).toBe(true);
      }
    });
  });

  it('geographic unit parentIds should reference valid IDs or be null', () => {
    const allIds = new Set(mockGeographicUnits.map(g => g.id));
    mockGeographicUnits.forEach(unit => {
      if (unit.parentId !== null) {
        expect(allIds.has(unit.parentId)).toBe(true);
      }
    });
  });
});

// =============================================================================
// REFERENTIAL INTEGRITY: CLAIMS -> PROMOTIONS -> CUSTOMERS
// =============================================================================

describe('seed data integrity: claims-promotions-customers', () => {
  it('claims should reference valid customer IDs from master data', () => {
    const customerIds = new Set(mockCustomers.map(c => c.id));
    // Only check the 5 static claims which use known customer IDs
    const staticClaims = mockClaims.slice(0, 5);
    staticClaims.forEach(claim => {
      expect(customerIds.has(claim.customerId)).toBe(true);
    });
  });

  it('claims should reference valid promotion IDs', () => {
    const promoIds = new Set(mockPromotions.map(p => p.id));
    const staticClaims = mockClaims.slice(0, 5);
    staticClaims.forEach(claim => {
      expect(promoIds.has(claim.promotionId)).toBe(true);
    });
  });

  it('static promotions should reference valid customer IDs', () => {
    const customerIds = new Set(mockCustomers.map(c => c.id));
    const staticPromos = mockPromotions.slice(0, 5);
    staticPromos.forEach(promo => {
      expect(customerIds.has(promo.customerId)).toBe(true);
    });
  });
});

// =============================================================================
// REFERENTIAL INTEGRITY: FINANCE DATA
// =============================================================================

describe('seed data integrity: finance', () => {
  it('static accruals should reference valid promotion IDs', () => {
    const promoIds = new Set(mockPromotions.map(p => p.id));
    const staticAccruals = mockAccruals.slice(0, 3);
    staticAccruals.forEach(accrual => {
      expect(promoIds.has(accrual.promotionId)).toBe(true);
    });
  });

  it('deductions referencing claims should use valid claim IDs', () => {
    const claimIds = new Set(mockClaims.map(c => c.id));
    mockDeductions.forEach(deduction => {
      if ('claimId' in deduction && deduction.claimId) {
        expect(claimIds.has(deduction.claimId)).toBe(true);
      }
    });
  });

  it('deductions should reference valid customer IDs', () => {
    const customerIds = new Set(mockCustomers.map(c => c.id));
    mockDeductions.forEach(deduction => {
      expect(customerIds.has(deduction.customerId)).toBe(true);
    });
  });

  it('cheques with claimId should reference valid claims', () => {
    const claimIds = new Set(mockClaims.map(c => c.id));
    mockCheques.forEach(cheque => {
      if (cheque.claimId) {
        expect(claimIds.has(cheque.claimId)).toBe(true);
      }
    });
  });

  it('cheques with journalId should reference valid journals', () => {
    const journalIds = new Set(mockJournals.map(j => j.id));
    mockCheques.forEach(cheque => {
      if ('journalId' in cheque && cheque.journalId) {
        expect(journalIds.has(cheque.journalId as string)).toBe(true);
      }
    });
  });

  it('finance stats totalJournalEntries should match journals count', () => {
    expect(mockFinanceStats.totalJournalEntries).toBe(mockJournals.length);
  });
});

// =============================================================================
// REFERENTIAL INTEGRITY: OPERATIONS DATA
// =============================================================================

describe('seed data integrity: operations', () => {
  it('deliveries should reference valid customer IDs', () => {
    const customerIds = new Set(mockCustomers.map(c => c.id));
    mockDeliveries.forEach(delivery => {
      expect(customerIds.has(delivery.customerId)).toBe(true);
    });
  });

  it('sell data should reference valid customer IDs', () => {
    const customerIds = new Set(mockCustomers.map(c => c.id));
    mockSellData.forEach(sell => {
      expect(customerIds.has(sell.customerId)).toBe(true);
    });
  });

  it('sell data should reference valid product IDs', () => {
    const productIds = new Set(mockProducts.map(p => p.id));
    mockSellData.forEach(sell => {
      expect(productIds.has(sell.productId)).toBe(true);
    });
  });

  it('inventory should reference valid product IDs', () => {
    const productIds = new Set(mockProducts.map(p => p.id));
    mockInventory.forEach(inv => {
      expect(productIds.has(inv.productId)).toBe(true);
    });
  });
});

// =============================================================================
// DATA CONSISTENCY: COMPUTED STATS
// =============================================================================

describe('seed data integrity: computed stats consistency', () => {
  it('promotionStats.total should match mockPromotions length', () => {
    expect(mockPromotionStats.total).toBe(mockPromotions.length);
  });

  it('claimStats.total should match mockClaims length', () => {
    expect(mockClaimStats.total).toBe(mockClaims.length);
  });

  it('claimStats status counts should sum to total', () => {
    const sum = mockClaimStats.submitted
      + mockClaimStats.underReview
      + mockClaimStats.approved
      + mockClaimStats.paid
      + mockClaimStats.rejected;
    // Note: some claims might be DRAFT or CANCELLED, which are not explicitly summed
    expect(sum).toBeLessThanOrEqual(mockClaimStats.total);
  });

  it('promotionStats.totalSpent should equal sum of all spentAmounts', () => {
    const expected = mockPromotions.reduce((sum, p) => sum + p.spentAmount, 0);
    expect(mockPromotionStats.totalSpent).toBe(expected);
  });

  it('promotionStats.totalRevenue should equal sum of all actualRevenue', () => {
    const expected = mockPromotions.reduce((sum, p) => sum + p.actualRevenue, 0);
    expect(mockPromotionStats.totalRevenue).toBe(expected);
  });
});

// =============================================================================
// ALL IDs SHOULD BE UNIQUE WITHIN THEIR DATASETS
// =============================================================================

describe('seed data integrity: unique IDs', () => {
  it('geographic unit IDs should be unique', () => {
    const ids = mockGeographicUnits.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('budget IDs should be unique', () => {
    const ids = mockBudgetsForAllocation.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('target IDs should be unique', () => {
    const ids = mockTargetsForAllocation.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('budget allocation IDs should be unique', () => {
    const ids = mockBudgetAllocations.map((a: any) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('target allocation IDs should be unique', () => {
    const ids = mockTargetAllocations.map((a: any) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('customer IDs should be unique', () => {
    const ids = mockCustomers.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('product IDs should be unique', () => {
    const ids = mockProducts.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('user IDs should be unique', () => {
    const ids = mockUsers.map(u => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('promotion IDs should be unique', () => {
    const ids = mockPromotions.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('claim IDs should be unique', () => {
    const ids = mockClaims.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('accrual IDs should be unique', () => {
    const ids = mockAccruals.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('deduction IDs should be unique', () => {
    const ids = mockDeductions.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('journal IDs should be unique', () => {
    const ids = mockJournals.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cheque IDs should be unique', () => {
    const ids = mockCheques.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('delivery IDs should be unique', () => {
    const ids = mockDeliveries.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sell data IDs should be unique', () => {
    const ids = mockSellData.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('inventory IDs should be unique', () => {
    const ids = mockInventory.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('insight IDs should be unique', () => {
    const ids = mockInsights.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('recommendation IDs should be unique', () => {
    const ids = mockRecommendations.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('report IDs should be unique', () => {
    const ids = mockReports.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ERP sync IDs should be unique', () => {
    const ids = mockERPSyncs.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('DMS sync IDs should be unique', () => {
    const ids = mockDMSSyncs.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('webhook IDs should be unique', () => {
    const ids = mockWebhooks.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// =============================================================================
// DATA SHAPE VALIDATION: Ensure all generated items match static items shape
// =============================================================================

describe('seed data integrity: generated data shape', () => {
  it('all customers should have same keys as the first customer', () => {
    const expectedKeys = Object.keys(mockCustomers[0]).sort();
    mockCustomers.forEach(customer => {
      expect(Object.keys(customer).sort()).toEqual(expectedKeys);
    });
  });

  it('all products should have same keys as the first product', () => {
    const expectedKeys = Object.keys(mockProducts[0]).sort();
    mockProducts.forEach(product => {
      expect(Object.keys(product).sort()).toEqual(expectedKeys);
    });
  });

  it('all promotions should have id, code, name, type, status, budget keys', () => {
    mockPromotions.forEach(promo => {
      expect(promo).toHaveProperty('id');
      expect(promo).toHaveProperty('code');
      expect(promo).toHaveProperty('name');
      expect(promo).toHaveProperty('type');
      expect(promo).toHaveProperty('status');
      expect(promo).toHaveProperty('budget');
    });
  });

  it('all claims should have id, code, type, status, amount keys', () => {
    mockClaims.forEach(claim => {
      expect(claim).toHaveProperty('id');
      expect(claim).toHaveProperty('code');
      expect(claim).toHaveProperty('type');
      expect(claim).toHaveProperty('status');
      expect(claim).toHaveProperty('amount');
    });
  });

  it('mockDashboardKPIs should have all expected fields', () => {
    const kpis = mockDashboardKPIs;
    expect(typeof kpis.totalRevenue).toBe('number');
    expect(typeof kpis.revenueGrowth).toBe('number');
    expect(typeof kpis.totalPromotions).toBe('number');
    expect(typeof kpis.activePromotions).toBe('number');
    expect(typeof kpis.pendingClaims).toBe('number');
    expect(typeof kpis.claimApprovalRate).toBe('number');
    expect(typeof kpis.avgROI).toBe('number');
    expect(typeof kpis.budgetUtilization).toBe('number');
  });

  it('mockChartData should have all expected chart datasets', () => {
    expect(mockChartData).toHaveProperty('revenueByMonth');
    expect(mockChartData).toHaveProperty('promotionsByStatus');
    expect(mockChartData).toHaveProperty('claimsTrend');
    expect(mockChartData).toHaveProperty('topCustomers');
  });
});
