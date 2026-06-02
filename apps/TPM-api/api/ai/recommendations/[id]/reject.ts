/**
 * Reject AI Recommendation API
 * POST /api/ai/recommendations/:id/reject
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { reason } = req.body;

  return res.status(200).json({
    success: true,
    data: {
      id,
      status: 'REJECTED',
      rejectedReason: reason || 'No reason provided',
      rejectedAt: new Date().toISOString(),
      rejectedById: 'current-user',
    },
  });
}
