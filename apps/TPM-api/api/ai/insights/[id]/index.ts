/**
 * Single AI Insight API
 * GET /api/ai/insights/:id
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Mock insight detail
    const insight = {
      id,
      type: 'ANOMALY',
      category: 'PROMOTION',
      title: 'Promotion is overspending',
      description: 'Spent 75% of budget but only 40% of time elapsed',
      severity: 'WARNING',
      confidence: 0.85,
      data: { spendRate: 0.75, expectedRate: 0.4 },
      entityType: 'Promotion',
      entityId: 'promo-001',
      actionRequired: true,
      actionTaken: false,
      createdAt: new Date().toISOString(),
      createdById: 'system',
      suggestedActions: [
        'Review promotion budget allocation',
        'Adjust spending rate',
        'Extend promotion duration',
        'Contact sales team for review',
      ],
    };

    return res.status(200).json({ success: true, data: insight });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
