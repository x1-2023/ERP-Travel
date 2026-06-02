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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { claimId } = req.body;
    if (!claimId) return res.status(400).json({ error: 'claimId is required' });

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        promotion: { select: { id: true, code: true, name: true, budget: true, actualSpend: true } },
        customer: { select: { id: true, name: true, code: true } },
      },
    });

    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // AI matching logic (simplified - in production, call ML service)
    const claimAmount = Number(claim.amount);
    const promotionBudget = claim.promotion ? Number(claim.promotion.budget) : 0;
    const variance = claim.promotion ? claimAmount - promotionBudget : claimAmount;
    const variancePercent = promotionBudget > 0 ? (variance / promotionBudget) * 100 : 100;

    // Determine recommendation
    let recommendation: 'AUTO_APPROVE' | 'APPROVE_WITH_FLAG' | 'MANUAL_REVIEW' | 'PARTIAL_APPROVE' | 'REJECT';
    let confidence = 0.5;
    const flags: string[] = [];

    if (claim.promotion && Math.abs(variancePercent) <= 5) {
      recommendation = 'AUTO_APPROVE';
      confidence = 0.95;
    } else if (claim.promotion && Math.abs(variancePercent) <= 15) {
      recommendation = 'APPROVE_WITH_FLAG';
      confidence = 0.80;
      flags.push('VARIANCE_ABOVE_5_PERCENT');
    } else if (claim.promotion && variancePercent > 15 && variancePercent <= 30) {
      recommendation = 'PARTIAL_APPROVE';
      confidence = 0.65;
      flags.push('HIGH_VARIANCE');
    } else if (!claim.promotion) {
      recommendation = 'MANUAL_REVIEW';
      confidence = 0.40;
      flags.push('NO_MATCHING_PROMOTION');
    } else {
      recommendation = 'REJECT';
      confidence = 0.70;
      flags.push('EXCESSIVE_VARIANCE');
    }

    if (claimAmount > 500000000) flags.push('HIGH_VALUE_CLAIM');

    const matchScore = claim.promotion ? Math.max(0, 1 - Math.abs(variancePercent) / 100) : 0;

    const aiMatch = await prisma.claimAIMatch.upsert({
      where: { claimId },
      update: {
        recommendation,
        confidence,
        matchScore,
        matchedPromotionId: claim.promotionId,
        matchedAmount: claimAmount,
        variance,
        variancePercent,
        flags,
        reasoning: `Claim of ${claimAmount.toLocaleString()} VND matched against promotion ${claim.promotion?.code || 'N/A'}. Variance: ${variancePercent.toFixed(1)}%.`,
        modelVersion: 'claims-ai-v3.1',
      },
      create: {
        claimId,
        recommendation,
        confidence,
        matchScore,
        matchedPromotionId: claim.promotionId,
        matchedAmount: claimAmount,
        variance,
        variancePercent,
        flags,
        reasoning: `Claim of ${claimAmount.toLocaleString()} VND matched against promotion ${claim.promotion?.code || 'N/A'}. Variance: ${variancePercent.toFixed(1)}%.`,
        modelVersion: 'claims-ai-v3.1',
      },
    });

    return res.status(200).json({ data: { aiMatch, claim } });
  } catch (error) {
    console.error('Claims AI process error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
