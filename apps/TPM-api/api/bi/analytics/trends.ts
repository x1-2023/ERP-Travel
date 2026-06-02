/**
 * BI Analytics Trends API
 * GET /api/bi/analytics/trends
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { metric = 'promotions' } = req.query;

  let trends: { period: string; value: number; change: number }[];

  switch (metric) {
    case 'promotions':
      trends = [
        { period: 'Jan', value: 45, change: 0 },
        { period: 'Feb', value: 52, change: 15.5 },
        { period: 'Mar', value: 48, change: -7.7 },
        { period: 'Apr', value: 61, change: 27.1 },
        { period: 'May', value: 55, change: -9.8 },
        { period: 'Jun', value: 67, change: 21.8 },
      ];
      break;

    case 'claims':
      trends = [
        { period: 'Jan', value: 120, change: 0 },
        { period: 'Feb', value: 145, change: 20.8 },
        { period: 'Mar', value: 138, change: -4.8 },
        { period: 'Apr', value: 162, change: 17.4 },
        { period: 'May', value: 155, change: -4.3 },
        { period: 'Jun', value: 178, change: 14.8 },
      ];
      break;

    case 'spend':
      trends = [
        { period: 'Jan', value: 120000000, change: 0 },
        { period: 'Feb', value: 150000000, change: 25 },
        { period: 'Mar', value: 180000000, change: 20 },
        { period: 'Apr', value: 140000000, change: -22.2 },
        { period: 'May', value: 165000000, change: 17.9 },
        { period: 'Jun', value: 190000000, change: 15.2 },
      ];
      break;

    case 'roi':
      trends = [
        { period: 'Jan', value: 18.5, change: 0 },
        { period: 'Feb', value: 21.2, change: 14.6 },
        { period: 'Mar', value: 19.8, change: -6.6 },
        { period: 'Apr', value: 23.5, change: 18.7 },
        { period: 'May', value: 22.1, change: -6.0 },
        { period: 'Jun', value: 25.8, change: 16.7 },
      ];
      break;

    default:
      trends = [];
  }

  return res.status(200).json({
    success: true,
    data: trends,
    metric,
  });
}
