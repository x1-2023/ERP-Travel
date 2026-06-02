/**
 * Deduction Matching Page
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { DeductionStatusBadge } from '@/components/finance/DeductionStatusBadge';
import { MatchingSuggestionCard } from '@/components/finance/MatchingSuggestionCard';
import {
  useDeduction,
  useMatchingSuggestions,
  useMatchDeduction,
} from '@/hooks/useDeductions';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/useToast';

export default function DeductionMatchingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries & Mutations
  const { data: deduction, isLoading: loadingDeduction } = useDeduction(id || '');
  const { data: suggestions, isLoading: loadingSuggestions } = useMatchingSuggestions(id || '');
  const matchDeduction = useMatchDeduction();

  const handleMatch = async (claimId: string) => {
    if (!id) return;

    try {
      await matchDeduction.mutateAsync({ id, claimId });
      toast({ title: 'Success', description: 'Deduction matched with claim successfully' });
      navigate(`/finance/deductions/${id}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to match deduction', variant: 'destructive' });
    }
  };

  if (loadingDeduction) {
    return <LoadingSpinner />;
  }

  if (!deduction) {
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

  if (deduction.status !== 'OPEN') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/finance/deductions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Match Deduction</h1>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot Match</AlertTitle>
          <AlertDescription>
            This deduction is not open for matching. Current status: {deduction.status}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(`/finance/deductions/${id}`)}>
          View Deduction Details
        </Button>
      </div>
    );
  }

  const filteredSuggestions = suggestions?.filter((s: any) =>
    !searchQuery ||
    s.claim.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.claim.promotion.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/finance/deductions/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Match Deduction</h1>
          <p className="text-muted-foreground">
            Find and match a claim for this deduction
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deduction Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deduction Details</CardTitle>
              <DeductionStatusBadge status={deduction.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Code</Label>
              <div className="font-medium">{deduction.code}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Customer</Label>
              <div className="font-medium">{deduction.customer?.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Invoice</Label>
              <div className="font-medium">{deduction.invoiceNumber}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Invoice Date</Label>
              <div className="font-medium">{formatDate(deduction.invoiceDate)}</div>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Amount</Label>
              <div className="text-2xl font-bold"><CurrencyDisplay amount={deduction.amount} size="sm" /></div>
            </div>
            {deduction.reason && (
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="text-sm">{deduction.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matching Claims */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Matching Claims</CardTitle>
            <CardDescription>
              {loadingSuggestions
                ? 'Finding matching claims...'
                : `${filteredSuggestions.length} suggestion(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Suggestions */}
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">No Matching Claims Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no approved claims that match this deduction.
                </p>
                <div className="mt-4 space-x-2">
                  <Button variant="outline" onClick={() => navigate('/claims')}>
                    Browse All Claims
                  </Button>
                  <Button variant="destructive" onClick={() => navigate(`/finance/deductions/${id}`)}>
                    Dispute Deduction
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map((suggestion: any) => (
                  <MatchingSuggestionCard
                    key={suggestion.claimId}
                    suggestion={suggestion}
                    selected={selectedClaimId === suggestion.claimId}
                    onSelect={setSelectedClaimId}
                    onMatch={handleMatch}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            {filteredSuggestions.length > 0 && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => navigate('/claims')}>
                    <Search className="mr-2 h-4 w-4" />
                    Search All Claims
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => navigate(`/finance/deductions/${id}`)}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Dispute Deduction
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
