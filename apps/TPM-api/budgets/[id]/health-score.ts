import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * GET /budgets/:id/health-score
 * Calculate Fund Health Score (Aforza-style)
 *
 * Score = weighted average of:
 * - Utilization Rate (30%): spent / totalAmount
 * - Timeliness (25%): on-schedule spending vs plan
 * - ROI (25%): revenue generated / fund spent
 * - Coverage (20%): % of allocations with activity
 *
 * Score Interpretation:
 * - 80-100: EXCELLENT - Fund performing well
 * - 60-79:  GOOD - Minor adjustments needed
 * - 40-59:  WARNING - Significant underperformance
 * - 0-39:   CRITICAL - Requires immediate action
 */
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

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing budget id' });

  try {
    // Get budget with allocations and activities
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            activities: true,
          },
        },
        activities: true,
      },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const totalAmount = Number(budget.totalAmount);
    const totalSpent = budget.allocations.reduce(
      (sum, a) => sum + Number(a.spentAmount), 0
    );
    const totalAllocated = budget.allocations.reduce(
      (sum, a) => sum + Number(a.allocatedAmount), 0
    );

    // ===== 1. Utilization Rate (30%) =====
    // Optimal range: 70-90%
    const utilizationRate = totalAmount > 0 ? totalSpent / totalAmount : 0;
    let utilizationScore: number;
    if (utilizationRate >= 0.7 && utilizationRate <= 0.9) {
      utilizationScore = 100;
    } else if (utilizationRate < 0.7) {
      utilizationScore = (utilizationRate / 0.7) * 100;
    } else {
      utilizationScore = Math.max(0, 100 - ((utilizationRate - 0.9) / 0.1) * 50);
    }

    // ===== 2. Timeliness (25%) =====
    // Are we spending on schedule?
    const now = new Date();
    const startDate = budget.startDate || new Date(budget.year, (budget.quarter ? (budget.quarter - 1) * 3 : 0), 1);
    const endDate = budget.endDate || new Date(budget.year, budget.quarter ? budget.quarter * 3 : 12, 0);
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedSpendRate = Math.min(1, elapsedDays / totalDays);
    const actualSpendRate = utilizationRate;
    const timelinessDeviation = Math.abs(expectedSpendRate - actualSpendRate);
    const timelinessScore = Math.max(0, 100 - timelinessDeviation * 200);

    // ===== 3. ROI (25%) =====
    // Revenue generated vs spent
    const activities = budget.activities || [];
    const totalRevenue = activities.reduce(
      (sum, a) => sum + Number(a.revenueGenerated || 0), 0
    );
    const roiRatio = totalSpent > 0 ? totalRevenue / totalSpent : 0;
    const roiScore = Math.min(100, roiRatio * 50); // ROI of 2x = 100 score

    // ===== 4. Coverage (20%) =====
    // % of allocations with spending activity
    const allocationCount = budget.allocations.length;
    const activeAllocations = budget.allocations.filter(
      a => Number(a.spentAmount) > 0
    ).length;
    const coverageScore = allocationCount > 0
      ? (activeAllocations / allocationCount) * 100
      : 0;

    // ===== Weighted Average =====
    const healthScore = Math.round(
      utilizationScore * 0.30 +
      timelinessScore * 0.25 +
      roiScore * 0.25 +
      coverageScore * 0.20
    );

    // Determine status
    const getStatus = (score: number): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' => {
      if (score >= 80) return 'EXCELLENT';
      if (score >= 60) return 'GOOD';
      if (score >= 40) return 'WARNING';
      return 'CRITICAL';
    };

    // Generate alerts
    const alerts: Array<{ type: string; severity: string; message: string }> = [];

    if (utilizationRate < 0.3) {
      alerts.push({
        type: 'UNDERSPEND',
        severity: 'WARNING',
        message: `Mới sử dụng ${Math.round(utilizationRate * 100)}% ngân sách. Cần đẩy nhanh chi tiêu.`,
      });
    }

    if (utilizationRate > 0.9) {
      alerts.push({
        type: 'OVERSPEND_RISK',
        severity: 'CRITICAL',
        message: `Đã sử dụng ${Math.round(utilizationRate * 100)}% ngân sách. Cần kiểm soát chi tiêu.`,
      });
    }

    if (timelinessScore < 50) {
      alerts.push({
        type: 'OFF_SCHEDULE',
        severity: 'WARNING',
        message: 'Tốc độ chi tiêu lệch so với kế hoạch. Cần điều chỉnh.',
      });
    }

    const unallocated = budget.allocations.filter(
      a => Number(a.childrenAllocated) < Number(a.allocatedAmount) * 0.5
    );
    if (unallocated.length > 0) {
      alerts.push({
        type: 'UNALLOCATED',
        severity: 'INFO',
        message: `${unallocated.length} khu vực chưa phân bổ hết 50% ngân sách.`,
      });
    }

    // Return response
    return res.status(200).json({
      data: {
        budgetId: id,
        healthScore,
        status: getStatus(healthScore),
        breakdown: {
          utilization: {
            score: Math.round(utilizationScore),
            weight: '30%',
            rate: Math.round(utilizationRate * 100),
            optimal: '70-90%',
          },
          timeliness: {
            score: Math.round(timelinessScore),
            weight: '25%',
            expectedRate: Math.round(expectedSpendRate * 100),
            actualRate: Math.round(actualSpendRate * 100),
          },
          roi: {
            score: Math.round(roiScore),
            weight: '25%',
            ratio: roiRatio.toFixed(2),
            revenue: totalRevenue,
            spent: totalSpent,
          },
          coverage: {
            score: Math.round(coverageScore),
            weight: '20%',
            activeAllocations,
            totalAllocations: allocationCount,
          },
        },
        alerts,
        recommendations: generateRecommendations(healthScore, utilizationRate, timelinessScore, roiScore, coverageScore),
      },
    });
  } catch (error) {
    console.error('Health score error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateRecommendations(
  healthScore: number,
  utilizationRate: number,
  timelinessScore: number,
  roiScore: number,
  coverageScore: number
): string[] {
  const recommendations: string[] = [];

  if (utilizationRate < 0.5) {
    recommendations.push('Tăng tốc độ triển khai các hoạt động đã lên kế hoạch.');
  }

  if (utilizationRate > 0.95) {
    recommendations.push('Xem xét yêu cầu ngân sách bổ sung hoặc cắt giảm hoạt động.');
  }

  if (timelinessScore < 60) {
    recommendations.push('Điều chỉnh lịch chi tiêu để phù hợp với kế hoạch.');
  }

  if (roiScore < 50) {
    recommendations.push('Phân tích hiệu quả các hoạt động và tập trung vào những hoạt động có ROI cao.');
  }

  if (coverageScore < 60) {
    recommendations.push('Mở rộng phạm vi phân bổ để tăng coverage.');
  }

  if (healthScore >= 80) {
    recommendations.push('Duy trì các hoạt động hiện tại. Cân nhắc mở rộng nếu có cơ hội.');
  }

  return recommendations;
}
