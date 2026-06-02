/**
 * AI Insights List Page
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { InsightFeed } from '@/components/ai';
import {
  useInsights,
  useGenerateInsights,
  useDismissInsight,
  useTakeInsightAction,
} from '@/hooks/ai/useInsights';
import { useToast } from '@/hooks/useToast';
import {
  INSIGHT_TYPES,
  INSIGHT_TYPE_LABELS,
  SEVERITIES,
  SEVERITY_LABELS,
} from '@/types/advanced';
import type { InsightType, Severity, InsightListParams } from '@/types/advanced';

export default function InsightsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [filters, setFilters] = useState<InsightListParams>({
    type: (searchParams.get('type') as InsightType) || undefined,
    severity: (searchParams.get('severity') as Severity) || undefined,
    actionRequired: searchParams.get('actionRequired') === 'true' ? true : undefined,
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading, refetch } = useInsights(filters);
  const generateMutation = useGenerateInsights();
  const dismissMutation = useDismissInsight();
  const actionMutation = useTakeInsightAction();

  const insights = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  const handleFilterChange = (key: keyof InsightListParams, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
      page: 1,
    };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.severity) params.set('severity', newFilters.severity);
    if (newFilters.actionRequired) params.set('actionRequired', 'true');
    setSearchParams(params);
  };

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({ category: 'ALL' });
      toast({
        title: 'Insights Generated',
        description: `Generated ${result.generated} new insights`,
      });
      refetch();
    } catch {
      toast({
        title: 'Generation Failed',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissMutation.mutateAsync(id);
      toast({ title: 'Insight Dismissed' });
    } catch {
      toast({
        title: 'Failed to dismiss',
        variant: 'destructive',
      });
    }
  };

  const handleAction = async (id: string) => {
    try {
      await actionMutation.mutateAsync({
        id,
        data: { action: 'ACKNOWLEDGED', notes: 'Reviewed and acknowledged' },
      });
      toast({ title: 'Action Recorded' });
    } catch {
      toast({
        title: 'Failed to record action',
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
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">
              Anomalies, trends, and opportunities detected by AI
            </p>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
          <Sparkles className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? 'Generating...' : 'Generate Insights'}
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                {INSIGHT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {INSIGHT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.severity || '__all__'}
              onValueChange={(value) => handleFilterChange('severity', value === '__all__' ? '' : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Severities</SelectItem>
                {SEVERITIES.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {SEVERITY_LABELS[severity]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.actionRequired ? 'true' : '__all__'}
              onValueChange={(value) => handleFilterChange('actionRequired', value === '__all__' ? '' : value)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Action Required" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                <SelectItem value="true">Action Required</SelectItem>
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
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.bySeverity?.CRITICAL || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Warning</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summary.bySeverity?.WARNING || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Action Required</p>
              <p className="text-2xl font-bold">{summary.actionRequired}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <InsightFeed
          insights={insights}
          onDismiss={handleDismiss}
          onAction={handleAction}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} insights
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
    </div>
  );
}
