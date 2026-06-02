/**
 * Voice Command History API
 * GET /api/voice/commands
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const mockCommandHistory = [
  {
    id: 'cmd-001',
    userId: 'user-001',
    transcript: 'Show me active promotions',
    intent: 'LIST_PROMOTIONS',
    entities: {},
    action: 'NAVIGATE',
    response: 'Found 15 active promotions',
    success: true,
    duration: 120,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmd-002',
    userId: 'user-001',
    transcript: "What's the status of PROMO-2024-001",
    intent: 'GET_PROMOTION_STATUS',
    entities: { promotionCode: 'PROMO-2024-001' },
    action: 'NAVIGATE',
    response: 'Promotion PROMO-2024-001 is ACTIVE',
    success: true,
    duration: 85,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmd-003',
    userId: 'user-001',
    transcript: 'Approve claim CLM-0042',
    intent: 'APPROVE_CLAIM',
    entities: { claimCode: 'CLM-0042' },
    action: 'NOTIFY',
    response: 'Claim CLM-0042 has been approved',
    success: true,
    duration: 150,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'cmd-004',
    userId: 'user-001',
    transcript: 'Show weather',
    intent: 'UNKNOWN',
    entities: {},
    action: 'NONE',
    response: "Sorry, I didn't understand that command",
    success: false,
    duration: 45,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { page = '1', pageSize = '20' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(pageSize as string, 10);
  const start = (pageNum - 1) * pageSizeNum;
  const end = start + pageSizeNum;

  const paginatedData = mockCommandHistory.slice(start, end);

  return res.status(200).json({
    success: true,
    data: paginatedData,
    pagination: {
      page: pageNum,
      pageSize: pageSizeNum,
      total: mockCommandHistory.length,
      totalPages: Math.ceil(mockCommandHistory.length / pageSizeNum),
    },
  });
}
