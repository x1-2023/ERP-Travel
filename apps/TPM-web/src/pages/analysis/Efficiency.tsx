// ============================================================================
// ANALYSIS EFFICIENCY PAGE - P2
// Promotion efficiency analysis with spend vs performance metrics
// Path: apps/web/src/pages/analysis/Efficiency.tsx
// ============================================================================

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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

// ============================================================================
// TYPES
// ============================================================================

interface EfficiencySummary {
  overallScore: number;
  spendEfficiency: number;
  volumeUplift: number;
  revenueUplift: number;
  costPerUnit: number;
  costPerCustomer: number;
  redemptionRate: number;
  targetAchievement: number;
}

interface PromotionEfficiency {
  id: string;
  code: string;
  name: string;
  type: string;
  
  // Spend metrics
  budgetAllocated: number;
  actualSpend: number;
  spendVariance: number;
  
  // Performance metrics
  targetVolume: number;
  actualVolume: number;
  volumeAchievement: number;
  
  targetRevenue: number;
  actualRevenue: number;
  revenueAchievement: number;
  
  // Efficiency metrics
  costPerUnit: number;
  costPerCustomer: number;
  efficiencyScore: number;
  
  // Status
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

interface EfficiencyByChannel {
  channel: string;
  spendEfficiency: number;
  volumeUplift: number;
  revenueUplift: number;
  costPerUnit: number;
  score: number;
}

interface EfficiencyTrend {
  period: string;
  efficiency: number;
  spend: number;
  volume: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSummary: EfficiencySummary = {
  overallScore: 78,
  spendEfficiency: 92,
  volumeUplift: 18.5,
  revenueUplift: 22.3,
  costPerUnit: 12500,
  costPerCustomer: 185000,
  redemptionRate: 67.5,
  targetAchievement: 108,
};

const mockPromotions: PromotionEfficiency[] = [
  {
    id: '1',
    code: 'PRO-TET-2026',
    name: 'Khuyến mãi Tết 2026',
    type: 'Seasonal',
    budgetAllocated: 5000000000,
    actualSpend: 4850000000,
    spendVariance: -3,
    targetVolume: 250000,
    actualVolume: 285000,
    volumeAchievement: 114,
    targetRevenue: 28000000000,
    actualRevenue: 32000000000,
    revenueAchievement: 114.3,
    costPerUnit: 17017,
    costPerCustomer: 242500,
    efficiencyScore: 92,
    status: 'EXCELLENT',
  },
  {
    id: '2',
    code: 'PRO-Q1-REBATE',
    name: 'Volume Rebate Q1',
    type: 'Rebate',
    budgetAllocated: 3500000000,
    actualSpend: 3650000000,
    spendVariance: 4.3,
    targetVolume: 180000,
    actualVolume: 175000,
    volumeAchievement: 97.2,
    targetRevenue: 18500000000,
    actualRevenue: 18000000000,
    revenueAchievement: 97.3,
    costPerUnit: 20857,
    costPerCustomer: 304167,
    efficiencyScore: 75,
    status: 'GOOD',
  },
  {
    id: '3',
    code: 'PRO-DISPLAY-001',
    name: 'Display Fee MT',
    type: 'Display',
    budgetAllocated: 2000000000,
    actualSpend: 2000000000,
    spendVariance: 0,
    targetVolume: 100000,
    actualVolume: 92000,
    volumeAchievement: 92,
    targetRevenue: 9000000000,
    actualRevenue: 8500000000,
    revenueAchievement: 94.4,
    costPerUnit: 21739,
    costPerCustomer: 333333,
    efficiencyScore: 68,
    status: 'AVERAGE',
  },
  {
    id: '4',
    code: 'PRO-LISTING-2026',
    name: 'New Product Listing',
    type: 'Listing',
    budgetAllocated: 1500000000,
    actualSpend: 1480000000,
    spendVariance: -1.3,
    targetVolume: 60000,
    actualVolume: 48000,
    volumeAchievement: 80,
    targetRevenue: 5000000000,
    actualRevenue: 4200000000,
    revenueAchievement: 84,
    costPerUnit: 30833,
    costPerCustomer: 493333,
    efficiencyScore: 52,
    status: 'POOR',
  },
  {
    id: '5',
    code: 'PRO-SAMPLING',
    name: 'Product Sampling',
    type: 'Sampling',
    budgetAllocated: 800000000,
    actualSpend: 920000000,
    spendVariance: 15,
    targetVolume: 40000,
    actualVolume: 32000,
    volumeAchievement: 80,
    targetRevenue: 2500000000,
    actualRevenue: 2100000000,
    revenueAchievement: 84,
    costPerUnit: 28750,
    costPerCustomer: 460000,
    efficiencyScore: 45,
    status: 'POOR',
  },
];

const mockByChannel: EfficiencyByChannel[] = [
  { channel: 'Modern Trade', spendEfficiency: 95, volumeUplift: 22, revenueUplift: 25, costPerUnit: 15000, score: 88 },
  { channel: 'General Trade', spendEfficiency: 88, volumeUplift: 15, revenueUplift: 18, costPerUnit: 18000, score: 75 },
  { channel: 'E-commerce', spendEfficiency: 82, volumeUplift: 28, revenueUplift: 32, costPerUnit: 12000, score: 82 },
  { channel: 'HORECA', spendEfficiency: 75, volumeUplift: 10, revenueUplift: 12, costPerUnit: 25000, score: 62 },
];

const mockTrends: EfficiencyTrend[] = [
  { period: 'T8/25', efficiency: 72, spend: 2.8, volume: 85 },
  { period: 'T9/25', efficiency: 74, spend: 3.2, volume: 92 },
  { period: 'T10/25', efficiency: 76, spend: 3.5, volume: 98 },
  { period: 'T11/25', efficiency: 75, spend: 4.2, volume: 105 },
  { period: 'T12/25', efficiency: 80, spend: 5.5, volume: 128 },
  { period: 'T1/26', efficiency: 78, spend: 4.8, volume: 115 },
];

const radarData = [
  { metric: 'Spend Efficiency', value: 92, fullMark: 100 },
  { metric: 'Volume Uplift', value: 75, fullMark: 100 },
  { metric: 'Revenue Uplift', value: 82, fullMark: 100 },
  { metric: 'Target Achievement', value: 88, fullMark: 100 },
  { metric: 'Redemption Rate', value: 68, fullMark: 100 },
  { metric: 'Cost Efficiency', value: 70, fullMark: 100 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getEfficiencyStatusBadge = (status: PromotionEfficiency['status']) => {
  switch (status) {
    case 'EXCELLENT':
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Xuất sắc</Badge>;
    case 'GOOD':
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">Tốt</Badge>;
    case 'AVERAGE':
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">Trung bình</Badge>;
    case 'POOR':
      return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20">Kém</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-blue-600 dark:text-blue-400';
  if (score >= 55) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreBgColor = (score: number) => {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 55) return 'bg-yellow-500';
  return 'bg-red-500';
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Efficiency Score Gauge
const EfficiencyGauge = ({ score, label }: { score: number; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            strokeWidth="12"
            stroke="#e5e7eb"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            strokeWidth="12"
            stroke={score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 55 ? '#f59e0b' : '#ef4444'}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 352} 352`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-bold', getScoreColor(score))}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium">{label}</span>
    </div>
  );
};

// Summary Cards
const SummarySection = ({ summary }: { summary: EfficiencySummary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <Card className="col-span-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-blue-500/30">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <EfficiencyGauge score={summary.overallScore} label="Overall Score" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Spend</span>
                <span className="font-medium">{summary.spendEfficiency}%</span>
              </div>
              <Progress value={summary.spendEfficiency} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span>Target</span>
                <span className="font-medium">{summary.targetAchievement}%</span>
              </div>
              <Progress value={Math.min(summary.targetAchievement, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Volume Uplift</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">+{summary.volumeUplift}%</p>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              vs baseline
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Revenue Uplift</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-600 dark:text-blue-400 truncate">+{summary.revenueUplift}%</p>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              vs baseline
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Cost/Unit</p>
            <CurrencyDisplay amount={summary.costPerUnit} size="md" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Cost/Customer</p>
            <CurrencyDisplay amount={summary.costPerCustomer} size="md" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Redemption</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-violet-600 dark:text-violet-400 truncate">{summary.redemptionRate}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Target Achievement</p>
            <p className={cn('text-sm sm:text-base lg:text-lg font-bold truncate', summary.targetAchievement >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
              {summary.targetAchievement}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Radar Chart
const EfficiencyRadarChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Efficiency Metrics</CardTitle>
        <CardDescription>Đánh giá đa chiều hiệu quả promotion</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" className="text-xs" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Efficiency"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Efficiency by Channel
const ChannelEfficiencyChart = ({ data }: { data: EfficiencyByChannel[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Efficiency theo Kênh</CardTitle>
        <CardDescription>So sánh hiệu quả giữa các kênh</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="channel" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="spendEfficiency" name="Spend Eff." fill="#3b82f6" />
              <Bar dataKey="volumeUplift" name="Volume %" fill="#10b981" />
              <Bar dataKey="score" name="Score" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Trend Chart
const EfficiencyTrendChart = ({ data }: { data: EfficiencyTrend[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Efficiency Trend</CardTitle>
        <CardDescription>Xu hướng hiệu quả theo thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="volume" name="Volume (K)" fill="#e5e7eb" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                name="Efficiency Score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Promotions Table
const PromotionsTable = ({ data }: { data: PromotionEfficiency[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Chi tiết Efficiency theo Promotion</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-right">Vol. Ach.</TableHead>
              <TableHead className="text-right">Rev. Ach.</TableHead>
              <TableHead className="text-right">Cost/Unit</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{promo.code}</div>
                    <div className="text-sm text-muted-foreground">{promo.name}</div>
                  </div>
                </TableCell>
                <TableCell>{promo.type}</TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={promo.budgetAllocated} size="sm" /></TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={promo.actualSpend} size="sm" /></TableCell>
                <TableCell className={cn(
                  'text-right font-medium',
                  promo.spendVariance > 0 ? 'text-red-600 dark:text-red-400' : promo.spendVariance < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''
                )}>
                  {promo.spendVariance > 0 ? '+' : ''}{promo.spendVariance}%
                </TableCell>
                <TableCell className={cn(
                  'text-right font-medium',
                  promo.volumeAchievement >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                )}>
                  {promo.volumeAchievement}%
                </TableCell>
                <TableCell className={cn(
                  'text-right font-medium',
                  promo.revenueAchievement >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                )}>
                  {promo.revenueAchievement}%
                </TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={promo.costPerUnit} size="sm" /></TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                      getScoreBgColor(promo.efficiencyScore)
                    )}>
                      {promo.efficiencyScore}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getEfficiencyStatusBadge(promo.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalysisEfficiencyPage() {
  const [period, setPeriod] = useState('q1-2026');
  const [channel, setChannel] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phân Tích Hiệu Quả</h1>
          <p className="text-muted-foreground">
            Đánh giá efficiency của các chương trình khuyến mãi
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q1-2026">Q1 2026</SelectItem>
              <SelectItem value="q4-2025">Q4 2025</SelectItem>
              <SelectItem value="2025">Năm 2025</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Kênh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kênh</SelectItem>
              <SelectItem value="MT">Modern Trade</SelectItem>
              <SelectItem value="GT">General Trade</SelectItem>
              <SelectItem value="EC">E-commerce</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <SummarySection summary={mockSummary} />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EfficiencyRadarChart />
        <ChannelEfficiencyChart data={mockByChannel} />
        <EfficiencyTrendChart data={mockTrends} />
      </div>
      
      {/* Promotions Table */}
      <PromotionsTable data={mockPromotions} />
    </div>
  );
}
