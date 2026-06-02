/**
 * Integration Dashboard Page
 */

import { Link } from 'react-router-dom';
import { Database, Link as LinkIcon, Webhook, Key, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { IntegrationSummary } from '@/components/integration';
import { AuditLogTable } from '@/components/integration/AuditLogTable';
import { useERPConnections } from '@/hooks/integration/useERP';
import { useDMSConnections } from '@/hooks/integration/useDMS';
import { useWebhooks } from '@/hooks/integration/useWebhooks';
import { useAPIKeys, useAuditLogs } from '@/hooks/integration/useSecurity';
import type { ERPConnection, DMSConnection, WebhookEndpoint, APIKey } from '@/types/integration';

export default function IntegrationDashboard() {
  const { data: erpData, isLoading: erpLoading } = useERPConnections();
  const { data: dmsData, isLoading: dmsLoading } = useDMSConnections();
  const { data: webhookData, isLoading: webhookLoading } = useWebhooks();
  const { data: apiKeyData, isLoading: apiKeyLoading } = useAPIKeys();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({ pageSize: 10 });

  const isLoading = erpLoading || dmsLoading || webhookLoading || apiKeyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const erpConnections = erpData?.data || [];
  const dmsConnections = dmsData?.data || [];
  const webhooks = webhookData?.data || [];
  const apiKeys = apiKeyData?.data || [];
  const auditLogs = auditData?.data || [];

  const erpActive = erpConnections.filter((c: ERPConnection) => c.status === 'ACTIVE').length;
  const dmsActive = dmsConnections.filter((c: DMSConnection) => c.status === 'ACTIVE').length;
  const webhookActive = webhooks.filter((w: WebhookEndpoint) => w.isActive).length;
  const apiKeysActive = apiKeys.filter((k: APIKey) => k.isActive).length;

  const hasErrors = erpConnections.some((c: ERPConnection) => c.status === 'ERROR') ||
    dmsConnections.some((c: DMSConnection) => c.status === 'ERROR');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage ERP, DMS, webhooks, and API integrations
          </p>
        </div>
        <Link to="/integration/security">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Card className="border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Connection Issues Detected</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Some integrations have errors. Check the connections below for details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <IntegrationSummary
        erpConnections={erpConnections.length}
        erpActive={erpActive}
        dmsConnections={dmsConnections.length}
        dmsActive={dmsActive}
        webhookEndpoints={webhooks.length}
        webhookActive={webhookActive}
        apiKeys={apiKeys.length}
        apiKeysActive={apiKeysActive}
      />

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/integration/erp">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">ERP Integration</CardTitle>
                  <CardDescription>SAP, Oracle, Dynamics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {erpActive} of {erpConnections.length} active
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/integration/dms">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <LinkIcon className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle className="text-lg">DMS Integration</CardTitle>
                  <CardDescription>Distributor systems</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {dmsActive} of {dmsConnections.length} active
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/integration/webhooks">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Webhook className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-lg">Webhooks</CardTitle>
                  <CardDescription>Event notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {webhookActive} of {webhooks.length} active
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/integration/security/api-keys">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle className="text-lg">API Keys</CardTitle>
                  <CardDescription>Access management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {apiKeysActive} of {apiKeys.length} active
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
            <CardDescription>Latest changes and events</CardDescription>
          </div>
          <Link to="/integration/security/audit-logs">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <AuditLogTable logs={auditLogs} compact />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
