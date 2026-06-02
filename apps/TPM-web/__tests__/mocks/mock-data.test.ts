// =============================================================================
// Tests for all src/mocks/data/*.ts mock data files
// Ensures all exports exist, arrays are populated, and objects have expected keys
// =============================================================================

import { describe, it, expect } from 'vitest';

// --- budget-target.ts ---
import {
  mockGeographicUnits,
  mockBudgetsForAllocation,
  mockTargetsForAllocation,
  mockBudgetAllocations,
  mockTargetAllocations,
  buildAllocationTree,
  getBudgetAllocationTree,
  getTargetAllocationTree,
  getGeographicUnitsTree,
} from '@/mocks/data/budget-target';

// --- operations-ai-bi.ts ---
import {
  deliveryStatuses,
  mockDeliveries,
  mockSellData,
  mockInventory,
  mockERPSyncs,
  mockDMSSyncs,
  mockWebhooks,
  insightTypes,
  insightSeverities,
  mockInsights,
  mockRecommendations,
  mockReports,
  mockDashboardKPIs,
  mockChartData,
} from '@/mocks/data/operations-ai-bi';

// --- master-data.ts ---
import {
  customerTypes,
  customerStatuses,
  mockCustomers,
  productCategories,
  productStatuses,
  mockProducts,
  userRoles,
  mockUsers,
  currentUser,
} from '@/mocks/data/master-data';

// --- finance.ts ---
import {
  accrualStatuses,
  mockAccruals,
  deductionStatuses,
  deductionTypes,
  mockDeductions,
  journalStatuses,
  mockJournals,
  chequeStatuses,
  mockCheques,
  mockFinanceStats,
} from '@/mocks/data/finance';

// --- promotions.ts ---
import {
  promotionStatuses,
  promotionTypes,
  mockPromotions,
  mockPromotionStats,
} from '@/mocks/data/promotions';

// --- claims.ts ---
import {
  claimStatuses,
  claimTypes,
  mockClaims,
  mockClaimStats,
} from '@/mocks/data/claims';

// =============================================================================
// BUDGET-TARGET DATA
// =============================================================================

