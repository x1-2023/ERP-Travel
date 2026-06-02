/**
 * Take Action on AI Insight API
 * POST /api/ai/insights/:id/action
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { action, notes } = req.body;

  // Mock taking action
  return res.status(200).json({
    success: true,
    data: {
      id,
      actionTaken: true,
      actionHistory: [
        {
          action,
          notes,
          userId: 'current-user',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  });
}
