/**
 * Scenario Run API - Execute Simulation
 * POST /api/planning/scenarios/[id]/run - Run scenario simulation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

interface ScenarioParameters {
  promotionType: string;
  discountPercent?: number;
  budget: number;
  duration: number;
  targetCustomers: string[];
  targetProducts: string[];
  startDate: string;
  expectedLiftPercent: number;
  redemptionRatePercent: number;
}

interface ScenarioAssumptions {
  baselineSalesPerDay: number;
  averageOrderValue: number;
  marginPercent: number;
  cannibalizedPercent?: number;
  haloEffectPercent?: number;
}

interface ScenarioResults {
  // Sales Impact
  baselineSales: number;
  projectedSales: number;
  incrementalSales: number;
  salesLiftPercent: number;

  // Cost Analysis
  promotionCost: number;
  fundingRequired: number;
  costPerIncrementalUnit: number;

  // Profitability
  grossMargin: number;
  netMargin: number;
  roi: number;
  paybackDays: number;

  // Volume
  projectedUnits: number;
  incrementalUnits: number;
  redemptions: number;

  // Timeline
  dailyProjections: DailyProjection[];
}

interface DailyProjection {
  date: string;
  day: number;
  baselineSales: number;
  projectedSales: number;
  promotionCost: number;
  cumulativeROI: number;
  cumulativeNetMargin: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Scenario ID is required' });
  }

  try {
    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: {
        baseline: true,
      },
    });

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Mark as running
    await prisma.scenario.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    // Get parameters and assumptions
    const params = scenario.parameters as unknown as ScenarioParameters;
    const assumptions = (scenario.assumptions as unknown as ScenarioAssumptions) || {} as ScenarioAssumptions;

    // Apply baseline data if available
    let baselineSalesPerDay = assumptions.baselineSalesPerDay || 10000;
    if (scenario.baseline) {
      // Use baseline value if available
      const baselineValue = scenario.baseline.baselineVolume?.toNumber();
      if (baselineValue) {
        baselineSalesPerDay = baselineValue / 30; // Convert monthly to daily
      }
    }

    // Run the simulation
    const results = runSimulation(params, {
      ...assumptions,
      baselineSalesPerDay,
    });

    // Save version
    const versionCount = await prisma.scenarioVersion.count({
      where: { scenarioId: id },
    });

    await prisma.scenarioVersion.create({
      data: {
        scenarioId: id,
        version: versionCount + 1,
        parameters: params as any,
        results: results as any,
        notes: req.body.notes || null,
        createdById: user.userId,
      },
    });

    // Update scenario with results
    const updated = await prisma.scenario.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        results: results as any,
        updatedAt: new Date(),
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

    return res.status(200).json({
      success: true,
      data: updated,
      results,
    });
  } catch (error: any) {
    // Mark as draft on error
    await prisma.scenario.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    console.error('Scenario run error:', error);
    return res.status(500).json({ error: error.message || 'Simulation failed' });
  }
}

/**
 * Core Simulation Engine
 */
