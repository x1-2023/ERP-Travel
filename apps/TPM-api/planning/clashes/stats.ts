/**
 * Clash Stats API
 * GET /api/planning/clashes/stats - Get clash statistics
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Get counts by status
    const statusCounts = await prisma.promotionClash.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get counts by severity
    const severityCounts = await prisma.promotionClash.groupBy({
      by: ['severity'],
      _count: { id: true },
    });

    // Get counts by clash type
    const typeCounts = await prisma.promotionClash.groupBy({
      by: ['clashType'],
      _count: { id: true },
    });

    // Get recent clashes (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClashes = await prisma.promotionClash.count({
      where: {
        detectedAt: { gte: thirtyDaysAgo },
      },
    });

    // Get unresolved high severity
    const unresolvedHigh = await prisma.promotionClash.count({
      where: {
        status: { in: ['DETECTED', 'ACKNOWLEDGED'] },
        severity: 'HIGH',
      },
    });

    // Get resolution rate
    const totalClashes = await prisma.promotionClash.count();
    const resolvedClashes = await prisma.promotionClash.count({
      where: { status: 'RESOLVED' },
    });

    const resolutionRate = totalClashes > 0
      ? Math.round((resolvedClashes / totalClashes) * 100)
      : 0;

    // Calculate total potential impact
    const impactSum = await prisma.promotionClash.aggregate({
      _sum: { estimatedImpact: true },
      where: { status: { in: ['DETECTED', 'ACKNOWLEDGED'] } },
    });

    return res.status(200).json({
      success: true,
      data: {
        total: totalClashes,
        byStatus: statusCounts.reduce(
          (acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        bySeverity: severityCounts.reduce(
          (acc, item) => {
            acc[item.severity] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        byType: typeCounts.reduce(
          (acc, item) => {
            acc[item.clashType] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        recentClashes,
        unresolvedHigh,
        resolutionRate,
        totalEstimatedImpact: impactSum?._sum?.estimatedImpact || 0,
      },
    });
  } catch (error: any) {
    console.error('Clash stats error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
}
