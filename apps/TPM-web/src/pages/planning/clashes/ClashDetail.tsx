/**
 * Clash Detail Page
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Package,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { ClashStatusBadge, ClashSeverityBadge } from '@/components/planning/ClashStatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  useClash,
  useResolveClash,
  useUpdateClash,
  type ResolutionType,
} from '@/hooks/planning/useClashes';

export default function ClashDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showResolve, setShowResolve] = useState(false);
  const [resolution, setResolution] = useState<ResolutionType>('ACCEPT_OVERLAP');
  const [notes, setNotes] = useState('');

  const { data: clash, isLoading, error } = useClash(id);
  const resolveMutation = useResolveClash();
  const updateMutation = useUpdateClash();

  const handleStartReview = async () => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, status: 'REVIEWING' });
      toast({ title: 'Status Updated', description: 'Clash is now under review.' });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    try {
      await resolveMutation.mutateAsync({ id, resolution, notes });
      toast({
        title: 'Clash Resolved',
        description: 'The clash has been resolved successfully.',
      });
      setShowResolve(false);
      navigate('/planning/clashes');
    } catch (err: any) {
      toast({
        title: 'Resolution Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error || !clash) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Clash not found</p>
          <Button asChild variant="outline">
            <Link to="/planning/clashes">Back to Clashes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isResolved = clash.status === 'RESOLVED' || clash.status === 'DISMISSED';
  const analysis = clash.analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/planning/clashes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <AlertTriangle
                className={`h-6 w-6 ${
                  clash.severity === 'HIGH'
                    ? 'text-red-500'
                    : clash.severity === 'MEDIUM'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                }`}
              />
              <h1 className="text-2xl font-bold">
                {clash.clashType.replace('_', ' ')}
              </h1>
              <ClashSeverityBadge severity={clash.severity} />
              <ClashStatusBadge status={clash.status} />
            </div>
            <p className="text-muted-foreground mt-1">{clash.description}</p>
          </div>
        </div>
        {!isResolved && (
          <div className="flex items-center gap-2">
            {clash.status === 'DETECTED' && (
              <Button variant="outline" onClick={handleStartReview}>
                Start Review
              </Button>
            )}
            <Button onClick={() => setShowResolve(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </div>
        )}
      </div>

      {/* Promotions Comparison */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promotion A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Link
                to={`/promotions/${clash.promotionA.id}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {clash.promotionA.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {clash.promotionA.code}
              </p>
            </div>
            {clash.promotionA.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(clash.promotionA.startDate)} -{' '}
                {formatDate(clash.promotionA.endDate || '')}
              </div>
            )}
            {clash.promotionA.customer && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                {clash.promotionA.customer.name}
              </div>
            )}
            {clash.promotionA.products && clash.promotionA.products.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Products ({clash.promotionA.products.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {clash.promotionA.products.slice(0, 5).map((p: any) => (
                    <span
                      key={p.id}
                      className="text-xs bg-muted px-2 py-1 rounded"
                    >
                      {p.code}
                    </span>
                  ))}
                  {clash.promotionA.products.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{clash.promotionA.products.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Promotion B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Link
                to={`/promotions/${clash.promotionB.id}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {clash.promotionB.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {clash.promotionB.code}
              </p>
            </div>
            {clash.promotionB.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(clash.promotionB.startDate)} -{' '}
                {formatDate(clash.promotionB.endDate || '')}
              </div>
            )}
            {clash.promotionB.customer && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                {clash.promotionB.customer.name}
              </div>
            )}
            {clash.promotionB.products && clash.promotionB.products.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Products ({clash.promotionB.products.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {clash.promotionB.products.slice(0, 5).map((p: any) => (
                    <span
                      key={p.id}
                      className="text-xs bg-muted px-2 py-1 rounded"
                    >
                      {p.code}
                    </span>
                  ))}
                  {clash.promotionB.products.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{clash.promotionB.products.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overlap Details */}
      <Card>
        <CardHeader>
          <CardTitle>Overlap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Overlap Period</span>
              </div>
              <p className="font-semibold">
                {formatDate(clash.overlapStart)} - {formatDate(clash.overlapEnd)}
              </p>
              {analysis && (
                <p className="text-sm text-muted-foreground">
                  {analysis.overlapDays} days
                </p>
              )}
            </div>
            {analysis && (
              <>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Budget at Risk</span>
                  </div>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    <CurrencyDisplay amount={analysis.budgetAtRisk.total} size="sm" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    A: <CurrencyDisplay amount={analysis.budgetAtRisk.promotionA} size="sm" /> |
                    B: <CurrencyDisplay amount={analysis.budgetAtRisk.promotionB} size="sm" />
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <span className="text-sm">Overlap % (A)</span>
                  </div>
                  <p className="font-semibold">
                    {analysis.overlapPercentage.promotionA}%
                  </p>
                  <p className="text-xs text-muted-foreground">of duration</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <span className="text-sm">Overlap % (B)</span>
                  </div>
                  <p className="font-semibold">
                    {analysis.overlapPercentage.promotionB}%
                  </p>
                  <p className="text-xs text-muted-foreground">of duration</p>
                </div>
              </>
            )}
          </div>

          {/* Affected Items */}
          <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t">
            {clash.affectedCustomers?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    Affected Customers ({clash.affectedCustomers.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clash.affectedCustomers.map((id: string) => (
                    <span key={id} className="text-sm bg-muted px-2 py-1 rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {clash.affectedProducts?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    Affected Products ({clash.affectedProducts.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clash.affectedProducts.slice(0, 10).map((id: string) => (
                    <span key={id} className="text-sm bg-muted px-2 py-1 rounded">
                      {id}
                    </span>
                  ))}
                  {clash.affectedProducts.length > 10 && (
                    <span className="text-sm text-muted-foreground">
                      +{clash.affectedProducts.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resolution Info */}
      {isResolved && (
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {clash.resolution?.replace('_', ' ')}
            </p>
            {clash.notes && (
              <p className="text-muted-foreground mt-2">{clash.notes}</p>
            )}
            {clash.resolvedBy && (
              <p className="text-sm text-muted-foreground mt-2">
                Resolved by {clash.resolvedBy.name} on{' '}
                {formatDate(clash.resolvedAt || '')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resolve Dialog */}
      <Dialog open={showResolve} onOpenChange={setShowResolve}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Clash</DialogTitle>
            <DialogDescription>
              Select how you want to resolve this promotion conflict.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup
              value={resolution}
              onValueChange={(v) => setResolution(v as ResolutionType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ACCEPT_OVERLAP" id="accept" />
                <Label htmlFor="accept">Accept Overlap (intentional)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADJUST_DATES" id="adjust" />
                <Label htmlFor="adjust">Adjust Dates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MERGE" id="merge" />
                <Label htmlFor="merge">Merge Promotions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CANCEL_ONE" id="cancel" />
                <Label htmlFor="cancel">Cancel One Promotion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="OTHER" id="other" />
                <Label htmlFor="other">Other Resolution</Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this resolution..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolve(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
              {resolveMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
