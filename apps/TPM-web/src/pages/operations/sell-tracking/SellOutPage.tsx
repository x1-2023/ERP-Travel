/**
 * Sell-Out Analysis Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, TrendingDown, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SellTrendChart } from '@/components/operations/SellTrendChart';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatPercent } from '@/lib/utils';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function SellOutPage() {
  const [filters, setFilters] = useState({
    customerId: '',
    productId: '',
    periodFrom: '',
    periodTo: '',
    groupBy: 'period' as 'period' | 'customer' | 'product' | 'category',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sell-out-analysis', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.customerId) params.set('customerId', filters.customerId);
      if (filters.productId) params.set('productId', filters.productId);
      if (filters.periodFrom) params.set('periodFrom', filters.periodFrom);
      if (filters.periodTo) params.set('periodTo', filters.periodTo);
      params.set('groupBy', filters.groupBy);

      const res = await api.get(`/operations/sell-tracking/sell-out?${params.toString()}`);
      return res.data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getSellThroughBadge = (rate: number) => {
    if (rate >= 80) {
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Excellent</Badge>;
    } else if (rate >= 60) {
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">Good</Badge>;
    } else if (rate >= 40) {
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">Average</Badge>;
    } else {
      return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/operations/sell-tracking">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">Sell-Out Analysis</h1>
            <p className="text-muted-foreground truncate">
              Analyze products sold by customers to consumers
            </p>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 self-start sm:self-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total Sell-Out"
          value={formatNumber(data?.totals?.quantity || 0)}
          subtitle="Units"
          icon={TrendingDown}
          color="primary"
        />
        <StatCard
          title="Total Value"
          value={formatCurrencyCompact(data?.totals?.value || 0, 'VND')}
          color="success"
        />
        <StatCard
          title="Avg Sell-Through"
          value={formatPercent(data?.analysis?.avgSellThroughRate || 0)}
          color={
            (data?.analysis?.avgSellThroughRate || 0) >= 70
              ? 'success'
              : (data?.analysis?.avgSellThroughRate || 0) >= 50
              ? 'warning'
              : 'danger'
          }
        />
        <StatCard
          title="Growth"
          value={`${data?.analysis?.overallGrowth > 0 ? '+' : ''}${data?.analysis?.overallGrowth || 0}%`}
          color={
            (data?.analysis?.overallGrowth || 0) > 0
              ? 'success'
              : (data?.analysis?.overallGrowth || 0) < 0
              ? 'danger'
              : 'default'
          }
        />
      </StatCardGroup>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Input
              type="month"
              placeholder="From period"
              value={filters.periodFrom}
              onChange={(e) => handleFilterChange('periodFrom', e.target.value)}
              className="w-40"
            />
            <Input
              type="month"
              placeholder="To period"
              value={filters.periodTo}
              onChange={(e) => handleFilterChange('periodTo', e.target.value)}
              className="w-40"
            />
            <Tabs
              value={filters.groupBy}
              onValueChange={(v) => handleFilterChange('groupBy', v)}
            >
              <TabsList>
                <TabsTrigger value="period">By Period</TabsTrigger>
                <TabsTrigger value="customer">By Customer</TabsTrigger>
                <TabsTrigger value="product">By Product</TabsTrigger>
                <TabsTrigger value="category">By Category</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Trend Chart */}
          {filters.groupBy === 'period' && data?.trend && (
            <SellTrendChart
              data={data.trend.map((t: any) => ({
                period: t.period,
                quantity: t.quantity,
                value: t.value,
              }))}
              type="sell-out"
              title="Sell-Out Trend"
            />
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* Data Table */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Sell-Out by {filters.groupBy.charAt(0).toUpperCase() + filters.groupBy.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {filters.groupBy === 'period'
                          ? 'Period'
                          : filters.groupBy === 'customer'
                          ? 'Customer'
                          : filters.groupBy === 'product'
                          ? 'Product'
                          : 'Category'}
                      </TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-center">Sell-Through</TableHead>
                      {filters.groupBy === 'period' && (
                        <TableHead className="text-right">Growth</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!Array.isArray(data?.data) || data.data.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={filters.groupBy === 'period' ? 5 : 4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.data.map((row: any) => (
                        <TableRow key={row.groupKey}>
                          <TableCell className="font-medium">{row.groupName}</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(row.quantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            <CurrencyDisplay amount={row.value} size="sm" />
                          </TableCell>
                          <TableCell className="text-center">
                            {getSellThroughBadge(row.sellThroughRate || 0)}
                          </TableCell>
                          {filters.groupBy === 'period' && (
                            <TableCell className="text-right">
                              {row.growthPercent !== undefined ? (
                                <span
                                  className={
                                    row.growthPercent > 0
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : row.growthPercent < 0
                                      ? 'text-red-600 dark:text-red-400'
                                      : ''
                                  }
                                >
                                  {row.growthPercent > 0 ? '+' : ''}
                                  {row.growthPercent}%
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.topProducts?.slice(0, 5).map((product: any, index: number) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium truncate max-w-[120px]">
                          {product.productName}
                        </span>
                      </div>
                      <span className="font-semibold">
                        {formatNumber(product.sellOut)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
