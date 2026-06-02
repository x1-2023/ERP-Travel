/**
 * Execute BI Report API
 * GET /api/bi/reports/:id/execute
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { format = 'JSON' } = req.query;

  // Mock report data
  const reportData = [
    {
      code: 'PROMO-2024-001',
      name: 'Q1 Discount Campaign',
      status: 'ACTIVE',
      budget: 100000000,
      spentAmount: 45000000,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
    },
    {
      code: 'PROMO-2024-002',
      name: 'Valentine Bundle',
      status: 'COMPLETED',
      budget: 50000000,
      spentAmount: 48500000,
      startDate: '2024-02-01',
      endDate: '2024-02-28',
    },
    {
      code: 'PROMO-2024-003',
      name: 'Spring Sale',
      status: 'ACTIVE',
      budget: 75000000,
      spentAmount: 30000000,
      startDate: '2024-03-01',
      endDate: '2024-04-30',
    },
    {
      code: 'PROMO-2024-004',
      name: 'Customer Loyalty Rebate',
      status: 'DRAFT',
      budget: 200000000,
      spentAmount: 0,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
    },
    {
      code: 'PROMO-2024-005',
      name: 'Flash Sale Weekend',
      status: 'PENDING',
      budget: 25000000,
      spentAmount: 0,
      startDate: '2024-03-15',
      endDate: '2024-03-17',
    },
  ];

  // For JSON format, return data directly
  if (format === 'JSON') {
    return res.status(200).json({
      success: true,
      data: reportData,
      columns: ['code', 'name', 'status', 'budget', 'spentAmount', 'startDate', 'endDate'],
    });
  }

  // For other formats, in a real implementation we would generate the file
  // For now, return a mock response
  return res.status(200).json({
    success: true,
    message: `Report would be generated as ${format}`,
    data: reportData,
  });
}
