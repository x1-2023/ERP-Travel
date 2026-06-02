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
    const now = new Date();
    const weeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    const [promotions, claims] = await Promise.all([
      prisma.promotion.findMany({
        where: {
          fund: { companyId },
          createdAt: { gte: weeksAgo },
        },
        select: { createdAt: true, budget: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.claim.findMany({
        where: {
          customer: { companyId },
          createdAt: { gte: weeksAgo },
        },
        select: { createdAt: true, amount: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group by week
    const weeks: Record<string, { weekLabel: string; promotionsCreated: number; claimsSubmitted: number; budgetAllocated: number; claimsAmount: number }> = {};

    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(weeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const key = `W${i + 1}`;
      weeks[key] = {
        weekLabel: `W${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        promotionsCreated: 0,
        claimsSubmitted: 0,
        budgetAllocated: 0,
        claimsAmount: 0,
      };
    }

    promotions.forEach((p) => {
      const weekIndex = Math.floor((p.createdAt.getTime() - weeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const key = `W${Math.min(weekIndex + 1, 12)}`;
      if (weeks[key]) {
        weeks[key].promotionsCreated += 1;
        weeks[key].budgetAllocated += Number(p.budget);
      }
    });

    claims.forEach((c) => {
      const weekIndex = Math.floor((c.createdAt.getTime() - weeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const key = `W${Math.min(weekIndex + 1, 12)}`;
      if (weeks[key]) {
        weeks[key].claimsSubmitted += 1;
        weeks[key].claimsAmount += Number(c.amount);
      }
    });

    return res.status(200).json({ data: Object.values(weeks) });
  } catch (error) {
    console.error('Weekly KPI error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
