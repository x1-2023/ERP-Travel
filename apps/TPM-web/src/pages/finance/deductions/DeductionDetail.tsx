/**
 * Deduction Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, AlertCircle, CheckCircle, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { DeductionStatusBadge } from '@/components/finance/DeductionStatusBadge';
import {
  useDeduction,
  useDisputeDeduction,
  useResolveDeduction,
} from '@/hooks/useDeductions';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

export default function DeductionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [resolution, setResolution] = useState<'ACCEPT' | 'REJECT' | 'PARTIAL'>('ACCEPT');
  const [partialAmount, setPartialAmount] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  // Queries & Mutations
  const { data: deduction, isLoading, error } = useDeduction(id || '');
  const disputeDeduction = useDisputeDeduction();
  const resolveDeduction = useResolveDeduction();

  const isOpen = deduction?.status === 'OPEN';
  const isDisputed = deduction?.status === 'DISPUTED';

  const confirmDispute = async () => {
    if (!id || !disputeReason.trim()) {
      toast({ title: 'Error', description: 'Please enter a reason', variant: 'destructive' });
      return;
    }

    try {
      await disputeDeduction.mutateAsync({ id, reason: disputeReason });
      toast({ title: 'Success', description: 'Deduction disputed successfully' });
      setShowDisputeDialog(false);
      setDisputeReason('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to dispute deduction', variant: 'destructive' });
    }
  };

  const confirmResolve = async () => {
    if (!id) return;

    if (resolution === 'PARTIAL' && (!partialAmount || parseFloat(partialAmount) <= 0)) {
      toast({ title: 'Error', description: 'Please enter a valid partial amount', variant: 'destructive' });
      return;
    }

    try {
      await resolveDeduction.mutateAsync({
        id,
        resolution,
        amount: resolution === 'PARTIAL' ? parseFloat(partialAmount) : undefined,
        notes: resolveNotes || undefined,
      });
      toast({ title: 'Success', description: `Deduction ${resolution.toLowerCase()}ed successfully` });
      setShowResolveDialog(false);
      setPartialAmount('');
      setResolveNotes('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to resolve deduction', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !deduction) {
    return (
      <EmptyState
        title="Deduction not found"
        description="The deduction you're looking for doesn't exist."
        action={
          <Button onClick={() => navigate('/finance/deductions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deductions
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/finance/deductions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{deduction.code}</h1>
              <DeductionStatusBadge status={deduction.status} />
            </div>
            <p className="text-muted-foreground">
              {deduction.customer?.name} - {deduction.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isOpen && (
            <>
              <Button onClick={() => navigate(`/finance/deductions/${id}/match`)}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Match Claim
              </Button>
              <Button variant="destructive" onClick={() => setShowDisputeDialog(true)}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Dispute
              </Button>
            </>
          )}
          {isDisputed && (
            <Button onClick={() => setShowResolveDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deduction Information */}
        <Card>
          <CardHeader>
            <CardTitle>Deduction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Invoice Number</Label>
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {deduction.invoiceNumber}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <div className="flex items-center gap-2 font-medium text-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <CurrencyDisplay amount={deduction.amount} size="sm" />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Invoice Date</Label>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(deduction.invoiceDate)}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <div className="font-medium">{formatDate(deduction.createdAt)}</div>
              </div>
            </div>
            {deduction.reason && (
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium">{deduction.reason}</p>
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
                {deduction.customer?.name}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Code</Label>
              <div className="font-medium">{deduction.customer?.code}</div>
            </div>
            {deduction.customer?.channel && (
              <div>
                <Label className="text-muted-foreground">Channel</Label>
                <Badge variant="outline">{deduction.customer.channel}</Badge>
              </div>
            )}
            <Link to={`/customers/${deduction.customerId}`}>
              <Button variant="outline" className="w-full">
                View Customer Details
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Matched Claim */}
        {deduction.matchedClaim && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                Matched Claim
              </CardTitle>
              <CardDescription>
                This deduction has been matched with a claim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label className="text-muted-foreground">Claim Code</Label>
                  <div className="font-medium">{deduction.matchedClaim.code}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="font-medium"><CurrencyDisplay amount={deduction.matchedClaim.amount} size="sm" /></div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant="success">{deduction.matchedClaim.status}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Promotion</Label>
                  <div className="font-medium">{deduction.matchedClaim.promotion?.name}</div>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/claims/${deduction.matchedClaimId}`}>
                  <Button variant="outline">View Claim Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dispute Information */}
        {(deduction.status === 'DISPUTED' || deduction.disputeReason) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Dispute Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Dispute Reason</Label>
                  <p className="font-medium">{deduction.disputeReason}</p>
                </div>
                {deduction.disputedAt && (
                  <div>
                    <Label className="text-muted-foreground">Disputed At</Label>
                    <div className="font-medium">{formatDate(deduction.disputedAt)}</div>
                  </div>
                )}
              </div>
              {deduction.resolvedAt && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <Label className="text-muted-foreground">Resolved At</Label>
                  <div className="font-medium">{formatDate(deduction.resolvedAt)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose how to resolve this disputed deduction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPT">Accept - Mark as Resolved</SelectItem>
                  <SelectItem value="REJECT">Reject - Write Off</SelectItem>
                  <SelectItem value="PARTIAL">Partial - Split Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {resolution === 'PARTIAL' && (
              <div className="space-y-2">
                <Label>Accepted Amount *</Label>
                <Input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Remainder will be written off: <CurrencyDisplay amount={Math.max(0, deduction.amount - (parseFloat(partialAmount) || 0))} size="sm" />
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmResolve} disabled={resolveDeduction.isPending}>
              {resolveDeduction.isPending ? 'Resolving...' : 'Resolve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
