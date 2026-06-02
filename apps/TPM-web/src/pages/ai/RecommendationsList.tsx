/**
 * AI Recommendations List Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Filter } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RecommendationCard } from '@/components/ai';
import {
  useRecommendations,
  useGenerateRecommendations,
  useAcceptRecommendation,
  useRejectRecommendation,
} from '@/hooks/ai/useRecommendations';
import { useToast } from '@/hooks/useToast';
import {
  RECOMMENDATION_TYPES,
  RECOMMENDATION_TYPE_LABELS,
  RECOMMENDATION_STATUSES,
  RECOMMENDATION_STATUS_LABELS,
} from '@/types/advanced';
import type {
  RecommendationType,
  RecommendationStatus,
  RecommendationListParams,
} from '@/types/advanced';

export default function RecommendationsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [filters, setFilters] = useState<RecommendationListParams>({
    type: (searchParams.get('type') as RecommendationType) || undefined,
    status: (searchParams.get('status') as RecommendationStatus) || undefined,
    page: 1,
    pageSize: 20,
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, refetch } = useRecommendations(filters);
  const generateMutation = useGenerateRecommendations();
  const acceptMutation = useAcceptRecommendation();
  const rejectMutation = useRejectRecommendation();

  const recommendations = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  const handleFilterChange = (key: keyof RecommendationListParams, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
      page: 1,
    };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.status) params.set('status', newFilters.status);
    setSearchParams(params);
  };

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({ type: 'ALL' });
      toast({
        title: 'Recommendations Generated',
        description: `Generated ${result.generated} new recommendations`,
      });
      refetch();
    } catch {
      toast({
        title: 'Generation Failed',
        variant: 'destructive',
      });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptMutation.mutateAsync(id);
      toast({ title: 'Recommendation Accepted' });
    } catch {
      toast({
        title: 'Failed to accept',
        variant: 'destructive',
      });
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingId) return;

    try {
      await rejectMutation.mutateAsync({
        id: rejectingId,
        data: { reason: rejectReason || 'No reason provided' },
      });
      toast({ title: 'Recommendation Rejected' });
      setRejectDialogOpen(false);
      setRejectingId(null);
    } catch {
      toast({
        title: 'Failed to reject',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ai')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">AI Recommendations</h1>
            <p className="text-muted-foreground">
              Suggestions for improving your promotions and operations
            </p>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
          <Lightbulb className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-pulse' : ''}`} />
          {generateMutation.isPending ? 'Generating...' : 'Get Recommendations'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.type || '__all__'}
              onValueChange={(value) => handleFilterChange('type', value === '__all__' ? '' : value)}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                {RECOMMENDATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {RECOMMENDATION_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || '__all__'}
              onValueChange={(value) => handleFilterChange('status', value === '__all__' ? '' : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                {RECOMMENDATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {RECOMMENDATION_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{summary.accepted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
              <p className="text-2xl font-bold">
                {(summary.avgConfidence * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Generate new recommendations to get AI suggestions
              </p>
              <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
                Generate Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onAccept={() => handleAccept(rec.id)}
              onReject={() => openRejectDialog(rec.id)}
              isAccepting={acceptMutation.isPending}
              isRejecting={rejectMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} recommendations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Recommendation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this recommendation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
