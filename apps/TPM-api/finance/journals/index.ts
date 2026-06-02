/**
 * GL Journals API - List & Create
 * GET /api/finance/journals - List journals with filters
 * POST /api/finance/journals - Create journal entry
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      return handleList(req, res);
    } else if (req.method === 'POST') {
      return handleCreate(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Journals API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    status,
    source,
    startDate,
    endDate,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (source) {
    where.source = source;
  }

  if (startDate || endDate) {
    where.journalDate = {};
    if (startDate) {
      where.journalDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.journalDate.lte = new Date(endDate as string);
    }
  }

  // Get journals with pagination
  const [journals, total] = await Promise.all([
    prisma.gLJournal.findMany({
      where,
      include: {
        lines: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
            debitAmount: true,
            creditAmount: true,
            description: true,
          },
        },
        fiscalPeriod: {
          select: { id: true, name: true, year: true, month: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { journalDate: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.gLJournal.count({ where }),
  ]);

  // Get summary stats
  const summary = await prisma.gLJournal.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalDebit: true },
  });

  const summaryData = {
    totalDraft: 0,
    totalPosted: 0,
    totalReversed: 0,
    draftAmount: 0,
    postedAmount: 0,
  };

  summary.forEach((s: any) => {
    if (s.status === 'DRAFT') {
      summaryData.totalDraft = s._count.id;
      summaryData.draftAmount = s._sum.totalDebit?.toNumber() || 0;
    } else if (s.status === 'POSTED') {
      summaryData.totalPosted = s._count.id;
      summaryData.postedAmount = s._sum.totalDebit?.toNumber() || 0;
    } else if (s.status === 'REVERSED') {
      summaryData.totalReversed = s._count.id;
    }
  });

  return res.status(200).json({
    journals,
    summary: summaryData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const {
    companyId,
    fiscalPeriodId,
    journalDate,
    description,
    source = 'ADJUSTMENT',
    sourceRef,
    lines,
  } = req.body;

  // Validate required fields
  if (!companyId || !fiscalPeriodId || !journalDate || !description || !lines || lines.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields: companyId, fiscalPeriodId, journalDate, description, lines',
    });
  }

  // Validate lines balance (debits = credits)
  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of lines) {
    totalDebit += parseFloat(line.debitAmount || 0);
    totalCredit += parseFloat(line.creditAmount || 0);
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      error: `Journal must balance. Debit: ${totalDebit}, Credit: ${totalCredit}`,
    });
  }

  // Generate journal number
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const journalNumber = `JE-${timestamp}-${random}`;

  // Create journal with lines
  const journal = await prisma.gLJournal.create({
    data: {
      journalNumber,
      companyId,
      fiscalPeriodId,
      journalDate: new Date(journalDate),
      description,
      source,
      sourceRef: sourceRef || null,
      status: 'DRAFT',
      totalDebit,
      totalCredit,
      createdById: req.body.userId || 'system',
      lines: {
        create: lines.map((line: any, index: number) => ({
          lineNumber: index + 1,
          accountCode: line.accountCode,
          accountName: line.accountName,
          debitAmount: parseFloat(line.debitAmount || 0),
          creditAmount: parseFloat(line.creditAmount || 0),
          description: line.description,
          costCenter: line.costCenter,
        })),
      },
    },
    include: {
      lines: true,
    },
  });

  return res.status(201).json(journal);
}
