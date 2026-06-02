/**
 * Sell-In Analysis Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { formatNumber } from '@/lib/utils';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function SellInPage() {
  const [filters, setFilters] = useState({
    customerId: '',
    productId: '',
    periodFrom: '',
    periodTo: '',
    groupBy: 'period' as 'period' | 'customer' | 'product' | 'category',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sell-in-analysis', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.customerId) params.set('customerId', filters.customerId);
      if (filters.productId) params.set('productId', filters.productId);
      if (filters.periodFrom) params.set('periodFrom', filters.periodFrom);
      if (filters.periodTo) params.set('periodTo', filters.periodTo);
      params.set('groupBy', filters.groupBy);

      const res = await api.get(`/operations/sell-tracking/sell-in?${params.toString()}`);
      return res.data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
            <h1 className="text-2xl font-bold truncate">Sell-In Analysis</h1>
            <p className="text-muted-foreground truncate">
              Analyze products shipped to customers
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
          title="Total Sell-In"
          value={formatNumber(data?.totals?.quantity || 0)}
          subtitle="Units"
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Total Value"
          value={formatCurrencyCompact(data?.totals?.value || 0, 'VND')}
          color="success"
        />
        <StatCard
          title="Customers"
          value={data?.analysis?.uniqueCustomers || 0}
          subtitle="Active"
          color="info"
        />
        <StatCard
          title="Products"
          value={data?.analysis?.uniqueProducts || 0}
          subtitle="SKUs"
          color="purple"
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
              type="sell-in"
              title="Sell-In Trend"
            />
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Sell-In by {filters.groupBy.charAt(0).toUpperCase() + filters.groupBy.slice(1)}
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
                    <TableHead className="text-right">Records</TableHead>
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
                        <TableCell className="text-right">{row.recordCount}</TableCell>
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
        </>
      )}
    </div>
  );
}
