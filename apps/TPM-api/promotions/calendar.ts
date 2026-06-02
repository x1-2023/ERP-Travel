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
    const { year, month } = req.query as Record<string, string>;

    const startOfYear = new Date(parseInt(year || String(new Date().getFullYear())), 0, 1);
    const endOfYear = new Date(parseInt(year || String(new Date().getFullYear())), 11, 31);

    const where: Record<string, unknown> = {
      fund: { company: { users: { some: { id: user.userId } } } },
      startDate: { lte: endOfYear },
      endDate: { gte: startOfYear },
    };

    if (month) {
      const m = parseInt(month) - 1;
      const y = parseInt(year || String(new Date().getFullYear()));
      where.startDate = { lte: new Date(y, m + 1, 0) };
      where.endDate = { gte: new Date(y, m, 1) };
    }

    const promotions = await prisma.promotion.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        budget: true,
        customer: { select: { id: true, name: true, channel: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return res.status(200).json({ data: promotions });
  } catch (error) {
    console.error('Calendar error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
