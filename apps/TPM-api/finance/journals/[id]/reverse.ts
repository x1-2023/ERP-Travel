/**
 * GL Journal Reverse API
 * POST /api/finance/journals/[id]/reverse - Reverse a posted journal
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Journal ID is required' });
  }

  try {
    const journal = await prisma.gLJournal.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { lineNumber: 'asc' } },
      },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    if (journal.status !== 'POSTED') {
      return res.status(400).json({
        error: `Only posted journals can be reversed. Current status: ${journal.status}`,
      });
    }

    const { reason, reversalDate } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reversal reason is required' });
    }

    // Generate reversal journal number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reversalNumber = `JE-REV-${timestamp}-${random}`;

    // Create reversal journal and update original in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create reversal journal with swapped debits/credits
      const reversalJournal = await tx.gLJournal.create({
        data: {
          journalNumber: reversalNumber,
          companyId: journal.companyId,
          fiscalPeriodId: journal.fiscalPeriodId,
          journalDate: reversalDate ? new Date(reversalDate) : new Date(),
          description: `Reversal of ${journal.journalNumber}: ${reason}`,
          source: 'REVERSAL',
          sourceRef: journal.id,
          status: 'POSTED',
          totalDebit: journal.totalCredit,
          totalCredit: journal.totalDebit,
          postedAt: new Date(),
          postedById: req.body.userId || null,
          createdById: req.body.userId || journal.createdById,
          lines: {
            create: journal.lines.map((line: any, index: number) => ({
              lineNumber: index + 1,
              accountCode: line.accountCode,
              accountName: line.accountName,
              debitAmount: line.creditAmount, // Swap debit and credit
              creditAmount: line.debitAmount,
              description: `Reversal: ${line.description || ''}`,
              costCenter: line.costCenter,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      // Update original journal
      await tx.gLJournal.update({
        where: { id },
        data: {
          status: 'REVERSED',
        },
      });

      return reversalJournal;
    });

    return res.status(200).json({
      success: true,
      message: 'Journal reversed successfully',
      reversalJournal: result,
    });
  } catch (error: any) {
    console.error('Reverse journal error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
