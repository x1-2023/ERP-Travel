import { useState } from 'react';
import { Brain, Play, Zap, CheckCircle2, AlertTriangle, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import ClaimMatchResult from '@/components/ai/ClaimMatchResult';
import { useClaimsAIStats, usePendingClaims, useProcessClaim, useBatchProcessClaims } from '@/hooks/useClaimsAI';

// Demo data
const demoStats = {
  totalClaims: 145, processedClaims: 98, unprocessedClaims: 47,
  processingRate: 68,
  recommendations: { autoApproved: 52, flagged: 21, manualReview: 18, rejected: 7 },
  averageConfidence: 0.78,
};

const demoPending = [
  { id: 'c1', code: 'CLM-2026-0048', amount: 125000000, status: 'PENDING', claimDate: '2026-02-01',
    customer: { name: 'Big C Vietnam', code: 'BIGC' },
    promotion: { code: 'PROMO-001', name: 'Tet Display Big C' } },
  { id: 'c2', code: 'CLM-2026-0049', amount: 85000000, status: 'PENDING', claimDate: '2026-02-02',
    customer: { name: 'AEON Vietnam', code: 'AEON' },
    promotion: { code: 'PROMO-002', name: 'AEON Spring Campaign' } },
  { id: 'c3', code: 'CLM-2026-0050', amount: 45000000, status: 'PENDING', claimDate: '2026-02-03',
    customer: { name: 'Co.op Mart', code: 'COOP' },
    promotion: null },
];

const demoMatchResult = {
  recommendation: 'APPROVE_WITH_FLAG' as const,
  confidence: 0.82,
  matchScore: 0.88,
  matchedAmount: 125000000,
  variance: 15000000,
  variancePercent: 12.5,
  flags: ['VARIANCE_ABOVE_5_PERCENT'],
  reasoning: 'Claim of 125,000,000 VND matched against promotion PROMO-001. Variance: 12.5%.',
};

export default function ClaimsAI() {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());

  const { data: stats } = useClaimsAIStats();
  const { data: pendingData } = usePendingClaims();
  const processClaim = useProcessClaim();
  const batchProcess = useBatchProcessClaims();

  const s = stats || demoStats;
  const pending = pendingData?.claims?.length ? pendingData.claims : demoPending;

  const toggleClaimSelection = (id: string) => {
    setSelectedClaims(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchProcess = () => {
    if (selectedClaims.size > 0) {
      batchProcess.mutate(Array.from(selectedClaims));
      setSelectedClaims(new Set());
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Claims Processing"
        description="Intelligent claim matching and recommendation engine"
        status={{ label: 'AI Powered', variant: 'neutral' }}
      />

      {/* Stats */}
      <StatCardGroup cols={5}>
        <StatCard title="Total Claims" value={s.totalClaims} icon={Clock} color="primary" />
        <StatCard title="Processed" value={s.processedClaims} subtitle={`${s.processingRate}% done`} icon={Brain} color="success" />
        <StatCard title="Auto Approved" value={s.recommendations.autoApproved} icon={CheckCircle2} color="success" />
        <StatCard title="Flagged" value={s.recommendations.flagged + s.recommendations.manualReview} icon={AlertTriangle} color="warning" />
        <StatCard title="Avg Confidence" value={`${Math.round(s.averageConfidence * 100)}%`} icon={Brain} color="purple" />
      </StatCardGroup>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Claims */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Claims ({s.unprocessedClaims})
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedClaims.size > 0 && (
                  <Button size="sm" onClick={handleBatchProcess} disabled={batchProcess.isPending}>
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Process {selectedClaims.size}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map((claim: any) => (
              <div
                key={claim.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedClaim === claim.id ? 'border-blue-300 bg-blue-50/70' : 'border-surface-border'
                }`}
                onClick={() => setSelectedClaim(claim.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedClaims.has(claim.id)}
                  onChange={() => toggleClaimSelection(claim.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{claim.code}</p>
                    <p className="text-sm font-semibold">{Number(claim.amount).toLocaleString('vi-VN')} VND</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{claim.customer?.name}</span>
                    {claim.promotion && (
                      <>
                        <span>-</span>
                        <span>{claim.promotion.code}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    processClaim.mutate(claim.id);
                  }}
                  disabled={processClaim.isPending}
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-center text-muted-foreground py-8">All claims have been processed</p>
            )}
          </CardContent>
        </Card>

        {/* Match Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              AI Match Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClaim ? (
              <ClaimMatchResult match={demoMatchResult} />
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a claim to view AI analysis</p>
                <p className="text-xs text-muted-foreground mt-1">Or process a claim to generate a match result</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
