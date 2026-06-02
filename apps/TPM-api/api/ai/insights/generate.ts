/**
 * Generate AI Insights API
 * POST /api/ai/insights/generate
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { category = 'ALL' } = req.body;

  // Simulate generating insights
  const generatedInsights = [];

  if (category === 'PROMOTION' || category === 'ALL') {
    generatedInsights.push({
      id: `ins-gen-${Date.now()}-1`,
      type: 'ANOMALY',
      category: 'PROMOTION',
      title: 'High spend velocity detected',
      description: 'Promotion spending faster than expected based on timeline',
      severity: 'WARNING',
      confidence: 0.82,
      data: { detected: true },
      actionRequired: true,
      actionTaken: false,
      createdAt: new Date().toISOString(),
      createdById: 'ai-system',
    });
  }

  if (category === 'CLAIM' || category === 'ALL') {
    generatedInsights.push({
      id: `ins-gen-${Date.now()}-2`,
      type: 'RISK',
      category: 'CLAIM',
      title: 'Unusual claim pattern detected',
      description: 'Claims from single customer increased 200% this week',
      severity: 'WARNING',
      confidence: 0.75,
      data: { detected: true },
      actionRequired: true,
      actionTaken: false,
      createdAt: new Date().toISOString(),
      createdById: 'ai-system',
    });
  }

  if (category === 'SALES' || category === 'ALL') {
    generatedInsights.push({
      id: `ins-gen-${Date.now()}-3`,
      type: 'TREND',
      category: 'SALES',
      title: 'Positive sales trend in Northern region',
      description: 'Sales up 18% compared to last month',
      severity: 'INFO',
      confidence: 0.88,
      data: { detected: true },
      actionRequired: false,
      actionTaken: false,
      createdAt: new Date().toISOString(),
      createdById: 'ai-system',
    });
  }

  return res.status(200).json({
    success: true,
    generated: generatedInsights.length,
    insights: generatedInsights,
  });
}
