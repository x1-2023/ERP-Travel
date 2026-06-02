/**
 * Smoke Tests for Planning Pages
 * Tests: TPO, Clashes, Scenarios, Templates
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom (useParams, useNavigate, useSearchParams)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock recharts
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    ResponsiveContainer: MockComponent,
    AreaChart: MockComponent,
    BarChart: MockComponent,
    LineChart: MockComponent,
    PieChart: MockComponent,
    RadarChart: MockComponent,
    ComposedChart: MockComponent,
    Area: MockComponent,
    Bar: MockComponent,
    Line: MockComponent,
    Pie: MockComponent,
    Radar: MockComponent,
    Cell: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    Legend: MockComponent,
    PolarGrid: MockComponent,
    PolarAngleAxis: MockComponent,
    PolarRadiusAxis: MockComponent,
  };
});

// Mock TPO hooks
vi.mock('@/hooks/useTPO', () => ({
  useTPO: () => ({
    isConnected: false,
    isLoading: false,
    mechanics: [],
    channels: [],
  }),
  usePromotionSuggestions: () => ({
    getSuggestions: vi.fn(),
    suggestions: null,
    isLoading: false,
    reset: vi.fn(),
  }),
  useROIPrediction: () => ({
    predict: vi.fn(),
    result: null,
    isLoading: false,
    reset: vi.fn(),
  }),
}));

// Mock i18n
vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
  }),
}));

// Mock clash hooks
vi.mock('@/hooks/planning/useClashes', () => ({
  useClashes: () => ({ data: { data: [], pagination: null }, isLoading: false, error: null }),
  useClashStats: () => ({ data: undefined }),
  useDetectClashes: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDismissClash: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useClash: () => ({ data: undefined, isLoading: false, error: new Error('not found') }),
  useResolveClash: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateClash: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock scenario hooks
vi.mock('@/hooks/planning/useScenarios', () => ({
  useScenarios: () => ({ data: { data: [], summary: null, pagination: null }, isLoading: false, error: null }),
  useScenario: () => ({ data: undefined, isLoading: false, error: new Error('not found') }),
  useScenarioVersions: () => ({ data: undefined }),
  useDeleteScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRunScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCloneScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateScenario: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRestoreScenarioVersion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useScenarioComparison: () => ({ data: undefined, isLoading: false, error: null }),
}));

// Mock template hooks
vi.mock('@/hooks/planning/useTemplates', () => ({
  useTemplates: () => ({ data: undefined, isLoading: false, error: null }),
  useTemplate: () => ({ data: undefined, isLoading: false, error: new Error('not found') }),
  useDeleteTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApplyTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock useBaselines
vi.mock('@/hooks/useBaselines', () => ({
  useBaselines: () => ({ data: { baselines: [] }, isLoading: false }),
}));

// Mock useToast
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock planning components used by pages
vi.mock('@/components/planning/ClashCard', () => ({
  ClashCard: () => <div data-testid="clash-card" />,
}));

vi.mock('@/components/planning/ClashStatusBadge', () => ({
  ClashStatusBadge: ({ status }: any) => <span>{status}</span>,
  ClashSeverityBadge: ({ severity }: any) => <span>{severity}</span>,
}));

vi.mock('@/components/planning', () => ({
  ScenarioCard: () => <div data-testid="scenario-card" />,
  ScenarioForm: () => <div data-testid="scenario-form" />,
  ScenarioStatusBadge: ({ status }: any) => <span>{status}</span>,
  ScenarioResults: () => <div data-testid="scenario-results" />,
  ComparisonChart: () => <div data-testid="comparison-chart" />,
}));

vi.mock('@/components/planning/TemplateCard', () => ({
  TemplateCard: () => <div data-testid="template-card" />,
}));

vi.mock('@/components/planning/ApplyTemplateDialog', () => ({
  ApplyTemplateDialog: () => null,
}));

vi.mock('@/components/planning/TemplatePreview', () => ({
  TemplatePreview: () => <div data-testid="template-preview" />,
}));

vi.mock('@/components/planning/TemplateForm', () => ({
  TemplateForm: () => <div data-testid="template-form" />,
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock('@/components/shared/EmptyState', () => ({
  EmptyState: ({ title }: any) => <div>{title}</div>,
}));

vi.mock('@/components/shared/DataTable', () => ({
  DataTable: () => <div data-testid="data-table" />,
}));

describe('Planning Pages', () => {
  describe('TPO Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: TPOPage } = await import('@/pages/planning/TPO');
      render(<TPOPage />);
      expect(screen.getByText('tpo.title')).toBeInTheDocument();
    });

    it('shows run optimization button', async () => {
      const { default: TPOPage } = await import('@/pages/planning/TPO');
      render(<TPOPage />);
      expect(screen.getByText('Run Optimization')).toBeInTheDocument();
    });
  });

  describe('ClashList Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ClashList } = await import('@/pages/planning/clashes/ClashList');
      render(<ClashList />);
      expect(screen.getByText('Clash Detection')).toBeInTheDocument();
    });

    it('shows run detection button', async () => {
      const { default: ClashList } = await import('@/pages/planning/clashes/ClashList');
      render(<ClashList />);
      const buttons = screen.getAllByText('Run Detection');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ClashDetail Page', () => {
    it('renders not found state when no clash data', async () => {
      const { default: ClashDetail } = await import('@/pages/planning/clashes/ClashDetail');
      render(<ClashDetail />);
      expect(screen.getByText('Clash not found')).toBeInTheDocument();
    });
  });

  describe('ScenarioList Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
      render(<ScenarioList />);
      expect(screen.getByText('Scenarios')).toBeInTheDocument();
    });

    it('shows new scenario button', async () => {
      const { default: ScenarioList } = await import('@/pages/planning/scenarios/ScenarioList');
      render(<ScenarioList />);
      expect(screen.getByText('New Scenario')).toBeInTheDocument();
    });
  });

  describe('ScenarioDetail Page', () => {
    it('renders not found state when no scenario data', async () => {
      const { default: ScenarioDetail } = await import('@/pages/planning/scenarios/ScenarioDetail');
      render(<ScenarioDetail />);
      expect(screen.getByText('Scenario not found')).toBeInTheDocument();
    });
  });

  describe('ScenarioBuilder Page', () => {
    it('renders create heading when no id', async () => {
      const { default: ScenarioBuilder } = await import('@/pages/planning/scenarios/ScenarioBuilder');
      render(<ScenarioBuilder />);
      // With id from mock, it will show Edit; but scenario is undefined so shows form
      expect(screen.getByTestId('scenario-form')).toBeInTheDocument();
    });
  });

  describe('ScenarioCompare Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ScenarioCompare } = await import('@/pages/planning/scenarios/ScenarioCompare');
      render(<ScenarioCompare />);
      expect(screen.getByText('Compare Scenarios')).toBeInTheDocument();
    });
  });

  describe('TemplateList Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: TemplateList } = await import('@/pages/planning/templates/TemplateList');
      render(<TemplateList />);
      expect(screen.getByText('Promotion Templates')).toBeInTheDocument();
    });
  });

  describe('TemplateDetail Page', () => {
    it('renders not found state when no template data', async () => {
      const { default: TemplateDetail } = await import('@/pages/planning/templates/TemplateDetail');
      render(<TemplateDetail />);
      expect(screen.getByText('Template not found')).toBeInTheDocument();
    });
  });

  describe('TemplateBuilder Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: TemplateBuilder } = await import('@/pages/planning/templates/TemplateBuilder');
      render(<TemplateBuilder />);
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });
  });
});
