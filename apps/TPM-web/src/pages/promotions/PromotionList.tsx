/**
 * Promotion List Page - Full Implementation
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PromotionFilters } from '@/components/promotions/PromotionFilters';
import { PromotionCard } from '@/components/promotions/PromotionCard';
import { PromotionStatusBadge } from '@/components/promotions/PromotionStatusBadge';
import { usePromotions, useDeletePromotion } from '@/hooks/usePromotions';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Promotion, PromotionStatus } from '@/types';

type ViewMode = 'table' | 'grid';

// Demo data when API not connected
const demoPromotions: Promotion[] = [
  {
    id: '1',
    code: 'PROMO-2026-001',
    name: 'Summer Sale Campaign',
    description: 'Summer promotional campaign for Q2',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    budget: 500000000,
    actualSpend: 320000000,
    promotionType: 'TRADE_PROMOTION',
    mechanicType: 'DISCOUNT',
    customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-01',
    updatedAt: '2025-12-15',
  },
  {
    id: '2',
    code: 'PROMO-2026-002',
    name: 'Q1 Trade Deal',
    description: 'Trade deal for Q1',
    status: 'PENDING_APPROVAL',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    budget: 300000000,
    actualSpend: 0,
    promotionType: 'TRADE_PROMOTION',
    mechanicType: 'REBATE',
    customer: { id: '2', code: 'CUST-002', name: 'Customer B', channel: 'KEY_ACCOUNT', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-10',
    updatedAt: '2025-12-20',
  },
  {
    id: '3',
    code: 'PROMO-2026-003',
    name: 'New Product Launch',
    description: 'Launch promotion for new product line',
    status: 'DRAFT',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    budget: 800000000,
    actualSpend: 0,
    promotionType: 'CONSUMER_PROMOTION',
    mechanicType: 'FREE_GOODS',
    customer: { id: '3', code: 'CUST-003', name: 'Customer C', channel: 'GENERAL_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: { id: '2', code: 'FUND-002', name: 'Marketing Fund', fundType: 'MARKETING_FUND', totalBudget: 2000000000, allocatedBudget: 800000000, utilizedBudget: 0, availableBudget: 1200000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-15',
    updatedAt: '2025-12-22',
  },
  {
    id: '4',
    code: 'PROMO-2026-004',
    name: 'Flash Sale Weekend',
    description: 'Weekend flash sale promotion',
    status: 'COMPLETED',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    budget: 200000000,
    actualSpend: 195000000,
    promotionType: 'TRADE_PROMOTION',
    mechanicType: 'DISCOUNT',
    customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-11-15',
    updatedAt: '2025-12-31',
  },
  {
    id: '5',
    code: 'PROMO-2026-005',
    name: 'Loyalty Program Boost',
    description: 'Increased loyalty points for members',
    status: 'APPROVED',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    budget: 450000000,
    actualSpend: 0,
    promotionType: 'CONSUMER_PROMOTION',
    mechanicType: 'LOYALTY_POINTS',
    customer: { id: '4', code: 'CUST-004', name: 'Customer D', channel: 'E_COMMERCE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: { id: '2', code: 'FUND-002', name: 'Marketing Fund', fundType: 'MARKETING_FUND', totalBudget: 2000000000, allocatedBudget: 800000000, utilizedBudget: 0, availableBudget: 1200000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-20',
    updatedAt: '2026-01-05',
  },
];

export default function PromotionList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') || '') as PromotionStatus | '',
    customerId: searchParams.get('customerId') || '',
    fundId: searchParams.get('fundId') || '',
  };

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  // Fetch promotions
  const { data, isLoading, error } = usePromotions({
    page,
    pageSize,
    status: filters.status || undefined,
    customerId: filters.customerId || undefined,
    fundId: filters.fundId || undefined,
    search: filters.search || undefined,
  });

  const deletePromotion = useDeletePromotion();

  // Use API data or demo data (fallback when API returns empty)
  const promotions = (data?.promotions?.length ? data.promotions : demoPromotions);
  const metadata = data?.metadata || {
    totalCount: demoPromotions.length,
    pageSize: 20,
    pageNumber: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Filter demo data locally when API not connected
  const filteredPromotions = useMemo(() => {
    if (data?.promotions) return promotions; // API handles filtering

    return promotions.filter((promo: Promotion) => {
      if (filters.search && !promo.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !promo.code.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status && promo.status !== filters.status) return false;
      if (filters.customerId && promo.customer?.id !== filters.customerId) return false;
      if (filters.fundId && promo.fund?.id !== filters.fundId) return false;
      return true;
    });
  }, [promotions, filters, data?.promotions]);

  // Update URL params
  const updateFilters = (newFilters: {
    search?: string;
    status?: PromotionStatus | '';
    customerId?: string;
    fundId?: string;
  }) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.customerId) params.set('customerId', newFilters.customerId);
    if (newFilters.fundId) params.set('fundId', newFilters.fundId);
    params.set('page', '1'); // Reset to first page on filter change
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
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      await deletePromotion.mutateAsync(id);
    }
  };

  // Table columns
  const columns: ColumnDef<Promotion>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Link
            to={`/promotions/${row.original.id}`}
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
            <p className="text-sm text-muted-foreground">
              {row.original.customer?.name}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <PromotionStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        cell: ({ row }) => (
          <div>
            <CurrencyDisplay amount={row.original.budget} size="sm" />
            <p className="text-sm text-muted-foreground">
              Spent: <CurrencyDisplay amount={row.original.actualSpend} size="sm" showToggle={false} />
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'startDate',
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
              <DropdownMenuItem onClick={() => navigate(`/promotions/${row.original.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/promotions/${row.original.id}/edit`)}>
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
    return <LoadingSpinner fullScreen text="Loading promotions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">
            Manage trade promotions and campaigns
          </p>
        </div>
        <Button asChild>
          <Link to="/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Promotion
          </Link>
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PromotionFilters filters={filters} onFiltersChange={updateFilters} />

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
      {filteredPromotions.length === 0 ? (
        <EmptyState
          title="No promotions found"
          description={
            filters.search || filters.status || filters.customerId || filters.fundId
              ? 'Try adjusting your filters'
              : 'Get started by creating your first promotion'
          }
          action={
            <Button asChild>
              <Link to="/promotions/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Promotion
              </Link>
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredPromotions}
              error={error?.message}
              onRowClick={(row) => navigate(`/promotions/${row.id}`)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPromotions.map((promotion: Promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredPromotions.length > 0 && (
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