describe('mocks/data/budget-target', () => {
  describe('mockGeographicUnits', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockGeographicUnits)).toBe(true);
      expect(mockGeographicUnits.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockGeographicUnits[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('nameEn');
      expect(first).toHaveProperty('level');
      expect(first).toHaveProperty('parentId');
      expect(first).toHaveProperty('isActive');
      expect(first).toHaveProperty('sortOrder');
      expect(first).toHaveProperty('createdAt');
      expect(first).toHaveProperty('updatedAt');
      expect(first).toHaveProperty('_count');
    });

    it('should contain multiple hierarchy levels', () => {
      const levels = new Set(mockGeographicUnits.map(u => u.level));
      expect(levels.has('COUNTRY')).toBe(true);
      expect(levels.has('REGION')).toBe(true);
      expect(levels.has('PROVINCE')).toBe(true);
      expect(levels.has('DISTRICT')).toBe(true);
    });

    it('country-level item should have null parentId', () => {
      const country = mockGeographicUnits.find(u => u.level === 'COUNTRY');
      expect(country).toBeDefined();
      expect(country!.parentId).toBeNull();
    });

    it('region-level items should have country as parent', () => {
      const regions = mockGeographicUnits.filter(u => u.level === 'REGION');
      expect(regions.length).toBeGreaterThan(0);
      regions.forEach(r => {
        expect(r.parentId).toBeTruthy();
      });
    });
  });

  describe('mockBudgetsForAllocation', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockBudgetsForAllocation)).toBe(true);
      expect(mockBudgetsForAllocation.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockBudgetsForAllocation[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('totalAmount');
      expect(first).toHaveProperty('allocatedAmount');
      expect(first).toHaveProperty('spentAmount');
      expect(first).toHaveProperty('remainingAmount');
      expect(first).toHaveProperty('currency');
      expect(first).toHaveProperty('year');
      expect(first).toHaveProperty('quarter');
      expect(first).toHaveProperty('status');
    });

    it('amounts should be numeric', () => {
      mockBudgetsForAllocation.forEach(b => {
        expect(typeof b.totalAmount).toBe('number');
        expect(typeof b.allocatedAmount).toBe('number');
        expect(typeof b.spentAmount).toBe('number');
        expect(typeof b.remainingAmount).toBe('number');
      });
    });
  });

  describe('mockTargetsForAllocation', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockTargetsForAllocation)).toBe(true);
      expect(mockTargetsForAllocation.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockTargetsForAllocation[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('totalTarget');
      expect(first).toHaveProperty('metric');
      expect(first).toHaveProperty('year');
      expect(first).toHaveProperty('quarter');
      expect(first).toHaveProperty('status');
    });
  });

  describe('mockBudgetAllocations', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockBudgetAllocations)).toBe(true);
      expect(mockBudgetAllocations.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockBudgetAllocations[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('budgetId');
      expect(first).toHaveProperty('budget');
      expect(first).toHaveProperty('geographicUnitId');
      expect(first).toHaveProperty('geographicUnit');
      expect(first).toHaveProperty('allocatedAmount');
      expect(first).toHaveProperty('spentAmount');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('children');
    });

    it('should have items with and without parent', () => {
      const roots = mockBudgetAllocations.filter((a: any) => a.parentId === null);
      const children = mockBudgetAllocations.filter((a: any) => a.parentId !== null);
      expect(roots.length).toBeGreaterThan(0);
      expect(children.length).toBeGreaterThan(0);
    });
  });

  describe('mockTargetAllocations', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockTargetAllocations)).toBe(true);
      expect(mockTargetAllocations.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockTargetAllocations[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('targetId');
      expect(first).toHaveProperty('target');
      expect(first).toHaveProperty('geographicUnitId');
      expect(first).toHaveProperty('geographicUnit');
      expect(first).toHaveProperty('targetValue');
      expect(first).toHaveProperty('achievedValue');
      expect(first).toHaveProperty('metric');
      expect(first).toHaveProperty('progressPercent');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('children');
    });
  });

  describe('buildAllocationTree', () => {
    it('should build a tree from flat list', () => {
      const items = [
        { id: 'a', parentId: null, children: [] as any[] },
        { id: 'b', parentId: 'a', children: [] as any[] },
        { id: 'c', parentId: 'a', children: [] as any[] },
        { id: 'd', parentId: 'b', children: [] as any[] },
      ];
      const tree = buildAllocationTree(items);
      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe('a');
      expect(tree[0].children.length).toBe(2);
      const childB = tree[0].children.find((c: any) => c.id === 'b');
      expect(childB.children.length).toBe(1);
      expect(childB.children[0].id).toBe('d');
    });

    it('should return empty array when no items match parentId', () => {
      const items = [{ id: 'a', parentId: 'nonexistent', children: [] as any[] }];
      const tree = buildAllocationTree(items);
      expect(tree.length).toBe(0);
    });

    it('should handle empty input', () => {
      const tree = buildAllocationTree([]);
      expect(tree).toEqual([]);
    });
  });

  describe('getBudgetAllocationTree', () => {
    it('should return a tree for existing budgetId', () => {
      const tree = getBudgetAllocationTree('bud-1');
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBeGreaterThan(0);
    });

    it('each root node should have children array', () => {
      const tree = getBudgetAllocationTree('bud-1');
      tree.forEach((node: any) => {
        expect(node).toHaveProperty('children');
        expect(Array.isArray(node.children)).toBe(true);
      });
    });

    it('should return empty array for non-existent budgetId', () => {
      const tree = getBudgetAllocationTree('non-existent');
      expect(tree).toEqual([]);
    });
  });

  describe('getTargetAllocationTree', () => {
    it('should return a tree for existing targetId', () => {
      const tree = getTargetAllocationTree('tgt-1');
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent targetId', () => {
      const tree = getTargetAllocationTree('non-existent');
      expect(tree).toEqual([]);
    });
  });

  describe('getGeographicUnitsTree', () => {
    it('should return hierarchical tree of geographic units', () => {
      const tree = getGeographicUnitsTree();
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBeGreaterThan(0);
    });

    it('root should be country level', () => {
      const tree = getGeographicUnitsTree();
      expect(tree[0]).toHaveProperty('id', 'geo-vn');
    });
  });
});

