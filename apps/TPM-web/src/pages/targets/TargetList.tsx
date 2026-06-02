/**
 * Target List Page
 */

import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Target as TargetIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTargets } from '@/hooks/useTargets';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatNumber, safeDivide, safePercentage } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';
import type { ColumnDef } from '@tanstack/react-table';
import type { Target } from '@/types';

// Demo data
const demoTargets: Target[] = [
  {
    id: '1',
    code: 'TGT-2026-001',
    name: 'Q1 Revenue Target',
    year: 2026,
    quarter: 1,
    targetType: 'REVENUE',
    targetValue: 5000000000,
    actualValue: 4250000000,
    achievementRate: 85,
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'TGT-2026-002',
    name: 'January Volume',
    year: 2026,
    month: 1,
    targetType: 'VOLUME',
    targetValue: 10000,
    actualValue: 11200,
    achievementRate: 112,
    status: 'ACHIEVED',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-31',
  },
  {
    id: '3',
    code: 'TGT-2026-003',
    name: 'Distribution Target',
    year: 2026,
    quarter: 1,
    targetType: 'DISTRIBUTION',
    targetValue: 500,
    actualValue: 420,
    achievementRate: 84,
    customerName: 'Vinamilk',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
  ACTIVE: 'bg-blue-500 text-white border border-blue-600 dark:bg-blue-600 dark:border-blue-700',
  ACHIEVED: 'bg-emerald-600 text-white border border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600',
  MISSED: 'bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:border-red-700',
};

const typeLabels: Record<string, string> = {
  REVENUE: 'Revenue',
  VOLUME: 'Volume',
  DISTRIBUTION: 'Distribution',
  COVERAGE: 'Coverage',
};

const columns: ColumnDef<Target>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <Link
        to={`/targets/${row.original.id}`}
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
    accessorKey: 'targetType',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline">{typeLabels[row.original.targetType]}</Badge>
    ),
  },
  {
    id: 'period',
    header: 'Period',
    cell: ({ row }) => {
      if (row.original.month) return `${row.original.year}-${String(row.original.month).padStart(2, '0')}`;
      if (row.original.quarter) return `${row.original.year} Q${row.original.quarter}`;
      return row.original.year;
    },
  },
  {
    accessorKey: 'targetValue',
    header: 'Target',
    cell: ({ row }) => {
      if (row.original.targetType === 'REVENUE') return formatCurrencyCompact(row.original.targetValue, 'VND');
      return formatNumber(row.original.targetValue);
    },
  },
  {
    id: 'achievement',
    header: 'Achievement',
    cell: ({ row }) => {
      const rate = row.original.achievementRate;
      return (
        <div className="w-32">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={rate >= 100 ? 'text-emerald-600 dark:text-emerald-400' : rate >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
              {rate}%
            </span>
            {rate >= 100 ? (
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
          </div>
          <Progress value={Math.min(rate, 100)} className="h-2" />
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className={statusColors[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
];

export default function TargetList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: 20,
    year: Number(searchParams.get('year')) || new Date().getFullYear(),
    targetType: searchParams.get('targetType') || '',
    status: searchParams.get('status') || '',
  };

  const { data, isLoading } = useTargets(filters);
  const targets = data?.targets?.length ? data.targets : demoTargets;

  // Calculate summary
  const totalTargets = targets.length;
  const achievedTargets = targets.filter((t: Target) => t.status === 'ACHIEVED').length;
  const avgAchievement = safeDivide(targets.reduce((sum: number, t: Target) => sum + t.achievementRate, 0), totalTargets);

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
          <h1 className="text-2xl font-bold">Mục tiêu</h1>
          <p className="text-muted-foreground">
            Quản lý mục tiêu bán hàng và theo dõi tiến độ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/targets/allocation">
              <TargetIcon className="mr-2 h-4 w-4" />
              Phân bổ mục tiêu
            </Link>
          </Button>
          <Button asChild>
            <Link to="/targets/new">
              <Plus className="mr-2 h-4 w-4" />
              Tạo mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng mục tiêu</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTargets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã đạt</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{achievedTargets}</div>
            <p className="text-xs text-muted-foreground">
              {safePercentage(achievedTargets, totalTargets, 0)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgAchievement >= 100 ? 'text-emerald-600 dark:text-emerald-400' : avgAchievement >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {avgAchievement.toFixed(1)}%
            </div>
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
          value={filters.targetType || 'all'}
          onValueChange={(targetType) => updateFilters({ targetType: targetType === 'all' ? '' : targetType })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="REVENUE">Revenue</SelectItem>
            <SelectItem value="VOLUME">Volume</SelectItem>
            <SelectItem value="DISTRIBUTION">Distribution</SelectItem>
            <SelectItem value="COVERAGE">Coverage</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status || 'all'}
          onValueChange={(status) => updateFilters({ status: status === 'all' ? '' : status })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ACHIEVED">Achieved</SelectItem>
            <SelectItem value="MISSED">Missed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={targets}
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
