/**
 * Phase 6: Claims Service
 * Validation, promotion matching, workflow logic
 */

import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { validateClaimTransition } from './status-transitions';

// ============================================================================
// APPROVAL THRESHOLDS
// ============================================================================

const APPROVAL_THRESHOLDS = [
  { level: 1, maxAmount: 50_000_000 },   // 50M VND - KAM can approve
  { level: 2, maxAmount: 200_000_000 },  // 200M VND - Manager required
  { level: 3, maxAmount: Infinity },      // Above 200M - Finance Director
];

export function getApprovalLevel(amount: number): number {
  for (const threshold of APPROVAL_THRESHOLDS) {
    if (amount <= threshold.maxAmount) return threshold.level;
  }
  return 3;
}

// ============================================================================
// CLAIM VALIDATION
// ============================================================================

interface ValidationResult {
  score: number;
  errors: string[];
  warnings: string[];
}

export async function validateClaim(claimId: string): Promise<ValidationResult> {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      customer: true,
      promotion: { include: { tactics: true } },
      lineItems: true,
    },
  });

  if (!claim) throw new Error('Claim not found');

  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check required fields
  if (!claim.customerId) { errors.push('Thiếu khách hàng'); score -= 20; }
  if (Number(claim.amount) <= 0) { errors.push('Số tiền phải > 0'); score -= 20; }
  if (!claim.claimDate) { errors.push('Thiếu ngày claim'); score -= 10; }

  // Check customer is active
  if (claim.customer && !claim.customer.isActive) {
    errors.push('Khách hàng không hoạt động');
    score -= 15;
  }

  // Check promotion linkage
  if (claim.promotionId && claim.promotion) {
    const promo = claim.promotion;
    // Check promotion is in a valid status
    if (!['CONFIRMED', 'EXECUTING', 'COMPLETED'].includes(promo.status)) {
      warnings.push(`Promotion đang ở trạng thái ${promo.status}`);
      score -= 10;
    }
    // Check claim period is within promotion dates
    if (claim.claimDate < promo.startDate || claim.claimDate > promo.endDate) {
      warnings.push('Ngày claim ngoài thời hạn promotion');
      score -= 10;
    }
    // Check claim amount vs promotion budget
    const claimAmount = Number(claim.claimedAmount || claim.amount);
    const promoBudget = Number(promo.budget);
    if (claimAmount > promoBudget) {
      warnings.push(`Số tiền claim (${claimAmount.toLocaleString()}) vượt ngân sách promotion (${promoBudget.toLocaleString()})`);
      score -= 15;
    }
  } else if (!claim.promotionId) {
    warnings.push('Claim chưa gắn promotion');
    score -= 5;
  }

  // Check line items
  if (claim.lineItems.length === 0) {
    warnings.push('Claim chưa có chi tiết sản phẩm');
    score -= 5;
  }

  // Check for duplicates (same customer, similar amount, similar date)
  const duplicates = await prisma.claim.findMany({
    where: {
      id: { not: claimId },
      customerId: claim.customerId,
      amount: claim.amount,
      claimDate: {
        gte: new Date(claim.claimDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        lte: new Date(claim.claimDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (duplicates.length > 0) {
    warnings.push(`Phát hiện ${duplicates.length} claim tương tự (cùng KH, số tiền, khoảng thời gian)`);
    score -= 10;
  }

  if (score < 0) score = 0;

  return { score, errors, warnings };
}

// ============================================================================
// SUBMIT CLAIM
// ============================================================================

export async function submitClaim(claimId: string, userId: string) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId } });
  if (!claim) throw new Error('Claim not found');

  validateClaimTransition(claim.status, 'SUBMITTED');

  // Run validation
  const validation = await validateClaim(claimId);

  if (validation.errors.length > 0) {
    // Auto-transition to VALIDATION_FAILED
    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.claim.update({
        where: { id: claimId },
        data: {
          status: 'SUBMITTED',
          submittedBy: userId,
          submittedAt: new Date(),
          validationScore: validation.score,
          validationNotes: validation.warnings.join('; '),
          validationErrors: validation.errors,
        },
      });

      await tx.claimAuditLog.create({
        data: {
          claimId,
          action: 'SUBMITTED',
          fromStatus: claim.status,
          toStatus: 'SUBMITTED',
          userId,
          details: { validation } as unknown as Prisma.InputJsonValue,
          notes: 'Submitted with validation errors',
        },
      });

      return c;
    });

    return { claim: updated, validation };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const c = await tx.claim.update({
      where: { id: claimId },
      data: {
        status: 'SUBMITTED',
        submittedBy: userId,
        submittedAt: new Date(),
        validationScore: validation.score,
        validationNotes: validation.warnings.join('; ') || null,
        validationErrors: Prisma.JsonNull,
      },
    });

    await tx.claimAuditLog.create({
      data: {
        claimId,
        action: 'SUBMITTED',
        fromStatus: claim.status,
        toStatus: 'SUBMITTED',
        userId,
        details: { validation } as unknown as Prisma.InputJsonValue,
      },
    });

    return c;
  });

  return { claim: updated, validation };
}

// ============================================================================
// AI MATCHING - Find promotion matches for a claim
// ============================================================================

