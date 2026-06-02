import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

type Resolution = 'ACCEPT' | 'REJECT' | 'PARTIAL';

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
    const { resolution, amount, notes } = req.body as {
      resolution: Resolution;
      amount?: number;
      notes?: string;
    };

    if (!resolution) {
      return res.status(400).json({ error: 'Missing required field: resolution' });
    }

    if (!['ACCEPT', 'REJECT', 'PARTIAL'].includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution. Must be ACCEPT, REJECT, or PARTIAL' });
    }

    // Get the deduction
    const deduction = await prisma.deduction.findUnique({ where: { id } });

    if (!deduction) {
      return res.status(404).json({ error: 'Deduction not found' });
    }

    if (deduction.status !== 'DISPUTED') {
      return res.status(400).json({ error: 'Can only resolve disputed deductions' });
    }

    let result;

    if (resolution === 'ACCEPT') {
      // Accept the deduction as valid - mark as resolved
      result = await prisma.deduction.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
        },
      });
    } else if (resolution === 'REJECT') {
      // Reject the deduction - write it off
      result = await prisma.deduction.update({
        where: { id },
        data: {
          status: 'WRITTEN_OFF',
          resolvedAt: new Date(),
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
        },
      });
    } else if (resolution === 'PARTIAL') {
      // Partial resolution - adjust amount and/or create new deduction for remainder
      if (amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Partial resolution requires a valid amount' });
      }

      const originalAmount = Number(deduction.amount);
      if (amount >= originalAmount) {
        return res.status(400).json({ error: 'Partial amount must be less than original amount' });
      }

      // Create new deduction for the accepted portion
      const remainderAmount = originalAmount - amount;

      result = await prisma.$transaction(async (tx) => {
        // Update original deduction as resolved with adjusted amount
        const updated = await tx.deduction.update({
          where: { id },
          data: {
            status: 'RESOLVED',
            amount: new Decimal(amount),
            resolvedAt: new Date(),
          },
          include: {
            customer: { select: { id: true, name: true, code: true } },
          },
        });

        // Create new deduction for remainder (written off)
        if (remainderAmount > 0) {
          await tx.deduction.create({
            data: {
              deductionNumber: `${deduction.deductionNumber}-WO`,
              companyId: deduction.companyId,
              customerId: deduction.customerId,
              source: deduction.source,
              sourceDocument: deduction.sourceDocument ? `${deduction.sourceDocument}-PARTIAL` : null,
              sourceDate: deduction.sourceDate,
              deductionDate: deduction.deductionDate,
              receivedDate: deduction.receivedDate,
              amount: new Decimal(remainderAmount),
              reasonDescription: `Partial write-off from ${deduction.deductionNumber}. ${notes || ''}`.trim(),
              status: 'WRITTEN_OFF',
              resolvedAt: new Date(),
            },
          });
        }

        return updated;
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        amount: Number(result!.amount),
      },
      message: `Deduction ${resolution.toLowerCase()}ed successfully`,
    });
  } catch (error) {
    console.error('Resolve deduction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