// =============================================================================
// OPERATIONS-AI-BI DATA
// =============================================================================

describe('mocks/data/operations-ai-bi', () => {
  describe('deliveryStatuses', () => {
    it('should be a non-empty readonly array', () => {
      expect(deliveryStatuses.length).toBeGreaterThan(0);
      expect(deliveryStatuses).toContain('PENDING');
      expect(deliveryStatuses).toContain('DELIVERED');
      expect(deliveryStatuses).toContain('CANCELLED');
    });
  });

  describe('mockDeliveries', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockDeliveries)).toBe(true);
      expect(mockDeliveries.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockDeliveries[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('orderId');
      expect(first).toHaveProperty('customerId');
      expect(first).toHaveProperty('customerName');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('scheduledDate');
      expect(first).toHaveProperty('totalItems');
      expect(first).toHaveProperty('totalValue');
    });
  });

  describe('mockSellData', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockSellData)).toBe(true);
      expect(mockSellData.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockSellData[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('customerId');
      expect(first).toHaveProperty('productId');
      expect(first).toHaveProperty('sellIn');
      expect(first).toHaveProperty('sellOut');
      expect(first).toHaveProperty('sellThrough');
      expect(first).toHaveProperty('revenue');
    });
  });

  describe('mockInventory', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockInventory)).toBe(true);
      expect(mockInventory.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockInventory[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('productId');
      expect(first).toHaveProperty('sku');
      expect(first).toHaveProperty('warehouseId');
      expect(first).toHaveProperty('quantity');
      expect(first).toHaveProperty('availableQuantity');
      expect(first).toHaveProperty('minStock');
      expect(first).toHaveProperty('status');
    });
  });

  describe('mockERPSyncs', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockERPSyncs)).toBe(true);
      expect(mockERPSyncs.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockERPSyncs[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('system');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('direction');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('recordsProcessed');
    });
  });

  describe('mockDMSSyncs', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockDMSSyncs)).toBe(true);
      expect(mockDMSSyncs.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockDMSSyncs[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('system');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
    });
  });

  describe('mockWebhooks', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockWebhooks)).toBe(true);
      expect(mockWebhooks.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockWebhooks[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('url');
      expect(first).toHaveProperty('events');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('successRate');
    });
  });

  describe('insightTypes and insightSeverities', () => {
    it('insightTypes should contain expected values', () => {
      expect(insightTypes).toContain('ANOMALY');
      expect(insightTypes).toContain('TREND');
      expect(insightTypes).toContain('OPPORTUNITY');
      expect(insightTypes).toContain('RISK');
    });

    it('insightSeverities should contain expected values', () => {
      expect(insightSeverities).toContain('INFO');
      expect(insightSeverities).toContain('WARNING');
      expect(insightSeverities).toContain('CRITICAL');
    });
  });

  describe('mockInsights', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockInsights)).toBe(true);
      expect(mockInsights.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockInsights[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('severity');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('description');
      expect(first).toHaveProperty('confidence');
      expect(first).toHaveProperty('data');
      expect(first).toHaveProperty('suggestedActions');
      expect(first).toHaveProperty('status');
    });

    it('confidence should be between 0 and 1', () => {
      mockInsights.forEach(insight => {
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('mockRecommendations', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockRecommendations)).toBe(true);
      expect(mockRecommendations.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockRecommendations[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('description');
      expect(first).toHaveProperty('confidence');
      expect(first).toHaveProperty('impact');
      expect(first).toHaveProperty('parameters');
      expect(first).toHaveProperty('status');
    });
  });

  describe('mockReports', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockReports)).toBe(true);
      expect(mockReports.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockReports[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('createdAt');
    });
  });

  describe('mockDashboardKPIs', () => {
    it('should be an object with expected keys', () => {
      expect(mockDashboardKPIs).toHaveProperty('totalRevenue');
      expect(mockDashboardKPIs).toHaveProperty('revenueGrowth');
      expect(mockDashboardKPIs).toHaveProperty('totalPromotions');
      expect(mockDashboardKPIs).toHaveProperty('activePromotions');
      expect(mockDashboardKPIs).toHaveProperty('pendingClaims');
      expect(mockDashboardKPIs).toHaveProperty('claimApprovalRate');
      expect(mockDashboardKPIs).toHaveProperty('avgROI');
      expect(mockDashboardKPIs).toHaveProperty('budgetUtilization');
    });

    it('values should be numeric', () => {
      expect(typeof mockDashboardKPIs.totalRevenue).toBe('number');
      expect(typeof mockDashboardKPIs.revenueGrowth).toBe('number');
      expect(typeof mockDashboardKPIs.totalPromotions).toBe('number');
      expect(typeof mockDashboardKPIs.avgROI).toBe('number');
    });
  });

  describe('mockChartData', () => {
    it('should have revenueByMonth array', () => {
      expect(Array.isArray(mockChartData.revenueByMonth)).toBe(true);
      expect(mockChartData.revenueByMonth.length).toBeGreaterThan(0);
      expect(mockChartData.revenueByMonth[0]).toHaveProperty('month');
      expect(mockChartData.revenueByMonth[0]).toHaveProperty('revenue');
      expect(mockChartData.revenueByMonth[0]).toHaveProperty('target');
    });

    it('should have promotionsByStatus array', () => {
      expect(Array.isArray(mockChartData.promotionsByStatus)).toBe(true);
      expect(mockChartData.promotionsByStatus.length).toBeGreaterThan(0);
      expect(mockChartData.promotionsByStatus[0]).toHaveProperty('status');
      expect(mockChartData.promotionsByStatus[0]).toHaveProperty('count');
    });

    it('should have claimsTrend array', () => {
      expect(Array.isArray(mockChartData.claimsTrend)).toBe(true);
      expect(mockChartData.claimsTrend.length).toBeGreaterThan(0);
      expect(mockChartData.claimsTrend[0]).toHaveProperty('date');
      expect(mockChartData.claimsTrend[0]).toHaveProperty('submitted');
      expect(mockChartData.claimsTrend[0]).toHaveProperty('approved');
    });

    it('should have topCustomers array', () => {
      expect(Array.isArray(mockChartData.topCustomers)).toBe(true);
      expect(mockChartData.topCustomers.length).toBeGreaterThan(0);
      expect(mockChartData.topCustomers[0]).toHaveProperty('name');
      expect(mockChartData.topCustomers[0]).toHaveProperty('revenue');
      expect(mockChartData.topCustomers[0]).toHaveProperty('growth');
    });
  });
});

