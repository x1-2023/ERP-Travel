/**
 * GL Journals API
 * GET /api/finance/gl-journals - List GL journals
 * POST /api/finance/gl-journals - Create GL journal
 * Sprint 1: Fix 7 (Fiscal period controls) + Fix 11 (GL balance validation)
 */

import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { financePlus, parsePagination, type AuthenticatedRequest } from '../../_lib/auth';
import { validateFiscalPeriod, FiscalPeriodClosedError } from '../../_lib/fiscal-period';

export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { status, source, startDate, endDate } = req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = { companyId: req.auth.companyId };
      if (status) where.status = status;
      if (source) where.source = source;
      if (startDate || endDate) {
        where.journalDate = {} as Record<string, Date>;
        if (startDate) (where.journalDate as Record<string, Date>).gte = new Date(startDate);
        if (endDate) (where.journalDate as Record<string, Date>).lte = new Date(endDate);
      }

      const [journals, total] = await Promise.all([
        prisma.gLJournal.findMany({
          where,
          skip,
          take: limit,
          orderBy: { journalDate: 'desc' },
          include: {
            fiscalPeriod: { select: { id: true, name: true, status: true } },
            _count: { select: { lines: true } },
          },
        }),
        prisma.gLJournal.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: journals,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const { journalNumber, journalDate, description, source, sourceRef, fiscalPeriodId, lines } = req.body;

      if (!journalNumber || !journalDate || !description || !source || !fiscalPeriodId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: journalNumber, journalDate, description, source, fiscalPeriodId' },
        });
      }

      if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Journal must have at least one line entry' },
        });
      }

      // Sprint 1 Fix 7: Validate fiscal period is open
      try {
        await validateFiscalPeriod(new Date(journalDate), req.auth.companyId, 'posting');
      } catch (error) {
        if (error instanceof FiscalPeriodClosedError) {
          return res.status(422).json({
            success: false,
            error: {
              code: 'FISCAL_PERIOD_CLOSED',
              message: error.message,
              details: {
                periodName: error.periodName,
                status: error.periodStatus,
              },
            },
          });
        }
        throw error;
      }

      // Sprint 1 Fix 11: GL Journal Balance Validation (Debit = Credit)
      let totalDebit = 0;
      let totalCredit = 0;

      for (const line of lines) {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        if (debit < 0 || credit < 0) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Debit and credit amounts cannot be negative' },
          });
        }

        if (debit > 0 && credit > 0) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'A journal line cannot have both debit and credit amounts' },
          });
        }

        totalDebit += debit;
        totalCredit += credit;
      }

      const difference = Math.abs(totalDebit - totalCredit);
      // Allow 1 VND tolerance for rounding
      if (difference > 1) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'JOURNAL_NOT_BALANCED',
            message: 'Journal entry is not balanced. Total debits must equal total credits.',
            details: {
              totalDebit,
              totalCredit,
              difference,
            },
          },
        });
      }

      // Create journal with lines
      const journal = await prisma.gLJournal.create({
        data: {
          journalNumber,
          journalDate: new Date(journalDate),
          description,
          source,
          sourceRef: sourceRef || null,
          companyId: req.auth.companyId,
          createdById: req.auth.userId,
          fiscalPeriodId,
          totalDebit,
          totalCredit,
          lines: {
            create: lines.map((line: Record<string, unknown>, index: number) => ({
              lineNumber: (line.lineNumber as number) || index + 1,
              accountCode: line.accountCode as string,
              accountName: (line.accountName as string) || '',
              debitAmount: Number(line.debit || 0),
              creditAmount: Number(line.credit || 0),
              description: (line.description as string) || null,
              costCenter: (line.costCenter as string) || null,
            })),
          },
        },
        include: { lines: true },
      });

      return res.status(201).json({ success: true, data: journal });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('GL Journals error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
