/**
 * Cheque API - Single Cheque Operations
 * GET /api/finance/cheques/[id] - Get cheque details
 * PUT /api/finance/cheques/[id] - Update cheque status (void, clear, etc.)
 * DELETE /api/finance/cheques/[id] - Delete cheque (issued/pending only)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Cheque ID is required' });
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
    console.error('Cheque API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const cheque = await prisma.chequebookEntry.findUnique({
    where: { id },
    include: {
      payee: {
        select: { id: true, code: true, name: true, channel: true },
      },
      claim: {
        select: {
          id: true,
          code: true,
          claimedAmount: true,
          approvedAmount: true,
          status: true,
          promotion: {
            select: { id: true, code: true, name: true },
          },
        },
      },
    },
  });

  if (!cheque) {
    return res.status(404).json({ error: 'Cheque not found' });
  }

  return res.status(200).json(cheque);
}

async function handleUpdate(id: string, req: VercelRequest, res: VercelResponse) {
  const cheque = await prisma.chequebookEntry.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!cheque) {
    return res.status(404).json({ error: 'Cheque not found' });
  }

  const { action, clearDate, voidReason } = req.body;

  // Handle different actions
  switch (action) {
    case 'CLEAR': {
      if (cheque.status !== 'ISSUED') {
        return res.status(400).json({
          error: `Cannot clear cheque with status: ${cheque.status}`,
        });
      }

      const cleared = await prisma.chequebookEntry.update({
        where: { id },
        data: {
          status: 'CLEARED',
          clearedAt: clearDate ? new Date(clearDate) : new Date(),
        },
        include: {
          payee: { select: { id: true, code: true, name: true } },
          claim: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Cheque cleared successfully',
        cheque: cleared,
      });
    }

    case 'VOID': {
      if (cheque.status === 'CLEARED') {
        return res.status(400).json({
          error: 'Cannot void a cleared cheque',
        });
      }

      if (cheque.status === 'VOIDED') {
        return res.status(400).json({
          error: 'Cheque is already voided',
        });
      }

      if (!voidReason) {
        return res.status(400).json({
          error: 'Void reason is required',
        });
      }

      const voided = await prisma.chequebookEntry.update({
        where: { id },
        data: {
          status: 'VOIDED',
          voidedAt: new Date(),
          voidReason,
        },
        include: {
          payee: { select: { id: true, code: true, name: true } },
          claim: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Cheque voided successfully',
        cheque: voided,
      });
    }

    case 'STALE': {
      if (cheque.status !== 'ISSUED') {
        return res.status(400).json({
          error: `Cannot mark as stale a cheque with status: ${cheque.status}`,
        });
      }

      const stale = await prisma.chequebookEntry.update({
        where: { id },
        data: {
          status: 'STALE' as any,
          memo: 'Marked as stale',
        },
        include: {
          payee: { select: { id: true, code: true, name: true } },
          claim: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Cheque marked as stale',
        cheque: stale,
      });
    }

    default: {
      // Regular update (for pending/issued cheques)
      if (cheque.status === 'CLEARED' || cheque.status === 'VOIDED') {
        return res.status(400).json({
          error: 'Cannot update cleared or voided cheques',
        });
      }

      const { issueDate, amount, memo, bankAccount } = req.body;

      const updated = await prisma.chequebookEntry.update({
        where: { id },
        data: {
          issueDate: issueDate ? new Date(issueDate) : undefined,
          amount: amount ? parseFloat(amount) : undefined,
          memo,
          bankAccount,
        },
        include: {
          payee: { select: { id: true, code: true, name: true } },
          claim: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json(updated);
    }
  }
}

async function handleDelete(id: string, res: VercelResponse) {
  const cheque = await prisma.chequebookEntry.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!cheque) {
    return res.status(404).json({ error: 'Cheque not found' });
  }

  if (cheque.status === 'CLEARED') {
    return res.status(400).json({
      error: 'Cannot delete a cleared cheque',
    });
  }

  await prisma.chequebookEntry.delete({ where: { id } });

  return res.status(200).json({ success: true, message: 'Cheque deleted' });
}
