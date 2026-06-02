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
      select: { id: true, customerId: true },
    });

    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });

    // Get stores for the promotion's customer
    const stores = await prisma.pepsiStore.findMany({
      where: { customerId: promotion.customerId },
      orderBy: { name: 'asc' },
    });

    const storePerformance = stores.map(store => ({
      id: store.id,
      code: store.code,
      name: store.name,
      district: store.district,
      city: store.city,
      region: store.region,
      tier: store.tier,
      monthlyTarget: Number(store.monthlyTarget),
      monthlyActual: Number(store.monthlyActual),
      achievement: Number(store.monthlyTarget) > 0
        ? Math.round((Number(store.monthlyActual) / Number(store.monthlyTarget)) * 100)
        : 0,
      status: Number(store.monthlyActual) >= Number(store.monthlyTarget) ? 'EXCEEDING'
        : Number(store.monthlyActual) >= Number(store.monthlyTarget) * 0.85 ? 'ON_TRACK'
        : 'BELOW_TARGET',
    }));

    return res.status(200).json({
      data: {
        stores: storePerformance,
        summary: {
          totalStores: stores.length,
          exceeding: storePerformance.filter(s => s.status === 'EXCEEDING').length,
          onTrack: storePerformance.filter(s => s.status === 'ON_TRACK').length,
          belowTarget: storePerformance.filter(s => s.status === 'BELOW_TARGET').length,
          avgAchievement: storePerformance.length > 0
            ? Math.round(storePerformance.reduce((sum, s) => sum + s.achievement, 0) / storePerformance.length)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Store monitoring error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
