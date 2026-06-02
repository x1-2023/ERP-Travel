/**
 * Promotion Efficiency Page
 * ROI Calculator & Efficiency Analysis
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  RefreshCw,
  Download,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import { safeDivide, safePercentageNumber } from '@/lib/utils';

// Types
interface PromotionEfficiency {
  id: string;
  name: string;
  type: string;
  investment: number;
  incrementalRevenue: number;
  incrementalVolume: number;
  roi: number;
  efficiency: number;
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

// Mock data
const mockPromotions: PromotionEfficiency[] = [
  {
    id: '1',
    name: 'Tết 2026 - Pepsi Bundle',
    type: 'Bundle',
    investment: 2500000000,
    incrementalRevenue: 4500000000,
    incrementalVolume: 15000,
    roi: 80,
    efficiency: 92,
    status: 'EXCELLENT',
  },
  {
    id: '2',
    name: 'Q1 MT Discount 15%',
    type: 'Discount',
    investment: 1800000000,
    incrementalRevenue: 2700000000,
    incrementalVolume: 12000,
    roi: 50,
    efficiency: 78,
    status: 'GOOD',
  },
  {
    id: '3',
    name: 'Aquafina Summer Campaign',
    type: 'POSM',
    investment: 800000000,
    incrementalRevenue: 1000000000,
    incrementalVolume: 8000,
    roi: 25,
    efficiency: 55,
    status: 'AVERAGE',
  },
  {
    id: '4',
    name: 'GT Rebate Program',
    type: 'Rebate',
    investment: 1200000000,
    incrementalRevenue: 1100000000,
    incrementalVolume: 5000,
    roi: -8,
    efficiency: 35,
    status: 'POOR',
  },
];

const trendData = [
  { month: 'Jan', roi: 45, efficiency: 68 },
  { month: 'Feb', roi: 52, efficiency: 72 },
  { month: 'Mar', roi: 48, efficiency: 70 },
  { month: 'Apr', roi: 58, efficiency: 75 },
  { month: 'May', roi: 62, efficiency: 78 },
  { month: 'Jun', roi: 55, efficiency: 74 },
];

const scatterData = [
  { investment: 500, roi: 25, volume: 3000, name: 'Promo A' },
  { investment: 1200, roi: 45, volume: 8000, name: 'Promo B' },
  { investment: 800, roi: 60, volume: 5000, name: 'Promo C' },
  { investment: 2000, roi: 35, volume: 12000, name: 'Promo D' },
  { investment: 1500, roi: 80, volume: 15000, name: 'Promo E' },
  { investment: 2500, roi: 55, volume: 18000, name: 'Promo F' },
];

const getStatusBadge = (status: PromotionEfficiency['status']) => {
  const config = {
    EXCELLENT: { label: 'Excellent', variant: 'success' as const, color: 'text-emerald-600 dark:text-emerald-400' },
    GOOD: { label: 'Good', variant: 'default' as const, color: 'text-blue-600 dark:text-blue-400' },
    AVERAGE: { label: 'Average', variant: 'warning' as const, color: 'text-amber-600 dark:text-amber-400' },
    POOR: { label: 'Poor', variant: 'destructive' as const, color: 'text-red-600 dark:text-red-400' },
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};

export default function PromotionEfficiencyPage() {
  const [calculatorInputs, setCalculatorInputs] = useState({
    investment: 1000000000,
    expectedLift: 15,
    baselineRevenue: 5000000000,
    marginPercent: 25,
  });

  const [calculatorResults, setCalculatorResults] = useState<{
    incrementalRevenue: number;
    incrementalProfit: number;
    roi: number;
    breakeven: number;
  } | null>(null);

  const calculateROI = () => {
    const { investment, expectedLift, baselineRevenue, marginPercent } = calculatorInputs;
    const incrementalRevenue = baselineRevenue * (expectedLift / 100);
    const incrementalProfit = incrementalRevenue * (marginPercent / 100);
    const roi = safePercentageNumber(incrementalProfit - investment, investment);
    const breakeven = safeDivide(investment, marginPercent / 100);

    setCalculatorResults({
      incrementalRevenue,
      incrementalProfit,
      roi,
      breakeven,
    });
  };

  // Summary stats
  const avgROI = safeDivide(mockPromotions.reduce((sum, p) => sum + p.roi, 0), mockPromotions.length);
  const avgEfficiency = safeDivide(mockPromotions.reduce((sum, p) => sum + p.efficiency, 0), mockPromotions.length);
  const totalInvestment = mockPromotions.reduce((sum, p) => sum + p.investment, 0);
  const totalRevenue = mockPromotions.reduce((sum, p) => sum + p.incrementalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotion Efficiency</h1>
          <p className="text-muted-foreground mt-1">
            ROI Calculator & Performance Analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgROI >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {avgROI.toFixed(1)}%
            </div>
            <div className="flex items-center mt-1">
              {avgROI >= 30 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
              )}
              <span className="text-xs text-muted-foreground">
                {avgROI >= 30 ? 'Above target' : 'Below target (30%)'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</div>
            <Progress value={avgEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalInvestment} size="lg" /></div>
            <p className="text-xs text-muted-foreground">Across {mockPromotions.length} promotions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incremental Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"><CurrencyDisplay amount={totalRevenue} size="lg" showToggle={false} /></div>
            <p className="text-xs text-muted-foreground">
              {(safePercentageNumber(totalRevenue - totalInvestment, totalInvestment)).toFixed(0)}% return
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">ROI Calculator</TabsTrigger>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Promotion Comparison</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  ROI Calculator
                </CardTitle>
                <CardDescription>
                  Enter promotion parameters to calculate expected ROI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="investment">Investment Amount (VND)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={calculatorInputs.investment}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, investment: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrencyCompact(calculatorInputs.investment, 'VND')}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lift">Expected Volume Lift (%)</Label>
                  <Input
                    id="lift"
                    type="number"
                    value={calculatorInputs.expectedLift}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, expectedLift: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="baseline">Baseline Revenue (VND)</Label>
                  <Input
                    id="baseline"
                    type="number"
                    value={calculatorInputs.baselineRevenue}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, baselineRevenue: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrencyCompact(calculatorInputs.baselineRevenue, 'VND')}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="margin">Margin (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={calculatorInputs.marginPercent}
                    onChange={(e) =>
                      setCalculatorInputs({ ...calculatorInputs, marginPercent: Number(e.target.value) })
                    }
                  />
                </div>

                <Button onClick={calculateROI} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Calculate ROI
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>Estimated promotion performance</CardDescription>
              </CardHeader>
              <CardContent>
                {calculatorResults ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground truncate">Incremental Revenue</p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                          {formatCurrencyCompact(calculatorResults.incrementalRevenue, 'VND')}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground truncate">Incremental Profit</p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                          {formatCurrencyCompact(calculatorResults.incrementalProfit, 'VND')}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Expected ROI</p>
                      <p
                        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                          calculatorResults.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {calculatorResults.roi.toFixed(1)}%
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {calculatorResults.roi >= 30 ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">Above target (30%)</span>
                          </>
                        ) : calculatorResults.roi >= 0 ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm text-amber-600 dark:text-amber-400">Below target</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-600 dark:text-red-400">Negative ROI</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Break-even Point</p>
                          <p className="text-sm text-muted-foreground">
                            Need {formatCurrencyCompact(calculatorResults.breakeven, 'VND')} incremental revenue to break even
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Calculator className="h-12 w-12 mb-4 opacity-50" />
                    <p>Enter parameters and click Calculate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ROI & Efficiency Trend</CardTitle>
                <CardDescription>Monthly performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2} name="ROI %" />
                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} name="Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment vs ROI</CardTitle>
                <CardDescription>Bubble size = volume lift</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="investment" name="Investment" unit="M" tickFormatter={(v) => `${v}M`} />
                    <YAxis dataKey="roi" name="ROI" unit="%" />
                    <ZAxis dataKey="volume" range={[50, 400]} name="Volume" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm">Investment: ₫{data.investment}M</p>
                              <p className="text-sm">ROI: {data.roi}%</p>
                              <p className="text-sm">Volume: {data.volume.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={scatterData} fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Performance Comparison</CardTitle>
              <CardDescription>Compare ROI and efficiency across promotions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Investment</TableHead>
                      <TableHead className="text-right">Incremental Revenue</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                      <TableHead className="text-right">Efficiency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPromotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{promo.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <CurrencyDisplay amount={promo.investment} size="sm" />
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                          <CurrencyDisplay amount={promo.incrementalRevenue} size="sm" showToggle={false} />
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={promo.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {promo.roi}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={promo.efficiency} className="w-16 h-2" />
                            <span className="text-sm">{promo.efficiency}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(promo.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
