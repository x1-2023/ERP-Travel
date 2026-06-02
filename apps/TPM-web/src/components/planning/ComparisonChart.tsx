/**
 * Scenario Comparison Chart Component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import type { CompareResult } from '@/hooks/planning/useScenarios';

interface ComparisonChartProps {
  comparison: CompareResult;
}

const METRIC_CONFIG: Record<
  string,
  {
    label: string;
    format: (v: number) => string;
    higherIsBetter: boolean;
  }
> = {
  roi: { label: 'ROI (%)', format: formatPercent, higherIsBetter: true },
  netMargin: { label: 'Net Margin', format: (v) => formatCurrencyCompact(v, 'VND'), higherIsBetter: true },
  salesLiftPercent: {
    label: 'Sales Lift (%)',
    format: formatPercent,
    higherIsBetter: true,
  },
  paybackDays: {
    label: 'Payback Days',
    format: (v) => `${v} days`,
    higherIsBetter: false,
  },
  incrementalSales: {
    label: 'Incremental Sales',
    format: (v) => formatCurrencyCompact(v, 'VND'),
    higherIsBetter: true,
  },
  promotionCost: {
    label: 'Promotion Cost',
    format: (v) => formatCurrencyCompact(v, 'VND'),
    higherIsBetter: false,
  },
  costPerIncrementalUnit: {
    label: 'Cost per Unit',
    format: (v) => formatCurrencyCompact(v, 'VND'),
    higherIsBetter: false,
  },
  grossMargin: { label: 'Gross Margin', format: (v) => formatCurrencyCompact(v, 'VND'), higherIsBetter: true },
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 0) return <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  if (rank === 1) return <Medal className="h-4 w-4 text-gray-500" />;
  if (rank === 2) return <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
  return null;
}

export function ComparisonChart({ comparison }: ComparisonChartProps) {
  const { scenarios, comparison: compData, recommendation } = comparison;

  // Calculate overall winner (most first places)
  const winCounts: Record<string, number> = {};
  scenarios.forEach((s) => (winCounts[s.id] = 0));
  Object.values(compData.winner).forEach((winnerId) => {
    winCounts[winnerId]++;
  });

  const overallWinner = Object.entries(winCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  return (
    <div className="space-y-6">
      {/* Scenarios Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Scenarios Being Compared</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {scenarios.map((scenario, idx) => (
              <div
                key={scenario.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  scenario.id === overallWinner ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700' : ''
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full`}
                  style={{
                    backgroundColor: `hsl(${(idx * 360) / scenarios.length}, 70%, 50%)`,
                  }}
                />
                <span className="font-medium">{scenario.name}</span>
                {scenario.id === overallWinner && (
                  <Badge variant="default" className="ml-2">
                    Best Overall
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Metric</th>
                  {scenarios.map((scenario, idx) => (
                    <th
                      key={scenario.id}
                      className="text-right py-3 px-4 font-semibold"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(${(idx * 360) / scenarios.length}, 70%, 50%)`,
                          }}
                        />
                        {scenario.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(METRIC_CONFIG).map(([key, config]) => {
                  const rankings = compData.rankings[key] || [];
                  const winner = compData.winner[key];

                  return (
                    <tr key={key} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {config.label}
                          <span className="text-xs text-muted-foreground">
                            ({config.higherIsBetter ? 'higher is better' : 'lower is better'})
                          </span>
                        </div>
                      </td>
                      {scenarios.map((scenario) => {
                        const value = compData.values[scenario.id]?.[key] ?? 0;
                        const rank = rankings.indexOf(scenario.id);
                        const isWinner = scenario.id === winner;

                        return (
                          <td
                            key={scenario.id}
                            className={`text-right py-3 px-4 ${
                              isWinner ? 'bg-emerald-50 dark:bg-emerald-950 font-semibold' : ''
                            }`}
                          >
                            <div className="flex items-center justify-end gap-2">
                              {rank >= 0 && rank < 3 && <RankIcon rank={rank} />}
                              <span className={isWinner ? 'text-emerald-700 dark:text-emerald-300' : ''}>
                                {config.format(value)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Bar Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map((scenario, idx) => {
              const roi = compData.values[scenario.id]?.roi ?? 0;
              const maxRoi = Math.max(
                ...scenarios.map((s) => Math.abs(compData.values[s.id]?.roi ?? 0))
              );
              const width = maxRoi > 0 ? (Math.abs(roi) / maxRoi) * 100 : 0;

              return (
                <div key={scenario.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{scenario.name}</span>
                    <span
                      className={roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                    >
                      {formatPercent(roi)}
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        roi >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${width}%`,
                        backgroundColor: `hsl(${(idx * 360) / scenarios.length}, 70%, 50%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Net Margin Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Net Margin Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map((scenario, idx) => {
              const margin = compData.values[scenario.id]?.netMargin ?? 0;
              const maxMargin = Math.max(
                ...scenarios.map((s) =>
                  Math.abs(compData.values[s.id]?.netMargin ?? 0)
                )
              );
              const width = maxMargin > 0 ? (Math.abs(margin) / maxMargin) * 100 : 0;

              return (
                <div key={scenario.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{scenario.name}</span>
                    <span
                      className={margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                    >
                      {formatCurrencyCompact(margin, 'VND')}
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all`}
                      style={{
                        width: `${width}%`,
                        backgroundColor: `hsl(${(idx * 360) / scenarios.length}, 70%, 50%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            AI Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {recommendation.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <h4 key={i} className="font-semibold text-lg mb-2">
                    {line.replace(/\*\*/g, '')}
                  </h4>
                );
              }
              if (line.startsWith('•')) {
                return (
                  <p key={i} className="ml-4 mb-1">
                    {line}
                  </p>
                );
              }
              if (line.trim()) {
                return (
                  <p key={i} className="mb-2">
                    {line}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
