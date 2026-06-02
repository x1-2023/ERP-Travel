/**
 * Baseline List Page
 */

import { Link, useSearchParams } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useBaselines } from '@/hooks/useBaselines';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import type { ColumnDef } from '@tanstack/react-table';
import type { Baseline } from '@/types';

// Demo data
const demoBaselines: Baseline[] = [
  {
    id: '1',
    code: 'BL-2026-001',
    name: 'Q1 Revenue Baseline',
    year: 2026,
    period: 'QUARTERLY',
    periodValue: 1,
    baselineType: 'REVENUE',
    baselineValue: 4500000000,
    actualValue: 4850000000,
    variance: 350000000,
    variancePercent: 7.78,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'BL-2026-002',
    name: 'January Volume',
    year: 2026,
    period: 'MONTHLY',
    periodValue: 1,
    baselineType: 'VOLUME',
    baselineValue: 10000,
    actualValue: 9500,
    variance: -500,
    variancePercent: -5.0,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-31',
  },
  {
    id: '3',
    code: 'BL-2026-003',
    name: 'Product A Price',
    year: 2026,
    period: 'YEARLY',
    periodValue: 1,
    baselineType: 'PRICE',
    baselineValue: 150000,
    actualValue: 155000,
    variance: 5000,
    variancePercent: 3.33,
    productName: 'Product A',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
];

const typeLabels: Record<string, string> = {
  REVENUE: 'Revenue',
  VOLUME: 'Volume',
  PRICE: 'Price',
  COST: 'Cost',
};

const columns: ColumnDef<Baseline>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <Link
        to={`/baselines/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.code}
      </Link>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'baselineType',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline">{typeLabels[row.original.baselineType]}</Badge>
    ),
  },
  {
    id: 'period',
    header: 'Period',
    cell: ({ row }) => {
      const { period, periodValue, year } = row.original;
      if (period === 'MONTHLY') return `${year}-${String(periodValue).padStart(2, '0')}`;
      if (period === 'QUARTERLY') return `${year} Q${periodValue}`;
      return year;
    },
  },
  {
    accessorKey: 'baselineValue',
    header: 'Baseline',
    cell: ({ row }) => {
      const type = row.original.baselineType;
      if (type === 'REVENUE' || type === 'PRICE' || type === 'COST') {
        return formatCurrencyCompact(row.original.baselineValue, 'VND');
      }
      return formatNumber(row.original.baselineValue);
    },
  },
  {
    accessorKey: 'actualValue',
    header: 'Actual',
    cell: ({ row }) => {
      if (!row.original.actualValue) return '-';
      const type = row.original.baselineType;
      if (type === 'REVENUE' || type === 'PRICE' || type === 'COST') {
        return formatCurrencyCompact(row.original.actualValue, 'VND');
      }
      return formatNumber(row.original.actualValue);
    },
  },
  {
    id: 'variance',
    header: 'Variance',
    cell: ({ row }) => {
      const variance = row.original.variancePercent;
      if (variance === undefined) return '-';

      const isPositive = variance > 0;
      const isNegative = variance < 0;

      return (
        <div className="flex items-center gap-1">
          {isPositive && <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
          {variance === 0 && <Minus className="h-4 w-4 text-gray-400" />}
          <span className={
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
          }>
            {isPositive ? '+' : ''}{variance.toFixed(2)}%
          </span>
        </div>
      );
    },
  },
];

export default function BaselineList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: 20,
    year: Number(searchParams.get('year')) || new Date().getFullYear(),
    period: searchParams.get('period') || '',
    baselineType: searchParams.get('baselineType') || '',
  };

  const { data, isLoading } = useBaselines(filters);
  const baselines = data?.baselines?.length ? data.baselines : demoBaselines;

  // Calculate summary
  const avgVariance = baselines.reduce((sum: number, b: Baseline) => sum + (b.variancePercent || 0), 0) / baselines.length;
  const positiveVariances = baselines.filter((b: Baseline) => (b.variancePercent || 0) > 0).length;
  const negativeVariances = baselines.filter((b: Baseline) => (b.variancePercent || 0) < 0).length;

  const updateFilters = (updates: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    if (!('page' in updates)) params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Baselines</h1>
          <p className="text-muted-foreground">
            Manage baseline data for ROI calculations
          </p>
        </div>
        <Button asChild>
          <Link to="/baselines/new">
            <Plus className="mr-2 h-4 w-4" />
            New Baseline
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {avgVariance >= 0 ? '+' : ''}{avgVariance.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Above Baseline</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{positiveVariances}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Below Baseline</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{negativeVariances}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select
          value={String(filters.year)}
          onValueChange={(year) => updateFilters({ year: Number(year) })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.period || 'all'}
          onValueChange={(period) => updateFilters({ period: period === 'all' ? '' : period })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Periods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.baselineType || 'all'}
          onValueChange={(baselineType) => updateFilters({ baselineType: baselineType === 'all' ? '' : baselineType })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="REVENUE">Revenue</SelectItem>
            <SelectItem value="VOLUME">Volume</SelectItem>
            <SelectItem value="PRICE">Price</SelectItem>
            <SelectItem value="COST">Cost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={baselines}
        isLoading={isLoading}
      />

      {data?.metadata && (
        <Pagination
          currentPage={data.metadata.pageNumber}
          totalPages={data.metadata.totalPages}
          pageSize={data.metadata.pageSize}
          totalCount={data.metadata.totalCount}
          onPageChange={(page) => updateFilters({ page })}
        />
      )}
    </div>
  );
}
