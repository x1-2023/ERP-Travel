import type { VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { financePlus, type AuthenticatedRequest } from '../../../_lib/auth';

// POST /api/finance/deductions/:id/convert - Convert deduction to claim
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const deduction = await prisma.deduction.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!deduction) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deduction not found' } });
    }

    if (deduction.matchedClaimId) {
      return res.status(422).json({
        success: false,
        error: { code: 'ALREADY_LINKED', message: 'Deduction already linked to a claim' },
      });
    }

    // Generate claim code from deduction number
    const claimCode = `CLM-${deduction.deductionNumber}`;

    const result = await prisma.$transaction(async (tx) => {
      // Create claim from deduction
      const claim = await tx.claim.create({
        data: {
          code: claimCode,
          amount: deduction.amount,
          claimedAmount: deduction.amount,
          status: 'DRAFT',
          claimDate: deduction.deductionDate,
          customerId: deduction.customerId,
          promotionId: deduction.matchedPromotionId,
          companyId: deduction.companyId,
          source: 'DEDUCTION',
          type: 'OTHER',
          description: `Converted from deduction ${deduction.deductionNumber}. ${deduction.reasonDescription || ''}`.trim(),
          invoiceNumber: deduction.sourceDocument,
          createdBy: req.auth.userId,
        },
      });

      // Link deduction to claim
      await tx.deduction.update({
        where: { id },
        data: { matchedClaimId: claim.id },
      });

      // Create audit log
      await tx.claimAuditLog.create({
        data: {
          claimId: claim.id,
          action: 'CREATED_FROM_DEDUCTION',
          toStatus: 'DRAFT',
          userId: req.auth.userId,
          details: {
            deductionId: id,
            deductionNumber: deduction.deductionNumber,
            amount: Number(deduction.amount),
          },
        },
      });

      return claim;
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Convert deduction error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
