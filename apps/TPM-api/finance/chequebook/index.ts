import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', status, payeeId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (payeeId) where.payeeId = payeeId;

      const [cheques, total] = await Promise.all([
        prisma.chequebookEntry.findMany({
          where,
          skip,
          take,
          orderBy: { issueDate: 'desc' },
          include: {
            payee: { select: { id: true, name: true } },
            claim: { select: { id: true, code: true } },
          },
        }),
        prisma.chequebookEntry.count({ where }),
      ]);

      return res.status(200).json({
        data: cheques,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { chequeNumber, payeeId, amount, issueDate, dueDate, claimId, bankAccount, memo } = req.body;

      if (!chequeNumber || !payeeId || amount === undefined || !issueDate || !dueDate) {
        return res.status(400).json({ error: 'Missing required fields: chequeNumber, payeeId, amount, issueDate, dueDate' });
      }

      const cheque = await prisma.chequebookEntry.create({
        data: {
          chequeNumber,
          payeeId,
          amount: parseFloat(amount),
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          claimId: claimId || null,
          bankAccount: bankAccount || null,
          memo: memo || null,
        },
      });

      return res.status(201).json({ data: cheque });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Chequebook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
