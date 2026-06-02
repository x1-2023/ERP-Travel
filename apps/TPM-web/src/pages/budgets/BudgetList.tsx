/**
 * Budget List Page
 */

import { Link, useSearchParams } from 'react-router-dom';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
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
import { SearchInput } from '@/components/shared/SearchInput';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { ColumnDef } from '@tanstack/react-table';
import type { Budget } from '@/types';
import { safePercentage, safePercentageNumber } from '@/lib/utils';

// Demo data
const demoBudgets: Budget[] = [
  {
    id: '1',
    code: 'BUD-2026-001',
    name: 'Q1 Trade Budget',
    year: 2026,
    totalAmount: 1000000000,
    allocatedAmount: 800000000,
    spentAmount: 450000000,
    availableAmount: 550000000,
    status: 'ACTIVE',
    category: 'Trade',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'BUD-2026-002',
    name: 'Q1 Marketing Budget',
    year: 2026,
    totalAmount: 500000000,
    allocatedAmount: 400000000,
    spentAmount: 280000000,
    availableAmount: 220000000,
    status: 'ACTIVE',
    category: 'Marketing',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '3',
    code: 'BUD-2026-003',
    name: 'Q2 Trade Budget',
    year: 2026,
    totalAmount: 1200000000,
    allocatedAmount: 200000000,
    spentAmount: 0,
    availableAmount: 1200000000,
    status: 'APPROVED',
    category: 'Trade',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
  APPROVED: 'bg-blue-500 text-white border border-blue-600 dark:bg-blue-600 dark:border-blue-700',
  ACTIVE: 'bg-emerald-600 text-white border border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600',
  CLOSED: 'bg-violet-500 text-white border border-violet-600 dark:bg-violet-600 dark:border-violet-700',
};

const columns: ColumnDef<Budget>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <Link
        to={`/budgets/${row.original.id}`}
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
    accessorKey: 'year',
    header: 'Year',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ row }) => <CurrencyDisplay amount={row.original.totalAmount} size="sm" />,
  },
  {
    id: 'utilization',
    header: 'Utilization',
    cell: ({ row }) => {
      const percent = safePercentageNumber(row.original.spentAmount, row.original.totalAmount);
      return (
        <div className="w-32">
          <div className="flex justify-between text-xs mb-1">
            <span>{percent.toFixed(0)}%</span>
          </div>
          <Progress value={percent} className="h-2" />
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

export default function BudgetList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: 20,
    year: Number(searchParams.get('year')) || new Date().getFullYear(),
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
  };

  const { data, isLoading } = useBudgets(filters);
  const budgets = data?.budgets?.length ? data.budgets : demoBudgets;

  // Calculate summary
  const totalBudget = budgets.reduce((sum: number, b: Budget) => sum + b.totalAmount, 0);
  const totalSpent = budgets.reduce((sum: number, b: Budget) => sum + b.spentAmount, 0);
  const totalAvailable = budgets.reduce((sum: number, b: Budget) => sum + b.availableAmount, 0);

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
          <h1 className="text-2xl font-bold">Ngân sách</h1>
          <p className="text-muted-foreground">
            Quản lý ngân sách và phân bổ theo năm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/budgets/allocation">
              <DollarSign className="mr-2 h-4 w-4" />
              Phân bổ ngân sách
            </Link>
          </Button>
          <Button asChild>
            <Link to="/budgets/new">
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
            <CardTitle className="text-sm font-medium">Tổng ngân sách</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalBudget} size="lg" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã chi tiêu</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CurrencyDisplay amount={totalSpent} size="lg" /></div>
            <p className="text-xs text-muted-foreground">
              {safePercentage(totalSpent, totalBudget)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Còn lại</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={totalAvailable} size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          value={filters.search}
          onChange={(search) => updateFilters({ search })}
          placeholder="Tìm kiếm ngân sách..."
          className="w-full sm:w-80"
        />
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
          value={filters.status || 'all'}
          onValueChange={(status) => updateFilters({ status: status === 'all' ? '' : status })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={budgets}
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
