/**
 * GL Journal API - Single Journal Operations
 * GET /api/finance/journals/[id] - Get journal details
 * PUT /api/finance/journals/[id] - Update journal (draft only)
 * DELETE /api/finance/journals/[id] - Delete journal (draft only)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Journal ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return handleGet(id, res);
    } else if (req.method === 'PUT') {
      return handleUpdate(id, req, res);
    } else if (req.method === 'DELETE') {
      return handleDelete(id, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Journal API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const journal = await prisma.gLJournal.findUnique({
    where: { id },
    include: {
      lines: {
        orderBy: { lineNumber: 'asc' },
      },
      accrualEntries: {
        select: { id: true, amount: true, status: true },
      },
      fiscalPeriod: {
        select: { id: true, name: true, year: true, month: true },
      },
      postedBy: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
  });

  if (!journal) {
    return res.status(404).json({ error: 'Journal not found' });
  }

  return res.status(200).json(journal);
}

async function handleUpdate(id: string, req: VercelRequest, res: VercelResponse) {
  const journal = await prisma.gLJournal.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!journal) {
    return res.status(404).json({ error: 'Journal not found' });
  }

  if (journal.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Only draft journals can be updated',
    });
  }

  const { journalDate, description, lines } = req.body;

  // If lines are provided, validate balance
  let totalDebit = 0;
  let totalCredit = 0;

  if (lines && lines.length > 0) {
    for (const line of lines) {
      totalDebit += parseFloat(line.debitAmount || 0);
      totalCredit += parseFloat(line.creditAmount || 0);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        error: `Journal must balance. Debit: ${totalDebit}, Credit: ${totalCredit}`,
      });
    }
  }

  // Update journal with transaction
  const updated = await prisma.$transaction(async (tx: any) => {
    // Update journal header
    const journalUpdate = await tx.gLJournal.update({
      where: { id },
      data: {
        journalDate: journalDate ? new Date(journalDate) : undefined,
        description: description || undefined,
        totalDebit: lines ? totalDebit : undefined,
        totalCredit: lines ? totalCredit : undefined,
      },
    });

    // If lines provided, replace all lines
    if (lines && lines.length > 0) {
      await tx.gLJournalLine.deleteMany({ where: { journalId: id } });
      await tx.gLJournalLine.createMany({
        data: lines.map((line: any, index: number) => ({
          journalId: id,
          lineNumber: index + 1,
          accountCode: line.accountCode,
          accountName: line.accountName,
          debitAmount: parseFloat(line.debitAmount || 0),
          creditAmount: parseFloat(line.creditAmount || 0),
          description: line.description,
          costCenter: line.costCenter,
        })),
      });
    }

    return tx.gLJournal.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { lineNumber: 'asc' } },
      },
    });
  });

  return res.status(200).json(updated);
}

async function handleDelete(id: string, res: VercelResponse) {
  const journal = await prisma.gLJournal.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!journal) {
    return res.status(404).json({ error: 'Journal not found' });
  }

  if (journal.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Only draft journals can be deleted',
    });
  }

  await prisma.$transaction([
    prisma.gLJournalLine.deleteMany({ where: { journalId: id } }),
    prisma.gLJournal.delete({ where: { id } }),
  ]);

  return res.status(200).json({ success: true, message: 'Journal deleted' });
}
