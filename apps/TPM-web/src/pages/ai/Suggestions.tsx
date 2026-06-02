import { useState } from 'react';
import { Sparkles, Filter, RefreshCw, Clock, CheckCircle2, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import SuggestionCard from '@/components/ai/SuggestionCard';
import { usePromoSuggestions, useApproveSuggestion, useRejectSuggestion, useApplySuggestion, useGenerateSuggestion } from '@/hooks/usePromoSuggestions';

// Demo data
const demoSuggestions = [
  {
    id: '1', type: 'PROMOTION', status: 'PENDING', priority: 8,
    title: 'Pepsi Tet Display Promotion - Big C',
    description: 'Run a Tet-themed end-cap display promotion across all Big C stores in HCMC to boost Q1 volumes.',
    confidence: 0.82,
    impactEstimate: { estimatedROI: 2.4, incrementalVolume: 3500, estimatedCost: 350000000 },
    customer: { name: 'Big C Vietnam', code: 'BIGC' },
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: '2', type: 'REALLOCATION', status: 'PENDING', priority: 6,
    title: 'Budget Reallocation: AEON to Co.op Mart',
    description: 'Reallocate 15% of underperforming AEON display budget to Co.op Mart sampling program.',
    confidence: 0.71,
    impactEstimate: { estimatedROI: 1.8, incrementalVolume: 1200, estimatedCost: 0 },
    customer: { name: 'AEON Vietnam', code: 'AEON' },
    createdAt: '2026-02-03T00:00:00Z',
  },
  {
    id: '3', type: 'TIMING_CHANGE', status: 'APPROVED', priority: 5,
    title: 'Extend Mirinda Summer Campaign by 2 Weeks',
    description: 'Analysis shows strong momentum for Mirinda in GT channel. Recommend extending campaign end date.',
    confidence: 0.68,
    impactEstimate: { estimatedROI: 1.5, incrementalVolume: 800, estimatedCost: 120000000 },
    customer: null,
    createdAt: '2026-01-28T00:00:00Z',
  },
];

export default function Suggestions() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: suggestionsData } = usePromoSuggestions({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const approveMutation = useApproveSuggestion();
  const rejectMutation = useRejectSuggestion();
  const applyMutation = useApplySuggestion();
  const generateMutation = useGenerateSuggestion();

  const suggestions = suggestionsData?.suggestions?.length ? suggestionsData.suggestions : demoSuggestions;

  const pendingCount = suggestions.filter((s: any) => s.status === 'PENDING').length;
  const approvedCount = suggestions.filter((s: any) => s.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Suggestions"
        description="AI-generated promotion and optimization suggestions"
        status={{ label: `${pendingCount} pending`, variant: pendingCount > 0 ? 'warning' : 'success' }}
        actions={
          <Button onClick={() => generateMutation.mutate({})} disabled={generateMutation.isPending}>
            <RefreshCw className={`h-4 w-4 mr-1 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Generate Suggestions
          </Button>
        }
      />

      {/* Stats */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total Suggestions"
          value={suggestions.length}
          icon={Sparkles}
          color="primary"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          color={pendingCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Avg Confidence"
          value={`${suggestions.length > 0 ? Math.round(suggestions.reduce((sum: number, s: any) => sum + s.confidence, 0) / suggestions.length * 100) : 0}%`}
          icon={Brain}
          color="purple"
        />
      </StatCardGroup>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm rounded-lg border border-surface-border bg-background px-3 py-1.5"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="APPLIED">Applied</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm rounded-lg border border-surface-border bg-background px-3 py-1.5"
        >
          <option value="">All Types</option>
          <option value="PROMOTION">Promotion</option>
          <option value="REALLOCATION">Reallocation</option>
          <option value="BASELINE_UPDATE">Baseline Update</option>
          <option value="MECHANIC_CHANGE">Mechanic Change</option>
          <option value="TIMING_CHANGE">Timing Change</option>
        </select>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion: any) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onApprove={(id) => approveMutation.mutate({ id })}
            onReject={(id) => rejectMutation.mutate({ id })}
            onApply={(id) => applyMutation.mutate(id)}
          />
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No suggestions found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Generate Suggestions" to get AI recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
