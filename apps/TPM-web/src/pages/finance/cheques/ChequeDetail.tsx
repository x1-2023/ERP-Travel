/**
 * Cheque Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, CreditCard, Calendar, DollarSign, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { ChequeStatusBadge } from '@/components/finance/ChequeStatusBadge';
import { useCheque, useClearCheque, useVoidCheque } from '@/hooks/useCheques';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

export default function ChequeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [clearDate, setClearDate] = useState('');
  const [voidReason, setVoidReason] = useState('');

  // Queries & Mutations
  const { data: cheque, isLoading, error } = useCheque(id || '');
  const clearCheque = useClearCheque();
  const voidCheque = useVoidCheque();

  const isIssued = cheque?.status === 'ISSUED';

  const confirmClear = async () => {
    if (!id) return;

    try {
      await clearCheque.mutateAsync({
        id,
        clearDate: clearDate || undefined,
      });
      toast({ title: 'Success', description: 'Cheque cleared successfully' });
      setShowClearDialog(false);
      setClearDate('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clear cheque', variant: 'destructive' });
    }
  };

  const confirmVoid = async () => {
    if (!id || !voidReason.trim()) {
      toast({ title: 'Error', description: 'Please enter a void reason', variant: 'destructive' });
      return;
    }

    try {
      await voidCheque.mutateAsync({ id, voidReason });
      toast({ title: 'Success', description: 'Cheque voided successfully' });
      setShowVoidDialog(false);
      setVoidReason('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to void cheque', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !cheque) {
    return (
      <EmptyState
        title="Cheque not found"
        description="The cheque you're looking for doesn't exist."
        action={
          <Button onClick={() => navigate('/finance/cheques')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cheques
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/finance/cheques')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{cheque.chequeNumber}</h1>
              <ChequeStatusBadge status={cheque.status} />
            </div>
            <p className="text-muted-foreground">
              {cheque.bankName || 'No bank'} - {formatDate(cheque.chequeDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isIssued && (
            <>
              <Button onClick={() => setShowClearDialog(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Cleared
              </Button>
              <Button variant="destructive" onClick={() => setShowVoidDialog(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Void
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cheque Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cheque Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Cheque Number</Label>
                <div className="flex items-center gap-2 font-medium font-mono">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  {cheque.chequeNumber}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <div className="flex items-center gap-2 font-medium text-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <CurrencyDisplay amount={cheque.amount} size="sm" />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Cheque Date</Label>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(cheque.chequeDate)}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Issued At</Label>
                <div className="font-medium">
                  {cheque.issuedAt ? formatDate(cheque.issuedAt) : '-'}
                </div>
              </div>
            </div>
            {cheque.payee && (
              <div>
                <Label className="text-muted-foreground">Payee</Label>
                <div className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {cheque.payee}
                </div>
              </div>
            )}
            {cheque.memo && (
              <div>
                <Label className="text-muted-foreground">Memo</Label>
                <p className="font-medium">{cheque.memo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Bank Name</Label>
              <div className="flex items-center gap-2 font-medium">
                <Building className="h-4 w-4 text-muted-foreground" />
                {cheque.bankName || 'Not specified'}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Bank Account</Label>
              <div className="font-medium font-mono">{cheque.bankAccount || 'Not specified'}</div>
            </div>
            {cheque.clearedAt && (
              <div>
                <Label className="text-muted-foreground">Cleared At</Label>
                <div className="font-medium">{formatDate(cheque.clearedAt)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <div className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                {cheque.customer?.name}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Code</Label>
              <div className="font-medium">{cheque.customer?.code}</div>
            </div>
            {(cheque.customer as { channel?: string } | undefined)?.channel && (
              <div>
                <Label className="text-muted-foreground">Channel</Label>
                <Badge variant="outline">{(cheque.customer as { channel?: string }).channel}</Badge>
              </div>
            )}
            <Link to={`/customers/${cheque.customerId}`}>
              <Button variant="outline" className="w-full">
                View Customer Details
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Linked Claim */}
        {cheque.claim && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                Linked Claim
              </CardTitle>
              <CardDescription>
                This cheque is linked to a claim payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Claim Code</Label>
                  <div className="font-medium">{cheque.claim.code}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Claimed Amount</Label>
                  <div className="font-medium"><CurrencyDisplay amount={cheque.claim.claimedAmount || 0} size="sm" /></div>
                </div>
                {cheque.claim.approvedAmount && (
                  <div>
                    <Label className="text-muted-foreground">Approved Amount</Label>
                    <div className="font-medium"><CurrencyDisplay amount={cheque.claim.approvedAmount} size="sm" /></div>
                  </div>
                )}
                {cheque.claim.promotion && (
                  <div>
                    <Label className="text-muted-foreground">Promotion</Label>
                    <div className="font-medium">{cheque.claim.promotion.name}</div>
                  </div>
                )}
              </div>
              <Link to={`/claims/${cheque.claimId}`}>
                <Button variant="outline" className="w-full">View Claim Details</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Void Information */}
        {cheque.status === 'VOIDED' && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Void Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Void Reason</Label>
                  <p className="font-medium">{cheque.voidReason}</p>
                </div>
                {cheque.voidedAt && (
                  <div>
                    <Label className="text-muted-foreground">Voided At</Label>
                    <div className="font-medium">{formatDate(cheque.voidedAt)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Cheque as Cleared</DialogTitle>
            <DialogDescription>
              Confirm that this cheque has been cleared by the bank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Clear Date (optional)</Label>
              <Input
                type="date"
                value={clearDate}
                onChange={(e) => setClearDate(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave blank to use today's date
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmClear} disabled={clearCheque.isPending}>
              {clearCheque.isPending ? 'Processing...' : 'Mark Cleared'}
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
