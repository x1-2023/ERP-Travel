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

    const { category, brand, search } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {
      companyId: userRecord.companyId,
      isActive: true,
    };
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.pepsiProduct.findMany({
      where,
      orderBy: [{ brand: 'asc' }, { name: 'asc' }],
    });

    return res.status(200).json({ data: products });
  } catch (error) {
    console.error('Pepsi products error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