export async function runAIMatching(claimId: string, userId: string) {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { customer: true, lineItems: true },
  });
  if (!claim) throw new Error('Claim not found');

  // Find potential promotions for this customer
  const promotions = await prisma.promotion.findMany({
    where: {
      customerId: claim.customerId,
      status: { in: ['CONFIRMED', 'EXECUTING', 'COMPLETED'] },
      startDate: { lte: claim.claimDate },
      endDate: { gte: new Date(claim.claimDate.getTime() - 90 * 24 * 60 * 60 * 1000) },
    },
    include: { tactics: { include: { items: true } } },
  });

  // Clear old matches
  await prisma.claimPromotionMatch.deleteMany({ where: { claimId } });

  const matches: Awaited<ReturnType<typeof prisma.claimPromotionMatch.create>>[] = [];
  const claimAmount = Number(claim.claimedAmount || claim.amount);

  for (const promo of promotions) {
    const promoBudget = Number(promo.budget);
    const variance = claimAmount - promoBudget;
    const variancePercent = promoBudget > 0 ? (variance / promoBudget) * 100 : 0;

    // Calculate confidence score
    let confidence = 0;
    const factors: Record<string, number> = {};

    // Date overlap factor (0-30 points)
    if (claim.claimDate >= promo.startDate && claim.claimDate <= promo.endDate) {
      factors.dateOverlap = 30;
      confidence += 30;
    } else {
      const daysDiff = Math.abs(
        (claim.claimDate.getTime() - promo.endDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      factors.dateOverlap = Math.max(0, 20 - daysDiff);
      confidence += factors.dateOverlap;
    }

    // Amount proximity factor (0-40 points)
    const absVariancePercent = Math.abs(variancePercent);
    if (absVariancePercent <= 5) {
      factors.amountMatch = 40;
    } else if (absVariancePercent <= 15) {
      factors.amountMatch = 30;
    } else if (absVariancePercent <= 30) {
      factors.amountMatch = 20;
    } else {
      factors.amountMatch = Math.max(0, 10 - absVariancePercent / 10);
    }
    confidence += factors.amountMatch;

    // Customer match factor (always 20 since we filter by customer)
    factors.customerMatch = 20;
    confidence += 20;

    // Promotion status factor (0-10 points)
    if (promo.status === 'EXECUTING') {
      factors.statusBonus = 10;
    } else if (promo.status === 'COMPLETED') {
      factors.statusBonus = 8;
    } else {
      factors.statusBonus = 5;
    }
    confidence += factors.statusBonus;

    const normalizedConfidence = Math.min(confidence, 100) / 100;

    const match = await prisma.claimPromotionMatch.create({
      data: {
        claimId,
        promotionId: promo.id,
        confidenceScore: normalizedConfidence,
        matchReason: `Auto-matched: ${Object.entries(factors).map(([k, v]) => `${k}=${v}`).join(', ')}`,
        matchFactors: factors,
        expectedAmount: promoBudget,
        variance,
        variancePercent,
      },
    });

    matches.push(match);
  }

  // Update claim status
  const newStatus = matches.length > 0 ? 'MATCHED' : 'UNDER_REVIEW';
  const validTransition = (() => {
    try {
      validateClaimTransition(claim.status, newStatus);
      return true;
    } catch { return false; }
  })();

  if (validTransition) {
    await prisma.$transaction(async (tx) => {
      await tx.claim.update({
        where: { id: claimId },
        data: { status: newStatus },
      });

      await tx.claimAuditLog.create({
        data: {
          claimId,
          action: 'AI_MATCHING',
          fromStatus: claim.status,
          toStatus: newStatus,
          userId,
          details: { matchCount: matches.length, topConfidence: matches[0]?.confidenceScore } as Prisma.InputJsonValue,
        },
      });
    });
  }

  return matches;
}

// ============================================================================
// APPROVE CLAIM
// ============================================================================

export async function approveClaim(
  claimId: string,
  approvedAmount: number,
  comments: string | undefined,
  userId: string
) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId } });
  if (!claim) throw new Error('Claim not found');

  const claimAmount = Number(claim.claimedAmount || claim.amount);
  const isPartial = approvedAmount < claimAmount;
  const newStatus = isPartial ? 'PARTIALLY_APPROVED' : 'APPROVED';

  validateClaimTransition(claim.status, newStatus);

  const level = getApprovalLevel(approvedAmount);

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.claim.update({
      where: { id: claimId },
      data: {
        status: newStatus,
        approvedAmount,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await tx.claimApproval.create({
      data: {
        claimId,
        level,
        status: 'APPROVED',
        approverId: userId,
        approvedAmount,
        comments,
        decidedAt: new Date(),
      },
    });

    await tx.claimAuditLog.create({
      data: {
        claimId,
        action: 'APPROVED',
        fromStatus: claim.status,
        toStatus: newStatus,
        userId,
        details: { approvedAmount, isPartial, level } as Prisma.InputJsonValue,
        notes: comments,
      },
    });

    return updated;
  });

  return result;
}

// ============================================================================
// REJECT CLAIM
// ============================================================================

export async function rejectClaim(
  claimId: string,
  reason: string,
  userId: string
) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId } });
  if (!claim) throw new Error('Claim not found');

  validateClaimTransition(claim.status, 'REJECTED');

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.claim.update({
      where: { id: claimId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });

    await tx.claimApproval.create({
      data: {
        claimId,
        level: 1,
        status: 'REJECTED',
        approverId: userId,
        comments: reason,
        decidedAt: new Date(),
      },
    });

    await tx.claimAuditLog.create({
      data: {
        claimId,
        action: 'REJECTED',
        fromStatus: claim.status,
        toStatus: 'REJECTED',
        userId,
        details: { reason } as Prisma.InputJsonValue,
        notes: reason,
      },
    });

    return updated;
  });

  return result;
}
