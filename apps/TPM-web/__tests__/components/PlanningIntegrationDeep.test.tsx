/**
 * Planning & Integration Deep Component Tests
 * Coverage for: ClashCard, ClashStatusBadge, ClashSeverityBadge,
 * ScenarioCard, ScenarioStatusBadge, TemplateCard,
 * APIKeyCard, AuditLogTable, DMSConnectionCard, ERPConnectionCard,
 * WebhookCard, IntegrationSummary, ConnectionStatusBadge, SyncStatusBadge
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { ClashCard } from '@/components/planning/ClashCard';
import { ClashStatusBadge, ClashSeverityBadge } from '@/components/planning/ClashStatusBadge';
import { ScenarioCard } from '@/components/planning/ScenarioCard';
import { ScenarioStatusBadge } from '@/components/planning/ScenarioStatusBadge';
import TemplateCard from '@/components/planning/TemplateCard';
import { APIKeyCard } from '@/components/integration/APIKeyCard';
import { AuditLogTable } from '@/components/integration/AuditLogTable';
import { DMSConnectionCard } from '@/components/integration/DMSConnectionCard';
import { ERPConnectionCard } from '@/components/integration/ERPConnectionCard';
import { WebhookCard } from '@/components/integration/WebhookCard';
import {
  IntegrationSummary,
  ConnectionStatusBadge,
  SyncStatusBadge,
} from '@/components/integration/IntegrationStats';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA FACTORIES
// ═══════════════════════════════════════════════════════════════════════════

function makeClash(overrides: Record<string, unknown> = {}) {
  return {
    id: 'clash-1',
    promotionAId: 'promo-a',
    promotionBId: 'promo-b',
    promotionA: { id: 'promo-a', code: 'PA-001', name: 'Summer Promo' },
    promotionB: { id: 'promo-b', code: 'PB-002', name: 'Winter Promo' },
    clashType: 'FULL_OVERLAP' as const,
    severity: 'HIGH' as const,
    status: 'DETECTED' as const,
    description: 'Two promotions overlap significantly',
    overlapStart: '2026-03-01T00:00:00Z',
    overlapEnd: '2026-03-15T00:00:00Z',
    affectedCustomers: ['c1', 'c2'],
    affectedProducts: ['p1', 'p2', 'p3'],
    potentialImpact: 5000000,
    detectedAt: '2026-02-01T00:00:00Z',
    ...overrides,
  };
}

function makeScenario(overrides: Record<string, unknown> = {}) {
  return {
    id: 'scenario-1',
    name: 'Discount 15% Scenario',
    description: 'Test scenario with 15% discount',
    status: 'DRAFT' as const,
    baselineId: null,
    baseline: null,
    parameters: {
      promotionType: 'DISCOUNT',
      discountPercent: 15,
      budget: 100000000,
      duration: 30,
      targetCustomers: [],
      targetProducts: [],
      startDate: '2026-03-01',
      expectedLiftPercent: 10,
      redemptionRatePercent: 50,
    },
    assumptions: {
      baselineSalesPerDay: 5000000,
      averageOrderValue: 200000,
      marginPercent: 25,
    },
    results: null,
    createdById: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    ...overrides,
  };
}

function makeTemplate(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tmpl-1',
    code: 'TMPL-DISC-01',
    name: 'Standard Discount',
    description: 'A basic percentage discount template',
    type: 'DISCOUNT',
    category: 'General',
    defaultDuration: 30,
    defaultBudget: 50000000,
    mechanics: {
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      stackable: true,
    },
    isActive: true,
    usageCount: 12,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-10'),
    createdById: 'user-1',
    ...overrides,
  };
}

function makeAPIKey(overrides: Record<string, unknown> = {}) {
  return {
    id: 'key-1',
    name: 'Production API Key',
    keyPreview: 'abcd1234',
    permissions: ['read:promotions', 'write:promotions', 'read:claims'],
    isActive: true,
    lastUsedAt: '2026-02-01T00:00:00Z',
    usageCount: 1500,
    expiresAt: undefined as string | undefined,
    allowedIPs: [],
    createdAt: '2026-01-01T00:00:00Z',
    createdById: 'user-1',
    ...overrides,
  };
}

function makeAuditLog(overrides: Record<string, unknown> = {}) {
  return {
    id: 'log-1',
    userId: 'user-1',
    user: { id: 'user-1', name: 'John Doe', email: 'john@test.com' },
    action: 'create',
    entityType: 'Promotion',
    entityId: 'promo-1',
    timestamp: '2026-02-01T10:00:00Z',
    ...overrides,
  };
}

function makeDMSConnection(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dms-1',
    name: 'Misa DMS Main',
    type: 'CUSTOM' as const,
    distributorId: 'dist-1',
    distributor: { id: 'dist-1', name: 'ABC Distributor', code: 'ABC' },
    status: 'ACTIVE' as const,
    lastSyncAt: '2026-02-01T08:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    createdById: 'user-1',
    ...overrides,
  };
}

function makeERPConnection(overrides: Record<string, unknown> = {}) {
  return {
    id: 'erp-1',
    name: 'SAP Production',
    type: 'SAP' as const,
    status: 'ACTIVE' as const,
    lastSyncAt: '2026-02-01T06:00:00Z',
    syncSchedule: '0 * * * *',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    createdById: 'user-1',
    ...overrides,
  };
}

function makeWebhook(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wh-1',
    name: 'Order Webhook',
    url: 'https://example.com/webhook',
    isActive: true,
    events: ['promotion.created', 'promotion.updated', 'claim.submitted'],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    createdById: 'user-1',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. ClashCard
// ═══════════════════════════════════════════════════════════════════════════

describe('ClashCard', () => {
  it('renders clash with promotion names and description', () => {
    render(<ClashCard clash={makeClash()} />);
    expect(screen.getByText('Summer Promo')).toBeInTheDocument();
    expect(screen.getByText('Winter Promo')).toBeInTheDocument();
    expect(screen.getByText('Two promotions overlap significantly')).toBeInTheDocument();
  });

  it('renders clash type and promotion codes', () => {
    render(<ClashCard clash={makeClash()} />);
    expect(screen.getByText('FULL OVERLAP')).toBeInTheDocument();
    expect(screen.getByText('PA-001')).toBeInTheDocument();
    expect(screen.getByText('PB-002')).toBeInTheDocument();
  });

  it('shows Resolve and Dismiss buttons when not resolved', () => {
    const onResolve = vi.fn();
    const onDismiss = vi.fn();
    render(
      <ClashCard clash={makeClash()} onResolve={onResolve} onDismiss={onDismiss} />
    );
    expect(screen.getByText('Resolve')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('hides action buttons when clash is resolved', () => {
    render(
      <ClashCard
        clash={makeClash({ status: 'RESOLVED' })}
        onResolve={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.queryByText('Resolve')).not.toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. ClashStatusBadge & ClashSeverityBadge
// ═══════════════════════════════════════════════════════════════════════════

describe('ClashStatusBadge', () => {
  it.each([
    ['DETECTED', 'Detected'],
    ['REVIEWING', 'Reviewing'],
    ['RESOLVED', 'Resolved'],
    ['DISMISSED', 'Dismissed'],
  ] as const)('renders %s as "%s"', (status, label) => {
    render(<ClashStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('ClashSeverityBadge', () => {
  it.each([
    ['HIGH', 'High'],
    ['MEDIUM', 'Medium'],
    ['LOW', 'Low'],
  ] as const)('renders %s as "%s"', (severity, label) => {
    render(<ClashSeverityBadge severity={severity} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. ScenarioCard
// ═══════════════════════════════════════════════════════════════════════════

describe('ScenarioCard', () => {
  it('renders scenario name and description', () => {
    render(<ScenarioCard scenario={makeScenario()} />);
    expect(screen.getByText('Discount 15% Scenario')).toBeInTheDocument();
    expect(screen.getByText('Test scenario with 15% discount')).toBeInTheDocument();
  });

  it('renders parameter values (duration, expected lift)', () => {
    render(<ScenarioCard scenario={makeScenario()} />);
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('10% expected lift')).toBeInTheDocument();
  });

  it('renders results when scenario is completed', () => {
    const completed = makeScenario({
      status: 'COMPLETED',
      results: {
        baselineSales: 150000000,
        projectedSales: 180000000,
        incrementalSales: 30000000,
        salesLiftPercent: 20,
        promotionCost: 15000000,
        fundingRequired: 15000000,
        costPerIncrementalUnit: 5000,
        grossMargin: 45000000,
        netMargin: 30000000,
        roi: 100,
        paybackDays: 14,
        projectedUnits: 900,
        incrementalUnits: 150,
        redemptions: 450,
        dailyProjections: [],
      },
    });
    render(<ScenarioCard scenario={completed} />);
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Net Margin')).toBeInTheDocument();
    expect(screen.getByText('Sales Lift')).toBeInTheDocument();
    expect(screen.getByText('Payback')).toBeInTheDocument();
    expect(screen.getByText('14 days')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. ScenarioStatusBadge
// ═══════════════════════════════════════════════════════════════════════════

describe('ScenarioStatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['RUNNING', 'Running'],
    ['COMPLETED', 'Completed'],
    ['FAILED', 'Failed'],
  ] as const)('renders %s as "%s"', (status, label) => {
    render(<ScenarioStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. TemplateCard
// ═══════════════════════════════════════════════════════════════════════════

describe('TemplateCard', () => {
  it('renders template name, code, and type', () => {
    render(<TemplateCard template={makeTemplate()} />);
    expect(screen.getByText('Standard Discount')).toBeInTheDocument();
    expect(screen.getByText('TMPL-DISC-01')).toBeInTheDocument();
    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
  });

  it('renders description and mechanics badges', () => {
    render(<TemplateCard template={makeTemplate()} />);
    expect(screen.getByText('A basic percentage discount template')).toBeInTheDocument();
    expect(screen.getByText('PERCENTAGE')).toBeInTheDocument();
    expect(screen.getByText('Stackable')).toBeInTheDocument();
  });

  it('renders active/inactive badge and usage count', () => {
    render(<TemplateCard template={makeTemplate()} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Used 12 times')).toBeInTheDocument();
  });

  it('shows "No description" when description is absent', () => {
    render(<TemplateCard template={makeTemplate({ description: undefined })} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('shows Inactive badge when template is not active', () => {
    render(<TemplateCard template={makeTemplate({ isActive: false })} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. APIKeyCard
// ═══════════════════════════════════════════════════════════════════════════

describe('APIKeyCard', () => {
  it('renders API key name and preview', () => {
    render(<APIKeyCard apiKey={makeAPIKey()} onRevoke={vi.fn()} />);
    expect(screen.getByText('Production API Key')).toBeInTheDocument();
    expect(screen.getByText('pm_****abcd1234')).toBeInTheDocument();
  });

  it('renders permissions badges', () => {
    render(<APIKeyCard apiKey={makeAPIKey()} onRevoke={vi.fn()} />);
    expect(screen.getByText('read:promotions')).toBeInTheDocument();
    expect(screen.getByText('write:promotions')).toBeInTheDocument();
    expect(screen.getByText('read:claims')).toBeInTheDocument();
  });

  it('shows Active badge for active key', () => {
    render(<APIKeyCard apiKey={makeAPIKey()} onRevoke={vi.fn()} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Revoked badge for inactive key', () => {
    render(<APIKeyCard apiKey={makeAPIKey({ isActive: false })} onRevoke={vi.fn()} />);
    expect(screen.getByText('Revoked')).toBeInTheDocument();
  });

  it('renders usage count', () => {
    render(<APIKeyCard apiKey={makeAPIKey()} onRevoke={vi.fn()} />);
    expect(screen.getByText('1,500 requests')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. AuditLogTable
// ═══════════════════════════════════════════════════════════════════════════

describe('AuditLogTable', () => {
  it('shows empty message when no logs', () => {
    render(<AuditLogTable logs={[]} />);
    expect(screen.getByText('No audit logs found')).toBeInTheDocument();
  });

  it('renders table headers and log row data', () => {
    const logs = [makeAuditLog()];
    render(<AuditLogTable logs={logs} />);
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Entity')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.getByText('Promotion')).toBeInTheDocument();
  });

  it('hides Details column in compact mode', () => {
    const logs = [makeAuditLog()];
    render(<AuditLogTable logs={logs} compact />);
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. DMSConnectionCard
// ═══════════════════════════════════════════════════════════════════════════

describe('DMSConnectionCard', () => {
  it('renders connection name, type, and distributor', () => {
    render(
      <DMSConnectionCard
        connection={makeDMSConnection()}
        onSync={vi.fn()}
        onPush={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('Misa DMS Main')).toBeInTheDocument();
    expect(screen.getByText('CUSTOM')).toBeInTheDocument();
    expect(screen.getByText('ABC Distributor')).toBeInTheDocument();
  });

  it('renders Configure and Sync buttons', () => {
    render(
      <DMSConnectionCard
        connection={makeDMSConnection()}
        onSync={vi.fn()}
        onPush={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Sync')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();
  });

  it('shows syncing state text', () => {
    render(
      <DMSConnectionCard
        connection={makeDMSConnection()}
        onSync={vi.fn()}
        onPush={vi.fn()}
        onEdit={vi.fn()}
        isSyncing
      />
    );
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. ERPConnectionCard
// ═══════════════════════════════════════════════════════════════════════════

describe('ERPConnectionCard', () => {
  it('renders connection name and type', () => {
    render(
      <ERPConnectionCard
        connection={makeERPConnection()}
        onSync={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('SAP Production')).toBeInTheDocument();
    expect(screen.getByText('SAP')).toBeInTheDocument();
  });

  it('renders Configure and Sync Now buttons', () => {
    render(
      <ERPConnectionCard
        connection={makeERPConnection()}
        onSync={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Sync Now')).toBeInTheDocument();
  });

  it('shows syncing state text', () => {
    render(
      <ERPConnectionCard
        connection={makeERPConnection()}
        onSync={vi.fn()}
        onEdit={vi.fn()}
        isSyncing
      />
    );
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('describes cron schedule', () => {
    render(
      <ERPConnectionCard
        connection={makeERPConnection()}
        onSync={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('Every hour')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. WebhookCard
// ═══════════════════════════════════════════════════════════════════════════

describe('WebhookCard', () => {
  it('renders webhook name and URL', () => {
    render(
      <WebhookCard webhook={makeWebhook()} onTest={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByText('Order Webhook')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/webhook')).toBeInTheDocument();
  });

  it('renders active badge and event badges', () => {
    render(
      <WebhookCard webhook={makeWebhook()} onTest={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('promotion.created')).toBeInTheDocument();
    expect(screen.getByText('promotion.updated')).toBeInTheDocument();
    expect(screen.getByText('claim.submitted')).toBeInTheDocument();
  });

  it('shows Inactive badge when webhook is inactive', () => {
    render(
      <WebhookCard
        webhook={makeWebhook({ isActive: false })}
        onTest={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders Configure and Test buttons', () => {
    render(
      <WebhookCard webhook={makeWebhook()} onTest={vi.fn()} onEdit={vi.fn()} />
    );
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. IntegrationStats (IntegrationSummary, ConnectionStatusBadge, SyncStatusBadge)
// ═══════════════════════════════════════════════════════════════════════════

describe('IntegrationSummary', () => {
  it('renders all four stat cards', () => {
    render(
      <IntegrationSummary
        erpConnections={3}
        erpActive={2}
        dmsConnections={5}
        dmsActive={4}
        webhookEndpoints={8}
        webhookActive={6}
        apiKeys={10}
        apiKeysActive={7}
      />
    );
    expect(screen.getByText('ERP Connections')).toBeInTheDocument();
    expect(screen.getByText('DMS Connections')).toBeInTheDocument();
    expect(screen.getByText('Webhook Endpoints')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('renders active counts in subtitles', () => {
    render(
      <IntegrationSummary
        erpConnections={3}
        erpActive={2}
        dmsConnections={5}
        dmsActive={4}
        webhookEndpoints={8}
        webhookActive={6}
        apiKeys={10}
        apiKeysActive={7}
      />
    );
    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText('4 active')).toBeInTheDocument();
    expect(screen.getByText('6 active')).toBeInTheDocument();
    expect(screen.getByText('7 active')).toBeInTheDocument();
  });
});

describe('ConnectionStatusBadge', () => {
  it.each([
    ['ACTIVE', 'Active'],
    ['INACTIVE', 'Inactive'],
    ['ERROR', 'Error'],
  ] as const)('renders %s as "%s"', (status, label) => {
    render(<ConnectionStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('SyncStatusBadge', () => {
  it.each([
    ['PENDING', 'Pending'],
    ['RUNNING', 'Running'],
    ['COMPLETED', 'Completed'],
    ['COMPLETED_WITH_ERRORS', 'With Errors'],
    ['FAILED', 'Failed'],
  ] as const)('renders %s as "%s"', (status, label) => {
    render(<SyncStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
