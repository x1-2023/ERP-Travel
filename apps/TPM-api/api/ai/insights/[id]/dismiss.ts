/**
 * Dismiss AI Insight API
 * POST /api/ai/insights/:id/dismiss
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Mock dismissing insight
  return res.status(200).json({
    success: true,
    data: {
      id,
      dismissedAt: new Date().toISOString(),
      dismissedById: 'current-user',
    },
  });
}
