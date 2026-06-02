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

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Suggestion ID required' });

  try {
    const { notes } = req.body;

    const suggestion = await prisma.promoSuggestion.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: user.userId,
        reviewedAt: new Date(),
        reviewNotes: notes || null,
      },
    });

    return res.status(200).json({ data: suggestion });
  } catch (error) {
    console.error('Suggestion approve error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
