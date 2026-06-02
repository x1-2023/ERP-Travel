// ============================================================================
// ANALYSIS WHAT-IF PAGE - P2
// What-If scenario simulation and comparison tool
// Path: apps/web/src/pages/analysis/WhatIf.tsx
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  RotateCcw,
  Save,
  Copy,
  Trash2,
  Plus,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  Layers,
  Download,
  Sliders,
  Loader2,
  FlaskConical,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useWhatIfSimulation, useTPOHealth, useTPOMechanics, useTPOChannels } from '@/hooks/useTPO';
import type { MechanicType, ChannelType, WhatIfScenario as TPOScenario } from '@/types/tpo';
import { cn, formatNumber, safeDivide, safePercentageNumber } from '@/lib/utils';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';

// ============================================================================
// TYPES
// ============================================================================

interface ScenarioParams {
  name: string;
  budget: number;
  discountPercent: number;
  duration: number;
  targetCustomers: number;
  expectedUplift: number;
  redemptionRate: number;
  channels: string[];
}

interface ScenarioResults {
  revenue: number;
  incrementalRevenue: number;
  volume: number;
  incrementalVolume: number;
  roi: number;
  costPerUnit: number;
  costPerCustomer: number;
  profitImpact: number;
  breakEvenDays: number;
}

interface SimulationData {
  day: number;
  baseline: number;
  scenario1: number;
  scenario2?: number;
  scenario3?: number;
}

interface ComparisonMetric {
  metric: string;
  baseline: number;
  scenario1: number;
  scenario2?: number;
  scenario3?: number;
  unit: string;
}

// ============================================================================
// MOCK DATA & CALCULATIONS
// ============================================================================

const defaultParams: ScenarioParams = {
  name: 'Scenario 1',
  budget: 2000000000,
  discountPercent: 15,
  duration: 30,
  targetCustomers: 5000,
  expectedUplift: 20,
  redemptionRate: 70,
  channels: ['MT', 'GT'],
};

const calculateResults = (params: ScenarioParams): ScenarioResults => {
  const baseRevenue = 10000000000; // 10 tỷ baseline
  const avgOrderValue = 500000;
  
  const effectiveCustomers = params.targetCustomers * (params.redemptionRate / 100);
  const incrementalRevenue = baseRevenue * (params.expectedUplift / 100);
  const totalRevenue = baseRevenue + incrementalRevenue;
  
  const incrementalVolume = Math.round(incrementalRevenue / avgOrderValue);
  const totalVolume = Math.round(totalRevenue / avgOrderValue);
  
  const roi = safePercentageNumber(incrementalRevenue - params.budget, params.budget);
  const costPerUnit = safeDivide(params.budget, totalVolume);
  const costPerCustomer = safeDivide(params.budget, effectiveCustomers);
  const profitImpact = incrementalRevenue - params.budget;
  const breakEvenDays = Math.ceil(safeDivide(params.budget, incrementalRevenue) * params.duration);
  
  return {
    revenue: totalRevenue,
    incrementalRevenue,
    volume: totalVolume,
    incrementalVolume,
    roi: Math.round(roi * 10) / 10,
    costPerUnit: Math.round(costPerUnit),
    costPerCustomer: Math.round(costPerCustomer),
    profitImpact,
    breakEvenDays,
  };
};

const generateSimulationData = (params: ScenarioParams, scenarios: ScenarioParams[]): SimulationData[] => {
  const data: SimulationData[] = [];
  const baseDaily = 333333333; // ~333 triệu/ngày baseline
  
  for (let day = 1; day <= params.duration; day++) {
    const dataPoint: SimulationData = {
      day,
      baseline: Math.round(baseDaily / 1000000),
      scenario1: Math.round(baseDaily * (1 + scenarios[0]?.expectedUplift / 100 || 0.2) / 1000000),
    };
    
    if (scenarios[1]) {
      dataPoint.scenario2 = Math.round(baseDaily * (1 + scenarios[1].expectedUplift / 100) / 1000000);
    }
    if (scenarios[2]) {
      dataPoint.scenario3 = Math.round(baseDaily * (1 + scenarios[2].expectedUplift / 100) / 1000000);
    }
    
    data.push(dataPoint);
  }
  
  return data;
};

const COLORS = {
  baseline: '#94a3b8',
  scenario1: '#3b82f6',
  scenario2: '#10b981',
  scenario3: '#f59e0b',
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Parameter Slider Component
const ParamSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-bold text-primary">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
};

