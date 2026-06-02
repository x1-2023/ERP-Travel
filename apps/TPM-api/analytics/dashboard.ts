import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!userRecord) return res.status(404).json({ error: 'User not found' });

    const companyId = userRecord.companyId;
    const currentYear = new Date().getFullYear();

    const [funds, activePromotions, pendingClaims, totalPromotions] = await Promise.all([
      prisma.fund.findMany({
        where: { companyId, year: currentYear, isActive: true },
        select: { totalBudget: true, committed: true, available: true },
      }),
      prisma.promotion.count({
        where: { fund: { companyId }, status: { in: ['EXECUTING', 'CONFIRMED'] } },
      }),
      prisma.claim.count({
        where: { customer: { companyId }, status: 'PENDING' },
      }),
      prisma.promotion.count({
        where: { fund: { companyId }, startDate: { gte: new Date(currentYear, 0, 1) } },
      }),
    ]);

    const totalBudget = funds.reduce((sum, f) => sum + Number(f.totalBudget), 0);
    const totalCommitted = funds.reduce((sum, f) => sum + Number(f.committed), 0);
    const totalAvailable = funds.reduce((sum, f) => sum + Number(f.available), 0);

    return res.status(200).json({
      data: {
        totalBudget,
        totalCommitted,
        totalAvailable,
        activePromotions,
        pendingClaims,
        totalPromotions,
        utilizationRate: totalBudget > 0 ? ((totalCommitted / totalBudget) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
