import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

interface CalculateRequest {
  period: string;
  method: 'PERCENTAGE' | 'PRO_RATA';
  promotionIds?: string[];
  preview?: boolean;
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
    const { period, method = 'PERCENTAGE', promotionIds, preview = false } = req.body as CalculateRequest;

    if (!period) {
      return res.status(400).json({ error: 'Missing required field: period' });
    }

    // Parse period (e.g., "2026-01")
    const [year, month] = period.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Get active promotions in period
    const wherePromotion: Record<string, unknown> = {
      status: 'ACTIVE',
      startDate: { lte: periodEnd },
      endDate: { gte: periodStart },
    };

    if (promotionIds && promotionIds.length > 0) {
      wherePromotion.id = { in: promotionIds };
    }

    const promotions = await prisma.promotion.findMany({
      where: wherePromotion,
      include: {
        claims: {
          where: { status: 'APPROVED' },
          select: { amount: true },
        },
      },
    });

    if (promotions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          calculated: 0,
          totalAmount: 0,
          entries: [],
          message: 'No active promotions found for the specified period',
        },
      });
    }

    // Calculate accruals
    const entries = [];
    let totalAmount = 0;

    for (const promo of promotions) {
      const budget = Number(promo.budget) || 0;
      const spentAmount = promo.claims.reduce((sum, c) => sum + Number(c.amount), 0);
      let accrualAmount = 0;

      if (method === 'PERCENTAGE') {
        // Method 1: Based on % completion (time-based)
        const totalDays = Math.ceil((promo.endDate.getTime() - promo.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const daysElapsed = Math.ceil((Math.min(periodEnd.getTime(), promo.endDate.getTime()) - Math.max(periodStart.getTime(), promo.startDate.getTime())) / (1000 * 60 * 60 * 24)) + 1;
        const percentComplete = Math.min(daysElapsed / totalDays, 1);
        accrualAmount = Math.max((budget * percentComplete) - spentAmount, 0);
      } else {
        // Method 2: Pro-rata based on days in period
        const totalDays = Math.ceil((promo.endDate.getTime() - promo.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const daysInPeriod = Math.ceil((Math.min(periodEnd.getTime(), promo.endDate.getTime()) - Math.max(periodStart.getTime(), promo.startDate.getTime())) / (1000 * 60 * 60 * 24)) + 1;
        accrualAmount = (budget / totalDays) * daysInPeriod;
      }

      // Round to 2 decimal places
      accrualAmount = Math.round(accrualAmount * 100) / 100;

      if (accrualAmount > 0) {
        entries.push({
          promotionId: promo.id,
          promotion: {
            id: promo.id,
            code: promo.code,
            name: promo.name,
            budget: Number(promo.budget),
            spentAmount,
          },
          period,
          amount: accrualAmount,
          status: 'PENDING' as const,
        });
        totalAmount += accrualAmount;
      }
    }

    // If preview mode, return without saving
    if (preview) {
      return res.status(200).json({
        success: true,
        data: {
          calculated: entries.length,
          totalAmount: Math.round(totalAmount * 100) / 100,
          entries,
          preview: true,
        },
      });
    }

    // Find or create fiscal period for this month
    let fiscalPeriod = await prisma.fiscalPeriod.findFirst({
      where: {
        year,
        month,
      },
    });

    const fiscalPeriodId = fiscalPeriod?.id || '';

    // Check for existing accruals in this period
    const existingAccruals = await prisma.accrualEntry.findMany({
      where: {
        fiscalPeriodId,
        promotionId: { in: entries.map(e => e.promotionId) },
        status: 'PENDING',
      },
    });

    if (existingAccruals.length > 0) {
      return res.status(400).json({
        error: 'Accruals already exist for some promotions in this period',
        existingPromotionIds: existingAccruals.map(a => a.promotionId),
      });
    }

    // Save accruals
    const created = await prisma.accrualEntry.createMany({
      data: entries.map(e => ({
        companyId: (e.promotion as any).companyId || '',
        promotionId: e.promotionId,
        fiscalPeriodId,
        entryType: 'MONTHLY_ACCRUAL' as const,
        entryDate: new Date(),
        amount: new Decimal(e.amount),
        cumulativeAmount: new Decimal(e.amount),
        status: 'PENDING' as const,
        createdById: user.userId,
      })),
    });

    // Fetch created entries with relations
    const savedEntries = await prisma.accrualEntry.findMany({
      where: {
        fiscalPeriodId,
        promotionId: { in: entries.map(e => e.promotionId) },
        status: 'PENDING',
      },
      include: {
        promotion: { select: { id: true, code: true, name: true, budget: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(201).json({
      success: true,
      data: {
        calculated: created.count,
        totalAmount: Math.round(totalAmount * 100) / 100,
        entries: savedEntries,
      },
    });
  } catch (error) {
    console.error('Calculate accruals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
