/**
 * Accrual Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, RotateCcw, FileText, Calendar, DollarSign, User, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { AccrualStatusBadge } from '@/components/finance/AccrualStatusBadge';
import { useAccrual, useUpdateAccrual, usePostAccrual, useReverseAccrual } from '@/hooks/useAccruals';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';
import { GL_ACCOUNTS } from '@/types/finance';

export default function AccrualDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [glAccountDebit, setGlAccountDebit] = useState<string>(GL_ACCOUNTS.PROMOTION_EXPENSE);
  const [glAccountCredit, setGlAccountCredit] = useState<string>(GL_ACCOUNTS.ACCRUED_LIABILITIES);
  const [reverseReason, setReverseReason] = useState('');

  // Queries & Mutations
  const { data: accrual, isLoading, error } = useAccrual(id || '');
  const updateAccrual = useUpdateAccrual();
  const postAccrual = usePostAccrual();
  const reverseAccrual = useReverseAccrual();

  const canEdit = accrual?.status === 'PENDING' || accrual?.status === 'CALCULATED';
  const canPost = accrual?.status === 'PENDING' || accrual?.status === 'CALCULATED';
  const canReverse = accrual?.status === 'POSTED';

  const startEditing = () => {
    setEditAmount(String(accrual?.amount || 0));
    setEditNotes(accrual?.notes || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditAmount('');
    setEditNotes('');
  };

  const saveChanges = async () => {
    if (!id) return;

    try {
      await updateAccrual.mutateAsync({
        id,
        data: {
          amount: parseFloat(editAmount),
          notes: editNotes || undefined,
        },
      });
      toast({ title: 'Success', description: 'Accrual updated successfully' });
      setIsEditing(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update accrual', variant: 'destructive' });
    }
  };

  const confirmPost = async () => {
    if (!id) return;

    try {
      await postAccrual.mutateAsync({
        id,
        glAccountDebit,
        glAccountCredit,
      });
      toast({ title: 'Success', description: 'Accrual posted to GL successfully' });
      setShowPostDialog(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to post accrual', variant: 'destructive' });
    }
  };

  const confirmReverse = async () => {
    if (!id) return;

    try {
      await reverseAccrual.mutateAsync({
        id,
        reason: reverseReason,
      });
      toast({ title: 'Success', description: 'Accrual reversed successfully' });
      setShowReverseDialog(false);
      setReverseReason('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reverse accrual', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !accrual) {
    return (
      <EmptyState
        title="Accrual not found"
        description="The accrual you're looking for doesn't exist."
        action={
          <Button onClick={() => navigate('/finance/accruals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accruals
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/finance/accruals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Accrual Detail</h1>
              <AccrualStatusBadge status={accrual.status} />
            </div>
            <p className="text-muted-foreground">
              {accrual.promotion?.code} - {accrual.period}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={startEditing}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveChanges} disabled={updateAccrual.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateAccrual.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
          {canPost && !isEditing && (
            <Button onClick={() => setShowPostDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Post to GL
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
        {/* Accrual Information */}
        <Card>
          <CardHeader>
            <CardTitle>Accrual Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Period</Label>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {accrual.period}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 font-medium text-lg">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <CurrencyDisplay amount={accrual.amount} size="sm" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <div className="font-medium">{formatDate(accrual.createdAt)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created By</Label>
                <div className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {accrual.createdBy?.name || 'Unknown'}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Notes</Label>
              {isEditing ? (
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="font-medium">{accrual.notes || 'No notes'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Promotion Information */}
        <Card>
          <CardHeader>
            <CardTitle>Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Code</Label>
              <div className="font-medium">{accrual.promotion?.code}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <div className="font-medium">{accrual.promotion?.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Budget</Label>
                <div className="font-medium"><CurrencyDisplay amount={accrual.promotion?.budget || 0} size="sm" /></div>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant="outline">{accrual.promotion?.status}</Badge>
              </div>
            </div>
            <Link to={`/promotions/${accrual.promotionId}`}>
              <Button variant="outline" className="w-full">
                View Promotion Details
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* GL Journal Information */}
        {accrual.glJournal && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                GL Journal Entry
              </CardTitle>
              <CardDescription>
                Entry Number: {accrual.glJournal.entryNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label className="text-muted-foreground">Entry Date</Label>
                  <div className="font-medium">{formatDate(accrual.glJournal.entryDate)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Debit Account</Label>
                  <div className="font-medium">{accrual.glJournal.debitAccount}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Credit Account</Label>
                  <div className="font-medium">{accrual.glJournal.creditAccount}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="font-medium"><CurrencyDisplay amount={accrual.glJournal.amount} size="sm" /></div>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium">{accrual.glJournal.description}</p>
              </div>
              {accrual.glJournal.reversedAt && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    This entry was reversed on {formatDate(accrual.glJournal.reversedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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
