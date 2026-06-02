/**
 * Scenario Card Component
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Play,
  Copy,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { ScenarioStatusBadge } from './ScenarioStatusBadge';
import { formatPercent } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Scenario } from '@/hooks/planning/useScenarios';

interface ScenarioCardProps {
  scenario: Scenario;
  onRun?: (id: string) => void;
  onClone?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  isSelected?: boolean;
  showSelect?: boolean;
}

export function ScenarioCard({
  scenario,
  onRun,
  onClone,
  onDelete,
  onSelect,
  isSelected,
  showSelect,
}: ScenarioCardProps) {
  const { results, parameters } = scenario;

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect?.(scenario.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            )}
            <div>
              <Link to={`/planning/scenarios/${scenario.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors">
                  {scenario.name}
                </CardTitle>
              </Link>
              {scenario.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {scenario.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScenarioStatusBadge status={scenario.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/planning/scenarios/${scenario.id}`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {scenario.status === 'DRAFT' && onRun && (
                  <DropdownMenuItem onClick={() => onRun(scenario.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Simulation
                  </DropdownMenuItem>
                )}
                {onClone && (
                  <DropdownMenuItem onClick={() => onClone(scenario.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(scenario.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Parameters Summary */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {parameters.duration} days
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <CurrencyDisplay amount={parameters.budget} size="sm" showToggle={false} /> budget
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {parameters.expectedLiftPercent}% expected lift
          </div>
        </div>

        {/* Results Summary (if completed) */}
        {results && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className={`text-lg font-semibold ${results.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatPercent(results.roi)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Margin</p>
              <div className={results.netMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                <CurrencyDisplay amount={results.netMargin} size="md" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sales Lift</p>
              <p className="text-lg font-semibold">{formatPercent(results.salesLiftPercent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payback</p>
              <p className="text-lg font-semibold">{results.paybackDays} days</p>
            </div>
          </div>
        )}

        {/* Baseline Reference */}
        {scenario.baseline && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            Baseline: {scenario.baseline.name} ({scenario.baseline.code})
          </div>
        )}
      </CardContent>
    </Card>
  );
}
