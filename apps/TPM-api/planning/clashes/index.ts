/**
 * Clashes API - List and Detect
 * GET /api/planning/clashes - List all clashes
 * POST /api/planning/clashes - Detect clashes for promotions
 */

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
      return handleList(req, res);
    } else if (req.method === 'POST') {
      return handleDetect(req, res, user.userId);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Clashes API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    limit = '20',
    status,
    severity,
    promotionId,
    startDate,
    endDate,
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (severity && severity !== 'all') {
    where.severity = severity;
  }

  if (promotionId) {
    where.OR = [
      { promotionAId: promotionId },
      { promotionBId: promotionId },
    ];
  }

  if (startDate || endDate) {
    where.detectedAt = {};
    if (startDate) where.detectedAt.gte = new Date(startDate);
    if (endDate) where.detectedAt.lte = new Date(endDate);
  }

  // Execute queries
  const [clashes, total, statusCounts, severityCounts] = await Promise.all([
    prisma.promotionClash.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { detectedAt: 'desc' },
      include: {
        promotionA: {
          select: {
            id: true,
            code: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        promotionB: {
          select: {
            id: true,
            code: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.promotionClash.count({ where }),
    prisma.promotionClash.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.promotionClash.groupBy({
      by: ['severity'],
      _count: { id: true },
    }),
  ]);

  const summary = {
    total,
    byStatus: statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
    bySeverity: severityCounts.reduce(
      (acc, item) => {
        acc[item.severity] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return res.status(200).json({
    success: true,
    data: clashes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    summary,
  });
}

async function handleDetect(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const { promotionIds, dateRange } = req.body;

  // Build query for promotions to check
  const where: any = {
    status: { in: ['DRAFT', 'APPROVED', 'ACTIVE'] },
  };

  if (promotionIds?.length) {
    where.id = { in: promotionIds };
  }

  if (dateRange?.startDate && dateRange?.endDate) {
    where.OR = [
      {
        startDate: { lte: new Date(dateRange.endDate) },
        endDate: { gte: new Date(dateRange.startDate) },
      },
    ];
  }

  // Fetch promotions
  const promotions = await prisma.promotion.findMany({
    where,
    include: {
      customer: { select: { id: true, code: true, name: true } },
    },
  });

  if (promotions.length < 2) {
    return res.status(200).json({
      success: true,
      data: [],
      message: 'Not enough promotions to detect clashes',
    });
  }

  // Detect clashes
  const clashes: any[] = [];
  const existingClashes = await prisma.promotionClash.findMany({
    where: { status: { in: ['DETECTED', 'ACKNOWLEDGED'] } },
    select: { promotionAId: true, promotionBId: true },
  });

  const existingPairs = new Set(
    existingClashes.map((c) => [c.promotionAId, c.promotionBId].sort().join('-'))
  );

  for (let i = 0; i < promotions.length; i++) {
    for (let j = i + 1; j < promotions.length; j++) {
      const promoA = promotions[i];
      const promoB = promotions[j];

      // Skip if clash already exists
      const pairKey = [promoA.id, promoB.id].sort().join('-');
      if (existingPairs.has(pairKey)) continue;

      // Check for clashes
      const clashResult = detectClash(promoA, promoB);

      if (clashResult.hasClash) {
        clashes.push({
          companyId: (promoA as any).companyId || '',
          promotionAId: promoA.id,
          promotionBId: promoB.id,
          clashType: clashResult.type,
          severity: clashResult.severity,
          description: clashResult.description,
          overlapStartDate: clashResult.overlapStart,
          overlapEndDate: clashResult.overlapEnd,
          affectedCustomer: clashResult.affectedCustomers?.[0] || null,
          affectedProducts: clashResult.affectedProducts || [],
          estimatedImpact: clashResult.potentialImpact,
          status: 'DETECTED',
          detectedAt: new Date(),
        });
      }
    }
  }

  // Create clash records
  if (clashes.length > 0) {
    await prisma.promotionClash.createMany({
      data: clashes,
      skipDuplicates: true,
    });
  }

  // Fetch created clashes with relations
  const createdClashes = await prisma.promotionClash.findMany({
    where: {
      detectedAt: { gte: new Date(Date.now() - 60000) }, // Last minute
      status: 'DETECTED',
    },
    include: {
      promotionA: {
        select: { id: true, code: true, name: true },
      },
      promotionB: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { severity: 'desc' },
  });

  return res.status(200).json({
    success: true,
    data: createdClashes,
    summary: {
      checked: promotions.length,
      clashesFound: clashes.length,
      bySeverity: {
        HIGH: clashes.filter((c) => c.severity === 'HIGH').length,
        MEDIUM: clashes.filter((c) => c.severity === 'MEDIUM').length,
        LOW: clashes.filter((c) => c.severity === 'LOW').length,
      },
    },
  });
}

interface ClashResult {
  hasClash: boolean;
  type?: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  overlapStart?: Date;
  overlapEnd?: Date;
  affectedCustomers?: string[];
  affectedProducts?: string[];
  potentialImpact?: number;
}

function detectClash(promoA: any, promoB: any): ClashResult {
  // Check date overlap
  const aStart = new Date(promoA.startDate);
  const aEnd = new Date(promoA.endDate);
  const bStart = new Date(promoB.startDate);
  const bEnd = new Date(promoB.endDate);

  const hasDateOverlap = aStart <= bEnd && bStart <= aEnd;
  if (!hasDateOverlap) {
    return { hasClash: false };
  }

  // Calculate overlap period
  const overlapStart = new Date(Math.max(aStart.getTime(), bStart.getTime()));
  const overlapEnd = new Date(Math.min(aEnd.getTime(), bEnd.getTime()));

  // Check customer overlap
  const aCustomerId = promoA.customerId;
  const bCustomerId = promoB.customerId;
  const hasCustomerOverlap = aCustomerId && bCustomerId && aCustomerId === bCustomerId;

  // Check product overlap
  const aProductIds = new Set(promoA.products?.map((p: any) => p.id) || []);
  const bProductIds = promoB.products?.map((p: any) => p.id) || [];
  const overlappingProducts = bProductIds.filter((id: string) => aProductIds.has(id));
  const hasProductOverlap = overlappingProducts.length > 0;

  // Determine clash type and severity
  if (hasCustomerOverlap && hasProductOverlap) {
    // Same customer, same products, overlapping dates = HIGH severity
    return {
      hasClash: true,
      type: 'FULL_OVERLAP',
      severity: 'HIGH',
      description: `Promotions target the same customer and ${overlappingProducts.length} product(s) during overlapping dates`,
      overlapStart,
      overlapEnd,
      affectedCustomers: [aCustomerId],
      affectedProducts: overlappingProducts,
      potentialImpact: calculateImpact(promoA, promoB, overlappingProducts.length),
    };
  } else if (hasCustomerOverlap) {
    // Same customer, different products
    return {
      hasClash: true,
      type: 'CUSTOMER_OVERLAP',
      severity: 'MEDIUM',
      description: `Promotions target the same customer during overlapping dates`,
      overlapStart,
      overlapEnd,
      affectedCustomers: [aCustomerId],
      affectedProducts: [],
      potentialImpact: calculateImpact(promoA, promoB, 0),
    };
  } else if (hasProductOverlap) {
    // Different customers, same products
    return {
      hasClash: true,
      type: 'PRODUCT_OVERLAP',
      severity: 'LOW',
      description: `Promotions target ${overlappingProducts.length} shared product(s) during overlapping dates`,
      overlapStart,
      overlapEnd,
      affectedCustomers: [aCustomerId, bCustomerId].filter(Boolean),
      affectedProducts: overlappingProducts,
      potentialImpact: calculateImpact(promoA, promoB, overlappingProducts.length),
    };
  }

  return { hasClash: false };
}

function calculateImpact(promoA: any, promoB: any, productOverlap: number): number {
  // Simple impact calculation based on budget overlap
  const budgetA = promoA.budget?.toNumber?.() || promoA.budget || 0;
  const budgetB = promoB.budget?.toNumber?.() || promoB.budget || 0;
  const totalBudget = budgetA + budgetB;

  // Impact increases with product overlap
  const overlapFactor = 1 + (productOverlap * 0.1);

  return Math.round(totalBudget * overlapFactor * 0.1); // 10% potential waste
}
