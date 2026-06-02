import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

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
    const { glAccountDebit, glAccountCredit } = req.body;

    if (!glAccountDebit || !glAccountCredit) {
      return res.status(400).json({ error: 'Missing required fields: glAccountDebit, glAccountCredit' });
    }

    // Get the accrual
    const accrual = await prisma.accrualEntry.findUnique({
      where: { id },
      include: {
        promotion: { select: { code: true, name: true } },
      },
    });

    if (!accrual) {
      return res.status(404).json({ error: 'Accrual not found' });
    }

    if (accrual.status !== 'PENDING') {
      return res.status(400).json({ error: 'Accrual is already posted or reversed' });
    }

    // Create GL Journal entry and update accrual in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create GL Journal entry
      const journal = await tx.gLJournal.create({
        data: {
          journalNumber: generateEntryNumber(),
          journalDate: new Date(),
          description: `Accrual for ${accrual.promotion.code} - ${accrual.promotion.name}`,
          companyId: accrual.companyId,
          fiscalPeriodId: accrual.fiscalPeriodId,
          source: 'ACCRUAL',
          sourceRef: accrual.id,
          totalDebit: accrual.amount,
          totalCredit: accrual.amount,
          status: 'POSTED',
          postedAt: new Date(),
          postedById: user.userId,
          createdById: user.userId,
          lines: {
            create: [
              {
                lineNumber: 1,
                accountCode: glAccountDebit,
                accountName: 'Accrual Debit',
                debitAmount: accrual.amount,
                creditAmount: 0,
              },
              {
                lineNumber: 2,
                accountCode: glAccountCredit,
                accountName: 'Accrual Credit',
                debitAmount: 0,
                creditAmount: accrual.amount,
              },
            ],
          },
        },
      });

      // Update accrual status
      const updatedAccrual = await tx.accrualEntry.update({
        where: { id },
        data: {
          status: 'POSTED',
          postedAt: new Date(),
          postedById: user.userId,
          glJournalId: journal.id,
        },
        include: {
          promotion: { select: { id: true, code: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return { accrual: updatedAccrual, journal };
    });

    return res.status(200).json({
      success: true,
      data: {
        accrual: {
          ...result.accrual,
          amount: Number(result.accrual.amount),
        },
        journal: {
          ...result.journal,
          totalDebit: Number(result.journal.totalDebit),
          totalCredit: Number(result.journal.totalCredit),
        },
      },
      message: 'Accrual posted to GL successfully',
    });
  } catch (error) {
    console.error('Post accrual error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
