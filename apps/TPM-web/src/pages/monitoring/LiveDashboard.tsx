import { Activity, DollarSign, FileText, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import AlertBanner from '@/components/monitoring/AlertBanner';
import { useMonitoringDashboard } from '@/hooks/useLiveMonitoring';
import { cn } from '@/lib/utils';

// Demo data
const demoDashboard = {
  overview: {
    activePromotionCount: 12, activeContractCount: 5, pendingClaimCount: 47,
    totalBudget: 15000000000, totalSpent: 8500000000, budgetUtilization: 57,
    alertCount: 3,
  },
  activePromotions: [
    { id: '1', code: 'PROMO-TET-001', name: 'Tet Display Big C', status: 'EXECUTING',
      customer: { name: 'Big C Vietnam' }, budget: 350000000, actualSpend: 210000000,
      endDate: '2026-03-02', daysRemaining: 23 },
    { id: '2', code: 'PROMO-SPR-002', name: 'Spring Campaign AEON', status: 'EXECUTING',
      customer: { name: 'AEON Vietnam' }, budget: 280000000, actualSpend: 95000000,
      endDate: '2026-03-15', daysRemaining: 36 },
    { id: '3', code: 'PROMO-Q1-003', name: 'Q1 Sampling Co.op', status: 'EXECUTING',
      customer: { name: 'Co.op Mart' }, budget: 150000000, actualSpend: 120000000,
      endDate: '2026-02-28', daysRemaining: 21 },
  ],
  recentAlerts: [
    { id: 'a1', message: 'Big C Q7 store monthly target below 80%', createdAt: '2026-02-07T08:30:00Z',
      rule: { name: 'Store Performance Drop', severity: 'WARNING', entityType: 'STORE' } },
    { id: 'a2', message: 'Promotion PROMO-Q1-003 budget utilization at 80%', createdAt: '2026-02-07T07:15:00Z',
      rule: { name: 'Promotion Budget Overrun', severity: 'CRITICAL', entityType: 'PROMOTION' } },
    { id: 'a3', message: 'Volume contract VC-AEON-2026 running below target', createdAt: '2026-02-06T16:00:00Z',
      rule: { name: 'Contract Volume Below Target', severity: 'WARNING', entityType: 'CONTRACT' } },
  ],
};

export default function LiveDashboard() {
  const { data: dashboard } = useMonitoringDashboard();
  const d = dashboard || demoDashboard;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        description="Real-time promotion and contract monitoring dashboard"
        status={{ label: 'Live', variant: 'success' }}
      />

      {/* Alert Banner */}
      {d.recentAlerts.length > 0 && (
        <AlertBanner alerts={d.recentAlerts} maxVisible={3} />
      )}

      {/* KPI Cards */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Active Promotions"
          value={d.overview.activePromotionCount}
          icon={Activity}
          color="primary"
          pulse
        />
        <StatCard
          title="Budget Utilization"
          value={`${d.overview.budgetUtilization}%`}
          subtitle={`${(d.overview.totalSpent / 1000000000).toFixed(1)}B / ${(d.overview.totalBudget / 1000000000).toFixed(1)}B VND`}
          icon={DollarSign}
          color={d.overview.budgetUtilization > 90 ? 'danger' : d.overview.budgetUtilization > 75 ? 'warning' : 'success'}
        />
        <StatCard
          title="Pending Claims"
          value={d.overview.pendingClaimCount}
          icon={FileText}
          color={d.overview.pendingClaimCount > 30 ? 'warning' : 'primary'}
        />
        <StatCard
          title="Active Contracts"
          value={d.overview.activeContractCount}
          subtitle={`${d.overview.alertCount} alerts`}
          icon={TrendingUp}
          color="purple"
        />
      </StatCardGroup>

      {/* Active Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Active Promotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium text-right">Budget</th>
                  <th className="pb-2 font-medium text-right">Spent</th>
                  <th className="pb-2 font-medium text-right">Utilization</th>
                  <th className="pb-2 font-medium text-right">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {d.activePromotions.map((promo: any) => {
                  const util = promo.budget > 0 ? Math.round((promo.actualSpend / promo.budget) * 100) : 0;
                  return (
                    <tr key={promo.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-2.5 font-mono text-xs">{promo.code}</td>
                      <td className="py-2.5">{promo.name}</td>
                      <td className="py-2.5 text-muted-foreground">{promo.customer?.name}</td>
                      <td className="py-2.5 text-right">{(promo.budget / 1000000).toFixed(0)}M</td>
                      <td className="py-2.5 text-right">{(promo.actualSpend / 1000000).toFixed(0)}M</td>
                      <td className="py-2.5 text-right">
                        <span className={cn(
                          'font-medium',
                          util > 90 ? 'text-red-600' : util > 75 ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {util}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={cn(
                          'inline-flex items-center gap-1',
                          promo.daysRemaining <= 7 ? 'text-red-600' : 'text-muted-foreground'
                        )}>
                          <Clock className="h-3 w-3" />
                          {promo.daysRemaining}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
