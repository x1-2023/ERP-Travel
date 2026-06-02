/**
 * Claim List Page - Phase 6 Enhanced
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SearchInput } from '@/components/shared/SearchInput';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { useClaims, useDeleteClaim } from '@/hooks/useClaims';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { ClaimStatus } from '@/types';

type ViewMode = 'table' | 'grid';

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'SUBMITTED', label: 'Đã gửi' },
  { value: 'VALIDATING', label: 'Đang xác thực' },
  { value: 'VALIDATION_FAILED', label: 'Lỗi xác thực' },
  { value: 'PENDING_MATCH', label: 'Chờ đối soát' },
  { value: 'MATCHED', label: 'Đã đối soát' },
  { value: 'UNDER_REVIEW', label: 'Đang xem xét' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'PARTIALLY_APPROVED', label: 'Duyệt 1 phần' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'SETTLED', label: 'Đã thanh toán' },
  { value: 'PARTIALLY_SETTLED', label: 'TT 1 phần' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

// Demo data
const demoClaims = [
  {
    id: '1', code: 'CLM-2026-001', status: 'SUBMITTED' as ClaimStatus,
    claimDate: '2026-01-15', amount: 50000000, claimAmount: 50000000,
    description: 'Q1 rebate claim', type: 'REBATE',
    customer: { id: '1', name: 'BigC', channel: 'MT' },
    promotion: { id: '1', code: 'PROMO-001', name: 'Tết 2026', status: 'EXECUTING' },
    _count: { lineItems: 3, settlements: 0, approvals: 0 },
    createdAt: '2026-01-15', updatedAt: '2026-01-15',
  },
  {
    id: '2', code: 'CLM-2026-002', status: 'APPROVED' as ClaimStatus,
    claimDate: '2026-01-10', amount: 75000000, claimAmount: 75000000, approvedAmount: 72000000,
    description: 'December trade deal', type: 'DISCOUNT',
    customer: { id: '2', name: 'CoopMart', channel: 'MT' },
    promotion: { id: '2', code: 'PROMO-002', name: 'Q1 Trade', status: 'CONFIRMED' },
    _count: { lineItems: 5, settlements: 1, approvals: 1 },
    createdAt: '2026-01-10', updatedAt: '2026-01-12',
  },
  {
    id: '3', code: 'CLM-2026-003', status: 'SETTLED' as ClaimStatus,
    claimDate: '2025-12-20', amount: 30000000, claimAmount: 30000000, approvedAmount: 30000000, settledAmount: 30000000,
    description: 'Flash sale settlement', type: 'PROMOTION',
    customer: { id: '1', name: 'BigC', channel: 'MT' },
    promotion: { id: '4', code: 'PROMO-004', name: 'Flash Sale', status: 'COMPLETED' },
    _count: { lineItems: 2, settlements: 1, approvals: 1 },
    createdAt: '2025-12-20', updatedAt: '2026-01-05',
  },
  {
    id: '4', code: 'CLM-2026-004', status: 'UNDER_REVIEW' as ClaimStatus,
    claimDate: '2026-01-18', amount: 120000000, claimAmount: 120000000,
    description: 'Display promotion', type: 'DISPLAY',
    customer: { id: '3', name: 'Lotte Mart', channel: 'MT' },
    promotion: { id: '1', code: 'PROMO-001', name: 'Tết 2026', status: 'EXECUTING' },
    _count: { lineItems: 8, settlements: 0, approvals: 0 },
    createdAt: '2026-01-18', updatedAt: '2026-01-20',
  },
  {
    id: '5', code: 'CLM-2026-005', status: 'REJECTED' as ClaimStatus,
    claimDate: '2026-01-08', amount: 45000000, claimAmount: 45000000,
    description: 'Thiếu chứng từ', type: 'OTHER',
    customer: { id: '4', name: 'Winmart', channel: 'MT' },
    promotion: { id: '3', code: 'PROMO-003', name: 'New Product', status: 'DRAFT' },
    _count: { lineItems: 1, settlements: 0, approvals: 1 },
    createdAt: '2026-01-08', updatedAt: '2026-01-10',
  },
];

export default function ClaimList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const filters = {
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') || '') as ClaimStatus | '',
    promotionId: searchParams.get('promotionId') || '',
  };

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  const { data, isLoading, error } = useClaims({
    page,
    pageSize,
    status: filters.status || undefined,
    promotionId: filters.promotionId || undefined,
    search: filters.search || undefined,
  });

  const deleteClaim = useDeleteClaim();

  const claims = data?.claims?.length ? data.claims : demoClaims;
  const metadata = data?.metadata || {
    totalCount: demoClaims.length, total: demoClaims.length,
    pageSize: 20, limit: 20, pageNumber: 1, page: 1,
    totalPages: 1, hasNextPage: false, hasPreviousPage: false,
  };

  const filteredClaims = useMemo(() => {
    if (data?.claims) return claims;
    return claims.filter((claim: any) => {
      if (filters.search && !claim.code.toLowerCase().includes(filters.search.toLowerCase()) &&
          !claim.customer?.name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status && claim.status !== filters.status) return false;
      return true;
    });
  }, [claims, filters, data?.claims]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();
    if (merged.search) params.set('search', merged.search);
    if (merged.status) params.set('status', merged.status);
    if (merged.promotionId) params.set('promotionId', merged.promotionId);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa claim này?')) {
      await deleteClaim.mutateAsync(id);
    }
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Mã Claim',
        cell: ({ row }: any) => (
          <Link to={`/claims/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.code}
          </Link>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Khách hàng',
        cell: ({ row }: any) => (
          <div>
            <p className="font-medium">{row.original.customer?.name || '-'}</p>
            {row.original.customer?.channel && (
              <p className="text-sm text-muted-foreground">{row.original.customer.channel}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'promotion',
        header: 'Promotion',
        cell: ({ row }: any) => (
          <div>
            <p className="font-medium">{row.original.promotion?.name || '-'}</p>
            <p className="text-sm text-muted-foreground">{row.original.promotion?.code || ''}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }: any) => <ClaimStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'amount',
        header: 'Số tiền',
        cell: ({ row }: any) => (
          <div>
            <CurrencyDisplay amount={row.original.claimAmount || row.original.amount} size="sm" />
            {row.original.approvedAmount && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Duyệt: <CurrencyDisplay amount={row.original.approvedAmount} size="sm" showToggle={false} />
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'claimDate',
        header: 'Ngày claim',
        cell: ({ row }: any) => formatDate(row.original.claimDate),
      },
      {
        id: 'actions',
        cell: ({ row }: any) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/claims/${row.original.id}`)}>
                <Eye className="mr-2 h-4 w-4" />Xem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/claims/${row.original.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />Sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate]
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Đang tải claims..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims</h1>
          <p className="text-muted-foreground">Quản lý claims & thanh toán khuyến mãi</p>
        </div>
        <Button asChild>
          <Link to="/claims/new">
            <Plus className="mr-2 h-4 w-4" />Tạo Claim
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            value={filters.search}
            onChange={(search) => updateFilters({ search })}
            placeholder="Tìm kiếm claims..."
            className="w-full sm:w-80"
          />
          <Select
            value={filters.status || 'all'}
            onValueChange={(status) => updateFilters({ status: status === 'all' ? '' : status as ClaimStatus })}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('table')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <EmptyState
          title="Không tìm thấy claim"
          description={filters.search || filters.status ? 'Thử thay đổi bộ lọc' : 'Bắt đầu bằng cách tạo claim đầu tiên'}
          action={<Button asChild><Link to="/claims/new"><Plus className="mr-2 h-4 w-4" />Tạo Claim</Link></Button>}
        />
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <DataTable columns={columns} data={filteredClaims} error={error?.message} onRowClick={(row: any) => navigate(`/claims/${row.id}`)} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClaims.map((claim: any) => (
            <Link key={claim.id} to={`/claims/${claim.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{claim.code}</p>
                      <CardTitle className="mt-1 text-lg">{claim.customer?.name || claim.promotion?.name}</CardTitle>
                    </div>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      <span>{formatDate(claim.claimDate)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Số tiền</span>
                        <CurrencyDisplay amount={claim.claimAmount || claim.amount} size="sm" />
                      </div>
                      {claim.approvedAmount && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Đã duyệt</span>
                          <CurrencyDisplay amount={claim.approvedAmount} size="sm" valueClassName="text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredClaims.length > 0 && (
        <Pagination
          currentPage={metadata.pageNumber || metadata.page || 1}
          totalPages={metadata.totalPages || 1}
          pageSize={metadata.pageSize || metadata.limit || 20}
          totalCount={metadata.totalCount || metadata.total || filteredClaims.length}
          onPageChange={updatePage}
          onPageSizeChange={updatePageSize}
        />
      )}
    </div>
  );
}
