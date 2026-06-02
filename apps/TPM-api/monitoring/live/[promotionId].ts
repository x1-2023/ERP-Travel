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

  const { promotionId } = req.query as { promotionId: string };
  if (!promotionId) return res.status(400).json({ error: 'Promotion ID required' });

  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        customer: { select: { id: true, name: true, code: true } },
        tactics: true,
        claims: { select: { id: true, amount: true, status: true } },
      },
    });

    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });

    const budget = Number(promotion.budget);
    const actualSpend = Number(promotion.actualSpend || 0);
    const claimTotal = promotion.claims.reduce((sum, c) => sum + Number(c.amount), 0);
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const elapsedDays = Math.max(0, (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const progressPercent = Math.min(100, (elapsedDays / totalDays) * 100);

    return res.status(200).json({
      data: {
        promotion: {
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
          status: promotion.status,
          customer: promotion.customer,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
        },
        metrics: {
          budget,
          actualSpend,
          budgetUtilization: budget > 0 ? Math.round((actualSpend / budget) * 100) : 0,
          claimTotal,
          claimCount: promotion.claims.length,
          pendingClaims: promotion.claims.filter(c => c.status === 'PENDING').length,
          tacticCount: promotion.tactics.length,
        },
        timeline: {
          totalDays: Math.round(totalDays),
          elapsedDays: Math.round(elapsedDays),
          remainingDays: Math.max(0, Math.round(totalDays - elapsedDays)),
          progressPercent: Math.round(progressPercent * 100) / 100,
          isActive: now >= start && now <= end,
        },
      },
    });
  } catch (error) {
    console.error('Live monitoring error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