// Scenario Card
const ScenarioCard = ({
  params,
  results,
  index,
  isActive,
  onActivate,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  params: ScenarioParams;
  results: ScenarioResults;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (params: ScenarioParams) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  const colors = ['border-blue-500 bg-blue-50/50', 'border-green-500 bg-green-50/50', 'border-yellow-500 bg-yellow-50/50'];
  
  return (
    <Card className={cn(
      'transition-all cursor-pointer',
      isActive ? colors[index % 3] : 'hover:border-primary/50'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-yellow-500'
            )} />
            <Input
              value={params.name}
              onChange={(e) => onUpdate({ ...params, name: e.target.value })}
              className="h-7 w-32 text-sm font-medium border-none bg-transparent p-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" onClick={onActivate}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-background rounded border">
            <p className="text-xs text-muted-foreground">ROI</p>
            <p className={cn('text-lg font-bold', results.roi >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
              {results.roi}%
            </p>
          </div>
          <div className="p-2 bg-background rounded border">
            <p className="text-xs text-muted-foreground">Incremental</p>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400"><CurrencyDisplay amount={results.incrementalRevenue} size="md" showToggle={false} /></div>
          </div>
        </div>

        {/* Key Params */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Budget:</span>
            <span className="font-medium"><CurrencyDisplay amount={params.budget} size="sm" showToggle={false} /></span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium">{params.discountPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{params.duration} ngày</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uplift:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">+{params.expectedUplift}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Results Comparison Table
const ComparisonTable = ({ scenarios, results }: { scenarios: ScenarioParams[], results: ScenarioResults[] }) => {
  const metrics: ComparisonMetric[] = [
    {
      metric: 'Budget',
      baseline: 0,
      scenario1: scenarios[0]?.budget || 0,
      scenario2: scenarios[1]?.budget,
      scenario3: scenarios[2]?.budget,
      unit: 'currency',
    },
    {
      metric: 'Incremental Revenue',
      baseline: 0,
      scenario1: results[0]?.incrementalRevenue || 0,
      scenario2: results[1]?.incrementalRevenue,
      scenario3: results[2]?.incrementalRevenue,
      unit: 'currency',
    },
    {
      metric: 'ROI',
      baseline: 0,
      scenario1: results[0]?.roi || 0,
      scenario2: results[1]?.roi,
      scenario3: results[2]?.roi,
      unit: '%',
    },
    {
      metric: 'Volume Uplift',
      baseline: 0,
      scenario1: results[0]?.incrementalVolume || 0,
      scenario2: results[1]?.incrementalVolume,
      scenario3: results[2]?.incrementalVolume,
      unit: 'units',
    },
    {
      metric: 'Cost per Unit',
      baseline: 0,
      scenario1: results[0]?.costPerUnit || 0,
      scenario2: results[1]?.costPerUnit,
      scenario3: results[2]?.costPerUnit,
      unit: 'currency',
    },
    {
      metric: 'Profit Impact',
      baseline: 0,
      scenario1: results[0]?.profitImpact || 0,
      scenario2: results[1]?.profitImpact,
      scenario3: results[2]?.profitImpact,
      unit: 'currency',
    },
    {
      metric: 'Break-even Days',
      baseline: 0,
      scenario1: results[0]?.breakEvenDays || 0,
      scenario2: results[1]?.breakEvenDays,
      scenario3: results[2]?.breakEvenDays,
      unit: 'days',
    },
  ];

  const formatValue = (value: number | undefined, unit: string) => {
    if (value === undefined) return '-';
    if (unit === 'currency') return formatCurrencyCompact(value, 'VND');
    if (unit === '%') return `${value}%`;
    if (unit === 'units') return formatNumber(value);
    if (unit === 'days') return `${value} ngày`;
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          So sánh Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chỉ số</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {scenarios[0]?.name || 'Scenario 1'}
                </div>
              </TableHead>
              {scenarios[1] && (
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {scenarios[1]?.name || 'Scenario 2'}
                  </div>
                </TableHead>
              )}
              {scenarios[2] && (
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {scenarios[2]?.name || 'Scenario 3'}
                  </div>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell className="text-center font-medium text-blue-600">
                  {formatValue(row.scenario1, row.unit)}
                </TableCell>
                {scenarios[1] && (
                  <TableCell className="text-center font-medium text-green-600">
                    {formatValue(row.scenario2, row.unit)}
                  </TableCell>
                )}
                {scenarios[2] && (
                  <TableCell className="text-center font-medium text-yellow-600">
                    {formatValue(row.scenario3, row.unit)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Simulation Chart
const SimulationChart = ({ data, scenarios }: { data: SimulationData[], scenarios: ScenarioParams[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Simulation</CardTitle>
        <CardDescription>Dự báo doanh thu theo ngày (triệu VNĐ)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.baseline} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.baseline} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="scenario1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.scenario1} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.scenario1} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="scenario2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.scenario2} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.scenario2} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="baseline"
                name="Baseline"
                stroke={COLORS.baseline}
                fill="url(#baselineGrad)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="scenario1"
                name={scenarios[0]?.name || 'Scenario 1'}
                stroke={COLORS.scenario1}
                fill="url(#scenario1Grad)"
              />
              {scenarios[1] && (
                <Area
                  type="monotone"
                  dataKey="scenario2"
                  name={scenarios[1].name}
                  stroke={COLORS.scenario2}
                  fill="url(#scenario2Grad)"
                />
              )}
              {scenarios[2] && (
                <Line
                  type="monotone"
                  dataKey="scenario3"
                  name={scenarios[2].name}
                  stroke={COLORS.scenario3}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Insights Panel
const InsightsPanel = ({ scenarios, results }: { scenarios: ScenarioParams[], results: ScenarioResults[] }) => {
  // Find best scenario
  const bestROI = results.reduce((best, r, i) => r.roi > (results[best]?.roi || 0) ? i : best, 0);
  const bestProfit = results.reduce((best, r, i) => r.profitImpact > (results[best]?.profitImpact || 0) ? i : best, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Best ROI
          </div>
          <p className="text-sm text-green-600 mt-1">
            {scenarios[bestROI]?.name} có ROI cao nhất ({results[bestROI]?.roi}%)
          </p>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 font-medium">
            <TrendingUp className="h-4 w-4" />
            Best Profit
          </div>
          <p className="text-sm text-blue-600 mt-1">
            {scenarios[bestProfit]?.name} mang lại lợi nhuận cao nhất ({formatCurrencyCompact(results[bestProfit]?.profitImpact, 'VND')})
          </p>
        </div>
        
        {results[0]?.roi < 100 && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Cảnh báo
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Một số scenario có ROI dưới 100%. Cân nhắc điều chỉnh parameters.
            </p>
          </div>
        )}
        
        <Separator />
        
        <div className="text-sm space-y-2">
          <p className="font-medium">Gợi ý tối ưu:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Tăng redemption rate để cải thiện ROI</li>
            <li>Giảm duration có thể tăng urgency</li>
            <li>Focus vào MT channel cho hiệu quả cao hơn</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalysisWhatIfPage() {
  // Scenarios state
  const [scenarios, setScenarios] = useState<ScenarioParams[]>([
    { ...defaultParams, name: 'Conservative' },
    { ...defaultParams, name: 'Aggressive', budget: 3000000000, discountPercent: 20, expectedUplift: 30 },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  // TPO Integration
  const { isSuccess: isConnected, isLoading: healthLoading } = useTPOHealth();
  const { data: mechanics = [] } = useTPOMechanics();
  const { data: channels = [] } = useTPOChannels();
  const { simulate: runTPOSimulation, result: tpoResult, isLoading: tpoLoading, reset: _resetTPO } = useWhatIfSimulation();

  const [showTPOPanel, setShowTPOPanel] = useState(false);
  const [tpoScenarios, setTPOScenarios] = useState<TPOScenario[]>([
    {
      scenario_id: 'A',
      scenario_name: 'Discount 15%',
      mechanic_type: 'DISCOUNT',
      discount_percent: 15,
      channel: 'MT',
      product_category: 'Beverages',
      budget_amount: 50000000,
      duration_days: 14,
    },
    {
      scenario_id: 'B',
      scenario_name: 'BOGO Offer',
      mechanic_type: 'BOGO',
      discount_percent: 0,
      channel: 'MT',
      product_category: 'Beverages',
      budget_amount: 50000000,
      duration_days: 14,
    },
  ]);

  const handleTPOSimulation = () => {
    runTPOSimulation({
      scenarios: tpoScenarios,
      comparison_date: new Date().toISOString().split('T')[0],
      include_sensitivity_analysis: true,
    });
  };

  const addTPOScenario = () => {
    if (tpoScenarios.length >= 5) return;
    const nextId = String.fromCharCode(65 + tpoScenarios.length);
    setTPOScenarios([
      ...tpoScenarios,
      {
        scenario_id: nextId,
        scenario_name: `Scenario ${nextId}`,
        mechanic_type: 'DISCOUNT',
        discount_percent: 10,
        channel: 'MT',
        product_category: 'Beverages',
        budget_amount: 50000000,
        duration_days: 14,
      },
    ]);
  };

  const updateTPOScenario = (index: number, updates: Partial<TPOScenario>) => {
    setTPOScenarios((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const removeTPOScenario = (index: number) => {
    if (tpoScenarios.length <= 2) return;
    setTPOScenarios((prev) => prev.filter((_, i) => i !== index));
  };
  
  // Calculate results for all scenarios
  const results = useMemo(() => scenarios.map(calculateResults), [scenarios]);
  
  // Generate simulation data
  const simulationData = useMemo(
    () => generateSimulationData(scenarios[0], scenarios),
    [scenarios]
  );
  
  // Active scenario
  const activeScenario = scenarios[activeIndex];
  
  // Update scenario
  const updateScenario = (index: number, params: ScenarioParams) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = params;
    setScenarios(newScenarios);
  };
  
  // Add scenario
  const addScenario = () => {
    if (scenarios.length >= 3) return;
    setScenarios([...scenarios, { ...defaultParams, name: `Scenario ${scenarios.length + 1}` }]);
  };
  
  // Delete scenario
  const deleteScenario = (index: number) => {
    if (scenarios.length <= 1) return;
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
    if (activeIndex >= newScenarios.length) {
      setActiveIndex(newScenarios.length - 1);
    }
  };
  
  // Duplicate scenario
  const duplicateScenario = (index: number) => {
    if (scenarios.length >= 3) return;
    const newScenario = { ...scenarios[index], name: `${scenarios[index].name} (Copy)` };
    setScenarios([...scenarios, newScenario]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">What-If Analysis</h1>
          <p className="text-muted-foreground">
            Mô phỏng và so sánh các kịch bản promotion
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showTPOPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowTPOPanel(!showTPOPanel)}
            className={showTPOPanel ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <FlaskConical className="h-4 w-4 mr-2" />
            TPO AI
            {isConnected && <span className="w-2 h-2 ml-2 rounded-full bg-green-500" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScenarios([{ ...defaultParams }])}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Lưu scenarios
          </Button>
        </div>
      </div>

      {/* TPO AI Simulation Panel */}
      {showTPOPanel && (
        <Card className="border-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-purple-500" />
                TPO AI What-If Simulation
              </CardTitle>
              {healthLoading ? (
                <Badge variant="outline"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Connecting...</Badge>
              ) : isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Wifi className="w-3 h-3 mr-1" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  <WifiOff className="w-3 h-3 mr-1" /> Not Connected
                </Badge>
              )}
            </div>
            <CardDescription>Compare promotion scenarios using TPO ML models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* TPO Scenarios */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Scenarios ({tpoScenarios.length}/5)</Label>
                <Button variant="outline" size="sm" onClick={addTPOScenario} disabled={tpoScenarios.length >= 5}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {tpoScenarios.map((scenario, index) => (
                <div key={scenario.scenario_id} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={scenario.scenario_name}
                      onChange={(e) => updateTPOScenario(index, { scenario_name: e.target.value })}
                      className="w-40 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTPOScenario(index)}
                      disabled={tpoScenarios.length <= 2}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Mechanic</Label>
                      <Select
                        value={scenario.mechanic_type}
                        onValueChange={(v) => updateTPOScenario(index, { mechanic_type: v as MechanicType })}
                      >
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {mechanics.map((m) => (
                            <SelectItem key={m.type} value={m.type}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Channel</Label>
                      <Select
                        value={scenario.channel}
                        onValueChange={(v) => updateTPOScenario(index, { channel: v as ChannelType })}
                      >
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {channels.map((ch) => (
                            <SelectItem key={ch.type} value={ch.type}>{ch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Discount %</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={scenario.discount_percent}
                        onChange={(e) => updateTPOScenario(index, { discount_percent: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Budget (M)</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={scenario.budget_amount / 1000000}
                        onChange={(e) => updateTPOScenario(index, { budget_amount: Number(e.target.value) * 1000000 })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleTPOSimulation} disabled={tpoLoading || !isConnected} className="w-full bg-purple-600 hover:bg-purple-700">
              {tpoLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running Simulation...</>
              ) : (
                <><FlaskConical className="w-4 h-4 mr-2" /> Run TPO Simulation</>
              )}
            </Button>

            {/* TPO Results */}
            {tpoResult && (
              <div className="space-y-4 pt-4 border-t">
                {/* Winner */}
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-500">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Recommended Scenario</div>
                      <div className="text-xl font-bold text-green-600">{tpoResult.recommended_scenario}</div>
                      <p className="text-sm text-muted-foreground mt-1">{tpoResult.recommendation_rationale}</p>
                    </div>
                  </div>
                </div>

                {/* Comparison */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Scenario</th>
                        <th className="text-right py-2">ROI</th>
                        <th className="text-right py-2">Profit</th>
                        <th className="text-right py-2">Uplift</th>
                        <th className="text-right py-2">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tpoResult.comparisons.map((c) => (
                        <tr key={c.scenario_id} className={c.scenario_id === tpoResult.recommended_scenario ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                          <td className="py-2 font-medium">
                            {c.scenario_name}
                            {c.scenario_id === tpoResult.recommended_scenario && (
                              <Badge className="ml-2" variant="default">Winner</Badge>
                            )}
                          </td>
                          <td className="text-right py-2 font-bold text-green-600">{c.predicted_roi}%</td>
                          <td className="text-right py-2">{formatCurrencyCompact(c.predicted_profit, 'VND')}</td>
                          <td className="text-right py-2">+{c.sales_uplift_percent.toFixed(1)}%</td>
                          <td className="text-right py-2">{(c.confidence_score * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Insights */}
                {tpoResult.key_insights.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Key Insights
                    </h4>
                    <ul className="space-y-1">
                      {tpoResult.key_insights.map((insight, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Scenario Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Scenarios ({scenarios.length}/3)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addScenario}
              disabled={scenarios.length >= 3}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={index}
              params={scenario}
              results={results[index]}
              index={index}
              isActive={activeIndex === index}
              onActivate={() => setActiveIndex(index)}
              onUpdate={(params) => updateScenario(index, params)}
              onDelete={() => deleteScenario(index)}
              onDuplicate={() => duplicateScenario(index)}
            />
          ))}
        </div>
        
        {/* Right: Controls & Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Parameter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Điều chỉnh: {activeScenario.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ParamSlider
                  label="Budget"
                  value={activeScenario.budget}
                  min={500000000}
                  max={10000000000}
                  step={100000000}
                  unit=""
                  onChange={(v) => updateScenario(activeIndex, { ...activeScenario, budget: v })}
                  formatValue={(v) => formatCurrencyCompact(v, 'VND')}
                />
                
                <ParamSlider
                  label="Discount"
                  value={activeScenario.discountPercent}
                  min={5}
                  max={50}
                  step={1}
                  unit="%"
                  onChange={(v) => updateScenario(activeIndex, { ...activeScenario, discountPercent: v })}
                />
                
                <ParamSlider
                  label="Duration"
                  value={activeScenario.duration}
                  min={7}
                  max={90}
                  step={1}
                  unit=" ngày"
                  onChange={(v) => updateScenario(activeIndex, { ...activeScenario, duration: v })}
                />
                
                <ParamSlider
                  label="Target Customers"
                  value={activeScenario.targetCustomers}
                  min={1000}
                  max={20000}
                  step={100}
                  unit=""
                  onChange={(v) => updateScenario(activeIndex, { ...activeScenario, targetCustomers: v })}
                  formatValue={(v) => formatNumber(v)}
                />
                
                <ParamSlider
                  label="Expected Uplift"
                  value={activeScenario.expectedUplift}
                  min={5}
                  max={50}
                  step={1}
                  unit="%"
                  onChange={(v) => updateScenario(activeIndex, { ...activeScenario, expectedUplift: v })}
                />
                
                <ParamSlider
                  label="Redemption Rate"
                  value={activeScenario.redemptionRate}
                  min={30}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(v) => updateScenario(activeIndex, { ...activeScenario, redemptionRate: v })}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Charts & Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SimulationChart data={simulationData} scenarios={scenarios} />
            </div>
            <InsightsPanel scenarios={scenarios} results={results} />
          </div>
          
          {/* Comparison Table */}
          <ComparisonTable scenarios={scenarios} results={results} />
        </div>
      </div>
    </div>
  );
}
