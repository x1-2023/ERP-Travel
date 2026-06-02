/**
 * BI Analytics Dashboard API
 * GET /api/bi/analytics/dashboard
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
      subtitle: 'This period',
    },
    {
      name: 'Active Budget',
      value: 2500000000,
      change: -5.2,
      trend: 'DOWN',
      format: 'CURRENCY',
      subtitle: 'Allocated',
    },
    {
      name: 'Claims Processed',
      value: 423,
      change: 8.3,
      trend: 'UP',
      format: 'NUMBER',
      subtitle: 'This period',
    },
    {
      name: 'Avg ROI',
      value: 24.5,
      change: 3.2,
      trend: 'UP',
      format: 'PERCENTAGE',
      subtitle: 'Return on investment',
    },
  ];

  const charts = [
    {
      id: 'promotions-by-type',
      title: 'Promotions by Type',
      type: 'PIE',
      data: [
        { label: 'Discount', value: 45 },
        { label: 'Bundle', value: 25 },
        { label: 'Gift', value: 20 },
        { label: 'Rebate', value: 10 },
      ],
    },
    {
      id: 'monthly-spend',
      title: 'Monthly Spend Trend',
      type: 'BAR',
      data: [
        { label: 'Jan', value: 120000000 },
        { label: 'Feb', value: 150000000 },
        { label: 'Mar', value: 180000000 },
        { label: 'Apr', value: 140000000 },
        { label: 'May', value: 165000000 },
        { label: 'Jun', value: 190000000 },
      ],
    },
    {
      id: 'top-customers',
      title: 'Top Customers by Promotion Value',
      type: 'BAR',
      data: [
        { label: 'ABC Corp', value: 350000000 },
        { label: 'XYZ Ltd', value: 280000000 },
        { label: 'DEF Inc', value: 220000000 },
        { label: 'GHI Co', value: 180000000 },
        { label: 'JKL Group', value: 150000000 },
      ],
    },
    {
      id: 'claim-status',
      title: 'Claims by Status',
      type: 'PIE',
      data: [
        { label: 'Approved', value: 320 },
        { label: 'Pending', value: 75 },
        { label: 'Rejected', value: 28 },
      ],
    },
  ];

  return res.status(200).json({
    success: true,
    kpis,
    charts,
  });
}
