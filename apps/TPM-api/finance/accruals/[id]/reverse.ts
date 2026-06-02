import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

// Generate unique entry number for GL journal
function generateEntryNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JE-${timestamp}-${random}`;
}

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
    return res.status(400).json({ error: 'Missing accrual ID' });
  }

  try {
    const { reason } = req.body;

    // Get the accrual with GL journal
    const accrual = await prisma.accrualEntry.findUnique({
      where: { id },
      include: {
        promotion: { select: { code: true, name: true } },
      },
    });

    if (!accrual) {
      return res.status(404).json({ error: 'Accrual not found' });
    }

    if (accrual.status !== 'POSTED') {
      return res.status(400).json({ error: 'Can only reverse posted accruals' });
    }

    if (!accrual.glJournalId) {
      return res.status(400).json({ error: 'Accrual has no GL journal entry' });
    }

    // Get original GL journal
    const originalJournal = await prisma.gLJournal.findUnique({
      where: { id: accrual.glJournalId },
    });

    if (!originalJournal) {
      return res.status(404).json({ error: 'Original GL journal not found' });
    }

    if (originalJournal.status === 'REVERSED') {
      return res.status(400).json({ error: 'GL journal is already reversed' });
    }

    // Create reversal journal and update records in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create reversal GL Journal entry (swap debit/credit)
      const reversalJournal = await tx.gLJournal.create({
        data: {
          journalNumber: generateEntryNumber(),
          journalDate: new Date(),
          description: `REVERSAL: ${originalJournal.description}${reason ? ` - Reason: ${reason}` : ''}`,
          companyId: originalJournal.companyId,
          fiscalPeriodId: originalJournal.fiscalPeriodId,
          totalDebit: originalJournal.totalCredit,
          totalCredit: originalJournal.totalDebit,
          sourceRef: `Reversal of ${originalJournal.journalNumber}`,
          source: 'REVERSAL',
          status: 'POSTED',
          postedAt: new Date(),
          postedById: user.userId,
          createdById: user.userId,
        },
      });

      // Update original GL journal status
      await tx.gLJournal.update({
        where: { id: originalJournal.id },
        data: { status: 'REVERSED' },
      });

      // Update accrual status
      const updatedAccrual = await tx.accrualEntry.update({
        where: { id },
        data: {
          status: 'REVERSED',
        },
        include: {
          promotion: { select: { id: true, code: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return { accrual: updatedAccrual, reversalJournal };
    });

    return res.status(200).json({
      success: true,
      data: {
        accrual: {
          ...result.accrual,
          amount: Number(result.accrual.amount),
        },
        reversalJournal: {
          ...result.reversalJournal,
          totalDebit: Number(result.reversalJournal.totalDebit),
        },
      },
      message: 'Accrual reversed successfully',
    });
  } catch (error) {
    console.error('Reverse accrual error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
