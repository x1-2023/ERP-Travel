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

    const { customerId, region, channel, tier, search } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {
      companyId: userRecord.companyId,
      isActive: true,
    };
    if (customerId) where.customerId = customerId;
    if (region) where.region = region;
    if (channel) where.channel = channel;
    if (tier) where.tier = tier;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.pepsiStore.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        customer: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(200).json({ data: stores });
  } catch (error) {
    console.error('Pepsi stores error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
