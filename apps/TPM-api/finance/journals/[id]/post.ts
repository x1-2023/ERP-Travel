/**
 * GL Journal Post API
 * POST /api/finance/journals/[id]/post - Post journal to GL
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
        lines: true,
      },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    if (journal.status !== 'DRAFT') {
      return res.status(400).json({
        error: `Cannot post journal with status: ${journal.status}`,
      });
    }

    if (journal.lines.length === 0) {
      return res.status(400).json({
        error: 'Journal must have at least one line',
      });
    }

    // Validate balance
    const totalDebit = journal.lines.reduce((sum: number, l: any) => sum + (l.debitAmount?.toNumber() || 0), 0);
    const totalCredit = journal.lines.reduce((sum: number, l: any) => sum + (l.creditAmount?.toNumber() || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        error: 'Journal is out of balance and cannot be posted',
      });
    }

    // Post the journal
    const posted = await prisma.gLJournal.update({
      where: { id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        postedById: req.body.userId || null,
      },
      include: {
        lines: { orderBy: { lineNumber: 'asc' } },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Journal posted successfully',
      journal: posted,
    });
  } catch (error: any) {
    console.error('Post journal error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
