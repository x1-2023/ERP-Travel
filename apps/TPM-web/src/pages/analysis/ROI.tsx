// ============================================================================
// ANALYSIS ROI PAGE - P2
// Return on Investment analysis for promotions
// Path: apps/web/src/pages/analysis/ROI.tsx
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
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Download,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

// ============================================================================
// TYPES
// ============================================================================

interface ROISummary {
  totalInvestment: number;
  totalRevenue: number;
  incrementalRevenue: number;
  grossROI: number;
  netROI: number;
  paybackPeriod: number;
  profitMargin: number;
}

interface PromotionROI {
  id: string;
  code: string;
  name: string;
  type: string;
  channel: string;
  investment: number;
  revenue: number;
  incrementalRevenue: number;
  roi: number;
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  startDate: string;
  endDate: string;
}

interface ROITrend {
  month: string;
  investment: number;
  revenue: number;
  roi: number;
}

interface ROIByChannel {
  channel: string;
  investment: number;
  revenue: number;
  roi: number;
  promotionCount: number;
}

interface ROIByType {
  type: string;
  investment: number;
  revenue: number;
  roi: number;
  count: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSummary: ROISummary = {
  totalInvestment: 15000000000,
  totalRevenue: 85000000000,
  incrementalRevenue: 28000000000,
  grossROI: 186.7,
  netROI: 145.2,
  paybackPeriod: 2.3,
  profitMargin: 32.5,
};

const mockPromotions: PromotionROI[] = [
  {
    id: '1',
    code: 'PRO-TET-2026',
    name: 'Khuyến mãi Tết 2026',
    type: 'Seasonal',
    channel: 'MT',
    investment: 5000000000,
    revenue: 32000000000,
    incrementalRevenue: 12000000000,
    roi: 240,
    status: 'EXCELLENT',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
  },
  {
    id: '2',
    code: 'PRO-Q1-REBATE',
    name: 'Volume Rebate Q1',
    type: 'Rebate',
    channel: 'GT',
    investment: 3500000000,
    revenue: 18000000000,
    incrementalRevenue: 6500000000,
    roi: 185.7,
    status: 'GOOD',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
  },
  {
    id: '3',
    code: 'PRO-DISPLAY-001',
    name: 'Display Fee MT',
    type: 'Display',
    channel: 'MT',
    investment: 2000000000,
    revenue: 8500000000,
    incrementalRevenue: 2800000000,
    roi: 140,
    status: 'GOOD',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
  },
  {
    id: '4',
    code: 'PRO-LISTING-2026',
    name: 'New Product Listing',
    type: 'Listing',
    channel: 'MT',
    investment: 1500000000,
    revenue: 4200000000,
    incrementalRevenue: 1200000000,
    roi: 80,
    status: 'AVERAGE',
    startDate: '2026-01-10',
    endDate: '2026-04-10',
  },
  {
    id: '5',
    code: 'PRO-SAMPLING',
    name: 'Product Sampling',
    type: 'Sampling',
    channel: 'E-commerce',
    investment: 800000000,
    revenue: 2100000000,
    incrementalRevenue: 450000000,
    roi: 56.25,
    status: 'POOR',
    startDate: '2026-01-20',
    endDate: '2026-02-28',
  },
];

const mockTrends: ROITrend[] = [
  { month: 'T8/25', investment: 2800, revenue: 9500, roi: 145 },
  { month: 'T9/25', investment: 3200, revenue: 11200, roi: 155 },
  { month: 'T10/25', investment: 3500, revenue: 13800, roi: 168 },
  { month: 'T11/25', investment: 4200, revenue: 16500, roi: 175 },
  { month: 'T12/25', investment: 5500, revenue: 24000, roi: 195 },
  { month: 'T1/26', investment: 4800, revenue: 21500, roi: 186 },
];

const mockByChannel: ROIByChannel[] = [
  { channel: 'Modern Trade', investment: 8500, revenue: 42000, roi: 194, promotionCount: 15 },
  { channel: 'General Trade', investment: 4200, revenue: 28000, roi: 167, promotionCount: 22 },
  { channel: 'E-commerce', investment: 1800, revenue: 9500, roi: 128, promotionCount: 8 },
  { channel: 'HORECA', investment: 500, revenue: 5500, roi: 110, promotionCount: 3 },
];

const mockByType: ROIByType[] = [
  { type: 'Discount', investment: 5200, revenue: 28000, roi: 215, count: 18 },
  { type: 'Rebate', investment: 4500, revenue: 24000, roi: 178, count: 12 },
  { type: 'Display', investment: 2800, revenue: 18000, roi: 157, count: 8 },
  { type: 'Listing', investment: 1500, revenue: 9000, roi: 133, count: 6 },
  { type: 'Sampling', investment: 1000, revenue: 6000, roi: 100, count: 4 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getROIStatusBadge = (status: PromotionROI['status']) => {
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

const getROIColor = (roi: number) => {
  if (roi >= 200) return 'text-emerald-600 dark:text-emerald-400';
  if (roi >= 150) return 'text-blue-600 dark:text-blue-400';
  if (roi >= 100) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Summary Cards
const SummarySection = ({ summary }: { summary: ROISummary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Tổng đầu tư</p>
            <CurrencyDisplay amount={summary.totalInvestment} size="md" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Doanh thu</p>
            <div className="text-blue-600 dark:text-blue-400">
              <CurrencyDisplay amount={summary.totalRevenue} size="md" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Incremental</p>
            <div className="text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={summary.incrementalRevenue} size="md" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 border-emerald-500/30">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Gross ROI</p>
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{summary.grossROI}%</p>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs LY
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Net ROI</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-violet-600 dark:text-violet-400 truncate">{summary.netROI}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Payback (tháng)</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold truncate">{summary.paybackPeriod}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Profit Margin</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold truncate">{summary.profitMargin}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ROI Trend Chart
const ROITrendChart = ({ data }: { data: ROITrend[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ROI Trend</CardTitle>
        <CardDescription>Xu hướng ROI theo thời gian (tỷ VNĐ)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="investment"
                name="Đầu tư"
                stroke="#ef4444"
                fill="url(#investmentGradient)"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#10b981"
                fill="url(#revenueGradient)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="roi"
                name="ROI %"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// ROI by Channel Chart
const ROIByChannelChart = ({ data }: { data: ROIByChannel[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ROI theo Kênh</CardTitle>
        <CardDescription>So sánh hiệu quả giữa các kênh phân phối</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="channel" type="category" width={100} className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" name="ROI %" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// ROI by Type Chart
const ROIByTypeChart = ({ data }: { data: ROIByType[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ROI theo Loại KM</CardTitle>
        <CardDescription>Hiệu quả theo từng loại chương trình</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="investment"
                label={({ payload }: { payload?: ROIByType }) => payload ? `${payload.type}: ${payload.roi}%` : ''}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// ROI Scatter Chart (Investment vs Revenue)
const ROIScatterChart = ({ data }: { data: PromotionROI[] }) => {
  const scatterData = data.map(p => ({
    x: p.investment / 1000000000,
    y: p.revenue / 1000000000,
    z: p.roi,
    name: p.name,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Investment vs Revenue</CardTitle>
        <CardDescription>Mối quan hệ đầu tư và doanh thu (tỷ VNĐ)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" dataKey="x" name="Đầu tư" unit=" tỷ" className="text-xs" />
              <YAxis type="number" dataKey="y" name="Doanh thu" unit=" tỷ" className="text-xs" />
              <ZAxis type="number" dataKey="z" range={[60, 400]} name="ROI" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Promotions" data={scatterData} fill="#3b82f6">
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.z >= 150 ? '#10b981' : entry.z >= 100 ? '#f59e0b' : '#ef4444'} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Insights Section
const InsightsSection = () => {
  const insights = [
    {
      type: 'success',
      icon: CheckCircle2,
      title: 'Top Performer',
      description: 'Khuyến mãi Tết 2026 đạt ROI 240%, cao nhất trong quý',
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Cần cải thiện',
      description: 'Product Sampling có ROI thấp (56%), cần xem xét lại chiến lược',
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: 'Gợi ý',
      description: 'MT channel có ROI tốt nhất (194%), nên tăng đầu tư cho kênh này',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg',
              insight.type === 'success' && 'bg-green-50',
              insight.type === 'warning' && 'bg-yellow-50',
              insight.type === 'info' && 'bg-blue-50'
            )}
          >
            <insight.icon className={cn(
              'h-5 w-5 mt-0.5',
              insight.type === 'success' && 'text-green-600',
              insight.type === 'warning' && 'text-yellow-600',
              insight.type === 'info' && 'text-blue-600'
            )} />
            <div>
              <p className="font-medium text-sm">{insight.title}</p>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Promotions Table
const PromotionsTable = ({ data }: { data: PromotionROI[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Chi tiết ROI theo Promotion</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Kênh</TableHead>
              <TableHead className="text-right">Đầu tư</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">Incremental</TableHead>
              <TableHead className="text-right">ROI</TableHead>
              <TableHead>Đánh giá</TableHead>
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
                <TableCell>{promo.channel}</TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={promo.investment} size="sm" /></TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={promo.revenue} size="sm" /></TableCell>
                <TableCell className="text-right text-emerald-600 dark:text-emerald-400"><CurrencyDisplay amount={promo.incrementalRevenue} size="sm" showToggle={false} /></TableCell>
                <TableCell className={cn('text-right font-bold', getROIColor(promo.roi))}>
                  {promo.roi}%
                </TableCell>
                <TableCell>{getROIStatusBadge(promo.status)}</TableCell>
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

export default function AnalysisROIPage() {
  const [period, setPeriod] = useState('q1-2026');
  const [channel, setChannel] = useState('all');
  const [_promotionType, _setPromotionType] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phân Tích ROI</h1>
          <p className="text-muted-foreground">
            Đánh giá hiệu quả đầu tư các chương trình khuyến mãi
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
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ROITrendChart data={mockTrends} />
        <ROIScatterChart data={mockPromotions} />
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ROIByChannelChart data={mockByChannel} />
        <ROIByTypeChart data={mockByType} />
        <InsightsSection />
      </div>
      
      {/* Promotions Table */}
      <PromotionsTable data={mockPromotions} />
    </div>
  );
}
