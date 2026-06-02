/**
 * Budget Monitoring Page
 * Real-time budget tracking: Planned vs Committed vs Actual
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Line,
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
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  Target,
  Zap,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyDisplay } from '@/components/ui/currency-display';

// Mock data
const trendData = [
  { month: 'Jan', planned: 4200, committed: 3800, actual: 3500, forecast: 4200 },
  { month: 'Feb', planned: 4500, committed: 4100, actual: 3900, forecast: 4500 },
  { month: 'Mar', planned: 4800, committed: 4600, actual: 4300, forecast: 4800 },
  { month: 'Apr', planned: 5000, committed: 4800, actual: 4500, forecast: 5200 },
  { month: 'May', planned: 5200, committed: 5000, actual: null, forecast: 5400 },
  { month: 'Jun', planned: 5500, committed: null, actual: null, forecast: 5600 },
];

const channelData = [
  { name: 'Modern Trade', value: 12000, color: '#3b82f6', percentage: 43 },
  { name: 'General Trade', value: 8000, color: '#10b981', percentage: 29 },
  { name: 'E-commerce', value: 5000, color: '#f59e0b', percentage: 18 },
  { name: 'HORECA', value: 3000, color: '#ef4444', percentage: 10 },
];

const categoryData = [
  { category: 'Discount', planned: 8000, actual: 7200, variance: -10 },
  { category: 'Rebate', planned: 6000, actual: 5800, variance: -3 },
  { category: 'POSM', planned: 4000, actual: 4200, variance: 5 },
  { category: 'Sampling', planned: 3000, actual: 2800, variance: -7 },
  { category: 'Display', planned: 2000, actual: 2100, variance: 5 },
];

const regionData = [
  { region: 'Miền Bắc', budget: 15000, spent: 12000, remaining: 3000, utilization: 80 },
  { region: 'Miền Trung', budget: 8000, spent: 6500, remaining: 1500, utilization: 81 },
  { region: 'Miền Nam', budget: 20000, spent: 16000, remaining: 4000, utilization: 80 },
  { region: 'Mekong', budget: 7000, spent: 5500, remaining: 1500, utilization: 79 },
];

const alerts = [
  {
    id: 1,
    type: 'warning',
    title: 'MT Channel approaching limit',
    description: '95% of MT budget allocated. Consider reallocation from other channels.',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'critical',
    title: 'Q1 overspend detected',
    description: 'Actual spend exceeded committed by ₫200M in January promotions.',
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'info',
    title: 'Budget reallocation approved',
    description: '₫500M transferred from HORECA to E-commerce channel.',
    time: '1 day ago',
  },
];

export default function BudgetMonitoringPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2026');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time budget tracking: Planned vs Committed vs Actual
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1-2026">Q1 2026</SelectItem>
              <SelectItem value="Q2-2026">Q2 2026</SelectItem>
              <SelectItem value="FY-2026">FY 2026</SelectItem>
              <SelectItem value="Q4-2025">Q4 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₫28.0B</div>
            <Progress value={70} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">70% of annual budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Committed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₫15.6B</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-1" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">+12% vs last Q</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Spend</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₫12.8B</div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">82% of committed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₫12.4B</div>
            <Badge variant="outline" className="mt-2">
              44% remaining
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          <TabsTrigger value="channel">By Channel</TabsTrigger>
          <TabsTrigger value="region">By Region</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Budget Trend Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Budget Trend</CardTitle>
                <CardDescription>
                  Planned vs Committed vs Actual (Monthly)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCommitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      tickFormatter={(value) => `${value / 1000}B`}
                      className="text-xs"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="font-medium">{label}</div>
                              {payload.map((entry: any) => (
                                <div
                                  key={entry.name}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-muted-foreground">
                                    {entry.name}:
                                  </span>
                                  <span className="font-medium">
                                    ₫{(entry.value / 1000).toFixed(1)}B
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="planned"
                      stroke="#94a3b8"
                      fillOpacity={1}
                      fill="url(#colorPlanned)"
                      name="Planned"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="committed"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorCommitted)"
                      name="Committed"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorActual)"
                      name="Actual"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      name="Forecast"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Channel Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget by Channel</CardTitle>
                <CardDescription>Distribution across sales channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Details */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Budget utilization by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((channel) => (
                    <div key={channel.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: channel.color }}
                          />
                          <span className="font-medium">{channel.name}</span>
                        </div>
                        <span className="font-mono"><CurrencyDisplay amount={channel.value * 1000000} size="sm" /></span>
                      </div>
                      <Progress value={channel.percentage * 2.3} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="region" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Budget Status</CardTitle>
              <CardDescription>Budget allocation and spending by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value / 1000}B`} />
                  <YAxis type="category" dataKey="region" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                  <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                  <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Variance</CardTitle>
              <CardDescription>Planned vs Actual by promotion category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `${value / 1000}B`} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alerts</CardTitle>
          <CardDescription>Warnings and threshold breaches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${
                  alert.type === 'critical'
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'critical'
                      ? 'text-red-600'
                      : alert.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Badge
                  variant={
                    alert.type === 'critical'
                      ? 'destructive'
                      : alert.type === 'warning'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {alert.type.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
