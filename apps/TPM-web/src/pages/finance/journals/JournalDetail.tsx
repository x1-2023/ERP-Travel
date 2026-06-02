/**
 * Journal Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, RotateCcw, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { JournalStatusBadge } from '@/components/finance/JournalStatusBadge';
import { useJournal, usePostJournal, useReverseJournal } from '@/hooks/useJournals';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [reverseReason, setReverseReason] = useState('');

  // Queries & Mutations
  const { data: journal, isLoading, error } = useJournal(id || '');
  const postJournal = usePostJournal();
  const reverseJournal = useReverseJournal();

  const isDraft = journal?.status === 'DRAFT';
  const isPosted = journal?.status === 'POSTED';
  const canReverse = isPosted && !journal?.reversedById;

  const handlePost = async () => {
    if (!id) return;

    try {
      await postJournal.mutateAsync({ id });
      toast({ title: 'Success', description: 'Journal posted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to post journal', variant: 'destructive' });
    }
  };

  const confirmReverse = async () => {
    if (!id || !reverseReason.trim()) {
      toast({ title: 'Error', description: 'Please enter a reason', variant: 'destructive' });
      return;
    }

    try {
      await reverseJournal.mutateAsync({ id, reason: reverseReason });
      toast({ title: 'Success', description: 'Journal reversed successfully' });
      setShowReverseDialog(false);
      setReverseReason('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reverse journal', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !journal) {
    return (
      <EmptyState
        title="Journal not found"
        description="The journal you're looking for doesn't exist."
        action={
          <Button onClick={() => navigate('/finance/journals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journals
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/finance/journals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{journal.code}</h1>
              <JournalStatusBadge status={journal.status} />
            </div>
            <p className="text-muted-foreground">
              {journal.journalType} - {formatDate(journal.journalDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <Button onClick={handlePost} disabled={postJournal.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {postJournal.isPending ? 'Posting...' : 'Post to GL'}
            </Button>
          )}
          {canReverse && (
            <Button variant="destructive" onClick={() => setShowReverseDialog(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reverse
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Journal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Journal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {journal.journalType}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(journal.journalDate)}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Debit</Label>
                <div className="flex items-center gap-2 font-medium">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <CurrencyDisplay amount={journal.totalDebit} size="sm" />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Credit</Label>
                <div className="flex items-center gap-2 font-medium">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <CurrencyDisplay amount={journal.totalCredit} size="sm" />
                </div>
              </div>
            </div>
            {journal.reference && (
              <div>
                <Label className="text-muted-foreground">Reference</Label>
                <div className="font-medium">{journal.reference}</div>
              </div>
            )}
            {journal.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium">{journal.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Information */}
        <Card>
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {journal.customer && (
              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <div className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {journal.customer.name}
                </div>
                <Link to={`/customers/${journal.customerId}`}>
                  <Button variant="link" className="p-0 h-auto">View Customer</Button>
                </Link>
              </div>
            )}
            {journal.promotion && (
              <div>
                <Label className="text-muted-foreground">Promotion</Label>
                <div className="font-medium">{journal.promotion.name}</div>
                <Link to={`/promotions/${journal.promotionId}`}>
                  <Button variant="link" className="p-0 h-auto">View Promotion</Button>
                </Link>
              </div>
            )}
            {journal.accrual && (
              <div>
                <Label className="text-muted-foreground">Accrual</Label>
                <div className="font-medium">{journal.accrual.code}</div>
                <Link to={`/finance/accruals/${journal.accrualId}`}>
                  <Button variant="link" className="p-0 h-auto">View Accrual</Button>
                </Link>
              </div>
            )}
            {journal.claim && (
              <div>
                <Label className="text-muted-foreground">Claim</Label>
                <div className="font-medium">{journal.claim.code}</div>
                <Link to={`/claims/${journal.claimId}`}>
                  <Button variant="link" className="p-0 h-auto">View Claim</Button>
                </Link>
              </div>
            )}
            {journal.postedAt && (
              <div>
                <Label className="text-muted-foreground">Posted At</Label>
                <div className="font-medium">{formatDate(journal.postedAt)}</div>
              </div>
            )}
            {journal.reversedBy && (
              <div>
                <Label className="text-muted-foreground">Reversed By</Label>
                <Link to={`/finance/journals/${journal.reversedById}`}>
                  <Badge variant="destructive">{journal.reversedBy.code}</Badge>
                </Link>
              </div>
            )}
            {journal.reversalOf && (
              <div>
                <Label className="text-muted-foreground">Reversal Of</Label>
                <Link to={`/finance/journals/${journal.reversalOfId}`}>
                  <Badge variant="outline">{journal.reversalOf.code}</Badge>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Journal Lines */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Journal Lines</CardTitle>
            <CardDescription>
              {journal.lines.length} line(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journal.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.lineNumber}</TableCell>
                    <TableCell className="font-mono">{line.accountCode}</TableCell>
                    <TableCell>{line.accountName}</TableCell>
                    <TableCell className="text-muted-foreground">{line.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      {line.debit > 0 ? <CurrencyDisplay amount={line.debit} size="sm" /> : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {line.credit > 0 ? <CurrencyDisplay amount={line.credit} size="sm" /> : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={4} className="text-right">Total</TableCell>
                  <TableCell className="text-right"><CurrencyDisplay amount={journal.totalDebit} size="sm" /></TableCell>
                  <TableCell className="text-right"><CurrencyDisplay amount={journal.totalCredit} size="sm" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Reverse Dialog */}
      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse Journal</DialogTitle>
            <DialogDescription>
              Enter the reason for reversing this journal entry. A reversal journal will be created.
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
