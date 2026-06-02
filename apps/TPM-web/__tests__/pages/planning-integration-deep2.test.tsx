/**
 * Deep Coverage Tests for Planning + Integration Pages
 * Targets: ScenarioList, ScenarioDetail, ClashDetail, TemplateList, TemplateDetail,
 *          DMSList, ERPList, WebhookList, APIKeysList, AuditLogsList
 *
 * Strategy: Mock hooks to return data (not empty/error) so we hit rendering branches.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// ─── Mock react-router-dom ───
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-1' }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// ─── Mock useToast ───
const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// ─── Mock recharts ───
vi.mock('recharts', () => {
  const MC = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    ResponsiveContainer: MC, AreaChart: MC, BarChart: MC, LineChart: MC,
    PieChart: MC, RadarChart: MC, ComposedChart: MC,
    Area: MC, Bar: MC, Line: MC, Pie: MC, Radar: MC, Cell: MC,
    XAxis: MC, YAxis: MC, CartesianGrid: MC, Tooltip: MC, Legend: MC,
    PolarGrid: MC, PolarAngleAxis: MC, PolarRadiusAxis: MC,
  };
});

// ─── Mock planning scenario hooks with DATA ───
vi.mock('@/hooks/planning/useScenarios', () => ({
  useScenarios: () => ({
    data: {
      data: [
        {
          id: 's1',
          name: 'Summer Promo Scenario',
          status: 'COMPLETED',
          description: 'Summer promotion test',
          createdAt: '2025-06-01',
          updatedAt: '2025-06-15',
        },
        {
          id: 's2',
          name: 'Winter Promo Scenario',
          status: 'DRAFT',
          description: 'Winter promotion test',
          createdAt: '2025-12-01',
          updatedAt: '2025-12-10',
        },
      ],
      summary: {
        total: 10,
        byStatus: { DRAFT: 3, RUNNING: 2, COMPLETED: 5 },
      },
      pagination: { page: 1, totalPages: 3, total: 10 },
    },
    isLoading: false,
    error: null,
  }),
  useScenario: () => ({
    data: {
      id: 'test-1',
      name: 'Test Scenario Alpha',
      status: 'DRAFT',
      description: 'A test scenario for simulation',
      parameters: {
        duration: 30,
        budget: 500000000,
        expectedLiftPercent: 15,
        redemptionRatePercent: 8,
        promotionType: 'DISCOUNT',
        discountPercent: 20,
        startDate: '2025-07-01',
      },
      assumptions: {
        baselineSalesPerDay: 100000000,
        averageOrderValue: 250000,
        marginPercent: 35,
        cannibalizedPercent: 5,
        haloEffectPercent: 3,
      },
      results: null,
      baseline: { name: 'Q2 Baseline', code: 'BL-Q2' },
    },
    isLoading: false,
    error: null,
  }),
  useScenarioVersions: () => ({
    data: {
      data: {
        versions: [
          {
            id: 'v1',
            version: 1,
            createdAt: '2025-06-01',
            notes: 'Initial version',
            summary: { roi: 120, netMargin: 50000000, salesLiftPercent: 12 },
          },
        ],
      },
    },
  }),
  useDeleteScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRunScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCloneScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRestoreScenarioVersion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useScenarioComparison: () => ({ data: undefined, isLoading: false, error: null }),
}));

// ─── Mock clash hooks with DATA ───
vi.mock('@/hooks/planning/useClashes', () => ({
  useClashes: () => ({ data: { data: [], pagination: null }, isLoading: false, error: null }),
  useClashStats: () => ({ data: undefined }),
  useDetectClashes: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDismissClash: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useClash: () => ({
    data: {
      id: 'clash-1',
      clashType: 'TIME_OVERLAP',
      severity: 'HIGH',
      status: 'DETECTED',
      description: 'Two promotions overlap in the same period.',
      overlapStart: '2025-07-01',
      overlapEnd: '2025-07-15',
      promotionA: {
        id: 'pa1',
        name: 'Promo Alpha',
        code: 'PA-001',
        startDate: '2025-06-15',
        endDate: '2025-07-20',
        customer: { name: 'Acme Corp' },
        products: [
          { id: 'p1', code: 'SKU-001' },
          { id: 'p2', code: 'SKU-002' },
        ],
      },
      promotionB: {
        id: 'pb1',
        name: 'Promo Beta',
        code: 'PB-001',
        startDate: '2025-07-01',
        endDate: '2025-08-01',
        customer: { name: 'Beta Inc' },
        products: [
          { id: 'p3', code: 'SKU-003' },
        ],
      },
      analysis: {
        overlapDays: 15,
        budgetAtRisk: { total: 100000000, promotionA: 60000000, promotionB: 40000000 },
        overlapPercentage: { promotionA: 42, promotionB: 48 },
        recommendations: ['Adjust start date of Promo Beta', 'Consider merging promotions'],
      },
      affectedCustomers: ['cust-1', 'cust-2'],
      affectedProducts: ['prod-1', 'prod-2', 'prod-3'],
    },
    isLoading: false,
    error: null,
  }),
  useResolveClash: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateClash: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// ─── Mock template hooks with DATA ───
vi.mock('@/hooks/planning/useTemplates', () => ({
  useTemplates: () => ({
    data: {
      data: [
        {
          id: 't1',
          code: 'TPL-001',
          name: 'Discount Template',
          description: 'Standard discount template',
          type: 'DISCOUNT',
          defaultDuration: 30,
          defaultBudget: 100000000,
          usageCount: 12,
          isActive: true,
        },
        {
          id: 't2',
          code: 'TPL-002',
          name: 'Rebate Template',
          description: 'Rebate promotion template',
          type: 'REBATE',
          defaultDuration: 60,
          defaultBudget: 200000000,
          usageCount: 5,
          isActive: false,
        },
      ],
      summary: {
        total: 8,
        active: 5,
        inactive: 3,
        byType: { DISCOUNT: 3, REBATE: 2, COUPON: 3 },
      },
      pagination: { page: 1, totalPages: 1, total: 8 },
    },
    isLoading: false,
    error: null,
  }),
  useTemplate: () => ({
    data: {
      data: {
        id: 'test-1',
        code: 'TPL-DETAIL',
        name: 'Detail Template',
        description: 'A template for testing detail view',
        type: 'DISCOUNT',
        defaultDuration: 14,
        defaultBudget: 50000000,
        isActive: true,
        versions: [],
        promotions: [],
      },
    },
    isLoading: false,
    error: null,
  }),
  useDeleteTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApplyTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// ─── Mock ERP hooks with DATA ───
vi.mock('@/hooks/integration/useERP', () => ({
  useERPConnections: () => ({
    data: {
      data: [
        {
          id: 'erp-1',
          name: 'SAP Production',
          type: 'SAP',
          status: 'CONNECTED',
          lastSyncAt: '2025-06-01T12:00:00Z',
        },
      ],
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTriggerERPSync: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// ─── Mock DMS hooks with DATA ───
vi.mock('@/hooks/integration/useDMS', () => ({
  useDMSConnections: () => ({
    data: {
      data: [
        {
          id: 'dms-1',
          name: 'MISA Connection',
          type: 'MISA',
          status: 'CONNECTED',
          lastSyncAt: '2025-06-01T12:00:00Z',
        },
      ],
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTriggerDMSSync: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePushToDMS: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// ─── Mock Webhook hooks with DATA ───
vi.mock('@/hooks/integration/useWebhooks', () => ({
  useWebhooks: () => ({
    data: {
      data: [
        {
          id: 'wh-1',
          name: 'Order Webhook',
          url: 'https://example.com/hook',
          events: ['promotion.created'],
          isActive: true,
        },
      ],
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTestWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// ─── Mock Security hooks with DATA ───
vi.mock('@/hooks/integration/useSecurity', () => ({
  useAPIKeys: () => ({
    data: {
      data: [
        {
          id: 'key-1',
          name: 'Production Key',
          prefix: 'pk_live_',
          permissions: ['promotions:read'],
          isActive: true,
          createdAt: '2025-01-01',
          expiresAt: '2025-12-31',
          lastUsedAt: '2025-06-01',
        },
      ],
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useAuditLogs: () => ({
    data: {
      data: [
        {
          id: 'log-1',
          timestamp: '2025-06-01T10:00:00Z',
          user: { name: 'John Doe' },
          action: 'create',
          entityType: 'promotion',
          entityId: 'promo-1',
          description: 'Created promotion',
        },
      ],
      pagination: { page: 1, pageSize: 50, totalPages: 1, total: 1 },
    },
    isLoading: false,
  }),
  useCreateAPIKey: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRevokeAPIKey: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// ─── Mock integration types ───
vi.mock('@/types/integration', () => ({
  ERP_TYPES: ['SAP', 'ORACLE', 'DYNAMICS'],
  DMS_TYPES: ['MISA', 'FAST', 'DMS_VIET'],
  WEBHOOK_EVENTS: ['promotion.created', 'promotion.updated', 'claim.created'],
  API_PERMISSIONS: ['promotions:read', 'promotions:write', 'claims:read'],
}));

// ─── Mock planning components ───
vi.mock('@/components/planning', () => ({
  ScenarioCard: ({ scenario }: any) => (
    <div data-testid="scenario-card">{scenario.name}</div>
  ),
  ScenarioForm: () => <div data-testid="scenario-form" />,
  ScenarioStatusBadge: ({ status }: any) => <span data-testid="scenario-status">{status}</span>,
  ScenarioResults: () => <div data-testid="scenario-results" />,
  ComparisonChart: () => <div data-testid="comparison-chart" />,
}));

vi.mock('@/components/planning/ClashStatusBadge', () => ({
  ClashStatusBadge: ({ status }: any) => <span data-testid="clash-status">{status}</span>,
  ClashSeverityBadge: ({ severity }: any) => <span data-testid="clash-severity">{severity}</span>,
}));

vi.mock('@/components/planning/TemplateCard', () => ({
  TemplateCard: ({ template }: any) => (
    <div data-testid="template-card">{template.name}</div>
  ),
}));

vi.mock('@/components/planning/ApplyTemplateDialog', () => ({
  ApplyTemplateDialog: () => null,
}));

vi.mock('@/components/planning/TemplatePreview', () => ({
  TemplatePreview: () => <div data-testid="template-preview">Preview Content</div>,
}));

vi.mock('@/components/planning/TemplateForm', () => ({
  TemplateForm: () => <div data-testid="template-form">Form Content</div>,
}));

// ─── Mock integration components ───
vi.mock('@/components/integration', () => ({
  IntegrationSummary: () => <div data-testid="integration-summary" />,
  ERPConnectionCard: ({ connection }: any) => (
    <div data-testid="erp-card">{connection.name}</div>
  ),
  DMSConnectionCard: ({ connection }: any) => (
    <div data-testid="dms-card">{connection.name}</div>
  ),
  WebhookCard: ({ webhook }: any) => (
    <div data-testid="webhook-card">{webhook.name}</div>
  ),
  ConnectionStatusBadge: ({ status }: any) => <span>{status}</span>,
  SyncStatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('@/components/integration/AuditLogTable', () => ({
  AuditLogTable: ({ logs }: any) => (
    <div data-testid="audit-log-table">{logs.length} logs</div>
  ),
}));

vi.mock('@/components/integration/APIKeyCard', () => ({
  APIKeyCard: ({ apiKey }: any) => (
    <div data-testid="api-key-card">{apiKey.name}</div>
  ),
  NewAPIKeyDisplay: () => <div data-testid="new-api-key-display" />,
}));

// ─── Mock shared components ───
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/shared/EmptyState', () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      {description && <span>{description}</span>}
      {action}
    </div>
  ),
}));

vi.mock('@/components/shared/DataTable', () => ({
  DataTable: () => <div data-testid="data-table">Table Content</div>,
}));

// ─── Mock Select to avoid Radix issues ───
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

// ─── Mock Dialog components ───
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

// ─── Mock AlertDialog ───
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

// ─── Mock Tabs ───
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value }: any) => <div data-testid="tabs" data-value={value}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

// ─── Mock RadioGroup ───
vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children }: any) => <div data-testid="radio-group">{children}</div>,
  RadioGroupItem: ({ value }: any) => <input type="radio" value={value} readOnly />,
}));

// ─── Mock Checkbox ───
vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id, checked }: any) => (
    <input type="checkbox" id={id} checked={checked || false} readOnly data-testid={`checkbox-${id}`} />
  ),
}));

// ─── Mock CurrencyDisplay ───
vi.mock('@/components/ui/currency-display', () => ({
  CurrencyDisplay: ({ amount }: any) => <span data-testid="currency">{amount != null ? amount : '-'}</span>,
}));

// ─── Mock i18n ───
vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
  }),
}));

// ===================== TESTS =====================

describe('ScenarioList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByText('Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Create and compare promotion scenarios')).toBeInTheDocument();
  });

  it('shows summary stat cards with data', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByText('Total Scenarios')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    // "Draft" appears in stat card title and in status filter SelectItem
    expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('3')).toBeInTheDocument();
    // "Running" also appears in stat and filter
    expect(screen.getAllByText('Running').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2')).toBeInTheDocument();
    // "Completed" also appears in stat and filter
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders scenario cards for each scenario', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByText('Summer Promo Scenario')).toBeInTheDocument();
    expect(screen.getByText('Winter Promo Scenario')).toBeInTheDocument();
  });

  it('shows New Scenario button', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByText('New Scenario')).toBeInTheDocument();
  });

  it('shows Compare Mode button', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByText('Compare Mode')).toBeInTheDocument();
  });

  it('shows pagination controls', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('shows search placeholder', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    render(<ScenarioList />);
    expect(screen.getByPlaceholderText('Search scenarios...')).toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
    const { container } = render(<ScenarioList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('ScenarioDetail Page (deep)', () => {
  it('renders scenario name and description', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByText('Test Scenario Alpha')).toBeInTheDocument();
    expect(screen.getByText('A test scenario for simulation')).toBeInTheDocument();
  });

  it('renders status badge', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByTestId('scenario-status')).toHaveTextContent('DRAFT');
  });

  it('shows parameter summary cards (Duration, Budget, Expected Lift, Redemption Rate)', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    // "Duration" appears in summary card and parameters tab
    expect(screen.getAllByText('Duration').length).toBeGreaterThanOrEqual(1);
    // "30 days" appears in summary card and parameters tab
    expect(screen.getAllByText('30 days').length).toBeGreaterThanOrEqual(1);
    // "Budget" appears in summary card and parameters tab
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1);
    // "Expected Lift" appears in summary card and parameters tab
    expect(screen.getAllByText('Expected Lift').length).toBeGreaterThanOrEqual(1);
    // "15%" appears in summary card and parameters tab
    expect(screen.getAllByText('15%').length).toBeGreaterThanOrEqual(1);
    // "Redemption Rate" appears in summary card and parameters tab
    expect(screen.getAllByText('Redemption Rate').length).toBeGreaterThanOrEqual(1);
    // "8%" appears in summary card and parameters tab
    expect(screen.getAllByText('8%').length).toBeGreaterThanOrEqual(1);
  });

  it('shows action buttons (Run, Edit, Clone, Delete)', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getAllByText('Run Simulation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Clone')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows tabs: Results, Parameters, Assumptions, Versions', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByTestId('tab-results')).toBeInTheDocument();
    expect(screen.getByTestId('tab-parameters')).toBeInTheDocument();
    expect(screen.getByTestId('tab-assumptions')).toBeInTheDocument();
    expect(screen.getByTestId('tab-versions')).toBeInTheDocument();
  });

  it('shows No Results Yet in results tab (no results)', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByText('No Results Yet')).toBeInTheDocument();
    expect(screen.getByText('Run the simulation to see results.')).toBeInTheDocument();
  });

  it('renders parameters tab content: Promotion Parameters', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByText('Promotion Parameters')).toBeInTheDocument();
    expect(screen.getByText('Promotion Type')).toBeInTheDocument();
    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
    expect(screen.getByText('Discount %')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('2025-07-01')).toBeInTheDocument();
  });

  it('renders assumptions tab content: Business Assumptions', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByText('Business Assumptions')).toBeInTheDocument();
    expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
    expect(screen.getByText('Margin %')).toBeInTheDocument();
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(screen.getByText('Cannibalization %')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('Halo Effect %')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
  });

  it('renders version history tab content', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Initial version')).toBeInTheDocument();
    expect(screen.getByText('ROI: 120%')).toBeInTheDocument();
    expect(screen.getByText('Lift: 12%')).toBeInTheDocument();
    expect(screen.getByText('Restore')).toBeInTheDocument();
  });

  it('renders baseline reference', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    render(<ScenarioDetail />);
    expect(screen.getByText('Baseline Reference')).toBeInTheDocument();
    expect(screen.getByText(/Q2 Baseline/)).toBeInTheDocument();
    expect(screen.getByText(/BL-Q2/)).toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
    const { container } = render(<ScenarioDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('ClashDetail Page (deep)', () => {
  it('renders clash type heading', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('TIME OVERLAP')).toBeInTheDocument();
  });

  it('renders severity and status badges', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByTestId('clash-severity')).toHaveTextContent('HIGH');
    expect(screen.getByTestId('clash-status')).toHaveTextContent('DETECTED');
  });

  it('renders clash description', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('Two promotions overlap in the same period.')).toBeInTheDocument();
  });

  it('shows Promotion A and Promotion B cards', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('Promotion A')).toBeInTheDocument();
    expect(screen.getByText('Promo Alpha')).toBeInTheDocument();
    expect(screen.getByText('PA-001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Promotion B')).toBeInTheDocument();
    expect(screen.getByText('Promo Beta')).toBeInTheDocument();
    expect(screen.getByText('PB-001')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
  });

  it('shows product codes on promotion cards', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('SKU-002')).toBeInTheDocument();
    expect(screen.getByText('SKU-003')).toBeInTheDocument();
  });

  it('shows Overlap Analysis section with details', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('Overlap Analysis')).toBeInTheDocument();
    expect(screen.getByText('Overlap Period')).toBeInTheDocument();
    expect(screen.getByText('15 days')).toBeInTheDocument();
    expect(screen.getByText('Budget at Risk')).toBeInTheDocument();
    expect(screen.getByText('Overlap % (A)')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('Overlap % (B)')).toBeInTheDocument();
    expect(screen.getByText('48%')).toBeInTheDocument();
  });

  it('shows affected customers and products', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText(/Affected Customers/)).toBeInTheDocument();
    expect(screen.getByText('cust-1')).toBeInTheDocument();
    expect(screen.getByText('cust-2')).toBeInTheDocument();
    expect(screen.getByText(/Affected Products/)).toBeInTheDocument();
    expect(screen.getByText('prod-1')).toBeInTheDocument();
  });

  it('shows Recommendations', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Adjust start date of Promo Beta')).toBeInTheDocument();
    expect(screen.getByText('Consider merging promotions')).toBeInTheDocument();
  });

  it('shows action buttons (Start Review, Resolve) when DETECTED', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    render(<ClashDetail />);
    expect(screen.getByText('Start Review')).toBeInTheDocument();
    expect(screen.getByText('Resolve')).toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
    const { container } = render(<ClashDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('TemplateList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
    render(<TemplateList />);
    expect(screen.getByText('Promotion Templates')).toBeInTheDocument();
    expect(screen.getByText('Reusable templates for creating promotions quickly')).toBeInTheDocument();
  });

  it('shows Create Template button', async () => {
    const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
    render(<TemplateList />);
    expect(screen.getByText('Create Template')).toBeInTheDocument();
  });

  it('shows summary stats: Total, Active, Inactive, By Type', async () => {
    const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
    render(<TemplateList />);
    expect(screen.getByText('Total Templates')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    // "Active" appears in stat card title and status filter
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('5')).toBeInTheDocument();
    // "Inactive" appears in stat card title and status filter
    expect(screen.getAllByText('Inactive').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('By Type')).toBeInTheDocument();
  });

  it('shows template cards in grid mode', async () => {
    const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
    render(<TemplateList />);
    expect(screen.getByText('Discount Template')).toBeInTheDocument();
    expect(screen.getByText('Rebate Template')).toBeInTheDocument();
  });

  it('shows search input', async () => {
    const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
    render(<TemplateList />);
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
    const { container } = render(<TemplateList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('TemplateDetail Page (deep)', () => {
  it('renders template name and code', async () => {
    const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
    render(<TemplateDetail />);
    expect(screen.getByText('Detail Template')).toBeInTheDocument();
    expect(screen.getByText('TPL-DETAIL')).toBeInTheDocument();
  });

  it('shows Edit, Apply Template, Delete buttons', async () => {
    const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
    render(<TemplateDetail />);
    // "Edit" appears in both button and tab trigger
    expect(screen.getAllByText('Edit').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Apply Template')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows tabs: Preview, Edit', async () => {
    const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
    render(<TemplateDetail />);
    expect(screen.getByTestId('tab-preview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-edit')).toBeInTheDocument();
  });

  it('renders preview content from TemplatePreview component', async () => {
    const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
    render(<TemplateDetail />);
    expect(screen.getByText('Preview Content')).toBeInTheDocument();
  });

  it('renders form content from TemplateForm component', async () => {
    const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
    render(<TemplateDetail />);
    expect(screen.getByText('Form Content')).toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
    const { container } = render(<TemplateDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('DMSList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: DMSList } = await import('@/pages/integration/dms/DMSList');
    render(<DMSList />);
    expect(screen.getByText('DMS Connections')).toBeInTheDocument();
    expect(screen.getByText('Manage connections to Distributor Management Systems')).toBeInTheDocument();
  });

  it('shows Refresh and Add Connection buttons', async () => {
    const { default: DMSList } = await import('@/pages/integration/dms/DMSList');
    render(<DMSList />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Add Connection')).toBeInTheDocument();
  });

  it('renders connection cards when data present', async () => {
    const { default: DMSList } = await import('@/pages/integration/dms/DMSList');
    render(<DMSList />);
    expect(screen.getByText('MISA Connection')).toBeInTheDocument();
  });

  it('does not show empty state when connections exist', async () => {
    const { default: DMSList } = await import('@/pages/integration/dms/DMSList');
    render(<DMSList />);
    expect(screen.queryByText('No DMS Connections')).not.toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: DMSList } = await import('@/pages/integration/dms/DMSList');
    const { container } = render(<DMSList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('ERPList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: ERPList } = await import('@/pages/integration/erp/ERPList');
    render(<ERPList />);
    expect(screen.getByText('ERP Connections')).toBeInTheDocument();
    expect(screen.getByText('Manage connections to SAP, Oracle, and other ERP systems')).toBeInTheDocument();
  });

  it('shows Refresh and Add Connection buttons', async () => {
    const { default: ERPList } = await import('@/pages/integration/erp/ERPList');
    render(<ERPList />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Add Connection')).toBeInTheDocument();
  });

  it('renders connection cards when data present', async () => {
    const { default: ERPList } = await import('@/pages/integration/erp/ERPList');
    render(<ERPList />);
    expect(screen.getByText('SAP Production')).toBeInTheDocument();
  });

  it('does not show empty state when connections exist', async () => {
    const { default: ERPList } = await import('@/pages/integration/erp/ERPList');
    render(<ERPList />);
    expect(screen.queryByText('No ERP Connections')).not.toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: ERPList } = await import('@/pages/integration/erp/ERPList');
    const { container } = render(<ERPList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('WebhookList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: WebhookList } = await import('@/pages/integration/webhooks/WebhookList');
    render(<WebhookList />);
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
    expect(screen.getByText('Receive real-time notifications for system events')).toBeInTheDocument();
  });

  it('shows Refresh and Add Webhook buttons', async () => {
    const { default: WebhookList } = await import('@/pages/integration/webhooks/WebhookList');
    render(<WebhookList />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Add Webhook')).toBeInTheDocument();
  });

  it('renders webhook cards when data present', async () => {
    const { default: WebhookList } = await import('@/pages/integration/webhooks/WebhookList');
    render(<WebhookList />);
    expect(screen.getByText('Order Webhook')).toBeInTheDocument();
  });

  it('does not show empty state when webhooks exist', async () => {
    const { default: WebhookList } = await import('@/pages/integration/webhooks/WebhookList');
    render(<WebhookList />);
    expect(screen.queryByText('No Webhooks')).not.toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: WebhookList } = await import('@/pages/integration/webhooks/WebhookList');
    const { container } = render(<WebhookList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('APIKeysList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: APIKeysList } = await import('@/pages/integration/security/APIKeysList');
    render(<APIKeysList />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Manage API keys for external access')).toBeInTheDocument();
  });

  it('shows Create Key button', async () => {
    const { default: APIKeysList } = await import('@/pages/integration/security/APIKeysList');
    render(<APIKeysList />);
    expect(screen.getByText('Create Key')).toBeInTheDocument();
  });

  it('renders API key cards when data present', async () => {
    const { default: APIKeysList } = await import('@/pages/integration/security/APIKeysList');
    render(<APIKeysList />);
    expect(screen.getByText('Production Key')).toBeInTheDocument();
  });

  it('does not show empty state when keys exist', async () => {
    const { default: APIKeysList } = await import('@/pages/integration/security/APIKeysList');
    render(<APIKeysList />);
    expect(screen.queryByText('No API Keys')).not.toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: APIKeysList } = await import('@/pages/integration/security/APIKeysList');
    const { container } = render(<APIKeysList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

describe('AuditLogsList Page (deep)', () => {
  it('renders heading and description', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Complete history of system changes and user actions')).toBeInTheDocument();
  });

  it('shows Export CSV button', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('shows Filters section', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders audit log table when data present', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByTestId('audit-log-table')).toBeInTheDocument();
    expect(screen.getByText('1 logs')).toBeInTheDocument();
  });

  it('does not show empty state when logs exist', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.queryByText('No Audit Logs')).not.toBeInTheDocument();
  });

  it('shows page size filter options', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByText('25 per page')).toBeInTheDocument();
    expect(screen.getByText('50 per page')).toBeInTheDocument();
    expect(screen.getByText('100 per page')).toBeInTheDocument();
  });

  it('shows action filter options', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByText('All Actions')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows entity filter options', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    render(<AuditLogsList />);
    expect(screen.getByText('All Entities')).toBeInTheDocument();
    expect(screen.getByText('Promotion')).toBeInTheDocument();
    expect(screen.getByText('Claim')).toBeInTheDocument();
  });

  it('does not contain NaN', async () => {
    const { default: AuditLogsList } = await import('@/pages/integration/security/AuditLogsList');
    const { container } = render(<AuditLogsList />);
    expect(container.textContent).not.toContain('NaN');
  });
});
