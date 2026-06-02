/**
 * Scenarios API - List and Create
 * GET /api/planning/scenarios - List scenarios with filters
 * POST /api/planning/scenarios - Create new scenario
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface CreateScenarioRequest {
  name: string;
  description?: string;
  baselineId?: string;
  parameters: {
    promotionType: string;
    discountPercent?: number;
    budget: number;
    duration: number;
    targetCustomers: string[];
    targetProducts: string[];
    startDate: string;
    expectedLiftPercent: number;
    redemptionRatePercent: number;
  };
  assumptions?: {
    baselineSalesPerDay: number;
    averageOrderValue: number;
    marginPercent: number;
    cannibalizedPercent?: number;
    haloEffectPercent?: number;
  };
}

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
      return handleCreate(req, res, user.userId);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Scenarios API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    limit = '20',
    status,
    baselineId,
    createdById,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (baselineId) {
    where.baselineId = baselineId;
  }

  if (createdById) {
    where.createdById = createdById;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Execute queries in parallel
  const [scenarios, total, statusCounts] = await Promise.all([
    prisma.scenario.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        baseline: {
          select: { id: true, category: true, brand: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        _count: { select: { versions: true } },
      },
    }),
    prisma.scenario.count({ where }),
    prisma.scenario.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  // Calculate summary stats
  const summary = {
    total,
    byStatus: statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return res.status(200).json({
    success: true,
    data: scenarios,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    summary,
  });
}

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const {
    name,
    description,
    baselineId,
    parameters,
    assumptions,
  } = req.body as CreateScenarioRequest;

  // Validate required fields
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Scenario name is required' });
  }

  if (!parameters) {
    return res.status(400).json({ error: 'Scenario parameters are required' });
  }

  // Validate parameters
  const {
    promotionType,
    budget,
    duration,
    startDate,
    expectedLiftPercent,
    redemptionRatePercent,
  } = parameters;

  if (!promotionType) {
    return res.status(400).json({ error: 'Promotion type is required' });
  }

  if (!budget || budget <= 0) {
    return res.status(400).json({ error: 'Valid budget is required' });
  }

  if (!duration || duration <= 0) {
    return res.status(400).json({ error: 'Valid duration is required' });
  }

  if (!startDate) {
    return res.status(400).json({ error: 'Start date is required' });
  }

  if (expectedLiftPercent === undefined || expectedLiftPercent < 0) {
    return res.status(400).json({ error: 'Expected lift percent must be >= 0' });
  }

  if (
    redemptionRatePercent === undefined ||
    redemptionRatePercent < 0 ||
    redemptionRatePercent > 100
  ) {
    return res
      .status(400)
      .json({ error: 'Redemption rate must be between 0 and 100' });
  }

  // Validate baseline if provided
  if (baselineId) {
    const baseline = await prisma.baseline.findUnique({
      where: { id: baselineId },
    });

    if (!baseline) {
      return res.status(400).json({ error: 'Baseline not found' });
    }
  }

  // Default assumptions if not provided
  const defaultAssumptions = {
    baselineSalesPerDay: 10000,
    averageOrderValue: 50,
    marginPercent: 30,
    cannibalizedPercent: 0,
    haloEffectPercent: 0,
  };

  // Create scenario
  const scenario = await prisma.scenario.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      baselineId: baselineId || null,
      parameters: parameters as any,
      assumptions: { ...defaultAssumptions, ...assumptions } as any,
      status: 'DRAFT',
      createdById: userId,
    },
    include: {
      baseline: {
        select: { id: true, category: true, brand: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return res.status(201).json({
    success: true,
    data: scenario,
  });
}
