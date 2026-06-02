/**
 * AI Insights API
 * GET /api/ai/insights - List insights
 * POST /api/ai/insights - Not used (use /generate instead)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data for insights
const mockInsights = [
  {
    id: 'ins-001',
    type: 'ANOMALY',
    category: 'PROMOTION',
    title: 'Promotion PROMO-2024-001 is overspending',
    description: 'Spent 75% of budget but only 40% of time elapsed',
    severity: 'WARNING',
    confidence: 0.85,
    data: { spendRate: 0.75, expectedRate: 0.4, promotionId: 'promo-001' },
    entityType: 'Promotion',
    entityId: 'promo-001',
    actionRequired: true,
    actionTaken: false,
    createdAt: new Date().toISOString(),
    createdById: 'system',
  },
  {
    id: 'ins-002',
    type: 'RISK',
    category: 'CLAIM',
    title: 'Low claim approval rate for PROMO-2024-002',
    description: 'Only 25% of claims approved out of 12 submitted',
    severity: 'WARNING',
    confidence: 0.8,
    data: { claimRate: 0.25, totalClaims: 12 },
    entityType: 'Promotion',
    entityId: 'promo-002',
    actionRequired: true,
    actionTaken: false,
    createdAt: new Date().toISOString(),
    createdById: 'system',
  },
  {
    id: 'ins-003',
    type: 'TREND',
    category: 'SALES',
    title: 'Sales declining trend detected',
    description: 'Sales decreased by 15.2% vs previous period',
    severity: 'CRITICAL',
    confidence: 0.9,
    data: { changePercent: -15.2, direction: 'DECLINING' },
    actionRequired: true,
    actionTaken: false,
    createdAt: new Date().toISOString(),
    createdById: 'system',
  },
  {
    id: 'ins-004',
    type: 'OPPORTUNITY',
    category: 'PROMOTION',
    title: 'Underutilized Q1 Marketing Fund',
    description: 'Fund has 60% remaining with 30 days left',
    severity: 'INFO',
    confidence: 0.95,
    data: { utilizationRate: 0.4, daysRemaining: 30, unusedAmount: 150000000 },
    entityType: 'Fund',
    entityId: 'fund-001',
    actionRequired: false,
    actionTaken: false,
    createdAt: new Date().toISOString(),
    createdById: 'system',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { type, category, severity, actionRequired, page = '1', pageSize = '20' } = req.query;

    let filtered = [...mockInsights];

    if (type) {
      filtered = filtered.filter((i) => i.type === type);
    }
    if (category) {
      filtered = filtered.filter((i) => i.category === category);
    }
    if (severity) {
      filtered = filtered.filter((i) => i.severity === severity);
    }
    if (actionRequired === 'true') {
      filtered = filtered.filter((i) => i.actionRequired && !i.actionTaken);
    }

    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);
    const start = (pageNum - 1) * pageSizeNum;
    const end = start + pageSizeNum;
    const paginatedData = filtered.slice(start, end);

    // Calculate summary
    const summary = {
      total: filtered.length,
      byType: {
        ANOMALY: filtered.filter((i) => i.type === 'ANOMALY').length,
        TREND: filtered.filter((i) => i.type === 'TREND').length,
        OPPORTUNITY: filtered.filter((i) => i.type === 'OPPORTUNITY').length,
        RISK: filtered.filter((i) => i.type === 'RISK').length,
      },
      bySeverity: {
        CRITICAL: filtered.filter((i) => i.severity === 'CRITICAL').length,
        WARNING: filtered.filter((i) => i.severity === 'WARNING').length,
        INFO: filtered.filter((i) => i.severity === 'INFO').length,
      },
      actionRequired: filtered.filter((i) => i.actionRequired && !i.actionTaken).length,
    };

    return res.status(200).json({
      success: true,
      data: paginatedData,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSizeNum),
      },
      summary,
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
