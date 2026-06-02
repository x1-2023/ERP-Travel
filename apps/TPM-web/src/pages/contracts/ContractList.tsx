import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, TrendingUp, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import ContractCard from '@/components/contracts/ContractCard';
import { useVolumeContracts, useContractDashboard } from '@/hooks/useVolumeContracts';

// Demo data for when API is not connected
const demoContracts = [
  {
    id: '1', code: 'VC-BIGC-2026', name: 'Big C Volume Contract 2026',
    customer: { name: 'Big C Vietnam', code: 'BIGC' },
    targetVolume: 120000, currentVolume: 10500, completionRate: 8.75,
    riskLevel: 'ON_TRACK', status: 'ACTIVE',
    nextMilestone: { name: 'Q1 Target', deadline: '2026-03-31' },
  },
  {
    id: '2', code: 'VC-AEON-2026', name: 'AEON Volume Contract 2026',
    customer: { name: 'AEON Vietnam', code: 'AEON' },
    targetVolume: 85000, currentVolume: 6200, completionRate: 7.3,
    riskLevel: 'AT_RISK', status: 'ACTIVE',
    nextMilestone: { name: 'Q1 Target', deadline: '2026-03-31' },
  },
  {
    id: '3', code: 'VC-COOP-2026', name: 'Co.op Mart Volume Contract 2026',
    customer: { name: 'Co.op Mart', code: 'COOP' },
    targetVolume: 65000, currentVolume: 4800, completionRate: 7.4,
    riskLevel: 'ON_TRACK', status: 'ACTIVE',
    nextMilestone: { name: 'Q1 Target', deadline: '2026-03-31' },
  },
];

const demoDashboard = {
  summary: {
    totalContracts: 8, activeContracts: 5,
    totalTargetVolume: 450000, totalCurrentVolume: 38500,
    averageCompletion: 8.56, atRiskCount: 2,
    riskBreakdown: { onTrack: 3, atRisk: 1, critical: 1 },
  },
};

export default function ContractList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: contractsData } = useVolumeContracts({ search, status: statusFilter || undefined });
  const { data: dashboard } = useContractDashboard();

  const contracts = contractsData?.contracts?.length ? contractsData.contracts : demoContracts;
  const summary = dashboard?.summary || demoDashboard.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volume Contracts"
        description="Manage volume contracts with key accounts"
        actions={
          <Button onClick={() => navigate('/contracts/create')}>
            <Plus className="h-4 w-4 mr-1" /> New Contract
          </Button>
        }
      />

      {/* Dashboard Cards */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Active Contracts"
          value={summary.activeContracts}
          subtitle={`of ${summary.totalContracts} total`}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Total Target Volume"
          value={`${(summary.totalTargetVolume / 1000).toFixed(0)}K`}
          subtitle="cases"
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Avg Completion"
          value={`${summary.averageCompletion.toFixed(1)}%`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="At Risk"
          value={summary.atRiskCount}
          subtitle="contracts need attention"
          icon={AlertTriangle}
          color={summary.atRiskCount > 0 ? 'danger' : 'success'}
        />
      </StatCardGroup>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg border border-surface-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
      {summary.riskBreakdown && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Risk Status:</span>
          <span className="inline-flex items-center gap-1 text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {summary.riskBreakdown.onTrack} On Track
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-600">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            {summary.riskBreakdown.atRisk} At Risk
          </span>
          <span className="inline-flex items-center gap-1 text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {summary.riskBreakdown.critical} Critical
          </span>
        </div>
      )}

      {/* Contract Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract: any) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onClick={() => navigate(`/contracts/${contract.id}`)}
          />
        ))}
      </div>

      {contracts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No contracts found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/contracts/create')}>
              Create First Contract
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