// =============================================================================
// MASTER-DATA
// =============================================================================

describe('mocks/data/master-data', () => {
  describe('customerTypes', () => {
    it('should contain expected types', () => {
      expect(customerTypes).toContain('RETAILER');
      expect(customerTypes).toContain('DISTRIBUTOR');
      expect(customerTypes).toContain('KEY_ACCOUNT');
    });
  });

  describe('customerStatuses', () => {
    it('should contain expected statuses', () => {
      expect(customerStatuses).toContain('ACTIVE');
      expect(customerStatuses).toContain('INACTIVE');
      expect(customerStatuses).toContain('SUSPENDED');
    });
  });

  describe('mockCustomers', () => {
    it('should be a non-empty array with at least 10 items (5 static + generated)', () => {
      expect(Array.isArray(mockCustomers)).toBe(true);
      expect(mockCustomers.length).toBeGreaterThanOrEqual(10);
    });

    it('first item should have expected keys', () => {
      const first = mockCustomers[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('email');
      expect(first).toHaveProperty('creditLimit');
      expect(first).toHaveProperty('currentDebt');
      expect(first).toHaveProperty('region');
      expect(first).toHaveProperty('tier');
      expect(first).toHaveProperty('totalOrders');
      expect(first).toHaveProperty('totalRevenue');
    });
  });

  describe('productCategories', () => {
    it('should contain expected categories', () => {
      expect(productCategories).toContain('BEVERAGES');
      expect(productCategories).toContain('SNACKS');
      expect(productCategories).toContain('DAIRY');
      expect(productCategories).toContain('PERSONAL_CARE');
      expect(productCategories).toContain('HOUSEHOLD');
    });
  });

  describe('productStatuses', () => {
    it('should contain expected statuses', () => {
      expect(productStatuses).toContain('ACTIVE');
      expect(productStatuses).toContain('INACTIVE');
      expect(productStatuses).toContain('DISCONTINUED');
    });
  });

  describe('mockProducts', () => {
    it('should be a non-empty array with at least 15 items (6 static + generated)', () => {
      expect(Array.isArray(mockProducts)).toBe(true);
      expect(mockProducts.length).toBeGreaterThanOrEqual(15);
    });

    it('first item should have expected keys', () => {
      const first = mockProducts[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('sku');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('category');
      expect(first).toHaveProperty('brand');
      expect(first).toHaveProperty('unit');
      expect(first).toHaveProperty('unitPrice');
      expect(first).toHaveProperty('costPrice');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('barcode');
      expect(first).toHaveProperty('minStock');
      expect(first).toHaveProperty('currentStock');
    });

    it('costPrice should be less than unitPrice for static items', () => {
      const first = mockProducts[0];
      expect(first.costPrice).toBeLessThan(first.unitPrice);
    });
  });

  describe('userRoles', () => {
    it('should contain expected roles', () => {
      expect(userRoles).toContain('ADMIN');
      expect(userRoles).toContain('MANAGER');
      expect(userRoles).toContain('SALES');
      expect(userRoles).toContain('FINANCE');
      expect(userRoles).toContain('VIEWER');
    });
  });

  describe('mockUsers', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockUsers)).toBe(true);
      expect(mockUsers.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockUsers[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('email');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('role');
      expect(first).toHaveProperty('department');
      expect(first).toHaveProperty('status');
    });
  });

  describe('currentUser', () => {
    it('should be the first user (admin)', () => {
      expect(currentUser).toBeDefined();
      expect(currentUser.id).toBe('user-001');
      expect(currentUser.role).toBe('ADMIN');
    });
  });
});

