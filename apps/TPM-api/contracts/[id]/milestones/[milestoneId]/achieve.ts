import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';
import { getUserFromRequest } from '../../../../_lib/auth';

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

  const { milestoneId } = req.query as { milestoneId: string };
  if (!milestoneId) return res.status(400).json({ error: 'Milestone ID required' });

  try {
    const { achievedVolume } = req.body;

    const milestone = await prisma.volumeContractMilestone.update({
      where: { id: milestoneId },
      data: {
        achievedVolume: achievedVolume ? parseFloat(achievedVolume) : undefined,
        isAchieved: true,
        achievedDate: new Date(),
      },
    });

    return res.status(200).json({ data: milestone });
  } catch (error) {
    console.error('Milestone achieve error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
