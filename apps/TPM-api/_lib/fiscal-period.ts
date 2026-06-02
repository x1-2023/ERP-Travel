/**
 * Sprint 1 Fix 7: Fiscal Period Controls
 * Prevents posting transactions to closed fiscal periods.
 */

import prisma from './prisma';

export class FiscalPeriodClosedError extends Error {
  constructor(
    public periodName: string,
    public periodStatus: string
  ) {
    super(`Fiscal period ${periodName} is ${periodStatus}. Cannot post transactions.`);
    this.name = 'FiscalPeriodClosedError';
  }
}

/**
 * Validate that the fiscal period for a given date is open for the given operation.
 * - HARD_CLOSE blocks everything
 * - SOFT_CLOSE blocks regular postings, allows adjustments
 */
export async function validateFiscalPeriod(
  date: Date,
  companyId: string,
  operation: 'posting' | 'adjustment' = 'posting'
): Promise<void> {
  const period = await prisma.fiscalPeriod.findFirst({
    where: {
      companyId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });

  if (!period) {
    throw new Error(`No fiscal period found for date ${date.toISOString()}`);
  }

  if (period.status === 'HARD_CLOSE') {
    throw new FiscalPeriodClosedError(period.name, period.status);
  }

  if (period.status === 'SOFT_CLOSE' && operation === 'posting') {
    throw new FiscalPeriodClosedError(
      period.name,
      `${period.status} (only adjustments allowed)`
    );
  }
}

/**
 * Get the fiscal period for a given date.
 */
export async function getFiscalPeriod(date: Date, companyId: string) {
  return prisma.fiscalPeriod.findFirst({
    where: {
      companyId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });
}
