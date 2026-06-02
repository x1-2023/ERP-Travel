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
    const { claimIds } = req.body;
    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({ error: 'claimIds array is required' });
    }

    const claims = await prisma.claim.findMany({
      where: { id: { in: claimIds } },
      include: {
        promotion: { select: { id: true, code: true, budget: true } },
        aiMatch: true,
      },
    });

    const results = [];
    for (const claim of claims) {
      if (claim.aiMatch) {
        results.push({ claimId: claim.id, status: 'already_processed', match: claim.aiMatch });
        continue;
      }

      const claimAmount = Number(claim.amount);
      const promotionBudget = claim.promotion ? Number(claim.promotion.budget) : 0;
      const variancePercent = promotionBudget > 0
        ? ((claimAmount - promotionBudget) / promotionBudget) * 100
        : 100;

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
      } else if (!claim.promotion) {
        recommendation = 'MANUAL_REVIEW';
        confidence = 0.40;
        flags.push('NO_MATCHING_PROMOTION');
      } else {
        recommendation = 'MANUAL_REVIEW';
        confidence = 0.50;
        flags.push('HIGH_VARIANCE');
      }

      const match = await prisma.claimAIMatch.create({
        data: {
          claimId: claim.id,
          recommendation,
          confidence,
          matchScore: claim.promotion ? Math.max(0, 1 - Math.abs(variancePercent) / 100) : 0,
          matchedPromotionId: claim.promotionId,
          matchedAmount: claimAmount,
          variance: claimAmount - promotionBudget,
          variancePercent,
          flags,
          reasoning: `Batch processed: variance ${variancePercent.toFixed(1)}%`,
          modelVersion: 'claims-ai-v3.1',
        },
      });

      results.push({ claimId: claim.id, status: 'processed', match });
    }

    const summary = {
      total: results.length,
      processed: results.filter(r => r.status === 'processed').length,
      alreadyProcessed: results.filter(r => r.status === 'already_processed').length,
    };

    return res.status(200).json({ data: results, summary });
  } catch (error) {
    console.error('Claims AI batch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
