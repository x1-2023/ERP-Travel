/**
 * AI Recommendations API
 * GET /api/ai/recommendations - List recommendations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const mockRecommendations = [
  {
    id: 'rec-001',
    type: 'PROMOTION_OPTIMIZATION',
    title: 'Optimize PROMO-2024-001 for better ROI',
    description: 'Similar promotions achieved 35% ROI. Consider adjusting parameters.',
    confidence: 0.82,
    impact: {
      currentROI: 18,
      potentialROI: 35,
      uplift: 17,
    },
    parameters: {
      suggestedDuration: 45,
      suggestedDiscount: 15,
      suggestedBudget: 200000000,
    },
    reasoning: 'Based on 12 similar promotions, optimal duration is 45 days with 15% discount',
    status: 'PENDING',
    entityType: 'Promotion',
    entityId: 'promo-001',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rec-002',
    type: 'BUDGET_ALLOCATION',
    title: 'Underutilized fund: Q1 Marketing Budget',
    description: 'Only 35% utilized with 25 days remaining',
    confidence: 0.9,
    impact: {
      unusedBudget: 325000000,
      potentialPromotions: 5,
    },
    parameters: {
      recommendedAction: 'CREATE_PROMOTIONS',
      suggestedCount: 5,
    },
    reasoning: 'Fund will expire in 25 days with 325M VND unused',
    status: 'PENDING',
    entityType: 'Fund',
    entityId: 'fund-001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec-003',
    type: 'CUSTOMER_TARGETING',
    title: 'High-value customer opportunity: ABC Distribution',
    description: 'Customer score 85 but only 1 active promotion',
    confidence: 0.75,
    impact: {
      customerScore: 0.85,
      potentialIncrease: 25,
    },
    parameters: {
      recommendedPromotionTypes: ['DISCOUNT', 'REBATE'],
      suggestedProducts: ['Product A', 'Product B'],
    },
    reasoning: 'Customer has high sell-out growth and excellent payment history',
    status: 'PENDING',
    entityType: 'Customer',
    entityId: 'cust-001',
    createdAt: new Date().toISOString(),
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { type, status, entityType, page = '1', pageSize = '20' } = req.query;

    let filtered = [...mockRecommendations];

    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (entityType) {
      filtered = filtered.filter((r) => r.entityType === entityType);
    }

    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);
    const start = (pageNum - 1) * pageSizeNum;
    const end = start + pageSizeNum;
    const paginatedData = filtered.slice(start, end);

    const summary = {
      total: filtered.length,
      pending: filtered.filter((r) => r.status === 'PENDING').length,
      accepted: filtered.filter((r) => r.status === 'ACCEPTED').length,
      avgConfidence:
        filtered.length > 0
          ? filtered.reduce((sum, r) => sum + r.confidence, 0) / filtered.length
          : 0,
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
