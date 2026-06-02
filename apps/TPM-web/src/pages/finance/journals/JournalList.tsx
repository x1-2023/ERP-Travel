/**
 * Journal List Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Send, RotateCcw } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { JournalStatusBadge } from '@/components/finance/JournalStatusBadge';
import { JournalStats } from '@/components/finance/JournalStats';
import { JournalCard } from '@/components/finance/JournalCard';
import {
  useJournals,
  usePostJournal,
  useReverseJournal,
  Journal,
} from '@/hooks/useJournals';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

type ViewMode = 'table' | 'grid';

export default function JournalListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [currentJournalId, setCurrentJournalId] = useState('');
  const [reverseReason, setReverseReason] = useState('');

  // Filters from URL
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Queries & Mutations
  const { data, isLoading, error } = useJournals({
    status: status || undefined,
    type: type || undefined,
    page,
  });
  const postJournal = usePostJournal();
  const reverseJournal = useReverseJournal();

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

  const handlePost = async (id: string) => {
    try {
      await postJournal.mutateAsync({ id });
      toast({ title: 'Success', description: 'Journal posted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to post journal', variant: 'destructive' });
    }
  };

  const handleReverse = (id: string) => {
    setCurrentJournalId(id);
    setShowReverseDialog(true);
  };

  const confirmReverse = async () => {
    if (!reverseReason.trim()) {
      toast({ title: 'Error', description: 'Please enter a reason', variant: 'destructive' });
      return;
    }

    try {
      await reverseJournal.mutateAsync({
        id: currentJournalId,
        reason: reverseReason,
      });
      toast({ title: 'Success', description: 'Journal reversed successfully' });
      setShowReverseDialog(false);
      setReverseReason('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reverse journal', variant: 'destructive' });
    }
  };

  // Table columns
  const columns: ColumnDef<Journal>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'journalType',
      header: 'Type',
    },
    {
      accessorKey: 'journalDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.journalDate),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-1">{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'totalDebit',
      header: 'Amount',
      cell: ({ row }) => <CurrencyDisplay amount={row.original.totalDebit} size="sm" />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <JournalStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }) => row.original.customer?.name || '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const journal = row.original;
        const isDraft = journal.status === 'DRAFT';
        const isPosted = journal.status === 'POSTED';
        const canReverse = isPosted && !journal.reversedById;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/finance/journals/${journal.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {isDraft && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handlePost(journal.id)}>
                    <Send className="mr-2 h-4 w-4" /> Post to GL
                  </DropdownMenuItem>
                </>
              )}
              {canReverse && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleReverse(journal.id)}
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
        title="Error loading journals"
        description="There was an error loading the journals. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">GL Journals</h1>
          <p className="text-muted-foreground">Manage general ledger journal entries</p>
        </div>
        <Button onClick={() => navigate('/finance/journals/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Journal
        </Button>
      </div>

      {/* Summary Stats */}
      {data?.summary && <JournalStats summary={data.summary} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="POSTED">Posted</SelectItem>
            <SelectItem value="REVERSED">Reversed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type || 'all'} onValueChange={(v) => handleFilterChange('type', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ACCRUAL">Accrual</SelectItem>
            <SelectItem value="CLAIM">Claim</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            <SelectItem value="REVERSAL">Reversal</SelectItem>
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
      {!data?.journals?.length ? (
        <EmptyState
          title="No journals found"
          description="Create a journal entry to get started."
          action={
            <Button onClick={() => navigate('/finance/journals/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Journal
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={data.journals} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.journals.map((journal: Journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              onView={(id) => navigate(`/finance/journals/${id}`)}
              onPost={handlePost}
              onReverse={handleReverse}
            />
          ))}
        </div>
      )}

      {/* Reverse Dialog */}
      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Journal</DialogTitle>
            <DialogDescription>
              Enter the reason for reversing this journal entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Reversal *</Label>
              <Textarea
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder="Enter reason..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReverseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReverse} disabled={reverseJournal.isPending}>
              {reverseJournal.isPending ? 'Reversing...' : 'Reverse Journal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
