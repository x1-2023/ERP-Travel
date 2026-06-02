import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * GET /fund-activities/summary
 * Get summary statistics for fund activities
 * Can filter by budgetId to get budget-specific ROI analysis
 * Sprint 0+1: RBAC + Standard errors
 */

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    promotion: 'Khuyến mãi',
    display: 'Trưng bày',
    sampling: 'Dùng thử',
    event: 'Sự kiện',
    listing_fee: 'Phí listing',
  };
  return labels[type] || type;
}

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  try {
    const { budgetId } = req.query;
    const where: Record<string, unknown> = {};
    if (budgetId) where.budgetId = budgetId;

    const activities = await prisma.fundActivity.findMany({
      where,
      include: {
        budget: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    const byType: Record<
      string,
      {
        count: number;
        totalAllocated: number;
        totalSpent: number;
        totalRevenue: number;
        avgRoi: number;
      }
    > = {};

    const byStatus: Record<string, number> = {
      PLANNED: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    let totalAllocated = 0;
    let totalSpent = 0;
    let totalRevenue = 0;
    let roiSum = 0;
    let roiCount = 0;

    for (const activity of activities) {
      const allocated = Number(activity.allocatedAmount);
      const spent = Number(activity.spentAmount);
      const revenue = activity.revenueGenerated
        ? Number(activity.revenueGenerated)
        : 0;
      const roi = activity.roi ? Number(activity.roi) : 0;

      totalAllocated += allocated;
      totalSpent += spent;
      totalRevenue += revenue;
      if (roi > 0) {
        roiSum += roi;
        roiCount++;
      }

      const type = activity.activityType;
      if (!byType[type]) {
        byType[type] = {
          count: 0,
          totalAllocated: 0,
          totalSpent: 0,
          totalRevenue: 0,
          avgRoi: 0,
        };
      }
      byType[type].count++;
      byType[type].totalAllocated += allocated;
      byType[type].totalSpent += spent;
      byType[type].totalRevenue += revenue;

      byStatus[activity.status]++;
    }

    for (const type of Object.keys(byType)) {
      const typeActivities = activities.filter(
        (a) => a.activityType === type && a.roi
      );
      if (typeActivities.length > 0) {
        byType[type].avgRoi =
          typeActivities.reduce((sum, a) => sum + Number(a.roi || 0), 0) /
          typeActivities.length;
      }
    }

    const topPerformers = activities
      .filter((a) => a.roi && Number(a.roi) > 0)
      .sort((a, b) => Number(b.roi || 0) - Number(a.roi || 0))
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        activityName: a.activityName,
        activityType: a.activityType,
        spent: Number(a.spentAmount),
        revenue: Number(a.revenueGenerated || 0),
        roi: Number(a.roi || 0),
      }));

    const underperformers = activities
      .filter((a) => a.status === 'COMPLETED' && Number(a.spentAmount) > 0)
      .sort((a, b) => Number(a.roi || 0) - Number(b.roi || 0))
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        activityName: a.activityName,
        activityType: a.activityType,
        spent: Number(a.spentAmount),
        revenue: Number(a.revenueGenerated || 0),
        roi: Number(a.roi || 0),
      }));

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalActivities: activities.length,
          totalAllocated,
          totalSpent,
          totalRevenue,
          utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
          overallRoi: totalSpent > 0 ? totalRevenue / totalSpent : 0,
          avgRoi: roiCount > 0 ? roiSum / roiCount : 0,
        },
        byType: Object.entries(byType).map(([type, data]) => ({
          type,
          label: getTypeLabel(type),
          ...data,
        })),
        byStatus,
        topPerformers,
        underperformers,
      },
    });
  } catch (error) {
    console.error('Fund activity summary error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
