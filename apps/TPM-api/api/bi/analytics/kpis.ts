/**
 * BI Analytics KPIs API
 * GET /api/bi/analytics/kpis
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const kpis = [
    {
      name: 'Total Promotions',
      value: 156,
      change: 12.5,
      trend: 'UP',
      format: 'NUMBER',
    },
    {
      name: 'Active Budget',
      value: 2500000000,
      change: -5.2,
      trend: 'DOWN',
      format: 'CURRENCY',
    },
    {
      name: 'Claims Processed',
      value: 423,
      change: 8.3,
      trend: 'UP',
      format: 'NUMBER',
    },
    {
      name: 'Avg ROI',
      value: 24.5,
      change: 3.2,
      trend: 'UP',
      format: 'PERCENTAGE',
    },
    {
      name: 'Claim Approval Rate',
      value: 78.5,
      change: 2.1,
      trend: 'UP',
      format: 'PERCENTAGE',
    },
    {
      name: 'Budget Utilization',
      value: 65.2,
      change: 5.5,
      trend: 'UP',
      format: 'PERCENTAGE',
    },
  ];

  return res.status(200).json({
    success: true,
    data: kpis,
  });
}
