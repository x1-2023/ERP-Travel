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

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Contract ID required' });

  try {
    if (req.method === 'GET') {
      const progress = await prisma.volumeContractProgress.findMany({
        where: { contractId: id },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });
      return res.status(200).json({ data: progress });
    }

    if (req.method === 'POST') {
      const { month, year, volume, revenue, target, notes } = req.body;

      if (!month || !year || volume === undefined) {
        return res.status(400).json({ error: 'Missing required fields: month, year, volume' });
      }

      // Get previous cumulative values
      const prevProgress = await prisma.volumeContractProgress.findMany({
        where: {
          contractId: id,
          OR: [
            { year: { lt: parseInt(year) } },
            { year: parseInt(year), month: { lt: parseInt(month) } },
          ],
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 1,
      });

      const prevCumVolume = prevProgress.length > 0 ? Number(prevProgress[0].cumVolume) : 0;
      const prevCumTarget = prevProgress.length > 0 ? Number(prevProgress[0].cumTarget) : 0;
      const newCumVolume = prevCumVolume + parseFloat(volume);
      const newCumTarget = prevCumTarget + parseFloat(target || '0');
      const gapPercent = newCumTarget > 0
        ? ((newCumVolume - newCumTarget) / newCumTarget) * 100
        : 0;

      const progress = await prisma.volumeContractProgress.upsert({
        where: { contractId_year_month: { contractId: id, year: parseInt(year), month: parseInt(month) } },
        update: {
          volume: parseFloat(volume),
          revenue: parseFloat(revenue || '0'),
          target: parseFloat(target || '0'),
          cumVolume: newCumVolume,
          cumTarget: newCumTarget,
          gapPercent: Math.round(gapPercent * 100) / 100,
          notes: notes || null,
        },
        create: {
          contractId: id,
          month: parseInt(month),
          year: parseInt(year),
          volume: parseFloat(volume),
          revenue: parseFloat(revenue || '0'),
          target: parseFloat(target || '0'),
          cumVolume: newCumVolume,
          cumTarget: newCumTarget,
          gapPercent: Math.round(gapPercent * 100) / 100,
          notes: notes || null,
        },
      });

      // Update contract current volume and completion rate
      const contract = await prisma.volumeContract.findUnique({ where: { id } });
      if (contract) {
        const completionRate = Number(contract.targetVolume) > 0
          ? (newCumVolume / Number(contract.targetVolume)) * 100
          : 0;
        await prisma.volumeContract.update({
          where: { id },
          data: {
            currentVolume: newCumVolume,
            completionRate: Math.round(completionRate * 100) / 100,
            riskLevel: completionRate < 70 ? 'CRITICAL' : completionRate < 85 ? 'AT_RISK' : 'ON_TRACK',
          },
        });
      }

      return res.status(201).json({ data: progress });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Contract progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
