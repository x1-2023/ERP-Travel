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

  const { claimId } = req.query as { claimId: string };
  if (!claimId) return res.status(400).json({ error: 'Claim ID required' });

  try {
    const match = await prisma.claimAIMatch.findUnique({
      where: { claimId },
      include: {
        claim: {
          include: {
            customer: { select: { id: true, name: true, code: true } },
            promotion: { select: { id: true, code: true, name: true, budget: true } },
          },
        },
      },
    });

    if (!match) return res.status(404).json({ error: 'No AI match found for this claim' });
    return res.status(200).json({ data: match });
  } catch (error) {
    console.error('Claim match error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
