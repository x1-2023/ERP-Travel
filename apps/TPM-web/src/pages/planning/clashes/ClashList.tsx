/**
 * Clash List Page
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  Scan,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { ClashCard } from '@/components/planning/ClashCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  useClashes,
  useClashStats,
  useDetectClashes,
  useDismissClash,
} from '@/hooks/planning/useClashes';

export default function ClashList() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [dismissId, setDismissId] = useState<string | null>(null);

  const { data, isLoading, error } = useClashes({
    page,
    limit: 10,
    status: status !== 'all' ? status : undefined,
    severity: severity !== 'all' ? severity : undefined,
  });

  const { data: stats } = useClashStats();
  const detectMutation = useDetectClashes();
  const dismissMutation = useDismissClash();

  const handleDetect = async () => {
    try {
      const result = await detectMutation.mutateAsync({});
      toast({
        title: 'Detection Complete',
        description: `Checked ${result.summary.checked} promotions, found ${result.summary.clashesFound} new clashes.`,
      });
    } catch (err: any) {
      toast({
        title: 'Detection Failed',
        description: err.message || 'Failed to detect clashes',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = async () => {
    if (!dismissId) return;
    try {
      await dismissMutation.mutateAsync(dismissId);
      toast({
        title: 'Clash Dismissed',
        description: 'The clash has been dismissed.',
      });
      setDismissId(null);
    } catch (err: any) {
      toast({
        title: 'Dismiss Failed',
        description: err.message || 'Failed to dismiss clash',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-6 text-destructive">Error loading clashes</div>;

  const clashes = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clash Detection</h1>
          <p className="text-muted-foreground">
            Identify and resolve promotion conflicts
          </p>
        </div>
        <Button onClick={handleDetect} disabled={detectMutation.isPending}>
          {detectMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Scan className="h-4 w-4 mr-2" />
          )}
          Run Detection
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clashes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.unresolvedHigh > 0 ? 'border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/30' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.unresolvedHigh}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">unresolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reviewing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {stats.byStatus?.REVIEWING || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.resolutionRate}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Potential Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  <CurrencyDisplay amount={stats.totalPotentialImpact} size="lg" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DETECTED">Detected</SelectItem>
            <SelectItem value="REVIEWING">Reviewing</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="DISMISSED">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={severity}
          onValueChange={(v) => {
            setSeverity(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clash List */}
      {clashes.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Clashes Found</h3>
          <p className="text-muted-foreground mb-4">
            {status !== 'all' || severity !== 'all'
              ? 'No clashes match your filters.'
              : 'Great! There are no promotion conflicts detected.'}
          </p>
          <Button onClick={handleDetect} disabled={detectMutation.isPending}>
            <Scan className="h-4 w-4 mr-2" />
            Run Detection
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {clashes.map((clash) => (
            <ClashCard
              key={clash.id}
              clash={clash}
              onDismiss={setDismissId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dismiss Confirmation */}
      <AlertDialog open={!!dismissId} onOpenChange={() => setDismissId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Clash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dismiss this clash? This indicates the
              overlap is intentional or not a concern.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDismiss}>Dismiss</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
