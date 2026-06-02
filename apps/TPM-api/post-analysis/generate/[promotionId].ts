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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { promotionId } = req.query as { promotionId: string };
  if (!promotionId) return res.status(400).json({ error: 'Promotion ID required' });

  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!userRecord) return res.status(404).json({ error: 'User not found' });

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        customer: { select: { id: true, name: true, code: true } },
        claims: true,
        tactics: true,
      },
    });

    if (!promotion) return res.status(404).json({ error: 'Promotion not found' });

    // Generate analysis (simplified - in production, call analytics service)
    const budget = Number(promotion.budget);
    const actualSpend = Number(promotion.actualSpend || budget * 0.85);
    const claimTotal = promotion.claims.reduce((sum, c) => sum + Number(c.amount), 0);

    // Simulated analysis values
    const baselineVolume = budget / 10000;
    const actualVolume = baselineVolume * (0.9 + Math.random() * 0.4);
    const incrementalVolume = actualVolume - baselineVolume;
    const upliftPercent = (incrementalVolume / baselineVolume) * 100;
    const incrementalRevenue = incrementalVolume * 10000;
    const roi = actualSpend > 0 ? (incrementalRevenue / actualSpend) : 0;
    const overallScore = Math.min(100, Math.max(0, roi * 20 + upliftPercent));

    let result: 'EXCELLENT' | 'SUCCESS' | 'PARTIAL' | 'UNDERPERFORM' | 'FAILURE';
    if (overallScore >= 80) result = 'EXCELLENT';
    else if (overallScore >= 60) result = 'SUCCESS';
    else if (overallScore >= 40) result = 'PARTIAL';
    else if (overallScore >= 20) result = 'UNDERPERFORM';
    else result = 'FAILURE';

    const analysis = await prisma.postPromotionAnalysis.upsert({
      where: { promotionId },
      update: {
        result,
        overallScore: Math.round(overallScore),
        totalSpend: actualSpend,
        incrementalRevenue,
        roi: Math.round(roi * 100) / 100,
        costPerUnit: actualVolume > 0 ? actualSpend / actualVolume : 0,
        baselineVolume,
        actualVolume,
        incrementalVolume,
        upliftPercent: Math.round(upliftPercent * 100) / 100,
        executionScore: 70 + Math.random() * 25,
        storeCompliance: 60 + Math.random() * 35,
        onTimeDelivery: 75 + Math.random() * 20,
        keyFindings: [
          `Promotion achieved ${Math.round(upliftPercent)}% volume uplift vs baseline`,
          `ROI of ${roi.toFixed(2)}x on total spend of ${actualSpend.toLocaleString()} VND`,
          `${promotion.claims.length} claims processed with total value ${claimTotal.toLocaleString()} VND`,
        ],
        recommendations: [
          upliftPercent > 15 ? 'Consider repeating this promotion type in next quarter' : 'Review mechanic effectiveness',
          roi > 1.5 ? 'Increase budget allocation for similar promotions' : 'Optimize spend distribution',
        ],
        lessonsLearned: [
          'Start communication to stores 2 weeks before promotion start',
          'Ensure display materials are delivered at least 5 days in advance',
        ],
        generatedAt: new Date(),
      },
      create: {
        companyId: userRecord.companyId,
        promotionId,
        result,
        overallScore: Math.round(overallScore),
        totalSpend: actualSpend,
        incrementalRevenue,
        roi: Math.round(roi * 100) / 100,
        costPerUnit: actualVolume > 0 ? actualSpend / actualVolume : 0,
        baselineVolume,
        actualVolume,
        incrementalVolume,
        upliftPercent: Math.round(upliftPercent * 100) / 100,
        executionScore: 70 + Math.random() * 25,
        storeCompliance: 60 + Math.random() * 35,
        onTimeDelivery: 75 + Math.random() * 20,
        keyFindings: [
          `Promotion achieved ${Math.round(upliftPercent)}% volume uplift vs baseline`,
          `ROI of ${roi.toFixed(2)}x on total spend of ${actualSpend.toLocaleString()} VND`,
        ],
        recommendations: [
          upliftPercent > 15 ? 'Consider repeating this promotion type' : 'Review mechanic effectiveness',
        ],
        lessonsLearned: [
          'Start communication to stores 2 weeks before promotion start',
        ],
      },
    });

    return res.status(200).json({ data: analysis });
  } catch (error) {
    console.error('Post analysis generate error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
