import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import MilestoneTracker from '@/components/contracts/MilestoneTracker';
import GapAlert from '@/components/contracts/GapAlert';
import { useVolumeContract, useGapAnalysis, useAchieveMilestone } from '@/hooks/useVolumeContracts';
import { cn } from '@/lib/utils';

// Demo data
const demoContract = {
  id: '1', code: 'VC-BIGC-2026', name: 'Big C Volume Contract 2026',
  customer: { id: '1', name: 'Big C Vietnam', code: 'BIGC', channel: 'MT' },
  status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-12-31',
  targetVolume: 120000, currentVolume: 10500, completionRate: 8.75,
  bonusType: 'TIERED', bonusValue: 3.5, riskLevel: 'ON_TRACK',
  channel: 'MT', region: 'SOUTH', categories: ['BEVERAGES', 'SNACKS'],
  milestones: [
    { id: 'm1', name: 'Q1 Target', targetVolume: 28000, achievedVolume: 10500, deadline: '2026-03-31', isAchieved: false },
    { id: 'm2', name: 'H1 Target', targetVolume: 58000, achievedVolume: 0, deadline: '2026-06-30', isAchieved: false },
    { id: 'm3', name: '9M Target', targetVolume: 90000, achievedVolume: 0, deadline: '2026-09-30', isAchieved: false },
    { id: 'm4', name: 'FY Target', targetVolume: 120000, achievedVolume: 0, deadline: '2026-12-31', isAchieved: false },
  ],
  progress: [
    { month: 1, year: 2026, volume: 10500, target: 10000, cumVolume: 10500, cumTarget: 10000, gapPercent: 5 },
  ],
};

const demoGap = {
  summary: {
    targetVolume: 120000, currentVolume: 10500, gap: 109500, completionRate: 8.75,
    remainingMonths: 11, avgMonthlyVolume: 10500, requiredMonthlyRun: 9955,
    runRateGap: -545, projectedYearEnd: 126000, projectedAchievement: 105, riskLevel: 'ON_TRACK',
  },
  milestones: [],
  suggestions: [],
};

const statusColors: Record<string, string> = {
  DRAFT: 'text-muted-foreground bg-muted',
  ACTIVE: 'text-blue-600 bg-blue-100',
  COMPLETED: 'text-green-600 bg-green-100',
  CANCELLED: 'text-red-600 bg-red-100',
};

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contract } = useVolumeContract(id || '');
  const { data: gapData } = useGapAnalysis(id || '');
  const achieveMilestone = useAchieveMilestone();

  const c = contract || demoContract;
  const gap = gapData || demoGap;

  const handleAchieve = (milestoneId: string) => {
    if (id) {
      achieveMilestone.mutate({ contractId: id, milestoneId });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={c.code}
        description={c.name}
        breadcrumbs={[
          { label: 'Contracts', href: '/contracts' },
          { label: c.code },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/contracts')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </div>
        }
      />

      {/* Contract Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contract Details</CardTitle>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                  c.riskLevel === 'CRITICAL' ? 'text-red-700 bg-red-100' :
                  c.riskLevel === 'AT_RISK' ? 'text-yellow-700 bg-yellow-100' :
                  'text-green-700 bg-green-100'
                )}>
                  {(c.riskLevel || 'ON_TRACK').replace('_', ' ')}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[c.status] || '')}>
                  {c.status}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{c.customer?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Channel</p>
                <p className="font-medium">{c.channel || 'All'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Region</p>
                <p className="font-medium">{c.region || 'All'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period</p>
                <p className="font-medium">
                  {new Date(c.startDate).toLocaleDateString('vi-VN')} - {new Date(c.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Volume Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Volume Progress
                </span>
                <span className="font-semibold">{Number(c.completionRate).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(100, Number(c.completionRate))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{Number(c.currentVolume).toLocaleString()} cases</span>
                <span>{Number(c.targetVolume).toLocaleString()} target</span>
              </div>
            </div>

            {/* Bonus Info */}
            <div className="grid grid-cols-3 gap-4 text-sm bg-muted/50 rounded-lg p-3">
              <div>
                <p className="text-muted-foreground">Bonus Type</p>
                <p className="font-medium">{c.bonusType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bonus Value</p>
                <p className="font-medium">{Number(c.bonusValue)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Categories</p>
                <p className="font-medium">{(c.categories || []).join(', ') || 'All'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MilestoneTracker
              milestones={c.milestones || []}
              onAchieve={handleAchieve}
            />
          </CardContent>
        </Card>
      </div>

      {/* Gap Analysis */}
      {gap.summary && (
        <GapAlert
          gap={gap.summary.gap}
          requiredMonthlyRun={gap.summary.requiredMonthlyRun}
          avgMonthlyVolume={gap.summary.avgMonthlyVolume}
          projectedAchievement={gap.summary.projectedAchievement}
          riskLevel={gap.summary.riskLevel}
        />
      )}

      {/* Monthly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {(c.progress || []).length > 0 ? (
            <div className="space-y-2">
              {(c.progress || []).map((p: any) => (
                <div key={`${p.year}-${p.month}`} className="flex items-center gap-4 text-sm">
                  <span className="w-20 text-muted-foreground">{p.month}/{p.year}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${p.target > 0 ? Math.min(100, (p.volume / p.target) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="w-32 text-right font-medium">
                    {Number(p.volume).toLocaleString()} / {Number(p.target).toLocaleString()}
                  </span>
                  <span className={cn(
                    'w-16 text-right font-medium',
                    Number(p.gapPercent) >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {Number(p.gapPercent) > 0 ? '+' : ''}{Number(p.gapPercent).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No progress data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
