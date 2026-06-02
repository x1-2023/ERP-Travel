import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

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

  try {
    const { accrualIds, glAccountDebit, glAccountCredit } = req.body;

    if (!accrualIds || !Array.isArray(accrualIds) || accrualIds.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid accrualIds array' });
    }

    if (!glAccountDebit || !glAccountCredit) {
      return res.status(400).json({ error: 'Missing required fields: glAccountDebit, glAccountCredit' });
    }

    // Get accruals
    const accruals = await prisma.accrualEntry.findMany({
      where: {
        id: { in: accrualIds },
        status: 'PENDING',
      },
      include: {
        promotion: { select: { code: true, name: true } },
      },
    });

    if (accruals.length === 0) {
      return res.status(400).json({ error: 'No valid accruals found to post' });
    }

    if (accruals.length !== accrualIds.length) {
      const foundIds = accruals.map((a: any) => a.id);
      const invalidIds = accrualIds.filter((id: string) => !foundIds.includes(id));
      return res.status(400).json({
        error: 'Some accruals are invalid or already posted',
        invalidIds,
      });
    }

    // Post all accruals in transaction
    const results = await prisma.$transaction(async (tx: any) => {
      const posted = [];

      for (const accrual of accruals) {
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

        // Update accrual
        const updated = await tx.accrualEntry.update({
          where: { id: accrual.id },
          data: {
            status: 'POSTED',
            postedAt: new Date(),
            postedById: user.userId,
            glJournalId: journal.id,
          },
        });

        posted.push({
          accrualId: updated.id,
          journalId: journal.id,
          journalNumber: journal.journalNumber,
          amount: Number(accrual.amount),
        });
      }

      return posted;
    });

    const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        posted: results.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        entries: results,
      },
      message: `${results.length} accruals posted to GL successfully`,
    });
  } catch (error) {
    console.error('Post batch accruals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