// =============================================================================
// FINANCE DATA
// =============================================================================

describe('mocks/data/finance', () => {
  describe('accrualStatuses', () => {
    it('should contain expected statuses', () => {
      expect(accrualStatuses).toContain('PENDING');
      expect(accrualStatuses).toContain('CALCULATED');
      expect(accrualStatuses).toContain('POSTED');
      expect(accrualStatuses).toContain('REVERSED');
    });
  });

  describe('mockAccruals', () => {
    it('should be a non-empty array with at least 10 items (3 static + generated)', () => {
      expect(Array.isArray(mockAccruals)).toBe(true);
      expect(mockAccruals.length).toBeGreaterThanOrEqual(10);
    });

    it('first item should have expected keys', () => {
      const first = mockAccruals[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('promotionId');
      expect(first).toHaveProperty('promotionCode');
      expect(first).toHaveProperty('period');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('estimatedAmount');
      expect(first).toHaveProperty('glAccountCode');
    });
  });

  describe('deductionStatuses', () => {
    it('should contain expected statuses', () => {
      expect(deductionStatuses).toContain('PENDING');
      expect(deductionStatuses).toContain('APPROVED');
      expect(deductionStatuses).toContain('REJECTED');
      expect(deductionStatuses).toContain('PROCESSED');
    });
  });

  describe('deductionTypes', () => {
    it('should contain expected types', () => {
      expect(deductionTypes).toContain('CLAIM');
      expect(deductionTypes).toContain('PENALTY');
      expect(deductionTypes).toContain('RETURN');
      expect(deductionTypes).toContain('DAMAGE');
      expect(deductionTypes).toContain('OTHER');
    });
  });

  describe('mockDeductions', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockDeductions)).toBe(true);
      expect(mockDeductions.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockDeductions[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('customerId');
      expect(first).toHaveProperty('customerName');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('amount');
    });
  });

  describe('journalStatuses', () => {
    it('should contain expected statuses', () => {
      expect(journalStatuses).toContain('DRAFT');
      expect(journalStatuses).toContain('PENDING');
      expect(journalStatuses).toContain('POSTED');
      expect(journalStatuses).toContain('REVERSED');
    });
  });

  describe('mockJournals', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockJournals)).toBe(true);
      expect(mockJournals.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockJournals[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('description');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('postingDate');
      expect(first).toHaveProperty('totalDebit');
      expect(first).toHaveProperty('totalCredit');
      expect(first).toHaveProperty('lines');
    });

    it('journal lines should balance (debit === credit)', () => {
      mockJournals.forEach(journal => {
        expect(journal.totalDebit).toBe(journal.totalCredit);
      });
    });
  });

  describe('chequeStatuses', () => {
    it('should contain expected statuses', () => {
      expect(chequeStatuses).toContain('DRAFT');
      expect(chequeStatuses).toContain('ISSUED');
      expect(chequeStatuses).toContain('CASHED');
      expect(chequeStatuses).toContain('CANCELLED');
      expect(chequeStatuses).toContain('BOUNCED');
    });
  });

  describe('mockCheques', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(mockCheques)).toBe(true);
      expect(mockCheques.length).toBeGreaterThan(0);
    });

    it('first item should have expected keys', () => {
      const first = mockCheques[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('chequeNumber');
      expect(first).toHaveProperty('bankName');
      expect(first).toHaveProperty('payee');
      expect(first).toHaveProperty('amount');
      expect(first).toHaveProperty('status');
    });
  });

  describe('mockFinanceStats', () => {
    it('should be an object with expected keys', () => {
      expect(mockFinanceStats).toHaveProperty('totalAccruals');
      expect(mockFinanceStats).toHaveProperty('postedAccruals');
      expect(mockFinanceStats).toHaveProperty('pendingDeductions');
      expect(mockFinanceStats).toHaveProperty('processedDeductions');
      expect(mockFinanceStats).toHaveProperty('outstandingCheques');
      expect(mockFinanceStats).toHaveProperty('totalJournalEntries');
    });

    it('values should be numeric', () => {
      expect(typeof mockFinanceStats.totalAccruals).toBe('number');
      expect(typeof mockFinanceStats.postedAccruals).toBe('number');
      expect(typeof mockFinanceStats.pendingDeductions).toBe('number');
      expect(typeof mockFinanceStats.totalJournalEntries).toBe('number');
    });
  });
});

