import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * GET /budgets/:id/comparison
 * Compare budget with previous period (Aforza-style budget review)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing budget id' });

  try {
    // Get current budget
    const current = await prisma.budget.findUnique({
      where: { id },
      include: {
        allocations: {
          include: { geographicUnit: true },
        },
      },
    });

    if (!current) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Find previous period budget (same category, previous quarter/year)
    const previousQuarter = current.quarter === 1 ? 4 : (current.quarter || 1) - 1;
    const previousYear = current.quarter === 1 ? current.year - 1 : current.year;

    const previous = await prisma.budget.findFirst({
      where: {
        year: previousYear,
        quarter: previousQuarter,
        category: current.category,
        companyId: current.companyId,
        id: { not: current.id },
      },
      include: {
        allocations: {
          include: { geographicUnit: true },
        },
      },
    });

    // Calculate current metrics
    const currentTotal = Number(current.totalAmount);
    const currentSpent = current.allocations.reduce((s, a) => s + Number(a.spentAmount), 0);
    const currentUtilization = currentTotal > 0 ? (currentSpent / currentTotal) * 100 : 0;

    // Calculate previous metrics (if exists)
    const previousTotal = previous ? Number(previous.totalAmount) : null;
    const previousSpent = previous
      ? previous.allocations.reduce((s, a) => s + Number(a.spentAmount), 0)
      : null;
    const previousUtilization = previousTotal && previousTotal > 0
      ? ((previousSpent || 0) / previousTotal) * 100
      : null;

    // Calculate changes
    const amountChange = previousTotal !== null ? currentTotal - previousTotal : null;
    const amountChangePercent = previousTotal !== null && previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : null;
    const utilizationChange = previousUtilization !== null
      ? currentUtilization - previousUtilization
      : null;

    // Compare by region
    const regionComparison = compareByRegion(current.allocations, previous?.allocations || []);

    // Calculate trending (get last 4 periods)
    const trendingData = await getUtilizationTrend(current.companyId, current.category);

    return res.status(200).json({
      data: {
        current: {
          id: current.id,
          code: current.code,
          name: current.name,
          period: `Q${current.quarter || 'Annual'} ${current.year}`,
          totalAmount: currentTotal,
          spentAmount: currentSpent,
          utilization: Math.round(currentUtilization),
        },
        previous: previous ? {
          id: previous.id,
          code: previous.code,
          name: previous.name,
          period: `Q${previous.quarter || 'Annual'} ${previous.year}`,
          totalAmount: previousTotal,
          spentAmount: previousSpent,
          utilization: Math.round(previousUtilization || 0),
        } : null,
        changes: {
          amount: amountChange !== null ? Math.round(amountChange) : null,
          amountPercent: amountChangePercent !== null ? Math.round(amountChangePercent) : null,
          utilization: utilizationChange !== null ? Math.round(utilizationChange) : null,
          trend: amountChangePercent !== null
            ? (amountChangePercent > 0 ? 'INCREASING' : amountChangePercent < 0 ? 'DECREASING' : 'STABLE')
            : 'N/A',
        },
        byRegion: regionComparison,
        trending: trendingData,
        constraints: current.constraints,
      },
    });
  } catch (error) {
    console.error('Budget comparison error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function compareByRegion(currentAllocs: any[], previousAllocs: any[]) {
  const currentByRegion = new Map<string, { code: string; name: string; amount: number }>();
  const previousByRegion = new Map<string, number>();

  // Current allocations by region
  currentAllocs
    .filter(a => a.geographicUnit.level === 'REGION')
    .forEach(a => {
      currentByRegion.set(a.geographicUnit.code, {
        code: a.geographicUnit.code,
        name: a.geographicUnit.name,
        amount: Number(a.allocatedAmount),
      });
    });

  // Previous allocations by region
  previousAllocs
    .filter(a => a.geographicUnit.level === 'REGION')
    .forEach(a => {
      previousByRegion.set(a.geographicUnit.code, Number(a.allocatedAmount));
    });

  // Combine all regions
  const allRegions = new Set([...currentByRegion.keys(), ...previousByRegion.keys()]);

  return Array.from(allRegions).map(code => {
    const current = currentByRegion.get(code);
    const previousAmount = previousByRegion.get(code) || 0;
    const currentAmount = current?.amount || 0;
    const change = currentAmount - previousAmount;
    const changePercent = previousAmount > 0
      ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100)
      : null;

    return {
      code,
      name: current?.name || code,
      current: currentAmount,
      previous: previousAmount,
      change,
      changePercent,
    };
  });
}

async function getUtilizationTrend(companyId: string | null, category: string | null) {
  const where: any = {};
  if (companyId) where.companyId = companyId;
  if (category) where.category = category;

  const budgets = await prisma.budget.findMany({
    where,
    include: { allocations: true },
    orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
    take: 8,
  });

  return budgets.map(b => {
    const total = Number(b.totalAmount);
    const spent = b.allocations.reduce((s, a) => s + Number(a.spentAmount), 0);
    return {
      period: `Q${b.quarter || 'A'} ${b.year}`,
      totalAmount: total,
      spentAmount: spent,
      utilization: total > 0 ? Math.round((spent / total) * 100) : 0,
    };
  }).reverse();
}
