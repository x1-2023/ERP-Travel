/**
 * Accrual List Page
 */

import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { LayoutGrid, List, MoreHorizontal, Eye, Send, RotateCcw, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { AccrualStatusBadge } from '@/components/finance/AccrualStatusBadge';
import { AccrualStats } from '@/components/finance/FinanceStats';
import { AccrualCard } from '@/components/finance/AccrualCard';
import { useAccruals, usePostAccrual, usePostAccrualBatch, useReverseAccrual } from '@/hooks/useAccruals';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';
import type { AccrualEntry, AccrualStatus } from '@/types/finance';
import { GL_ACCOUNTS } from '@/types/finance';

type ViewMode = 'table' | 'grid';

// Generate period options (last 12 months + next 3 months)
function generatePeriodOptions(): string[] {
  const periods: string[] = [];
  const now = new Date();

  for (let i = -12; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    periods.push(`${year}-${month}`);
  }

  return periods.reverse();
}

export default function AccrualListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showBatchPostDialog, setShowBatchPostDialog] = useState(false);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [currentAccrualId, setCurrentAccrualId] = useState<string>('');
  const [glAccountDebit, setGlAccountDebit] = useState<string>(GL_ACCOUNTS.PROMOTION_EXPENSE);
  const [glAccountCredit, setGlAccountCredit] = useState<string>(GL_ACCOUNTS.ACCRUED_LIABILITIES);
  const [reverseReason, setReverseReason] = useState('');

  // Filters from URL
  const period = searchParams.get('period') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Queries & Mutations
  const { data, isLoading, error } = useAccruals({ period: period || undefined, status: status as AccrualStatus || undefined, page });
  const postAccrual = usePostAccrual();
  const postBatch = usePostAccrualBatch();
  const reverseAccrual = useReverseAccrual();

  const periodOptions = useMemo(() => generatePeriodOptions(), []);

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePost = (id: string) => {
    setCurrentAccrualId(id);
    setShowPostDialog(true);
  };

  const handleReverse = (id: string) => {
    setCurrentAccrualId(id);
    setShowReverseDialog(true);
  };

  const confirmPost = async () => {
    try {
      await postAccrual.mutateAsync({
        id: currentAccrualId,
        glAccountDebit,
        glAccountCredit,
      });
      toast({ title: 'Success', description: 'Accrual posted to GL successfully' });
      setShowPostDialog(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to post accrual', variant: 'destructive' });
    }
  };

  const confirmBatchPost = async () => {
    try {
      await postBatch.mutateAsync({
        accrualIds: selectedIds,
        glAccountDebit,
        glAccountCredit,
      });
      toast({ title: 'Success', description: `${selectedIds.length} accruals posted to GL` });
      setShowBatchPostDialog(false);
      setSelectedIds([]);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to post accruals', variant: 'destructive' });
    }
  };

  const confirmReverse = async () => {
    try {
      await reverseAccrual.mutateAsync({
        id: currentAccrualId,
        reason: reverseReason,
      });
      toast({ title: 'Success', description: 'Accrual reversed successfully' });
      setShowReverseDialog(false);
      setReverseReason('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reverse accrual', variant: 'destructive' });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.accruals) return;
    const pendingIds = data.accruals
      .filter((a: AccrualEntry) => a.status === 'PENDING' || a.status === 'CALCULATED')
      .map((a: AccrualEntry) => a.id);

    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  // Table columns
  const columns: ColumnDef<AccrualEntry>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedIds.length > 0}
          onCheckedChange={toggleSelectAll}
        />
      ),
      cell: ({ row }) => {
        const canSelect = row.original.status === 'PENDING' || row.original.status === 'CALCULATED';
        return canSelect ? (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={() => toggleSelect(row.original.id)}
          />
        ) : null;
      },
    },
    {
      accessorKey: 'promotion.code',
      header: 'Promotion',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.promotion?.code}</div>
          <div className="text-sm text-muted-foreground">{row.original.promotion?.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'period',
      header: 'Period',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} size="sm" />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <AccrualStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const accrual = row.original;
        const canPost = accrual.status === 'PENDING' || accrual.status === 'CALCULATED';
        const canReverse = accrual.status === 'POSTED';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/finance/accruals/${accrual.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {canPost && (
                <DropdownMenuItem onClick={() => handlePost(accrual.id)}>
                  <Send className="mr-2 h-4 w-4" /> Post to GL
                </DropdownMenuItem>
              )}
              {canReverse && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleReverse(accrual.id)}
                    className="text-destructive"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Reverse
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading accruals"
        description="There was an error loading the accruals. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Accrual Management</h1>
          <p className="text-muted-foreground">Manage promotion accruals and GL postings</p>
        </div>
        <Button onClick={() => navigate('/finance/accruals/calculate')}>
          <Calculator className="mr-2 h-4 w-4" />
          Calculate Accruals
        </Button>
      </div>

      {/* Summary Stats */}
      {data?.summary && <AccrualStats summary={data.summary} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={period || 'all'} onValueChange={(v) => handleFilterChange('period', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Periods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periodOptions.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CALCULATED">Calculated</SelectItem>
            <SelectItem value="POSTED">Posted</SelectItem>
            <SelectItem value="REVERSED">Reversed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex gap-2">
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

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.length} accrual(s) selected
              </span>
              <Button onClick={() => setShowBatchPostDialog(true)}>
                <Send className="mr-2 h-4 w-4" />
                Post Selected to GL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Display */}
      {!data?.accruals?.length ? (
        <EmptyState
          title="No accruals found"
          description="Calculate accruals for a period to get started."
          action={
            <Button onClick={() => navigate('/finance/accruals/calculate')}>
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Accruals
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={data.accruals} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.accruals.map((accrual: AccrualEntry) => (
            <AccrualCard
              key={accrual.id}
              accrual={accrual}
              onPost={handlePost}
              onReverse={handleReverse}
            />
          ))}
        </div>
      )}

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Accrual to GL</DialogTitle>
            <DialogDescription>
              Select the GL accounts for this accrual posting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Debit Account (Expense)</Label>
              <Select value={glAccountDebit} onValueChange={setGlAccountDebit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GL_ACCOUNTS.PROMOTION_EXPENSE}>6100 - Promotion Expense</SelectItem>
                  <SelectItem value={GL_ACCOUNTS.TRADE_SPEND}>6200 - Trade Spend</SelectItem>
                  <SelectItem value={GL_ACCOUNTS.REBATE_EXPENSE}>6300 - Rebate Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Credit Account (Liability)</Label>
              <Select value={glAccountCredit} onValueChange={setGlAccountCredit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GL_ACCOUNTS.ACCRUED_LIABILITIES}>2100 - Accrued Liabilities</SelectItem>
                  <SelectItem value={GL_ACCOUNTS.ACCOUNTS_PAYABLE}>2000 - Accounts Payable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPost} disabled={postAccrual.isPending}>
              {postAccrual.isPending ? 'Posting...' : 'Post to GL'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Post Dialog */}
      <Dialog open={showBatchPostDialog} onOpenChange={setShowBatchPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post {selectedIds.length} Accruals to GL</DialogTitle>
            <DialogDescription>
              All selected accruals will be posted with the same GL accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Debit Account (Expense)</Label>
              <Select value={glAccountDebit} onValueChange={setGlAccountDebit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GL_ACCOUNTS.PROMOTION_EXPENSE}>6100 - Promotion Expense</SelectItem>
                  <SelectItem value={GL_ACCOUNTS.TRADE_SPEND}>6200 - Trade Spend</SelectItem>
                  <SelectItem value={GL_ACCOUNTS.REBATE_EXPENSE}>6300 - Rebate Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Credit Account (Liability)</Label>
              <Select value={glAccountCredit} onValueChange={setGlAccountCredit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GL_ACCOUNTS.ACCRUED_LIABILITIES}>2100 - Accrued Liabilities</SelectItem>
                  <SelectItem value={GL_ACCOUNTS.ACCOUNTS_PAYABLE}>2000 - Accounts Payable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchPostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBatchPost} disabled={postBatch.isPending}>
              {postBatch.isPending ? 'Posting...' : `Post ${selectedIds.length} Accruals`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reverse Dialog */}
      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Accrual</DialogTitle>
            <DialogDescription>
              This will create a reversal GL journal entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Reversal (Optional)</Label>
              <Input
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReverseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReverse} disabled={reverseAccrual.isPending}>
              {reverseAccrual.isPending ? 'Reversing...' : 'Reverse Accrual'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