// =============================================================================
// PROMOTIONS DATA
// =============================================================================

describe('mocks/data/promotions', () => {
  describe('promotionStatuses', () => {
    it('should contain expected statuses', () => {
      expect(promotionStatuses).toContain('DRAFT');
      expect(promotionStatuses).toContain('PENDING');
      expect(promotionStatuses).toContain('APPROVED');
      expect(promotionStatuses).toContain('ACTIVE');
      expect(promotionStatuses).toContain('COMPLETED');
      expect(promotionStatuses).toContain('CANCELLED');
      expect(promotionStatuses).toContain('REJECTED');
    });
  });

  describe('promotionTypes', () => {
    it('should contain expected types', () => {
      expect(promotionTypes).toContain('DISCOUNT');
      expect(promotionTypes).toContain('BUNDLE');
      expect(promotionTypes).toContain('GIFT');
      expect(promotionTypes).toContain('REBATE');
      expect(promotionTypes).toContain('DISPLAY');
      expect(promotionTypes).toContain('VOLUME');
    });
  });

  describe('mockPromotions', () => {
    it('should be a non-empty array with at least 24 items (5 static + generated)', () => {
      expect(Array.isArray(mockPromotions)).toBe(true);
      expect(mockPromotions.length).toBeGreaterThanOrEqual(24);
    });

    it('first item should have expected keys', () => {
      const first = mockPromotions[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('description');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('startDate');
      expect(first).toHaveProperty('endDate');
      expect(first).toHaveProperty('budget');
      expect(first).toHaveProperty('spentAmount');
      expect(first).toHaveProperty('targetRevenue');
      expect(first).toHaveProperty('actualRevenue');
      expect(first).toHaveProperty('customerId');
      expect(first).toHaveProperty('products');
      expect(first).toHaveProperty('regions');
    });

    it('products should be an array', () => {
      mockPromotions.forEach(promo => {
        expect(Array.isArray(promo.products)).toBe(true);
      });
    });
  });

  describe('mockPromotionStats', () => {
    it('should be an object with expected keys', () => {
      expect(mockPromotionStats).toHaveProperty('total');
      expect(mockPromotionStats).toHaveProperty('active');
      expect(mockPromotionStats).toHaveProperty('pending');
      expect(mockPromotionStats).toHaveProperty('completed');
      expect(mockPromotionStats).toHaveProperty('draft');
      expect(mockPromotionStats).toHaveProperty('totalBudget');
      expect(mockPromotionStats).toHaveProperty('totalSpent');
      expect(mockPromotionStats).toHaveProperty('totalRevenue');
    });

    it('total should equal mockPromotions length', () => {
      expect(mockPromotionStats.total).toBe(mockPromotions.length);
    });

    it('totalBudget should be sum of all budgets', () => {
      const expectedBudget = mockPromotions.reduce((sum, p) => sum + p.budget, 0);
      expect(mockPromotionStats.totalBudget).toBe(expectedBudget);
    });
  });
});

// =============================================================================
// CLAIMS DATA
// =============================================================================

describe('mocks/data/claims', () => {
  describe('claimStatuses', () => {
    it('should contain expected statuses', () => {
      expect(claimStatuses).toContain('DRAFT');
      expect(claimStatuses).toContain('SUBMITTED');
      expect(claimStatuses).toContain('UNDER_REVIEW');
      expect(claimStatuses).toContain('APPROVED');
      expect(claimStatuses).toContain('REJECTED');
      expect(claimStatuses).toContain('PAID');
      expect(claimStatuses).toContain('CANCELLED');
    });
  });

  describe('claimTypes', () => {
    it('should contain expected types', () => {
      expect(claimTypes).toContain('DISCOUNT');
      expect(claimTypes).toContain('REBATE');
      expect(claimTypes).toContain('DISPLAY');
      expect(claimTypes).toContain('DAMAGE');
      expect(claimTypes).toContain('RETURN');
      expect(claimTypes).toContain('OTHER');
    });
  });

  describe('mockClaims', () => {
    it('should be a non-empty array with at least 12 items (5 static + generated)', () => {
      expect(Array.isArray(mockClaims)).toBe(true);
      expect(mockClaims.length).toBeGreaterThanOrEqual(12);
    });

    it('first item should have expected keys', () => {
      const first = mockClaims[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('promotionId');
      expect(first).toHaveProperty('promotionCode');
      expect(first).toHaveProperty('customerId');
      expect(first).toHaveProperty('customerName');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('amount');
      expect(first).toHaveProperty('description');
      expect(first).toHaveProperty('evidenceUrls');
    });

    it('evidenceUrls should be an array', () => {
      mockClaims.forEach(claim => {
        expect(Array.isArray(claim.evidenceUrls)).toBe(true);
      });
    });
  });

  describe('mockClaimStats', () => {
    it('should be an object with expected keys', () => {
      expect(mockClaimStats).toHaveProperty('total');
      expect(mockClaimStats).toHaveProperty('submitted');
      expect(mockClaimStats).toHaveProperty('underReview');
      expect(mockClaimStats).toHaveProperty('approved');
      expect(mockClaimStats).toHaveProperty('paid');
      expect(mockClaimStats).toHaveProperty('rejected');
      expect(mockClaimStats).toHaveProperty('totalAmount');
      expect(mockClaimStats).toHaveProperty('approvedAmount');
      expect(mockClaimStats).toHaveProperty('paidAmount');
    });

    it('total should equal mockClaims length', () => {
      expect(mockClaimStats.total).toBe(mockClaims.length);
    });

    it('all stat values should be numeric', () => {
      expect(typeof mockClaimStats.total).toBe('number');
      expect(typeof mockClaimStats.totalAmount).toBe('number');
      expect(typeof mockClaimStats.approvedAmount).toBe('number');
      expect(typeof mockClaimStats.paidAmount).toBe('number');
    });
  });
});
