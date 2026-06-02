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
    const now = new Date();

    const [
      activePromotions,
      totalBudget,
      pendingClaims,
      recentAlerts,
      activeContracts,
    ] = await Promise.all([
      prisma.promotion.findMany({
        where: {
          fund: { companyId },
          status: 'EXECUTING',
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
        },
        orderBy: { endDate: 'asc' },
        take: 10,
      }),
      prisma.promotion.aggregate({
        where: { fund: { companyId }, status: { in: ['EXECUTING', 'CONFIRMED'] } },
        _sum: { budget: true, actualSpend: true },
      }),
      prisma.claim.count({
        where: { customer: { companyId }, status: 'PENDING' },
      }),
      prisma.triggeredAlert.findMany({
        where: { rule: { companyId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          rule: { select: { id: true, name: true, severity: true, entityType: true } },
        },
      }),
      prisma.volumeContract.count({
        where: { companyId, status: 'ACTIVE' },
      }),
    ]);

    const totalBudgetAmount = Number(totalBudget._sum.budget || 0);
    const totalSpent = Number(totalBudget._sum.actualSpend || 0);

    return res.status(200).json({
      data: {
        overview: {
          activePromotionCount: activePromotions.length,
          activeContractCount: activeContracts,
          pendingClaimCount: pendingClaims,
          totalBudget: totalBudgetAmount,
          totalSpent,
          budgetUtilization: totalBudgetAmount > 0 ? Math.round((totalSpent / totalBudgetAmount) * 100) : 0,
          alertCount: recentAlerts.length,
        },
        activePromotions: activePromotions.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          status: p.status,
          customer: p.customer,
          budget: Number(p.budget),
          actualSpend: Number(p.actualSpend || 0),
          endDate: p.endDate,
          daysRemaining: Math.max(0, Math.ceil((p.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))),
        })),
        recentAlerts,
      },
    });
  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
