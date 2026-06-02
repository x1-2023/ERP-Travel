/**
 * Smoke Tests for Misc Pages
 * Tests: Analytics, ReportList, WeeklyKPI, Settings, CalendarView,
 *        BaselineList, BaselineNew, Alerts, LiveDashboard, VoiceCommandCenter
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock chart components
vi.mock('@/components/charts/LineChart', () => ({
  LineChart: () => <div data-testid="line-chart" />,
}));

vi.mock('@/components/charts/BarChart', () => ({
  BarChart: () => <div data-testid="bar-chart" />,
}));

vi.mock('@/components/charts/PieChart', () => ({
  PieChart: () => <div data-testid="pie-chart" />,
}));

vi.mock('@/components/charts/AreaChart', () => ({
  AreaChart: () => <div data-testid="area-chart" />,
}));

// Mock recharts (for pages that use it directly)
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    ResponsiveContainer: MockComponent,
    AreaChart: MockComponent,
    BarChart: MockComponent,
    LineChart: MockComponent,
    PieChart: MockComponent,
    ComposedChart: MockComponent,
    Area: MockComponent,
    Bar: MockComponent,
    Line: MockComponent,
    Pie: MockComponent,
    Cell: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    Legend: MockComponent,
  };
});

// Mock hooks
vi.mock('@/hooks/useBaselines', () => ({
  useBaselines: () => ({ data: undefined, isLoading: false }),
  useCreateBaseline: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useLiveMonitoring', () => ({
  useMonitoringDashboard: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/voice', () => ({
  useProcessCommand: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCommandHistory: () => ({ data: undefined, isLoading: false }),
  useVoiceSuggestions: () => ({ data: undefined }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock stores
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ user: { name: 'Test', email: 'test@test.com' } }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({ theme: 'light' }),
}));

// Mock shared components
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock('@/components/shared/page-header', () => ({
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}));

vi.mock('@/components/shared/DataTable', () => ({
  DataTable: () => <div data-testid="data-table" />,
}));

vi.mock('@/components/shared/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

// Mock monitoring components
vi.mock('@/components/monitoring/AlertBanner', () => ({
  default: () => <div data-testid="alert-banner" />,
}));

// Mock voice components
vi.mock('@/components/voice', () => ({
  VoiceButton: () => <div data-testid="voice-button" />,
  VoiceTranscript: () => <div data-testid="voice-transcript" />,
  VoiceCommandList: () => <div data-testid="voice-command-list" />,
  VoiceFeedback: () => <div data-testid="voice-feedback" />,
}));

// Mock types/advanced
vi.mock('@/types/advanced', () => ({
  VOICE_COMMAND_EXAMPLES: [],
}));

// Mock date-fns for WeeklyKPI
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
  };
});

describe('Misc Pages', () => {
  describe('Analytics Page', () => {
    it('renders without crashing', async () => {
      const { default: Analytics } = await import('@/pages/analytics/Analytics');
      render(<Analytics />);
      // Analytics page uses demo data, should render
      expect(document.body).toBeTruthy();
    });
  });

  describe('ReportList Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ReportList } = await import('@/pages/reports/ReportList');
      render(<ReportList />);
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('shows report cards', async () => {
      const { default: ReportList } = await import('@/pages/reports/ReportList');
      render(<ReportList />);
      expect(screen.getByText('Weekly KPI')).toBeInTheDocument();
      expect(screen.getByText('Budget Analysis')).toBeInTheDocument();
      expect(screen.getByText('Claim Summary')).toBeInTheDocument();
    });
  });

  describe('WeeklyKPI Page', () => {
    it('renders without crashing', async () => {
      const { default: WeeklyKPI } = await import('@/pages/reports/WeeklyKPI');
      render(<WeeklyKPI />);
      // WeeklyKPI uses demo data
      expect(document.body).toBeTruthy();
    });
  });

  describe('Settings Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: Settings } = await import('@/pages/settings/Settings');
      render(<Settings />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('shows appearance section', async () => {
      const { default: Settings } = await import('@/pages/settings/Settings');
      render(<Settings />);
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });
  });

  describe('CalendarView Page', () => {
    it('renders without crashing', async () => {
      const { default: CalendarView } = await import('@/pages/calendar/CalendarView');
      render(<CalendarView />);
      // CalendarView uses demo data
      expect(document.body).toBeTruthy();
    });
  });

  describe('BaselineList Page', () => {
    it('renders without crashing', async () => {
      const { default: BaselineList } = await import('@/pages/baselines/BaselineList');
      render(<BaselineList />);
      // BaselineList uses demo data fallback
      expect(document.body).toBeTruthy();
    });
  });

  describe('BaselineNew Page', () => {
    it('renders without crashing', async () => {
      const { default: BaselineNew } = await import('@/pages/baselines/BaselineNew');
      render(<BaselineNew />);
      expect(document.body).toBeTruthy();
    });
  });

  describe('Alerts Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: Alerts } = await import('@/pages/monitoring/Alerts');
      render(<Alerts />);
      expect(screen.getByText('Alert Management')).toBeInTheDocument();
    });
  });

  describe('LiveDashboard Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: LiveDashboard } = await import('@/pages/monitoring/LiveDashboard');
      render(<LiveDashboard />);
      expect(screen.getByText('Live Monitoring')).toBeInTheDocument();
    });
  });

  describe('VoiceCommandCenter Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: VoiceCommandCenter } = await import('@/pages/voice/VoiceCommandCenter');
      render(<VoiceCommandCenter />);
      expect(screen.getByText('Voice Commands')).toBeInTheDocument();
    });
  });
});
