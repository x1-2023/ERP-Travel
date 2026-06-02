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

    const analyses = await prisma.postPromotionAnalysis.findMany({
      where: { companyId: userRecord.companyId },
      include: {
        promotion: {
          select: { id: true, code: true, name: true, startDate: true, endDate: true },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    const resultCounts = {
      excellent: analyses.filter(a => a.result === 'EXCELLENT').length,
      success: analyses.filter(a => a.result === 'SUCCESS').length,
      partial: analyses.filter(a => a.result === 'PARTIAL').length,
      underperform: analyses.filter(a => a.result === 'UNDERPERFORM').length,
      failure: analyses.filter(a => a.result === 'FAILURE').length,
    };

    const avgROI = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.roi, 0) / analyses.length
      : 0;

    const avgUplift = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.upliftPercent, 0) / analyses.length
      : 0;

    return res.status(200).json({
      data: {
        total: analyses.length,
        resultBreakdown: resultCounts,
        averageROI: Math.round(avgROI * 100) / 100,
        averageUplift: Math.round(avgUplift * 100) / 100,
        averageScore: analyses.length > 0
          ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
          : 0,
        analyses: analyses.map(a => ({
          id: a.id,
          promotion: a.promotion,
          result: a.result,
          overallScore: a.overallScore,
          roi: a.roi,
          upliftPercent: a.upliftPercent,
          totalSpend: Number(a.totalSpend),
          generatedAt: a.generatedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Post analysis summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
