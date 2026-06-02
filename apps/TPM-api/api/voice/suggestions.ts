/**
 * Voice Suggestions API
 * GET /api/voice/suggestions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // In a real implementation, these would be based on user's recent activity
  const suggestions = [
    {
      command: 'Show me active promotions',
      description: 'View all currently active promotions',
    },
    {
      command: 'Show pending claims',
      description: '5 claims need your review',
    },
    {
      command: "What's the status of PROMO-2024-001",
      description: 'Check your recent promotion',
    },
    {
      command: 'Show sales report for last month',
      description: 'View monthly sales performance',
    },
    {
      command: 'What promotions are expiring this week?',
      description: '3 promotions expiring soon',
    },
  ];

  return res.status(200).json({
    success: true,
    suggestions,
  });
}
