import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

interface MatchingSuggestion {
  claimId: string;
  claim: {
    id: string;
    code: string;
    amount: number;
    claimDate: Date;
    status: string;
    promotion: {
      id: string;
      code: string;
      name: string;
    } | null;
  };
  confidence: number;
  matchReasons: string[];
}

// Calculate match confidence between deduction and claim
function calculateMatchConfidence(
  deduction: { amount: number; sourceDate: Date; customerId: string },
  claim: { amount: number; claimDate: Date; customerId: string }
): { confidence: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Customer match (required, but gives base points)
  if (deduction.customerId === claim.customerId) {
    score += 0.3;
    reasons.push('Same customer');
  }

  // Amount matching
  const deductionAmount = Number(deduction.amount);
  const claimAmount = Number(claim.amount);
  const amountDiff = Math.abs(deductionAmount - claimAmount);
  const amountTolerance = deductionAmount * 0.1; // 10% tolerance

  if (amountDiff === 0) {
    score += 0.4;
    reasons.push('Exact amount match');
  } else if (amountDiff <= amountTolerance) {
    score += 0.3;
    reasons.push(`Amount within 10% (${Math.round((amountDiff / deductionAmount) * 100)}% difference)`);
  } else if (amountDiff <= deductionAmount * 0.2) {
    score += 0.15;
    reasons.push(`Amount within 20% (${Math.round((amountDiff / deductionAmount) * 100)}% difference)`);
  }

  // Date proximity
  const daysDiff = Math.abs(
    (deduction.sourceDate.getTime() - claim.claimDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff <= 7) {
    score += 0.2;
    reasons.push('Dates within 1 week');
  } else if (daysDiff <= 30) {
    score += 0.1;
    reasons.push('Dates within 1 month');
  } else if (daysDiff <= 60) {
    score += 0.05;
    reasons.push('Dates within 2 months');
  }

  // Bonus for very close matches
  if (amountDiff === 0 && daysDiff <= 7) {
    score += 0.1;
    reasons.push('High confidence match');
  }

  return {
    confidence: Math.min(score, 1), // Cap at 1.0
    reasons,
  };
}

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

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing deduction ID' });
  }

  try {
    // Get the deduction
    const deduction = await prisma.deduction.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!deduction) {
      return res.status(404).json({ error: 'Deduction not found' });
    }

    if (deduction.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Deduction is not pending for matching',
        suggestions: [],
      });
    }

    const deductionAmount = Number(deduction.amount);

    // Find potential matching claims
    // Criteria: same customer, approved status, amount within reasonable range
    const claims = await prisma.claim.findMany({
      where: {
        customerId: deduction.customerId,
        status: 'APPROVED',
        amount: {
          gte: deductionAmount * 0.5, // At least 50% of deduction amount
          lte: deductionAmount * 1.5, // At most 150% of deduction amount
        },
      },
      include: {
        promotion: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { claimDate: 'desc' },
      take: 10, // Limit to top 10 candidates
    });

    // Calculate confidence for each claim
    const suggestions: MatchingSuggestion[] = claims
      .map((claim) => {
        const { confidence, reasons } = calculateMatchConfidence(
          {
            amount: deductionAmount,
            sourceDate: deduction.sourceDate || new Date(),
            customerId: deduction.customerId,
          },
          {
            amount: Number(claim.amount),
            claimDate: claim.claimDate,
            customerId: claim.customerId,
          }
        );

        return {
          claimId: claim.id,
          claim: {
            id: claim.id,
            code: claim.code,
            amount: Number(claim.amount),
            claimDate: claim.claimDate,
            status: claim.status,
            promotion: claim.promotion,
          },
          confidence,
          matchReasons: reasons,
        };
      })
      .filter((s) => s.confidence > 0.3) // Only return suggestions with >30% confidence
      .sort((a, b) => b.confidence - a.confidence); // Sort by confidence descending

    return res.status(200).json({
      success: true,
      data: suggestions,
      deduction: {
        id: deduction.id,
        deductionNumber: deduction.deductionNumber,
        amount: deductionAmount,
        customer: deduction.customer.name,
      },
    });
  } catch (error) {
    console.error('Matching suggestions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
