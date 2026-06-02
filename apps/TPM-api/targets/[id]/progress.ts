import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../../_lib/auth';

/**
 * GET /targets/:id/progress
 * Get progress summary by geographic level
 * Sprint 0+1: RBAC + Standard errors
 */
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing target id' } });

  try {
    const target = await prisma.target.findUnique({
      where: { id },
      include: {
        allocations: { include: { geographicUnit: true } },
      },
    });

    if (!target) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    const totalTarget = Number(target.totalTarget);
    const totalAchieved = Number(target.totalAchieved);
    const overallProgress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

    const getStatus = (progress: number): 'ACHIEVED' | 'GOOD' | 'SLOW' | 'AT_RISK' => {
      if (progress >= 100) return 'ACHIEVED';
      if (progress >= 75) return 'GOOD';
      if (progress >= 50) return 'SLOW';
      return 'AT_RISK';
    };

    const byLevel: Record<string, Array<{
      id: string; code: string; name: string;
      targetValue: number; achievedValue: number;
      progress: number; status: string;
    }>> = { COUNTRY: [], REGION: [], PROVINCE: [], DISTRICT: [], DEALER: [] };

    for (const allocation of target.allocations) {
      const level = allocation.geographicUnit?.level || 'REGION';
      const targetVal = Number(allocation.targetValue);
      const achievedVal = Number(allocation.achievedValue);
      const progress = targetVal > 0 ? (achievedVal / targetVal) * 100 : 0;

      byLevel[level]?.push({
        id: allocation.id,
        code: allocation.code,
        name: allocation.geographicUnit?.name || allocation.code,
        targetValue: targetVal,
        achievedValue: achievedVal,
        progress: Math.round(progress * 10) / 10,
        status: getStatus(progress),
      });
    }

    const allStatuses = target.allocations.map(a => {
      const targetVal = Number(a.targetValue);
      const achievedVal = Number(a.achievedValue);
      return getStatus(targetVal > 0 ? (achievedVal / targetVal) * 100 : 0);
    });

    const statusBreakdown = {
      achieved: allStatuses.filter(s => s === 'ACHIEVED').length,
      good: allStatuses.filter(s => s === 'GOOD').length,
      slow: allStatuses.filter(s => s === 'SLOW').length,
      atRisk: allStatuses.filter(s => s === 'AT_RISK').length,
    };

    const sortedByProgress = target.allocations
      .map(a => ({
        id: a.id,
        code: a.code,
        name: a.geographicUnit?.name || a.code,
        level: a.geographicUnit?.level || 'REGION',
        progress: Number(a.targetValue) > 0
          ? (Number(a.achievedValue) / Number(a.targetValue)) * 100
          : 0,
      }))
      .sort((a, b) => b.progress - a.progress);

    return res.status(200).json({
      success: true,
      data: {
        target: {
          id: target.id, code: target.code, name: target.name,
          metric: target.metric, year: target.year, quarter: target.quarter,
        },
        overall: {
          totalTarget,
          totalAchieved,
          progress: Math.round(overallProgress * 10) / 10,
          status: getStatus(overallProgress),
          remaining: Math.max(0, totalTarget - totalAchieved),
        },
        byLevel: {
          regions: byLevel.REGION,
          provinces: byLevel.PROVINCE,
          districts: byLevel.DISTRICT,
        },
        statusBreakdown,
        topPerformers: sortedByProgress.slice(0, 5),
        underperformers: sortedByProgress.slice(-5).reverse(),
      },
    });
  } catch (error) {
    console.error('Target progress error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
