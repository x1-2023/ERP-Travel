/**
 * Fund List Page - Full Implementation
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Edit, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SearchInput } from '@/components/shared/SearchInput';
import { useFunds, useDeleteFund } from '@/hooks/useFunds';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Fund, FundType } from '@/types';

type ViewMode = 'table' | 'grid';

// Demo data when API not connected
const demoFunds: Fund[] = [
  {
    id: '1',
    code: 'FUND-2026-001',
    name: 'Trade Fund Q1',
    fundType: 'TRADE_FUND',
    totalBudget: 2000000000,
    allocatedBudget: 1200000000,
    utilizedBudget: 800000000,
    availableBudget: 800000000,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    description: 'Q1 2026 Trade Promotion Fund',
    createdAt: '2025-12-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    code: 'FUND-2026-002',
    name: 'Marketing Fund',
    fundType: 'MARKETING_FUND',
    totalBudget: 3000000000,
    allocatedBudget: 1500000000,
    utilizedBudget: 450000000,
    availableBudget: 1500000000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Annual Marketing Budget',
    createdAt: '2025-12-01',
    updatedAt: '2026-01-10',
  },
  {
    id: '3',
    code: 'FUND-2026-003',
    name: 'Co-Op Advertising Fund',
    fundType: 'CO_OP_FUND',
    totalBudget: 1500000000,
    allocatedBudget: 600000000,
    utilizedBudget: 200000000,
    availableBudget: 900000000,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    description: 'Cooperative advertising with key accounts',
    createdAt: '2025-12-15',
    updatedAt: '2026-01-08',
  },
  {
    id: '4',
    code: 'FUND-2026-004',
    name: 'Promotional Events Fund',
    fundType: 'PROMOTIONAL_FUND',
    totalBudget: 1000000000,
    allocatedBudget: 800000000,
    utilizedBudget: 750000000,
    availableBudget: 200000000,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    description: 'In-store promotional events budget',
    createdAt: '2025-12-10',
    updatedAt: '2026-01-20',
  },
  {
    id: '5',
    code: 'FUND-2025-005',
    name: 'Trade Fund Q4 2025',
    fundType: 'TRADE_FUND',
    totalBudget: 1800000000,
    allocatedBudget: 1800000000,
    utilizedBudget: 1750000000,
    availableBudget: 0,
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    description: 'Q4 2025 Trade Promotion Fund - Completed',
    createdAt: '2025-09-15',
    updatedAt: '2025-12-31',
  },
];

const fundTypeOptions: { value: FundType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'TRADE_FUND', label: 'Trade Fund' },
  { value: 'MARKETING_FUND', label: 'Marketing Fund' },
  { value: 'PROMOTIONAL_FUND', label: 'Promotional Fund' },
  { value: 'CO_OP_FUND', label: 'Co-Op Fund' },
];

const fundTypeLabels: Record<FundType, string> = {
  TRADE_FUND: 'Trade',
  MARKETING_FUND: 'Marketing',
  PROMOTIONAL_FUND: 'Promotional',
  CO_OP_FUND: 'Co-Op',
};

export default function FundList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    fundType: (searchParams.get('fundType') || '') as FundType | '',
  };

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  // Fetch funds
  const { data, isLoading, error } = useFunds({
    page,
    pageSize,
    fundType: filters.fundType || undefined,
    search: filters.search || undefined,
  });

  const deleteFund = useDeleteFund();
  const { toast } = useToast();

  // Use API data or demo data
  const funds = data?.funds || demoFunds;
  const metadata = data?.metadata || {
    totalCount: demoFunds.length,
    pageSize: 20,
    pageNumber: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Filter demo data locally when API not connected
  const filteredFunds = useMemo(() => {
    if (data?.funds) return funds; // API handles filtering

    return funds.filter((fund: Fund) => {
      if (filters.search && !fund.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !fund.code.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.fundType && fund.fundType !== filters.fundType) return false;
      return true;
    });
  }, [funds, filters, data?.funds]);

  // Update URL params
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();
    if (merged.search) params.set('search', merged.search);
    if (merged.fundType) params.set('fundType', merged.fundType);
    params.set('page', '1');
    params.set('pageSize', String(pageSize));
    setSearchParams(params);
  };

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const updatePageSize = (newSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', String(newSize));
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa quỹ này?')) {
      try {
        await deleteFund.mutateAsync(id);
        toast({ title: 'Thành công', description: 'Đã xóa quỹ' });
      } catch {
        toast({ title: 'Lỗi', description: 'Không thể xóa quỹ', variant: 'destructive' });
      }
    }
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Table columns
  const columns: ColumnDef<Fund>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Fund Code',
        cell: ({ row }) => (
          <Link
            to={`/funds/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.code}
          </Link>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <Badge variant="outline" className="mt-1">
              {fundTypeLabels[row.original.fundType]}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'totalBudget',
        header: 'Budget',
        cell: ({ row }) => {
          const utilizationPercent = row.original.totalBudget > 0
            ? Math.round((row.original.utilizedBudget / row.original.totalBudget) * 100)
            : 0;
          return (
            <div className="space-y-1">
              <CurrencyDisplay amount={row.original.totalBudget} size="sm" />
              <div className="flex items-center gap-2">
                <Progress
                  value={utilizationPercent}
                  className={`h-2 w-20 [&>div]:${getUtilizationColor(utilizationPercent)}`}
                />
                <span className="text-xs text-muted-foreground">{utilizationPercent}%</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'availableBudget',
        header: 'Available',
        cell: ({ row }) => (
          <div className={row.original.availableBudget > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            <CurrencyDisplay amount={row.original.availableBudget} size="sm" />
          </div>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'Period',
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{formatDate(row.original.startDate)}</p>
            <p className="text-muted-foreground">to {formatDate(row.original.endDate)}</p>
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/funds/${row.original.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/funds/${row.original.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate]
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading funds..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quỹ khuyến mãi</h1>
          <p className="text-muted-foreground">
            Quản lý quỹ và ngân sách khuyến mãi
          </p>
        </div>
        <Button asChild>
          <Link to="/funds/new">
            <Plus className="mr-2 h-4 w-4" />
            Tạo mới
          </Link>
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            value={filters.search}
            onChange={(search) => updateFilters({ search })}
            placeholder="Tìm kiếm quỹ..."
            className="w-full sm:w-80"
          />

          <Select
            value={filters.fundType || 'all'}
            onValueChange={(fundType) => updateFilters({ fundType: fundType === 'all' ? '' : fundType as FundType })}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Fund Type" />
            </SelectTrigger>
            <SelectContent>
              {fundTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredFunds.length === 0 ? (
        <EmptyState
          title="No funds found"
          description={
            filters.search || filters.fundType
              ? 'Try adjusting your filters'
              : 'Get started by creating your first fund'
          }
          action={
            <Button asChild>
              <Link to="/funds/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Fund
              </Link>
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredFunds}
              error={error?.message}
              onRowClick={(row) => navigate(`/funds/${row.id}`)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFunds.map((fund: Fund) => {
            const utilizationPercent = fund.totalBudget > 0
              ? Math.round((fund.utilizedBudget / fund.totalBudget) * 100)
              : 0;
            const allocatedPercent = fund.totalBudget > 0
              ? Math.round((fund.allocatedBudget / fund.totalBudget) * 100)
              : 0;

            return (
              <Link key={fund.id} to={`/funds/${fund.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {fund.code}
                        </p>
                        <CardTitle className="mt-1 text-lg">{fund.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{fundTypeLabels[fund.fundType]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4" />
                        <span>
                          {formatDate(fund.startDate)} - {formatDate(fund.endDate)}
                        </span>
                      </div>

                      <div className="space-y-3 pt-2 border-t">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Allocated</span>
                            <span className="font-medium">{allocatedPercent}%</span>
                          </div>
                          <Progress value={allocatedPercent} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Utilized</span>
                            <span className="font-medium">{utilizationPercent}%</span>
                          </div>
                          <Progress
                            value={utilizationPercent}
                            className={`h-2 [&>div]:${getUtilizationColor(utilizationPercent)}`}
                          />
                        </div>

                        <div className="flex justify-between pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Available</p>
                            <div className={fund.availableBudget > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                              <CurrencyDisplay amount={fund.availableBudget} size="sm" />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <CurrencyDisplay amount={fund.totalBudget} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredFunds.length > 0 && (
        <Pagination
          currentPage={metadata.pageNumber}
          totalPages={metadata.totalPages}
          pageSize={metadata.pageSize}
          totalCount={metadata.totalCount}
          onPageChange={updatePage}
          onPageSizeChange={updatePageSize}
        />
      )}
    </div>
  );
}
