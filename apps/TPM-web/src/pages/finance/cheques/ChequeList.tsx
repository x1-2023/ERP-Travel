/**
 * Cheque List Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
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
import { ChequeStatusBadge } from '@/components/finance/ChequeStatusBadge';
import { ChequeStats } from '@/components/finance/ChequeStats';
import { ChequeCard } from '@/components/finance/ChequeCard';
import {
  useCheques,
  useCreateCheque,
  useClearCheque,
  useVoidCheque,
  Cheque,
} from '@/hooks/useCheques';
import { useCustomers } from '@/hooks/useCustomers';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

type ViewMode = 'table' | 'grid';

export default function ChequeListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [currentChequeId, setCurrentChequeId] = useState('');
  const [voidReason, setVoidReason] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    customerId: '',
    chequeNumber: '',
    chequeDate: '',
    amount: '',
    bankAccount: '',
    bankName: '',
    payee: '',
    memo: '',
  });

  // Filters from URL
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Queries & Mutations
  const { data, isLoading, error } = useCheques({
    status: status || undefined,
    page,
  });
  const { data: customersData } = useCustomers({ limit: 100 });
  const createCheque = useCreateCheque();
  const clearCheque = useClearCheque();
  const voidCheque = useVoidCheque();

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

  const handleClear = async (id: string) => {
    try {
      await clearCheque.mutateAsync({ id });
      toast({ title: 'Success', description: 'Cheque cleared successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clear cheque', variant: 'destructive' });
    }
  };

  const handleVoid = (id: string) => {
    setCurrentChequeId(id);
    setShowVoidDialog(true);
  };

  const confirmVoid = async () => {
    if (!voidReason.trim()) {
      toast({ title: 'Error', description: 'Please enter a void reason', variant: 'destructive' });
      return;
    }

    try {
      await voidCheque.mutateAsync({
        id: currentChequeId,
        voidReason,
      });
      toast({ title: 'Success', description: 'Cheque voided successfully' });
      setShowVoidDialog(false);
      setVoidReason('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to void cheque', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!createForm.customerId || !createForm.chequeNumber || !createForm.chequeDate || !createForm.amount) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      await createCheque.mutateAsync({
        customerId: createForm.customerId,
        chequeNumber: createForm.chequeNumber,
        chequeDate: createForm.chequeDate,
        amount: parseFloat(createForm.amount),
        bankAccount: createForm.bankAccount || undefined,
        bankName: createForm.bankName || undefined,
        payee: createForm.payee || undefined,
        memo: createForm.memo || undefined,
      });
      toast({ title: 'Success', description: 'Cheque issued successfully' });
      setShowCreateDialog(false);
      setCreateForm({
        customerId: '',
        chequeNumber: '',
        chequeDate: '',
        amount: '',
        bankAccount: '',
        bankName: '',
        payee: '',
        memo: '',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to issue cheque', variant: 'destructive' });
    }
  };

  // Table columns
  const columns: ColumnDef<Cheque>[] = [
    {
      accessorKey: 'chequeNumber',
      header: 'Cheque #',
      cell: ({ row }) => (
        <span className="font-medium font-mono">{row.original.chequeNumber}</span>
      ),
    },
    {
      accessorKey: 'chequeDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.chequeDate),
    },
    {
      accessorKey: 'customer.name',
      header: 'Payee',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.payee || row.original.customer?.name}</div>
          {row.original.customer && (
            <div className="text-sm text-muted-foreground">{row.original.customer.code}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.amount} size="sm" />,
    },
    {
      accessorKey: 'bankName',
      header: 'Bank',
      cell: ({ row }) => row.original.bankName || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ChequeStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'claim.code',
      header: 'Claim',
      cell: ({ row }) => row.original.claim?.code || '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cheque = row.original;
        const isIssued = cheque.status === 'ISSUED';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/finance/cheques/${cheque.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {isIssued && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleClear(cheque.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Cleared
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleVoid(cheque.id)}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Void
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
        title="Error loading cheques"
        description="There was an error loading the cheques. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chequebook</h1>
          <p className="text-muted-foreground">Manage cheque issuance and tracking</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Issue Cheque
        </Button>
      </div>

      {/* Summary Stats */}
      {data?.summary && <ChequeStats summary={data.summary} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ISSUED">Issued</SelectItem>
            <SelectItem value="CLEARED">Cleared</SelectItem>
            <SelectItem value="VOIDED">Voided</SelectItem>
            <SelectItem value="STALE">Stale</SelectItem>
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
      {!data?.cheques?.length ? (
        <EmptyState
          title="No cheques found"
          description="Issue a cheque to get started."
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Issue Cheque
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={data.cheques} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.cheques.map((cheque: Cheque) => (
            <ChequeCard
              key={cheque.id}
              cheque={cheque}
              onView={(id) => navigate(`/finance/cheques/${id}`)}
              onClear={handleClear}
              onVoid={handleVoid}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Cheque</DialogTitle>
            <DialogDescription>
              Issue a new cheque for payment.
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
                <Label>Cheque Number *</Label>
                <Input
                  value={createForm.chequeNumber}
                  onChange={(e) => setCreateForm({ ...createForm, chequeNumber: e.target.value })}
                  placeholder="000001"
                />
              </div>
              <div className="space-y-2">
                <Label>Cheque Date *</Label>
                <Input
                  type="date"
                  value={createForm.chequeDate}
                  onChange={(e) => setCreateForm({ ...createForm, chequeDate: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  value={createForm.bankName}
                  onChange={(e) => setCreateForm({ ...createForm, bankName: e.target.value })}
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Input
                  value={createForm.bankAccount}
                  onChange={(e) => setCreateForm({ ...createForm, bankAccount: e.target.value })}
                  placeholder="Account #"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payee</Label>
              <Input
                value={createForm.payee}
                onChange={(e) => setCreateForm({ ...createForm, payee: e.target.value })}
                placeholder="Payee name (defaults to customer)"
              />
            </div>
            <div className="space-y-2">
              <Label>Memo</Label>
              <Textarea
                value={createForm.memo}
                onChange={(e) => setCreateForm({ ...createForm, memo: e.target.value })}
                placeholder="Payment memo..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createCheque.isPending}>
              {createCheque.isPending ? 'Issuing...' : 'Issue Cheque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Cheque</DialogTitle>
            <DialogDescription>
              Enter the reason for voiding this cheque.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Void Reason *</Label>
              <Textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter reason..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmVoid} disabled={voidCheque.isPending}>
              {voidCheque.isPending ? 'Voiding...' : 'Void Cheque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
