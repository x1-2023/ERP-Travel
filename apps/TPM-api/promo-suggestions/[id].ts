import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Suggestion ID required' });

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const suggestion = await prisma.promoSuggestion.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, code: true, channel: true } },
      },
    });

    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
    return res.status(200).json({ data: suggestion });
  } catch (error) {
    console.error('Suggestion detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
