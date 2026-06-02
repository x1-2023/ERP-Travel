import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Suggestion ID required' });

  try {
    const suggestion = await prisma.promoSuggestion.findUnique({ where: { id } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
    if (suggestion.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Suggestion must be approved before applying' });
    }

    // Mark suggestion as applied
    const updated = await prisma.promoSuggestion.update({
      where: { id },
      data: {
        status: 'APPLIED',
        appliedAt: new Date(),
      },
    });

    return res.status(200).json({
      data: updated,
      message: 'Suggestion applied. Create a promotion based on the suggested configuration.',
    });
  } catch (error) {
    console.error('Suggestion apply error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
