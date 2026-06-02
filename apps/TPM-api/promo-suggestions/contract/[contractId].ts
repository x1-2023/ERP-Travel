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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contractId } = req.query as { contractId: string };
  if (!contractId) return res.status(400).json({ error: 'Contract ID required' });

  try {
    const suggestions = await prisma.promoSuggestion.findMany({
      where: { contractId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        customer: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(200).json({ data: suggestions });
  } catch (error) {
    console.error('Contract suggestions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