function runSimulation(
  params: ScenarioParameters,
  assumptions: ScenarioAssumptions
): ScenarioResults {
  const {
    discountPercent = 0,
    duration,
    expectedLiftPercent,
    redemptionRatePercent,
  } = params;

  const {
    baselineSalesPerDay,
    averageOrderValue,
    marginPercent,
    cannibalizedPercent = 0,
    haloEffectPercent = 0,
  } = assumptions;

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Baseline sales for the period
  const baselineSales = baselineSalesPerDay * duration;

  // Apply expected lift
  const liftMultiplier = 1 + (expectedLiftPercent / 100);
  const rawProjectedSales = baselineSalesPerDay * liftMultiplier * duration;

  // Apply halo effect (additional lift from brand awareness)
  const haloSales = rawProjectedSales * (haloEffectPercent / 100);
  const projectedSales = rawProjectedSales + haloSales;

  // Calculate cannibalization (sales that would have happened anyway)
  const grossIncrementalSales = projectedSales - baselineSales;
  const cannibalized = grossIncrementalSales * (cannibalizedPercent / 100);
  const incrementalSales = grossIncrementalSales - cannibalized;

  // Sales lift percentage (net of cannibalization)
  const salesLiftPercent = baselineSales > 0
    ? (incrementalSales / baselineSales) * 100
    : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // COST CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Number of redemptions
  const totalTransactions = projectedSales / averageOrderValue;
  const redemptions = totalTransactions * (redemptionRatePercent / 100);

  // Promotion cost (discount * redemptions * AOV)
  const promotionCost = redemptions * (discountPercent / 100) * averageOrderValue;

  // Funding required (typically promotion cost + buffer)
  const fundingRequired = promotionCost * 1.1; // 10% buffer

  // Cost per incremental unit
  const incrementalUnits = incrementalSales / averageOrderValue;
  const costPerIncrementalUnit = incrementalUnits > 0
    ? promotionCost / incrementalUnits
    : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFITABILITY CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Gross margin on incremental sales
  const grossMargin = incrementalSales * (marginPercent / 100);

  // Net margin = Gross margin - Promotion cost
  const netMargin = grossMargin - promotionCost;

  // ROI = (Net Margin / Promotion Cost) * 100
  const roi = promotionCost > 0
    ? (netMargin / promotionCost) * 100
    : 0;

  // Payback days (when cumulative net margin turns positive)
  const dailyNetMargin = netMargin / duration;
  const dailyPromotionCost = promotionCost / duration;
  let paybackDays = duration;

  if (dailyNetMargin > 0) {
    // Simple payback calculation
    paybackDays = Math.ceil(promotionCost / (dailyNetMargin + dailyPromotionCost));
    if (paybackDays > duration) paybackDays = duration;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOLUME CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const projectedUnits = projectedSales / averageOrderValue;

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY PROJECTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const dailyProjections: DailyProjection[] = [];
  const startDate = new Date(params.startDate);
  let cumulativeNetMargin = 0;
  let cumulativePromotionCost = 0;

  for (let day = 1; day <= duration; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);

    // Apply a curve to simulate realistic promotion patterns
    // Peak in the middle, taper at start and end
    const dayFactor = calculateDayFactor(day, duration);

    const dayBaselineSales = baselineSalesPerDay;
    const dayProjectedSales = baselineSalesPerDay * liftMultiplier * dayFactor;
    const dayPromotionCost = (promotionCost / duration) * dayFactor;

    cumulativePromotionCost += dayPromotionCost;
    const dayGrossMargin = (dayProjectedSales - dayBaselineSales) * (marginPercent / 100);
    cumulativeNetMargin += dayGrossMargin - dayPromotionCost;

    const cumulativeROI = cumulativePromotionCost > 0
      ? (cumulativeNetMargin / cumulativePromotionCost) * 100
      : 0;

    dailyProjections.push({
      date: currentDate.toISOString().split('T')[0],
      day,
      baselineSales: Math.round(dayBaselineSales),
      projectedSales: Math.round(dayProjectedSales),
      promotionCost: Math.round(dayPromotionCost),
      cumulativeROI: Math.round(cumulativeROI * 10) / 10,
      cumulativeNetMargin: Math.round(cumulativeNetMargin),
    });
  }

  return {
    // Sales Impact
    baselineSales: Math.round(baselineSales),
    projectedSales: Math.round(projectedSales),
    incrementalSales: Math.round(incrementalSales),
    salesLiftPercent: Math.round(salesLiftPercent * 10) / 10,

    // Cost Analysis
    promotionCost: Math.round(promotionCost),
    fundingRequired: Math.round(fundingRequired),
    costPerIncrementalUnit: Math.round(costPerIncrementalUnit),

    // Profitability
    grossMargin: Math.round(grossMargin),
    netMargin: Math.round(netMargin),
    roi: Math.round(roi * 10) / 10,
    paybackDays,

    // Volume
    projectedUnits: Math.round(projectedUnits),
    incrementalUnits: Math.round(incrementalUnits),
    redemptions: Math.round(redemptions),

    // Timeline
    dailyProjections,
  };
}

/**
 * Calculate day factor for realistic promotion curve
 * Ramp up -> Peak -> Taper down
 */
function calculateDayFactor(day: number, totalDays: number): number {
  const midpoint = totalDays / 2;
  const normalizedDay = (day - midpoint) / midpoint;

  // Bell curve-like distribution
  // Peak at midpoint, 70% at start/end
  const factor = 1 - (normalizedDay * normalizedDay * 0.3);

  return Math.max(0.7, Math.min(1.1, factor));
}
