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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { promotionId } = req.query as { promotionId: string };
  if (!promotionId) return res.status(400).json({ error: 'Promotion ID required' });

  try {
    const analysis = await prisma.postPromotionAnalysis.findUnique({
      where: { promotionId },
      include: {
        promotion: {
          include: {
            customer: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    return res.status(200).json({ data: analysis });
  } catch (error) {
    console.error('Post analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
