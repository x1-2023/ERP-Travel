import { useState } from 'react';
import { Bell, Filter, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';

// Demo data
const demoAlerts = [
  {
    id: 'a1', message: 'Big C Q7 store monthly target below 80%', severity: 'WARNING',
    entityType: 'STORE', entityId: 'store1', status: 'ACTIVE',
    rule: { name: 'Store Performance Drop', severity: 'WARNING' },
    createdAt: '2026-02-07T08:30:00Z', currentValue: 78, thresholdValue: 85,
  },
  {
    id: 'a2', message: 'Promotion PROMO-Q1-003 budget utilization at 80%', severity: 'CRITICAL',
    entityType: 'PROMOTION', entityId: 'promo3', status: 'ACTIVE',
    rule: { name: 'Promotion Budget Overrun', severity: 'CRITICAL' },
    createdAt: '2026-02-07T07:15:00Z', currentValue: 80, thresholdValue: 95,
  },
  {
    id: 'a3', message: 'Volume contract VC-AEON-2026 running below target', severity: 'WARNING',
    entityType: 'CONTRACT', entityId: 'contract2', status: 'ACTIVE',
    rule: { name: 'Contract Volume Below Target', severity: 'WARNING' },
    createdAt: '2026-02-06T16:00:00Z', currentValue: 72, thresholdValue: 85,
  },
  {
    id: 'a4', message: 'Claim CLM-2026-0045 exceeds 100M VND, pending 72h', severity: 'URGENT',
    entityType: 'CLAIM', entityId: 'claim45', status: 'ACTIVE',
    rule: { name: 'High Value Claim Pending', severity: 'URGENT' },
    createdAt: '2026-02-05T10:00:00Z', currentValue: 150000000, thresholdValue: 100000000,
  },
  {
    id: 'a5', message: 'Co.op Mart Q1 sampling campaign nearing completion', severity: 'INFO',
    entityType: 'PROMOTION', entityId: 'promo4', status: 'ACKNOWLEDGED',
    rule: { name: 'Campaign Near End', severity: 'INFO' },
    createdAt: '2026-02-04T14:00:00Z', currentValue: 90, thresholdValue: 85,
  },
];

const severityIcons: Record<string, typeof Info> = {
  INFO: Info,
  WARNING: AlertTriangle,
  CRITICAL: AlertCircle,
  URGENT: AlertCircle,
};

const severityColors: Record<string, string> = {
  INFO: 'text-blue-600 bg-blue-50 border-blue-200',
  WARNING: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  CRITICAL: 'text-red-600 bg-red-50 border-red-200',
  URGENT: 'text-red-800 bg-red-100 border-red-300',
};

const statusBadge: Record<string, string> = {
  ACTIVE: 'text-red-600 bg-red-100',
  ACKNOWLEDGED: 'text-blue-600 bg-blue-100',
  RESOLVED: 'text-green-600 bg-green-100',
};

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const alerts = demoAlerts.filter(a => {
    if (severityFilter && a.severity !== severityFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const activeCount = demoAlerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = demoAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'URGENT').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Management"
        description="Monitor and manage system alerts"
        status={activeCount > 0
          ? { label: `${activeCount} active`, variant: 'warning' }
          : { label: 'All clear', variant: 'success' }
        }
      />

      {/* Summary Cards */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total Alerts"
          value={demoAlerts.length}
          icon={Bell}
          color="primary"
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={AlertTriangle}
          color={activeCount > 0 ? 'danger' : 'success'}
          pulse={activeCount > 0}
        />
        <StatCard
          title="Critical/Urgent"
          value={criticalCount}
          icon={AlertCircle}
          color={criticalCount > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Resolved"
          value={demoAlerts.filter(a => a.status === 'RESOLVED').length}
          icon={CheckCircle2}
          color="success"
        />
      </StatCardGroup>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-sm rounded-lg border border-surface-border bg-background px-3 py-1.5"
        >
          <option value="">All Severity</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="CRITICAL">Critical</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm rounded-lg border border-surface-border bg-background px-3 py-1.5"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = severityIcons[alert.severity] || Info;
          return (
            <Card key={alert.id} className={cn('border', severityColors[alert.severity])}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{alert.rule.name}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', statusBadge[alert.status] || '')}>
                        {alert.status}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {alert.entityType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {alert.status === 'ACTIVE' && (
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No alerts match your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
