/**
 * Security Dashboard Page
 */

import { Link } from 'react-router-dom';
import { Key, Shield, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { AuditLogTable } from '@/components/integration/AuditLogTable';
import { useAPIKeys, useAuditLogs, useSecurityDashboard } from '@/hooks/integration/useSecurity';

export default function SecurityDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useSecurityDashboard();
  const { data: apiKeyData, isLoading: apiKeyLoading } = useAPIKeys();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({ pageSize: 10 });

  const isLoading = dashboardLoading || apiKeyLoading || auditLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const dashboard = dashboardData;
  const apiKeys = apiKeyData?.data || [];
  const auditLogs = auditData?.data || [];

  const activeKeys = apiKeys.filter((k) => k.isActive).length;
  const expiringSoon = apiKeys.filter((k) => {
    if (!k.expiresAt || !k.isActive) return false;
    const expiryDate = new Date(k.expiresAt);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return expiryDate < sevenDaysFromNow && expiryDate > new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="text-muted-foreground">
            Manage API keys, permissions, and audit logs
          </p>
        </div>
      </div>

      {/* Alerts */}
      {expiringSoon > 0 && (
        <Card className="border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">API Keys Expiring Soon</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {expiringSoon} API key(s) will expire within the next 7 days.
                </p>
              </div>
              <Link to="/integration/security/api-keys" className="ml-auto">
                <Button variant="outline" size="sm">
                  View Keys
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <StatCardGroup cols={4}>
        <StatCard
          title="Total API Keys"
          value={apiKeys.length}
          subtitle={`${activeKeys} active`}
          icon={Key}
          color={activeKeys > 0 ? 'success' : 'default'}
        />
        <StatCard
          title="Total API Usage"
          value={dashboard?.apiKeys?.totalUsage?.toLocaleString() || '0'}
          subtitle="Requests"
          icon={Shield}
          color="primary"
        />
        <StatCard
          title="Today's Logins"
          value={dashboard?.audit?.todayLogins || 0}
          subtitle="Sessions"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Audit Events"
          value={auditLogs.length}
          subtitle="Recent"
          icon={FileText}
          color="info"
        />
      </StatCardGroup>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/integration/security/api-keys">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle className="text-lg">API Keys</CardTitle>
                  <CardDescription>
                    Create and manage API keys for external access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {activeKeys} active keys
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/integration/security/audit-logs">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">Audit Logs</CardTitle>
                  <CardDescription>
                    View all system changes and user actions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Complete activity history
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest security events and changes</CardDescription>
          </div>
          <Link to="/integration/security/audit-logs">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={auditLogs} compact />
        </CardContent>
      </Card>
    </div>
  );
}
