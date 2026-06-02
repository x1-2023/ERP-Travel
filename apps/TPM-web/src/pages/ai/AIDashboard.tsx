/**
 * AI Dashboard Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lightbulb, Eye, AlertCircle, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { InsightFeed, RecommendationCard, AnomalyAlert } from '@/components/ai';
import {
  useInsights,
  useGenerateInsights,
  useDismissInsight,
} from '@/hooks/ai/useInsights';
import {
  useRecommendations,
  useGenerateRecommendations,
  useAcceptRecommendation,
  useRejectRecommendation,
} from '@/hooks/ai/useRecommendations';
import { useToast } from '@/hooks/useToast';

export default function AIDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);

  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useInsights({
    pageSize: 10,
  });
  const { data: recommendationsData, isLoading: recsLoading, refetch: refetchRecs } = useRecommendations({
    status: 'PENDING',
    pageSize: 5,
  });

  const generateInsightsMutation = useGenerateInsights();
  const generateRecsMutation = useGenerateRecommendations();
  const dismissMutation = useDismissInsight();
  const acceptMutation = useAcceptRecommendation();
  const rejectMutation = useRejectRecommendation();

  const insights = insightsData?.data || [];
  const recommendations = recommendationsData?.data || [];
  const insightSummary = insightsData?.summary;
  const recSummary = recommendationsData?.summary;

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const result = await generateInsightsMutation.mutateAsync({ category: 'ALL' });
      toast({
        title: 'Insights Generated',
        description: `Generated ${result.generated} new insights`,
      });
      refetchInsights();
    } catch {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecs(true);
    try {
      const result = await generateRecsMutation.mutateAsync({ type: 'ALL' });
      toast({
        title: 'Recommendations Generated',
        description: `Generated ${result.generated} new recommendations`,
      });
      refetchRecs();
    } catch {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const handleDismissInsight = async (id: string) => {
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

  const handleAcceptRecommendation = async (id: string) => {
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

  const handleRejectRecommendation = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id, data: { reason: 'Not applicable' } });
      toast({ title: 'Recommendation Rejected' });
    } catch {
      toast({
        title: 'Failed to reject',
        variant: 'destructive',
      });
    }
  };

  if (insightsLoading || recsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">
            Intelligent insights and recommendations
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
          >
            <Sparkles className={`mr-2 h-4 w-4 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
            {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
          </Button>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isGeneratingRecs}
          >
            <Lightbulb className={`mr-2 h-4 w-4 ${isGeneratingRecs ? 'animate-pulse' : ''}`} />
            {isGeneratingRecs ? 'Generating...' : 'Get Recommendations'}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <AnomalyAlert insights={insights} />

      {/* Stats */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Active Insights"
          value={insightSummary?.total || 0}
          icon={Eye}
          color="primary"
        />
        <StatCard
          title="Action Required"
          value={insightSummary?.actionRequired || 0}
          icon={AlertCircle}
          color={insightSummary?.actionRequired && insightSummary.actionRequired > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Pending Recommendations"
          value={recSummary?.pending || 0}
          icon={Lightbulb}
          color="purple"
        />
        <StatCard
          title="Avg Confidence"
          value={`${((recSummary?.avgConfidence || 0) * 100).toFixed(0)}%`}
          icon={Target}
          color="cyan"
        />
      </StatCardGroup>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Insights</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/ai/insights')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <InsightFeed
              insights={insights.slice(0, 5)}
              onDismiss={handleDismissInsight}
              compact
            />
          </CardContent>
        </Card>

        {/* Top Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Recommendations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/ai/recommendations')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending recommendations
              </div>
            ) : (
              recommendations.slice(0, 3).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAccept={() => handleAcceptRecommendation(rec.id)}
                  onReject={() => handleRejectRecommendation(rec.id)}
                  isAccepting={acceptMutation.isPending}
                  isRejecting={rejectMutation.isPending}
                  compact
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/ai/insights?type=ANOMALY')}>
              View Anomalies
            </Button>
            <Button variant="outline" onClick={() => navigate('/ai/insights?severity=CRITICAL')}>
              Critical Issues
            </Button>
            <Button variant="outline" onClick={() => navigate('/ai/recommendations?type=PROMOTION_OPTIMIZATION')}>
              Promotion Optimizations
            </Button>
            <Button variant="outline" onClick={() => refetchInsights()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
