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

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Contract ID required' });

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const contract = await prisma.volumeContract.findUnique({
      where: { id },
      include: {
        milestones: { orderBy: { deadline: 'asc' } },
        progress: { orderBy: [{ year: 'asc' }, { month: 'asc' }] },
        customer: { select: { id: true, name: true } },
      },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const targetVolume = Number(contract.targetVolume);
    const currentVolume = Number(contract.currentVolume);
    const gap = targetVolume - currentVolume;
    const remainingMonths = Math.max(1, Math.ceil(
      (contract.endDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)
    ));
    const requiredMonthlyRun = gap / remainingMonths;

    // Calculate average monthly volume from progress
    const progressData = contract.progress;
    const avgMonthlyVolume = progressData.length > 0
      ? progressData.reduce((sum, p) => sum + Number(p.volume), 0) / progressData.length
      : 0;

    const runRateGap = requiredMonthlyRun - avgMonthlyVolume;
    const projectedYearEnd = currentVolume + (avgMonthlyVolume * remainingMonths);
    const projectedAchievement = targetVolume > 0 ? (projectedYearEnd / targetVolume) * 100 : 0;

    // Milestone analysis
    const milestoneAnalysis = contract.milestones.map(m => {
      const mTarget = Number(m.targetVolume);
      const mAchieved = Number(m.achievedVolume);
      const mGap = mTarget - mAchieved;
      const daysRemaining = Math.max(0, Math.ceil(
        (m.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      ));
      return {
        id: m.id,
        name: m.name,
        targetVolume: mTarget,
        achievedVolume: mAchieved,
        gap: mGap,
        achievementPercent: mTarget > 0 ? Math.round((mAchieved / mTarget) * 100) : 0,
        daysRemaining,
        isAchieved: m.isAchieved,
        requiredDailyRate: daysRemaining > 0 ? Math.round(mGap / daysRemaining) : 0,
        status: m.isAchieved ? 'ACHIEVED' : daysRemaining === 0 ? 'MISSED' : mAchieved / mTarget >= 0.85 ? 'ON_TRACK' : 'AT_RISK',
      };
    });

    // Suggestions based on gap
    const suggestions = [];
    if (runRateGap > 0) {
      suggestions.push({
        type: 'PROMOTION',
        message: `Increase monthly volume by ${Math.round(runRateGap).toLocaleString()} cases to meet target`,
        urgency: runRateGap > avgMonthlyVolume * 0.3 ? 'HIGH' : 'MEDIUM',
      });
    }
    if (projectedAchievement < 90) {
      suggestions.push({
        type: 'REALLOCATION',
        message: 'Consider running targeted promotions to close the gap',
        urgency: 'HIGH',
      });
    }

    return res.status(200).json({
      data: {
        contract: {
          id: contract.id,
          code: contract.code,
          name: contract.name,
          customer: contract.customer,
        },
        summary: {
          targetVolume,
          currentVolume,
          gap,
          completionRate: Number(contract.completionRate),
          remainingMonths,
          avgMonthlyVolume: Math.round(avgMonthlyVolume),
          requiredMonthlyRun: Math.round(requiredMonthlyRun),
          runRateGap: Math.round(runRateGap),
          projectedYearEnd: Math.round(projectedYearEnd),
          projectedAchievement: Math.round(projectedAchievement * 100) / 100,
          riskLevel: contract.riskLevel,
        },
        milestones: milestoneAnalysis,
        suggestions,
      },
    });
  } catch (error) {
    console.error('Gap analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
