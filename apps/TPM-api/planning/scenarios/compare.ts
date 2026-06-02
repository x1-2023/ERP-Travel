/**
 * Scenario Compare API
 * POST /api/planning/scenarios/compare - Compare multiple scenarios
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import prisma from '../../_lib/prisma';

interface CompareRequest {
  scenarioIds: string[];
}

interface MetricComparison {
  metrics: string[];
  values: Record<string, Record<string, number>>;
  winner: Record<string, string>;
  rankings: Record<string, string[]>;
}

const COMPARISON_METRICS = [
  { key: 'roi', label: 'ROI (%)', higherIsBetter: true },
  { key: 'netMargin', label: 'Net Margin', higherIsBetter: true },
  { key: 'salesLiftPercent', label: 'Sales Lift (%)', higherIsBetter: true },
  { key: 'paybackDays', label: 'Payback Days', higherIsBetter: false },
  { key: 'incrementalSales', label: 'Incremental Sales', higherIsBetter: true },
  { key: 'promotionCost', label: 'Promotion Cost', higherIsBetter: false },
  { key: 'costPerIncrementalUnit', label: 'Cost per Unit', higherIsBetter: false },
  { key: 'grossMargin', label: 'Gross Margin', higherIsBetter: true },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { scenarioIds } = req.body as CompareRequest;

    // Validate
    if (!scenarioIds || !Array.isArray(scenarioIds)) {
      return res.status(400).json({ error: 'scenarioIds array is required' });
    }

    if (scenarioIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 scenarios required for comparison' });
    }

    if (scenarioIds.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 scenarios can be compared' });
    }

    // Fetch scenarios
    const scenarios = await prisma.scenario.findMany({
      where: {
        id: { in: scenarioIds },
        status: 'COMPLETED',
        results: { not: Prisma.JsonNull },
      },
      include: {
        baseline: {
          select: { id: true, category: true, brand: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (scenarios.length < 2) {
      return res.status(400).json({
        error: 'At least 2 completed scenarios with results are required',
      });
    }

    // Build comparison matrix
    const comparison = buildComparison(scenarios);

    // Generate recommendation
    const recommendation = generateRecommendation(scenarios, comparison);

    return res.status(200).json({
      success: true,
      data: {
        scenarios,
        comparison,
        recommendation,
      },
    });
  } catch (error: any) {
    console.error('Scenario compare error:', error);
    return res.status(500).json({ error: error.message || 'Comparison failed' });
  }
}

function buildComparison(scenarios: any[]): MetricComparison {
  const metrics = COMPARISON_METRICS.map((m) => m.key);
  const values: Record<string, Record<string, number>> = {};
  const winner: Record<string, string> = {};
  const rankings: Record<string, string[]> = {};

  // Initialize values structure
  for (const scenario of scenarios) {
    values[scenario.id] = {};
  }

  // Extract metric values
  for (const metric of COMPARISON_METRICS) {
    const metricValues: Array<{ id: string; value: number }> = [];

    for (const scenario of scenarios) {
      const results = scenario.results as any;
      const value = results?.[metric.key] ?? 0;
      values[scenario.id][metric.key] = value;
      metricValues.push({ id: scenario.id, value });
    }

    // Sort to determine winner and rankings
    if (metric.higherIsBetter) {
      metricValues.sort((a, b) => b.value - a.value);
    } else {
      metricValues.sort((a, b) => a.value - b.value);
    }

    // Set winner (best value)
    winner[metric.key] = metricValues[0].id;

    // Set rankings
    rankings[metric.key] = metricValues.map((m) => m.id);
  }

  return { metrics, values, winner, rankings };
}

function generateRecommendation(scenarios: any[], comparison: MetricComparison): string {
  // Score each scenario based on wins
  const scores: Record<string, number> = {};

  for (const scenario of scenarios) {
    scores[scenario.id] = 0;
  }

  // Weight the metrics (ROI and Net Margin are most important)
  const weights: Record<string, number> = {
    roi: 3,
    netMargin: 3,
    salesLiftPercent: 2,
    paybackDays: 2,
    incrementalSales: 1,
    promotionCost: 1,
    costPerIncrementalUnit: 1,
    grossMargin: 1,
  };

  // Score based on rankings
  for (const [metric, rankedIds] of Object.entries(comparison.rankings)) {
    const weight = weights[metric] || 1;
    rankedIds.forEach((id, index) => {
      // Points based on position (first = full points, last = 1 point)
      const points = (scenarios.length - index) * weight;
      scores[id] += points;
    });
  }

  // Find the winner
  let bestId = '';
  let bestScore = -1;

  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  const bestScenario = scenarios.find((s) => s.id === bestId);
  const bestResults = bestScenario?.results as any;

  // Build recommendation text
  let recommendation = `**Recommended: ${bestScenario?.name}**\n\n`;

  recommendation += `Based on comprehensive analysis, "${bestScenario?.name}" delivers the best overall performance.\n\n`;

  recommendation += `**Key Highlights:**\n`;
  recommendation += `• ROI: ${bestResults?.roi}%\n`;
  recommendation += `• Net Margin: $${bestResults?.netMargin?.toLocaleString()}\n`;
  recommendation += `• Sales Lift: ${bestResults?.salesLiftPercent}%\n`;
  recommendation += `• Payback Period: ${bestResults?.paybackDays} days\n\n`;

  // Comparison insights
  if (scenarios.length === 2) {
    const otherScenario = scenarios.find((s) => s.id !== bestId);
    const otherResults = otherScenario?.results as any;

    const roiDiff = (bestResults?.roi || 0) - (otherResults?.roi || 0);
    const marginDiff = (bestResults?.netMargin || 0) - (otherResults?.netMargin || 0);

    if (roiDiff > 0) {
      recommendation += `Compared to "${otherScenario?.name}", this option delivers ${roiDiff.toFixed(1)}% higher ROI `;
      recommendation += `and $${Math.abs(marginDiff).toLocaleString()} ${marginDiff >= 0 ? 'more' : 'less'} net margin.`;
    }
  } else {
    const winCount = Object.values(comparison.winner).filter((id) => id === bestId).length;
    recommendation += `This scenario leads in ${winCount} out of ${COMPARISON_METRICS.length} key metrics.`;
  }

  return recommendation;
}
