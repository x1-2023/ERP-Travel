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

  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!userRecord) return res.status(404).json({ error: 'User not found' });

    const companyId = userRecord.companyId;

    const [
      totalContracts,
      activeContracts,
      contracts,
      upcomingMilestones,
    ] = await Promise.all([
      prisma.volumeContract.count({ where: { companyId } }),
      prisma.volumeContract.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.volumeContract.findMany({
        where: { companyId, status: 'ACTIVE' },
        include: {
          customer: { select: { id: true, name: true, code: true } },
          milestones: { where: { isAchieved: false }, orderBy: { deadline: 'asc' }, take: 1 },
        },
      }),
      prisma.volumeContractMilestone.findMany({
        where: {
          contract: { companyId },
          isAchieved: false,
          deadline: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        },
        include: {
          contract: { select: { id: true, code: true, name: true } },
        },
        orderBy: { deadline: 'asc' },
        take: 10,
      }),
    ]);

    // Calculate summary metrics
    const totalTarget = contracts.reduce((sum, c) => sum + Number(c.targetVolume), 0);
    const totalCurrent = contracts.reduce((sum, c) => sum + Number(c.currentVolume), 0);
    const avgCompletion = contracts.length > 0
      ? contracts.reduce((sum, c) => sum + Number(c.completionRate), 0) / contracts.length
      : 0;
    const atRiskCount = contracts.filter(c => c.riskLevel !== 'ON_TRACK').length;

    const riskBreakdown = {
      onTrack: contracts.filter(c => c.riskLevel === 'ON_TRACK').length,
      atRisk: contracts.filter(c => c.riskLevel === 'AT_RISK').length,
      critical: contracts.filter(c => c.riskLevel === 'CRITICAL').length,
    };

    return res.status(200).json({
      data: {
        summary: {
          totalContracts,
          activeContracts,
          totalTargetVolume: totalTarget,
          totalCurrentVolume: totalCurrent,
          averageCompletion: Math.round(avgCompletion * 100) / 100,
          atRiskCount,
          riskBreakdown,
        },
        contracts: contracts.map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          customer: c.customer,
          targetVolume: Number(c.targetVolume),
          currentVolume: Number(c.currentVolume),
          completionRate: Number(c.completionRate),
          riskLevel: c.riskLevel,
          status: c.status,
          nextMilestone: c.milestones[0] || null,
        })),
        upcomingMilestones,
      },
    });
  } catch (error) {
    console.error('Contracts dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
