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

    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Claims without AI match
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where: {
          customer: { companyId: userRecord.companyId },
          aiMatch: null,
          status: 'PENDING',
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, code: true } },
          promotion: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.claim.count({
        where: {
          customer: { companyId: userRecord.companyId },
          aiMatch: null,
          status: 'PENDING',
        },
      }),
    ]);

    return res.status(200).json({
      data: claims,
      pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Claims AI pending error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
