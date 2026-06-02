/**
 * Smoke tests for Integration pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock ERP hooks
vi.mock('@/hooks/integration/useERP', () => ({
  useERPConnections: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useERPConnection: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useCreateERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTriggerERPSync: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTestERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useERPSyncLogs: () => ({ data: { data: [] }, isLoading: false }),
}));

// Mock DMS hooks
vi.mock('@/hooks/integration/useDMS', () => ({
  useDMSConnections: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useDMSConnection: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useCreateDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTriggerDMSSync: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePushToDMS: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock Webhook hooks
vi.mock('@/hooks/integration/useWebhooks', () => ({
  useWebhooks: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useWebhook: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useCreateWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTestWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useWebhookDeliveries: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useRetryDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock Security hooks
vi.mock('@/hooks/integration/useSecurity', () => ({
  useAPIKeys: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useAuditLogs: () => ({ data: { data: [] }, isLoading: false }),
  useSecurityDashboard: () => ({ data: undefined, isLoading: false }),
  useCreateAPIKey: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRevokeAPIKey: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock integration components
vi.mock('@/components/integration', () => ({
  IntegrationSummary: () => <div data-testid="integration-summary" />,
  ERPConnectionCard: () => <div data-testid="erp-card" />,
  DMSConnectionCard: () => <div data-testid="dms-card" />,
  WebhookCard: () => <div data-testid="webhook-card" />,
  ConnectionStatusBadge: ({ status }: { status: string }) => <span data-testid="connection-status">{status}</span>,
  SyncStatusBadge: ({ status }: { status: string }) => <span data-testid="sync-status">{status}</span>,
  DeliveryStatusBadge: ({ status }: { status: string }) => <span data-testid="delivery-badge">{status}</span>,
}));

vi.mock('@/components/integration/AuditLogTable', () => ({
  AuditLogTable: () => <div data-testid="audit-log-table" />,
}));

vi.mock('@/components/integration/APIKeyCard', () => ({
  APIKeyCard: () => <div data-testid="api-key-card" />,
  NewAPIKeyDisplay: () => <div data-testid="new-api-key-display" />,
}));

// Mock types
vi.mock('@/types/integration', () => ({
  ERP_TYPES: ['SAP', 'ORACLE'],
  DMS_TYPES: ['MISA', 'FAST'],
  WEBHOOK_EVENTS: ['promotion.created', 'claim.created'],
  API_PERMISSIONS: ['promotions:read', 'promotions:write'],
}));

// Mock Select to avoid Radix empty-string value crash in AuditLogsList
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock stat-card
vi.mock('@/components/ui/stat-card', () => ({
  StatCard: ({ title }: { title: string }) => <div data-testid="stat-card">{title}</div>,
  StatCardGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="stat-card-group">{children}</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

import IntegrationDashboard from '@/pages/integration/IntegrationDashboard';
import DMSList from '@/pages/integration/dms/DMSList';
import DMSDetail from '@/pages/integration/dms/DMSDetail';
import ERPList from '@/pages/integration/erp/ERPList';
import ERPDetail from '@/pages/integration/erp/ERPDetail';
import SecurityDashboard from '@/pages/integration/security/SecurityDashboard';
import APIKeysList from '@/pages/integration/security/APIKeysList';
import AuditLogsList from '@/pages/integration/security/AuditLogsList';
import WebhookList from '@/pages/integration/webhooks/WebhookList';
import WebhookDetail from '@/pages/integration/webhooks/WebhookDetail';

describe('IntegrationDashboard', () => {
  it('renders without crashing', () => {
    render(<IntegrationDashboard />);
    expect(screen.getByText('Integration Hub')).toBeInTheDocument();
  });

  it('displays quick links', () => {
    render(<IntegrationDashboard />);
    expect(screen.getByText('ERP Integration')).toBeInTheDocument();
    expect(screen.getByText('DMS Integration')).toBeInTheDocument();
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('shows recent activity section', () => {
    render(<IntegrationDashboard />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });
});

describe('DMSList', () => {
  it('renders without crashing', () => {
    render(<DMSList />);
    expect(screen.getByText('DMS Connections')).toBeInTheDocument();
  });

  it('shows empty state and add connection button', () => {
    render(<DMSList />);
    expect(screen.getByText('No DMS Connections')).toBeInTheDocument();
    expect(screen.getAllByText('Add Connection').length).toBeGreaterThanOrEqual(1);
  });
});

describe('DMSDetail', () => {
  it('renders without crashing and shows not found', () => {
    render(<DMSDetail />);
    expect(screen.getByText('Connection not found')).toBeInTheDocument();
  });
});

describe('ERPList', () => {
  it('renders without crashing', () => {
    render(<ERPList />);
    expect(screen.getByText('ERP Connections')).toBeInTheDocument();
  });

  it('shows empty state and add connection button', () => {
    render(<ERPList />);
    expect(screen.getByText('No ERP Connections')).toBeInTheDocument();
    expect(screen.getAllByText('Add Connection').length).toBeGreaterThanOrEqual(1);
  });
});

describe('ERPDetail', () => {
  it('renders without crashing and shows not found', () => {
    render(<ERPDetail />);
    expect(screen.getByText('Connection not found')).toBeInTheDocument();
  });
});

describe('SecurityDashboard', () => {
  it('renders without crashing', () => {
    render(<SecurityDashboard />);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('displays quick action links', () => {
    render(<SecurityDashboard />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });
});

describe('APIKeysList', () => {
  it('renders without crashing', () => {
    render(<APIKeysList />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('shows empty state and create key button', () => {
    render(<APIKeysList />);
    expect(screen.getByText('No API Keys')).toBeInTheDocument();
    expect(screen.getAllByText('Create Key').length).toBeGreaterThanOrEqual(1);
  });
});

describe('AuditLogsList', () => {
  it('renders without crashing', () => {
    render(<AuditLogsList />);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('shows filters section', () => {
    render(<AuditLogsList />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });
});

describe('WebhookList', () => {
  it('renders without crashing', () => {
    render(<WebhookList />);
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
  });

  it('shows empty state and add webhook button', () => {
    render(<WebhookList />);
    expect(screen.getByText('No Webhooks')).toBeInTheDocument();
    expect(screen.getAllByText('Add Webhook').length).toBeGreaterThanOrEqual(1);
  });
});

describe('WebhookDetail', () => {
  it('renders without crashing and shows not found', () => {
    render(<WebhookDetail />);
    expect(screen.getByText('Webhook not found')).toBeInTheDocument();
  });
});
