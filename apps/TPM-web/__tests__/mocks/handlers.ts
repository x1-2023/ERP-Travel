/**
 * MSW Request Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw';

const API_URL = '/api';

// Mock Data
export const mockPromotion = {
  id: '1',
  code: 'PROMO-001',
  name: 'Summer Sale',
  description: 'Summer promotional campaign',
  status: 'ACTIVE',
  startDate: '2024-01-01',
  endDate: '2024-03-31',
  budget: 100000000,
  actualSpend: 45000000,
  promotionType: 'TRADE_PROMOTION',
  mechanicType: 'DISCOUNT',
  customer: {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC Corp',
    channel: 'MODERN_TRADE',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  fund: {
    id: 'fund-1',
    code: 'FUND001',
    name: 'Trade Fund Q1',
    fundType: 'TRADE_FUND',
    totalBudget: 500000000,
    allocatedBudget: 200000000,
    utilizedBudget: 100000000,
    availableBudget: 300000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  createdBy: {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    company: { id: 'comp-1', name: 'Company' },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export const mockPromotions = [
  mockPromotion,
  {
    ...mockPromotion,
    id: '2',
    code: 'PROMO-002',
    name: 'Winter Campaign',
    status: 'DRAFT',
  },
  {
    ...mockPromotion,
    id: '3',
    code: 'PROMO-003',
    name: 'Flash Sale',
    status: 'PENDING_APPROVAL',
  },
];

export const mockCustomers = [
  {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC Corp',
    channel: 'MODERN_TRADE',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cust-2',
    code: 'CUST002',
    name: 'XYZ Ltd',
    channel: 'GENERAL_TRADE',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockProducts = [
  {
    id: 'prod-1',
    sku: 'SKU001',
    name: 'Product A',
    category: 'Beverages',
    brand: 'Brand X',
    price: 50000,
    unit: 'bottle',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockBudgets = [
  {
    id: 'budget-1',
    code: 'BUD-2024-001',
    name: 'Q1 Trade Budget',
    category: 'TRADE',
    year: 2024,
    totalAmount: 500000000,
    allocatedAmount: 300000000,
    spentAmount: 150000000,
    status: 'APPROVED',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'budget-2',
    code: 'BUD-2024-002',
    name: 'Q2 Marketing Budget',
    category: 'MARKETING',
    year: 2024,
    totalAmount: 250000000,
    allocatedAmount: 100000000,
    spentAmount: 50000000,
    status: 'DRAFT',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockClaims = [
  {
    id: 'claim-1',
    code: 'CLM-001',
    promotionId: '1',
    customerId: 'cust-1',
    claimDate: '2024-02-01',
    claimAmount: 5000000,
    approvedAmount: null,
    status: 'DRAFT',
    description: 'Monthly claim',
    invoiceNumber: 'INV-001',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: 'claim-2',
    code: 'CLM-002',
    promotionId: '1',
    customerId: 'cust-2',
    claimDate: '2024-02-15',
    claimAmount: 7500000,
    approvedAmount: 7000000,
    status: 'APPROVED',
    description: 'Quarterly claim',
    invoiceNumber: 'INV-002',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
];

export const mockFunds = [
  {
    id: 'fund-1',
    code: 'FUND001',
    name: 'Trade Fund Q1',
    fundType: 'TRADE_FUND',
    totalBudget: 500000000,
    allocatedBudget: 200000000,
    utilizedBudget: 100000000,
    availableBudget: 300000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'fund-2',
    code: 'FUND002',
    name: 'Marketing Fund',
    fundType: 'MARKETING_FUND',
    totalBudget: 250000000,
    allocatedBudget: 100000000,
    utilizedBudget: 50000000,
    availableBudget: 150000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// Handlers
export const handlers = [
  // Promotions
  http.get(`${API_URL}/promotions`, () => {
    return HttpResponse.json({
      success: true,
      data: mockPromotions,
      metadata: {
        totalCount: mockPromotions.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get(`${API_URL}/promotions/:id`, ({ params }) => {
    const promotion = mockPromotions.find((p) => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: promotion });
  }),

  http.post(`${API_URL}/promotions`, async ({ request }) => {
    const body = await request.json();
    const newPromotion = {
      ...mockPromotion,
      ...body,
      id: String(Date.now()),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newPromotion }, { status: 201 });
  }),

  http.patch(`${API_URL}/promotions/:id`, async ({ params, request }) => {
    const body = await request.json();
    const promotion = mockPromotions.find((p) => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...promotion, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete(`${API_URL}/promotions/:id`, ({ params }) => {
    const promotion = mockPromotions.find((p) => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true });
  }),

  // Customers
  http.get(`${API_URL}/customers`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCustomers,
      metadata: {
        totalCount: mockCustomers.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  // Products
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json({
      success: true,
      data: mockProducts,
      metadata: {
        totalCount: mockProducts.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  // Auth
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockPromotion.createdBy,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }
    return HttpResponse.json(
      { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
      { status: 401 }
    );
  }),

  // Dashboard stats
  http.get(`${API_URL}/dashboard/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalPromotions: 156,
        activeBudget: 2500000000,
        totalClaims: 423,
        avgROI: 24.5,
      },
    });
  }),

  // Funds
  http.get(`${API_URL}/funds`, () => {
    return HttpResponse.json({
      success: true,
      data: mockFunds,
      metadata: {
        totalCount: mockFunds.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get(`${API_URL}/funds/:id`, ({ params }) => {
    const fund = mockFunds.find((f) => f.id === params.id);
    if (!fund) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Fund not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: fund });
  }),

  http.post(`${API_URL}/funds`, async ({ request }) => {
    const body = await request.json();
    const newFund = {
      ...mockFunds[0],
      ...body,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newFund }, { status: 201 });
  }),

  http.patch(`${API_URL}/funds/:id`, async ({ params, request }) => {
    const body = await request.json();
    const fund = mockFunds.find((f) => f.id === params.id);
    if (!fund) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Fund not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...fund, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete(`${API_URL}/funds/:id`, ({ params }) => {
    const fund = mockFunds.find((f) => f.id === params.id);
    if (!fund) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Fund not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true });
  }),

  // Promotions submit/approve/reject
  http.post(`${API_URL}/promotions/:id/submit`, () => {
    return HttpResponse.json({ success: true, data: { status: 'SUBMITTED' } });
  }),
  http.post(`${API_URL}/promotions/:id/approve`, () => {
    return HttpResponse.json({ success: true, data: { status: 'APPROVED' } });
  }),
  http.post(`${API_URL}/promotions/:id/reject`, () => {
    return HttpResponse.json({ success: true, data: { status: 'REJECTED' } });
  }),

  // Budgets
  http.get(`${API_URL}/budgets`, () => {
    return HttpResponse.json({
      success: true,
      data: mockBudgets,
      metadata: { totalCount: mockBudgets.length, pageSize: 10, pageNumber: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });
  }),
  http.get(`${API_URL}/budgets/years`, () => {
    return HttpResponse.json({ success: true, data: [2024, 2023, 2022] });
  }),
  http.get(`${API_URL}/budgets/:id/approval-history`, () => {
    return HttpResponse.json({ success: true, data: { timeline: [], summary: { totalSteps: 0 } } });
  }),
  http.get(`${API_URL}/budgets/:id/health-score`, () => {
    return HttpResponse.json({ success: true, data: { healthScore: 85, status: 'GOOD' } });
  }),
  http.get(`${API_URL}/budgets/:id/comparison`, () => {
    return HttpResponse.json({ success: true, data: { current: mockBudgets[0], previous: null, changes: {} } });
  }),
  http.get(`${API_URL}/budgets/:id`, ({ params }) => {
    const budget = mockBudgets.find((b: any) => b.id === params.id);
    if (!budget) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: budget });
  }),
  http.post(`${API_URL}/budgets`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { ...mockBudgets[0], ...(body as object), id: String(Date.now()) } }, { status: 201 });
  }),
  http.patch(`${API_URL}/budgets/:id`, async ({ params, request }) => {
    const body = await request.json();
    const budget = mockBudgets.find((b: any) => b.id === params.id);
    if (!budget) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: { ...budget, ...(body as object) } });
  }),
  http.delete(`${API_URL}/budgets/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/budgets/:id/submit`, () => {
    return HttpResponse.json({ success: true, data: { status: 'SUBMITTED' } });
  }),
  http.post(`${API_URL}/budgets/:id/review`, () => {
    return HttpResponse.json({ success: true, data: { status: 'APPROVED' } });
  }),

  // Claims
  http.get(`${API_URL}/claims`, () => {
    return HttpResponse.json({
      success: true,
      data: mockClaims,
      metadata: { totalCount: mockClaims.length, pageSize: 10, pageNumber: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });
  }),
  http.get(`${API_URL}/claims/:id`, ({ params }) => {
    const claim = mockClaims.find((c: any) => c.id === params.id);
    if (!claim) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: claim });
  }),
  http.post(`${API_URL}/claims`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { ...mockClaims[0], ...(body as object), id: String(Date.now()) } }, { status: 201 });
  }),
  http.patch(`${API_URL}/claims/:id`, async ({ params, request }) => {
    const body = await request.json();
    const claim = mockClaims.find((c: any) => c.id === params.id);
    if (!claim) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: { ...claim, ...(body as object) } });
  }),
  http.delete(`${API_URL}/claims/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/claims/:id/submit`, () => {
    return HttpResponse.json({ success: true, data: { status: 'SUBMITTED' } });
  }),
  http.post(`${API_URL}/claims/:id/approve`, () => {
    return HttpResponse.json({ success: true, data: { status: 'APPROVED' } });
  }),
  http.post(`${API_URL}/claims/:id/reject`, () => {
    return HttpResponse.json({ success: true, data: { status: 'REJECTED' } });
  }),

  // Customers detail
  http.get(`${API_URL}/customers/:id`, ({ params }) => {
    const customer = mockCustomers.find((c: any) => c.id === params.id);
    if (!customer) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: customer });
  }),

  // Products detail
  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p: any) => p.id === params.id);
    if (!product) return HttpResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } }, { status: 404 });
    return HttpResponse.json({ success: true, data: product });
  }),

  // Dashboard chart endpoints
  http.get(`${API_URL}/dashboard/kpi`, () => {
    return HttpResponse.json({ success: true, data: [{ period: '2024-01', revenue: 100000000, spend: 30000000, roi: 23.5, claimsProcessed: 45 }] });
  }),
  http.get(`${API_URL}/dashboard/activity`, () => {
    return HttpResponse.json({ success: true, data: [{ id: 'act-1', type: 'PROMOTION_CREATED', message: 'New promotion created', user: { name: 'Admin' }, createdAt: '2024-01-15' }] });
  }),
  http.get(`${API_URL}/dashboard/charts/:type`, () => {
    return HttpResponse.json({ success: true, data: { data: [{ name: 'Category A', value: 100 }] } });
  }),

  // Auth me endpoint
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({ success: true, data: { id: 'user-1', email: 'admin@example.com', name: 'Admin User', role: 'ADMIN', company: { id: 'comp-1', name: 'Company' } } });
  }),

  // Funds utilization
  http.get(`${API_URL}/funds/:id/utilization`, ({ params }) => {
    return HttpResponse.json({ success: true, data: { fundId: params.id, utilizationRate: 45.5, allocated: 200000000, spent: 91000000 } });
  }),

  // ──────────────────────────────────────────────────────────
  // DMS Integration
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/integration/dms`, () => {
    return HttpResponse.json({ data: [{ id: 'dms-1', name: 'DMS Connection 1', type: 'SAP', status: 'ACTIVE' }], summary: { total: 1, active: 1, pendingSync: 0 } });
  }),
  http.get(`${API_URL}/integration/dms/:id`, ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'DMS Connection 1', type: 'SAP', status: 'ACTIVE', stats: { totalRecords: 100, totalSellOut: 50, totalValue: 1000000 } });
  }),
  http.post(`${API_URL}/integration/dms`, () => {
    return HttpResponse.json({ id: 'dms-new', name: 'New DMS' }, { status: 201 });
  }),
  http.put(`${API_URL}/integration/dms/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/integration/dms/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/integration/dms/:id/sync`, () => {
    return HttpResponse.json({ data: { success: true, recordsSynced: 50, errors: [] } });
  }),
  http.post(`${API_URL}/integration/dms/:id/push`, () => {
    return HttpResponse.json({ data: { success: true, recordsPushed: 25, errors: [] } });
  }),

  // ──────────────────────────────────────────────────────────
  // ERP Integration
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/integration/erp`, () => {
    return HttpResponse.json({ data: [{ id: 'erp-1', name: 'ERP Connection 1', type: 'SAP', status: 'ACTIVE' }], summary: { total: 1, active: 1, byType: { SAP: 1 }, lastSyncErrors: 0 } });
  }),
  http.get(`${API_URL}/integration/erp/:id/logs`, () => {
    return HttpResponse.json({ data: [{ id: 'log-1', status: 'SUCCESS', entityType: 'PRODUCT', recordsProcessed: 100 }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
  }),
  http.get(`${API_URL}/integration/erp/:id`, ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'ERP Connection 1', type: 'SAP', status: 'ACTIVE', recentLogs: [], stats: { totalSyncs: 10, successRate: 95, avgDuration: 120, lastErrors: [] } });
  }),
  http.post(`${API_URL}/integration/erp`, () => {
    return HttpResponse.json({ id: 'erp-new', name: 'New ERP' }, { status: 201 });
  }),
  http.put(`${API_URL}/integration/erp/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/integration/erp/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/integration/erp/:id/test`, () => {
    return HttpResponse.json({ data: { success: true, latency: 150, version: '1.0' } });
  }),
  http.post(`${API_URL}/integration/erp/:id/sync`, () => {
    return HttpResponse.json({ success: true, recordsSynced: 200 });
  }),

  // ──────────────────────────────────────────────────────────
  // Security
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/integration/security/api-keys`, () => {
    return HttpResponse.json({ data: [{ id: 'key-1', name: 'Test Key', isActive: true, prefix: 'pk_test' }], summary: { total: 1, active: 1, expiringSoon: 0 } });
  }),
  http.get(`${API_URL}/integration/security/api-keys/:id`, ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Test Key', isActive: true, prefix: 'pk_test' });
  }),
  http.post(`${API_URL}/integration/security/api-keys`, () => {
    return HttpResponse.json({ data: { id: 'key-new', name: 'New Key', isActive: true, key: 'pk_test_abc123' } }, { status: 201 });
  }),
  http.delete(`${API_URL}/integration/security/api-keys/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.get(`${API_URL}/integration/security/audit-logs`, () => {
    return HttpResponse.json({ data: [{ id: 'log-1', action: 'CREATE', entityType: 'PROMOTION', userId: 'user-1', timestamp: '2024-01-01' }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
  }),
  http.get(`${API_URL}/integration/security/audit-logs/:entityType/:entityId`, ({ params }) => {
    return HttpResponse.json({ entityType: params.entityType, entityId: params.entityId, entityInfo: null, logs: [], totalChanges: 0 });
  }),
  http.get(`${API_URL}/integration/security/dashboard`, () => {
    return HttpResponse.json({ apiKeys: { total: 5, active: 3, expiringSoon: 1, totalUsage: 10000 }, audit: { todayLogins: 15, todayActions: 230, recentSensitiveActions: [], actionsByType: [], entityTypes: [] } });
  }),

  // ──────────────────────────────────────────────────────────
  // Webhooks
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/integration/webhooks`, () => {
    return HttpResponse.json({ data: [{ id: 'wh-1', url: 'https://example.com/webhook', isActive: true }], summary: { total: 1, active: 1, deliveredToday: 10, failedToday: 0 } });
  }),
  http.get(`${API_URL}/integration/webhooks/:id/deliveries`, () => {
    return HttpResponse.json({ data: [{ id: 'del-1', status: 'SUCCESS', event: 'promotion.created' }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
  }),
  http.get(`${API_URL}/integration/webhooks/:id`, ({ params }) => {
    return HttpResponse.json({ id: params.id, url: 'https://example.com/webhook', isActive: true, recentDeliveries: [], stats: { totalDeliveries: 100, successfulDeliveries: 95, failedDeliveries: 5, successRate: 95 } });
  }),
  http.post(`${API_URL}/integration/webhooks`, () => {
    return HttpResponse.json({ id: 'wh-new', url: 'https://example.com/new' }, { status: 201 });
  }),
  http.put(`${API_URL}/integration/webhooks/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/integration/webhooks/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/integration/webhooks/:id/test`, () => {
    return HttpResponse.json({ data: { delivered: true, responseStatus: 200, latency: 150 } });
  }),
  http.post(`${API_URL}/integration/webhooks/:id/retry`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ──────────────────────────────────────────────────────────
  // Planning - Templates
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/planning/templates`, () => {
    return HttpResponse.json({ success: true, data: [{ id: 'tmpl-1', code: 'TMPL-001', name: 'Template A', type: 'DISCOUNT', isActive: true }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }, summary: { total: 1, active: 1, inactive: 0, byType: { DISCOUNT: 1 } } });
  }),
  http.get(`${API_URL}/planning/templates/:id/versions`, ({ params }) => {
    return HttpResponse.json({ success: true, data: { template: { id: params.id, code: 'TMPL-001', name: 'Template A' }, versions: [{ id: 'v1', version: 1 }], totalVersions: 1 } });
  }),
  http.get(`${API_URL}/planning/templates/:id`, ({ params }) => {
    return HttpResponse.json({ success: true, data: { id: params.id, code: 'TMPL-001', name: 'Template A', type: 'DISCOUNT', isActive: true, versions: [], promotions: [] } });
  }),
  http.post(`${API_URL}/planning/templates`, () => {
    return HttpResponse.json({ success: true, data: { id: 'tmpl-new', code: 'TMPL-002', name: 'New Template' } }, { status: 201 });
  }),
  http.put(`${API_URL}/planning/templates/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/planning/templates/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/planning/templates/:id/apply`, () => {
    return HttpResponse.json({ success: true, data: { promotionId: 'promo-new' } });
  }),

  // ──────────────────────────────────────────────────────────
  // Finance - Accruals
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/finance/accruals`, () => {
    return HttpResponse.json({ data: [{ id: 'acc-1', period: '2026-01', amount: 30000000, status: 'PENDING' }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }, summary: { totalAmount: 30000000, pendingCount: 1 } });
  }),
  http.get(`${API_URL}/finance/accruals/:id`, ({ params }) => {
    return HttpResponse.json({ data: { id: params.id, period: '2026-01', amount: 30000000, status: 'PENDING' } });
  }),
  http.post(`${API_URL}/finance/accruals/calculate`, () => {
    return HttpResponse.json({ success: true, data: [{ id: 'acc-calc', amount: 30000000 }] });
  }),
  http.put(`${API_URL}/finance/accruals/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/finance/accruals/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/finance/accruals/:id/post`, () => {
    return HttpResponse.json({ success: true, data: { status: 'POSTED' } });
  }),
  http.post(`${API_URL}/finance/accruals/post-batch`, () => {
    return HttpResponse.json({ success: true, data: { posted: 3, failed: 0 } });
  }),
  http.post(`${API_URL}/finance/accruals/:id/reverse`, () => {
    return HttpResponse.json({ success: true, data: { status: 'REVERSED' } });
  }),

  // ──────────────────────────────────────────────────────────
  // Finance - Deductions
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/finance/deductions`, () => {
    return HttpResponse.json({ data: [{ id: 'ded-1', code: 'DED-001', amount: 5000000, status: 'PENDING' }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }, summary: { totalAmount: 5000000, pendingCount: 1 } });
  }),
  http.get(`${API_URL}/finance/deductions/:id/suggestions`, ({ params }) => {
    return HttpResponse.json({ data: [{ id: 'sug-1', claimId: 'claim-1', confidence: 0.95 }] });
  }),
  http.get(`${API_URL}/finance/deductions/:id`, ({ params }) => {
    return HttpResponse.json({ data: { id: params.id, code: 'DED-001', amount: 5000000, status: 'PENDING' } });
  }),
  http.post(`${API_URL}/finance/deductions`, () => {
    return HttpResponse.json({ success: true, data: { id: 'ded-new', code: 'DED-002' } }, { status: 201 });
  }),
  http.put(`${API_URL}/finance/deductions/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/finance/deductions/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/finance/deductions/:id/match`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/finance/deductions/:id/dispute`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_URL}/finance/deductions/:id/resolve`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ──────────────────────────────────────────────────────────
  // Baselines
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/baselines`, () => {
    return HttpResponse.json({ data: [{ id: 'bl-1', year: 2026, period: 'Q1', baselineType: 'VOLUME', value: 10000 }], metadata: { totalCount: 1 } });
  }),
  http.get(`${API_URL}/baselines/:id`, ({ params }) => {
    return HttpResponse.json({ data: { id: params.id, year: 2026, period: 'Q1', baselineType: 'VOLUME', value: 10000 } });
  }),
  http.post(`${API_URL}/baselines`, () => {
    return HttpResponse.json({ success: true, data: { id: 'bl-new' } }, { status: 201 });
  }),
  http.patch(`${API_URL}/baselines/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/baselines/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ──────────────────────────────────────────────────────────
  // Geographic Units
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/geographic-units`, () => {
    return HttpResponse.json({ data: [{ id: 'geo-1', code: 'VN', name: 'Vietnam', level: 'COUNTRY', isActive: true, sortOrder: 1 }] });
  }),
  http.get(`${API_URL}/geographic-units/:id`, ({ params }) => {
    return HttpResponse.json({ data: { id: params.id, code: 'VN', name: 'Vietnam', level: 'COUNTRY', isActive: true, sortOrder: 1 } });
  }),
  http.post(`${API_URL}/geographic-units`, () => {
    return HttpResponse.json({ success: true, data: { id: 'geo-new' } }, { status: 201 });
  }),
  http.patch(`${API_URL}/geographic-units/:id`, () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete(`${API_URL}/geographic-units/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ──────────────────────────────────────────────────────────
  // Claims AI
  // ──────────────────────────────────────────────────────────
  http.get(`${API_URL}/claims-ai/stats`, () => {
    return HttpResponse.json({ data: { totalProcessed: 100, autoMatched: 85, pendingReview: 15, accuracy: 95.5 } });
  }),
  http.get(`${API_URL}/claims-ai/pending`, () => {
    return HttpResponse.json({ data: [{ id: 'claim-p1', code: 'CLM-P001', amount: 5000000, status: 'PENDING' }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
  }),
  http.get(`${API_URL}/claims-ai/match/:claimId`, ({ params }) => {
    return HttpResponse.json({ data: { claimId: params.claimId, matchedPromotionId: 'promo-1', confidence: 0.92, matchDetails: {} } });
  }),
  http.post(`${API_URL}/claims-ai/process`, () => {
    return HttpResponse.json({ success: true, data: { processed: true } });
  }),
  http.post(`${API_URL}/claims-ai/batch-process`, () => {
    return HttpResponse.json({ success: true, data: { processed: 3, failed: 0 } });
  }),
];
