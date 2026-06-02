import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

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

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing deduction ID' });
  }

  try {
    const { claimId } = req.body;

    if (!claimId) {
      return res.status(400).json({ error: 'Missing required field: claimId' });
    }

    // Get the deduction
    const deduction = await prisma.deduction.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!deduction) {
      return res.status(404).json({ error: 'Deduction not found' });
    }

    if (deduction.status !== 'PENDING') {
      return res.status(400).json({ error: 'Deduction is not pending for matching' });
    }

    // Get the claim
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { customer: true },
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (claim.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Claim must be approved before matching' });
    }

    // Validate customer match
    if (deduction.customerId !== claim.customerId) {
      return res.status(400).json({ error: 'Customer mismatch between deduction and claim' });
    }

    // Match deduction with claim in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update deduction
      const updatedDeduction = await tx.deduction.update({
        where: { id },
        data: {
          status: 'MATCHED',
          matchedClaimId: claimId,
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
          matchedClaim: {
            select: {
              id: true,
              code: true,
              amount: true,
              promotion: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });

      // Update claim status to PAID
      await tx.claim.update({
        where: { id: claimId },
        data: { status: 'SETTLED' },
      });

      return updatedDeduction;
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        amount: Number(result.amount),
      },
      message: 'Deduction matched with claim successfully',
    });
  } catch (error) {
    console.error('Match deduction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
