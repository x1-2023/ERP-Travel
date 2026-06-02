/**
 * Spending Analysis Page
 * Detailed spending breakdown and analysis
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
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
  PieChart,
  Pie,
  Cell,
  Treemap,
} from 'recharts';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import { safePercentageNumber } from '@/lib/utils';

// Mock data
const categorySpending = [
  { category: 'Discount', budget: 5000, spent: 4200, variance: -800, percentage: 35 },
  { category: 'Rebate', budget: 3500, spent: 3800, variance: 300, percentage: 32 },
  { category: 'POSM', budget: 2000, spent: 1500, variance: -500, percentage: 13 },
  { category: 'Display', budget: 1500, spent: 1400, variance: -100, percentage: 12 },
  { category: 'Sampling', budget: 1000, spent: 1000, variance: 0, percentage: 8 },
];

const channelSpending = [
  { name: 'Modern Trade', value: 4500, color: '#3b82f6' },
  { name: 'General Trade', value: 3200, color: '#10b981' },
  { name: 'E-commerce', value: 1800, color: '#f59e0b' },
  { name: 'HORECA', value: 900, color: '#ef4444' },
  { name: 'Others', value: 500, color: '#8b5cf6' },
];

const monthlySpending = [
  { month: 'Jan', trade: 2800, marketing: 1200, total: 4000 },
  { month: 'Feb', trade: 3200, marketing: 1400, total: 4600 },
  { month: 'Mar', trade: 3000, marketing: 1300, total: 4300 },
  { month: 'Apr', trade: 3500, marketing: 1500, total: 5000 },
  { month: 'May', trade: 3800, marketing: 1600, total: 5400 },
  { month: 'Jun', trade: 3600, marketing: 1500, total: 5100 },
];

const regionSpending = [
  { name: 'Miền Bắc', size: 4500, fill: '#3b82f6' },
  { name: 'Miền Nam', size: 5200, fill: '#10b981' },
  { name: 'Miền Trung', size: 2100, fill: '#f59e0b' },
  { name: 'Mekong', size: 1800, fill: '#8b5cf6' },
];

const topPromotions = [
  { id: '1', name: 'Tết 2026 Pepsi Bundle', channel: 'MT', spent: 2500000000, roi: 85 },
  { id: '2', name: 'Q1 MT Discount', channel: 'MT', spent: 1800000000, roi: 52 },
  { id: '3', name: 'GT Rebate Program', channel: 'GT', spent: 1200000000, roi: 35 },
  { id: '4', name: 'Aquafina Summer', channel: 'E-comm', spent: 800000000, roi: 45 },
  { id: '5', name: 'POSM Campaign', channel: 'GT', spent: 600000000, roi: 28 },
];


export default function SpendingAnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2026');

  // Summary stats
  const totalSpent = channelSpending.reduce((sum, item) => sum + item.value, 0) * 1000000;
  const totalBudget = 12000000000;
  const utilizationRate = safePercentageNumber(totalSpent, totalBudget);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spending Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Detailed breakdown of promotion spending
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
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalSpent} size="lg" /></div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-1" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">+12% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate.toFixed(0)}%</div>
            <Progress value={utilizationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Spend</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalSpent / 90} size="lg" /></div>
            <p className="text-xs text-muted-foreground">Based on 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              -<CurrencyDisplay amount={totalBudget - totalSpent} size="lg" showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">Under budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="category" className="space-y-4">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="channel">By Channel</TabsTrigger>
          <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
          <TabsTrigger value="top">Top Promotions</TabsTrigger>
        </TabsList>

        {/* Category Tab */}
        <TabsContent value="category" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Budget vs Actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categorySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(v) => `${v / 1000}B`} />
                    <Tooltip formatter={(value) => formatCurrencyCompact(Number(value) * 1000000, 'VND')} />
                    <Legend />
                    <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                    <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Variance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorySpending.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono"><CurrencyDisplay amount={cat.spent * 1000000} size="sm" showToggle={false} /></span>
                          <span
                            className={`flex items-center text-sm ${
                              cat.variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {cat.variance > 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            <CurrencyDisplay amount={Math.abs(cat.variance) * 1000000} size="sm" showToggle={false} />
                          </span>
                        </div>
                      </div>
                      <Progress value={safePercentageNumber(cat.spent, cat.budget)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channel Tab */}
        <TabsContent value="channel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription>Spending share by sales channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelSpending}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelSpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrencyCompact(Number(value) * 1000000, 'VND')} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Spending by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <Treemap
                    data={regionSpending}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={({ x, y, width, height, name, value }: any) => (
                      <g>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          style={{
                            fill: regionSpending.find((r) => r.name === name)?.fill || '#8884d8',
                            stroke: '#fff',
                            strokeWidth: 2,
                          }}
                        />
                        {width > 50 && height > 30 && (
                          <>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 - 8}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize={12}
                              fontWeight="bold"
                            >
                              {name}
                            </text>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 10}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize={11}
                            >
                              ₫{value / 1000}B
                            </text>
                          </>
                        )}
                      </g>
                    )}
                  />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trend Tab */}
        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>Trade vs Marketing spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${v / 1000}B`} />
                  <Tooltip formatter={(value) => formatCurrencyCompact(Number(value) * 1000000, 'VND')} />
                  <Legend />
                  <Bar dataKey="trade" stackId="a" fill="#3b82f6" name="Trade" />
                  <Bar dataKey="marketing" stackId="a" fill="#10b981" name="Marketing" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Promotions Tab */}
        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Promotions</CardTitle>
              <CardDescription>Highest spending promotions with ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPromotions.map((promo, idx) => (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <Badge variant="outline">#{idx + 1}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{promo.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{promo.channel}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <CurrencyDisplay amount={promo.spent} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              promo.roi >= 50 ? 'text-emerald-600 dark:text-emerald-400' : promo.roi >= 30 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {promo.roi}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Progress value={promo.roi} className="w-20 h-2" />
                        </TableCell>
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
