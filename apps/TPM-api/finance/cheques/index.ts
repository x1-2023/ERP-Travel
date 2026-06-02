/**
 * Chequebook API - List & Create
 * GET /api/finance/cheques - List cheques with filters
 * POST /api/finance/cheques - Create/issue cheque
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
    console.error('Cheques API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    status,
    payeeId,
    bankAccount,
    startDate,
    endDate,
    minAmount,
    maxAmount,
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

  if (payeeId) {
    where.payeeId = payeeId;
  }

  if (bankAccount) {
    where.bankAccount = { contains: bankAccount as string, mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) {
      where.issueDate.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.issueDate.lte = new Date(endDate as string);
    }
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) {
      where.amount.gte = parseFloat(minAmount as string);
    }
    if (maxAmount) {
      where.amount.lte = parseFloat(maxAmount as string);
    }
  }

  // Get cheques with pagination
  const [cheques, total] = await Promise.all([
    prisma.chequebookEntry.findMany({
      where,
      include: {
        payee: {
          select: { id: true, code: true, name: true },
        },
        claim: {
          select: { id: true, code: true, claimedAmount: true },
        },
      },
      orderBy: { issueDate: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.chequebookEntry.count({ where }),
  ]);

  // Get summary stats
  const summary = await prisma.chequebookEntry.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { amount: true },
  });

  const summaryData = {
    totalIssued: 0,
    totalCleared: 0,
    totalVoided: 0,
    totalPending: 0,
    issuedAmount: 0,
    clearedAmount: 0,
    pendingAmount: 0,
  };

  summary.forEach((s: any) => {
    const count = s._count.id;
    const amount = s._sum.amount?.toNumber() || 0;

    switch (s.status) {
      case 'ISSUED':
        summaryData.totalIssued = count;
        summaryData.issuedAmount = amount;
        break;
      case 'CLEARED':
        summaryData.totalCleared = count;
        summaryData.clearedAmount = amount;
        break;
      case 'VOIDED':
        summaryData.totalVoided = count;
        break;
      case 'PENDING':
        summaryData.totalPending = count;
        summaryData.pendingAmount = amount;
        break;
    }
  });

  return res.status(200).json({
    cheques,
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
    payeeId,
    claimId,
    chequeNumber,
    issueDate,
    dueDate,
    amount,
    bankAccount,
    memo,
  } = req.body;

  // Validate required fields
  if (!payeeId || !chequeNumber || !issueDate || !amount || !dueDate) {
    return res.status(400).json({
      error: 'Missing required fields: payeeId, chequeNumber, issueDate, dueDate, amount',
    });
  }

  // Check for duplicate cheque number
  const existing = await prisma.chequebookEntry.findFirst({
    where: { chequeNumber },
  });

  if (existing) {
    return res.status(400).json({
      error: `Cheque number ${chequeNumber} already exists`,
    });
  }

  // If linked to claim, verify claim exists and is approved
  if (claimId) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: { status: true, approvedAmount: true },
    });

    if (!claim) {
      return res.status(400).json({ error: 'Claim not found' });
    }

    if (claim.status !== 'APPROVED' && claim.status !== 'SETTLED') {
      return res.status(400).json({
        error: 'Cheque can only be issued for approved or settled claims',
      });
    }
  }

  // Create cheque
  const cheque = await prisma.chequebookEntry.create({
    data: {
      payeeId,
      claimId: claimId || null,
      chequeNumber,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      amount: parseFloat(amount),
      bankAccount: bankAccount || null,
      memo: memo || null,
      status: 'ISSUED',
    },
    include: {
      payee: {
        select: { id: true, code: true, name: true },
      },
      claim: {
        select: { id: true, code: true },
      },
    },
  });

  return res.status(201).json(cheque);
}
