/**
 * PSP Budget Page
 * Real-time promotion spending monitoring (Promotion Spending Plan)
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
import { Progress } from '@/components/ui/progress';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Download,
  Activity,
  Target,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
} from 'recharts';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import { safePercentage, safePercentageNumber } from '@/lib/utils';

// Types
interface PSPItem {
  id: string;
  promotionCode: string;
  promotionName: string;
  channel: string;
  plannedBudget: number;
  committedBudget: number;
  actualSpend: number;
  remaining: number;
  utilizationRate: number;
  status: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_UTILIZED' | 'COMPLETED';
  lastUpdated: string;
}

// Mock data
const mockPSPData: PSPItem[] = [
  {
    id: '1',
    promotionCode: 'PROMO-TET-001',
    promotionName: 'Tết 2026 Pepsi Bundle',
    channel: 'MT',
    plannedBudget: 1500000000,
    committedBudget: 1400000000,
    actualSpend: 1200000000,
    remaining: 300000000,
    utilizationRate: 80,
    status: 'ON_TRACK',
    lastUpdated: '2026-01-27T10:30:00',
  },
  {
    id: '2',
    promotionCode: 'PROMO-TET-001',
    promotionName: 'Tết 2026 Pepsi Bundle',
    channel: 'GT',
    plannedBudget: 1000000000,
    committedBudget: 1100000000,
    actualSpend: 1050000000,
    remaining: -50000000,
    utilizationRate: 105,
    status: 'OVER_BUDGET',
    lastUpdated: '2026-01-27T10:30:00',
  },
  {
    id: '3',
    promotionCode: 'PROMO-Q1-002',
    promotionName: 'Q1 Discount Campaign',
    channel: 'MT',
    plannedBudget: 800000000,
    committedBudget: 600000000,
    actualSpend: 400000000,
    remaining: 400000000,
    utilizationRate: 50,
    status: 'UNDER_UTILIZED',
    lastUpdated: '2026-01-27T09:15:00',
  },
  {
    id: '4',
    promotionCode: 'PROMO-Q1-003',
    promotionName: 'Aquafina Display',
    channel: 'E-comm',
    plannedBudget: 500000000,
    committedBudget: 500000000,
    actualSpend: 500000000,
    remaining: 0,
    utilizationRate: 100,
    status: 'COMPLETED',
    lastUpdated: '2026-01-26T18:00:00',
  },
];

const trendData = [
  { week: 'W1', planned: 2000, committed: 1800, actual: 1500 },
  { week: 'W2', planned: 2200, committed: 2100, actual: 1900 },
  { week: 'W3', planned: 2400, committed: 2300, actual: 2200 },
  { week: 'W4', planned: 2600, committed: 2500, actual: 2400 },
  { week: 'W5', planned: 2800, committed: 2700, actual: null },
  { week: 'W6', planned: 3000, committed: null, actual: null },
];

const channelData = [
  { channel: 'MT', planned: 1500, committed: 1400, actual: 1200 },
  { channel: 'GT', planned: 1000, committed: 1100, actual: 1050 },
  { channel: 'E-comm', planned: 500, committed: 500, actual: 500 },
  { channel: 'HORECA', planned: 300, committed: 250, actual: 200 },
];

const getStatusBadge = (status: PSPItem['status']) => {
  const config = {
    ON_TRACK: { label: 'On Track', variant: 'success' as const, icon: CheckCircle },
    OVER_BUDGET: { label: 'Over Budget', variant: 'destructive' as const, icon: AlertTriangle },
    UNDER_UTILIZED: { label: 'Under-utilized', variant: 'warning' as const, icon: TrendingDown },
    COMPLETED: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle },
  };
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function PSPBudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2026');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Calculate summary stats
  const totalPlanned = mockPSPData.reduce((sum, item) => sum + item.plannedBudget, 0);
  const totalCommitted = mockPSPData.reduce((sum, item) => sum + item.committedBudget, 0);
  const totalActual = mockPSPData.reduce((sum, item) => sum + item.actualSpend, 0);
  const overBudgetCount = mockPSPData.filter((item) => item.status === 'OVER_BUDGET').length;

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PSP Budget Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Real-time Promotion Spending Plan tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1-2026">Q1 2026</SelectItem>
              <SelectItem value="Q2-2026">Q2 2026</SelectItem>
              <SelectItem value="FY-2026">FY 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Last updated: {lastRefresh.toLocaleTimeString('vi-VN')}</span>
        <Badge variant="outline" className="ml-2">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalPlanned} size="lg" /></div>
            <p className="text-xs text-muted-foreground">Total planned for period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Committed</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400"><CurrencyDisplay amount={totalCommitted} size="lg" showToggle={false} /></div>
            <Progress value={safePercentageNumber(totalCommitted, totalPlanned)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {safePercentage(totalCommitted, totalPlanned, 0)}% of planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"><CurrencyDisplay amount={totalActual} size="lg" showToggle={false} /></div>
            <Progress value={safePercentageNumber(totalActual, totalCommitted)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {safePercentage(totalActual, totalCommitted, 0)}% of committed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{overBudgetCount}</div>
            <p className="text-xs text-muted-foreground">Promotions exceeding budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending Trend</CardTitle>
            <CardDescription>Planned vs Committed vs Actual (Weekly)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(v) => `${v / 1000}B`} />
                <Tooltip
                  formatter={(value) => formatCurrencyCompact(Number(value) * 1000000, 'VND')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="planned"
                  fill="#94a3b8"
                  fillOpacity={0.3}
                  stroke="#94a3b8"
                  name="Planned"
                />
                <Line
                  type="monotone"
                  dataKey="committed"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Committed"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Actual"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget by Channel</CardTitle>
            <CardDescription>Channel-wise budget utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${v}M`} />
                <YAxis type="category" dataKey="channel" width={70} />
                <Tooltip formatter={(value) => formatCurrencyCompact(Number(value) * 1000000, 'VND')} />
                <Legend />
                <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
                <Bar dataKey="committed" fill="#3b82f6" name="Committed" />
                <Bar dataKey="actual" fill="#10b981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>PSP Details</CardTitle>
          <CardDescription>Promotion-level spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Committed</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPSPData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.promotionName}</div>
                        <div className="text-sm text-muted-foreground">{item.promotionCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <CurrencyDisplay amount={item.plannedBudget} size="sm" />
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-600 dark:text-blue-400">
                      <CurrencyDisplay amount={item.committedBudget} size="sm" showToggle={false} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                      <CurrencyDisplay amount={item.actualSpend} size="sm" showToggle={false} />
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        item.remaining < 0 ? 'text-red-600 dark:text-red-400' : ''
                      }`}
                    >
                      <CurrencyDisplay amount={item.remaining} size="sm" showToggle={false} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress
                          value={Math.min(item.utilizationRate, 100)}
                          className={`w-16 h-2 ${
                            item.utilizationRate > 100 ? '[&>div]:bg-red-500' : ''
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            item.utilizationRate > 100 ? 'text-red-600' : ''
                          }`}
                        >
                          {item.utilizationRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
