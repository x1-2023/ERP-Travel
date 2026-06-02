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
  if (!id) return res.status(400).json({ error: 'Contract ID required' });

  try {
    if (req.method === 'GET') {
      const contract = await prisma.volumeContract.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, code: true, channel: true } },
          milestones: { orderBy: { deadline: 'asc' } },
          progress: { orderBy: [{ year: 'asc' }, { month: 'asc' }] },
        },
      });

      if (!contract) return res.status(404).json({ error: 'Contract not found' });
      return res.status(200).json({ data: contract });
    }

    if (req.method === 'PUT') {
      const { name, status, targetVolume, bonusType, bonusValue, bonusCondition, notes } = req.body;

      const contract = await prisma.volumeContract.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(status && { status }),
          ...(targetVolume && { targetVolume: parseFloat(targetVolume) }),
          ...(bonusType && { bonusType }),
          ...(bonusValue !== undefined && { bonusValue: parseFloat(bonusValue) }),
          ...(bonusCondition !== undefined && { bonusCondition }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
          milestones: { orderBy: { deadline: 'asc' } },
        },
      });

      return res.status(200).json({ data: contract });
    }

    if (req.method === 'DELETE') {
      await prisma.volumeContract.delete({ where: { id } });
      return res.status(200).json({ message: 'Contract deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Contract detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
