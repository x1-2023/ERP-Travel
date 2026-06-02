/**
 * Deduction List Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { DeductionStatusBadge } from '@/components/finance/DeductionStatusBadge';
import { DeductionStats } from '@/components/finance/DeductionStats';
import { DeductionCard } from '@/components/finance/DeductionCard';
import {
  useDeductions,
  useCreateDeduction,
  useDisputeDeduction,
} from '@/hooks/useDeductions';
import { useCustomers } from '@/hooks/useCustomers';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';
import type { Deduction, DeductionStatus } from '@/types/finance';

type ViewMode = 'table' | 'grid';

export default function DeductionListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [currentDeductionId, setCurrentDeductionId] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    customerId: '',
    invoiceNumber: '',
    invoiceDate: '',
    amount: '',
    reason: '',
  });

  // Filters from URL
  const status = searchParams.get('status') || '';
  const customerId = searchParams.get('customerId') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Queries & Mutations
  const { data, isLoading, error } = useDeductions({
    status: status as DeductionStatus || undefined,
    customerId: customerId || undefined,
    page,
  });
  const { data: customersData } = useCustomers({ limit: 100 });
  const createDeduction = useCreateDeduction();
  const disputeDeduction = useDisputeDeduction();

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

  const handleMatch = (id: string) => {
    navigate(`/finance/deductions/${id}/match`);
  };

  const handleDispute = (id: string) => {
    setCurrentDeductionId(id);
    setShowDisputeDialog(true);
  };

  const confirmDispute = async () => {
    if (!disputeReason.trim()) {
      toast({ title: 'Error', description: 'Please enter a reason', variant: 'destructive' });
      return;
    }

    try {
      await disputeDeduction.mutateAsync({
        id: currentDeductionId,
        reason: disputeReason,
      });
      toast({ title: 'Success', description: 'Deduction disputed successfully' });
      setShowDisputeDialog(false);
      setDisputeReason('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to dispute deduction', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!createForm.customerId || !createForm.invoiceNumber || !createForm.invoiceDate || !createForm.amount) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      await createDeduction.mutateAsync({
        customerId: createForm.customerId,
        invoiceNumber: createForm.invoiceNumber,
        invoiceDate: createForm.invoiceDate,
        amount: parseFloat(createForm.amount),
        reason: createForm.reason || undefined,
      });
      toast({ title: 'Success', description: 'Deduction created successfully' });
      setShowCreateDialog(false);
      setCreateForm({ customerId: '', invoiceNumber: '', invoiceDate: '', amount: '', reason: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create deduction', variant: 'destructive' });
    }
  };

  // Table columns
  const columns: ColumnDef<Deduction>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.customer?.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} size="sm" />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <DeductionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'invoiceDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.invoiceDate),
    },
    {
      accessorKey: 'matchedClaim',
      header: 'Matched Claim',
      cell: ({ row }) => row.original.matchedClaim?.code || '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const deduction = row.original;
        const isOpen = deduction.status === 'OPEN';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/finance/deductions/${deduction.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {isOpen && (
                <>
                  <DropdownMenuItem onClick={() => handleMatch(deduction.id)}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Match Claim
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDispute(deduction.id)}
                    className="text-destructive"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" /> Dispute
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
        title="Error loading deductions"
        description="There was an error loading the deductions. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Deductions</h1>
          <p className="text-muted-foreground">Manage customer deductions and claim matching</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Deduction
        </Button>
      </div>

      {/* Summary Stats */}
      {data?.summary && <DeductionStats summary={data.summary} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="MATCHED">Matched</SelectItem>
            <SelectItem value="DISPUTED">Disputed</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="WRITTEN_OFF">Written Off</SelectItem>
          </SelectContent>
        </Select>

        <Select value={customerId || 'all'} onValueChange={(v) => handleFilterChange('customerId', v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customersData?.customers?.map((c: { id: string; name: string }) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
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

      {/* Data Display */}
      {!data?.deductions?.length ? (
        <EmptyState
          title="No deductions found"
          description="Record a deduction to get started."
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Deduction
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={data.deductions} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.deductions.map((deduction: Deduction) => (
            <DeductionCard
              key={deduction.id}
              deduction={deduction}
              onMatch={handleMatch}
              onDispute={handleDispute}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Deduction</DialogTitle>
            <DialogDescription>
              Record a new customer deduction from an invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={createForm.customerId}
                onValueChange={(v) => setCreateForm({ ...createForm, customerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customersData?.customers?.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input
                  value={createForm.invoiceNumber}
                  onChange={(e) => setCreateForm({ ...createForm, invoiceNumber: e.target.value })}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date *</Label>
                <Input
                  type="date"
                  value={createForm.invoiceDate}
                  onChange={(e) => setCreateForm({ ...createForm, invoiceDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={createForm.reason}
                onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                placeholder="Reason for deduction..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createDeduction.isPending}>
              {createDeduction.isPending ? 'Creating...' : 'Create Deduction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Deduction</DialogTitle>
            <DialogDescription>
              Enter the reason for disputing this deduction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Dispute *</Label>
              <Textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Enter reason..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDispute} disabled={disputeDeduction.isPending}>
              {disputeDeduction.isPending ? 'Disputing...' : 'Dispute Deduction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
