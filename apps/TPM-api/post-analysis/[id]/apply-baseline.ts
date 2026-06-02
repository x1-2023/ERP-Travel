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
  if (!id) return res.status(400).json({ error: 'Analysis ID required' });

  try {
    const analysis = await prisma.postPromotionAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

    // Update baseline with learnings from this promotion
    const updated = await prisma.postPromotionAnalysis.update({
      where: { id },
      data: {
        baselineUpdate: {
          applied: true,
          appliedAt: new Date().toISOString(),
          appliedBy: user.userId,
          adjustments: {
            volumeAdjustment: Number(analysis.upliftPercent),
            newBaseline: Number(analysis.actualVolume),
          },
        },
      },
    });

    return res.status(200).json({
      data: updated,
      message: 'Baseline update applied from post-promotion analysis',
    });
  } catch (error) {
    console.error('Apply baseline error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
