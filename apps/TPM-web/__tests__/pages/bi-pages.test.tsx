/**
 * Smoke Tests for BI Pages
 * Tests: BIDashboard, AnalyticsDashboard, ExportCenter, ReportBuilder
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

// Mock BI hooks
vi.mock('@/hooks/bi', () => ({
  useDashboard: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useTrends: () => ({ data: undefined, isLoading: false }),
  useExport: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReports: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useCreateReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExecuteReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock useToast
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock BI components
vi.mock('@/components/bi', () => ({
  ChartWidget: () => <div data-testid="chart-widget" />,
  ExportButton: () => <button data-testid="export-button">Export</button>,
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

// Mock types/advanced
vi.mock('@/types/advanced', () => ({
  REPORT_TYPES: ['TABLE', 'CHART', 'SUMMARY'],
  DATA_SOURCES: ['PROMOTIONS', 'CLAIMS', 'CUSTOMERS'],
  CHART_TYPES: ['BAR', 'LINE', 'PIE'],
}));

describe('BI Pages', () => {
  describe('BIDashboard', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: BIDashboard } = await import('@/pages/bi/BIDashboard');
      render(<BIDashboard />);
      expect(screen.getByText('Business Intelligence')).toBeInTheDocument();
    });

    it('shows fallback KPI cards', async () => {
      const { default: BIDashboard } = await import('@/pages/bi/BIDashboard');
      render(<BIDashboard />);
      expect(screen.getByText('Total Promotions')).toBeInTheDocument();
      expect(screen.getByText('Active Budget')).toBeInTheDocument();
    });

    it('shows quick reports section', async () => {
      const { default: BIDashboard } = await import('@/pages/bi/BIDashboard');
      render(<BIDashboard />);
      expect(screen.getByText('Quick Reports')).toBeInTheDocument();
    });
  });

  describe('AnalyticsDashboard', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: AnalyticsDashboard } = await import('@/pages/bi/AnalyticsDashboard');
      render(<AnalyticsDashboard />);
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('shows refresh button', async () => {
      const { default: AnalyticsDashboard } = await import('@/pages/bi/AnalyticsDashboard');
      render(<AnalyticsDashboard />);
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  describe('ExportCenter', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ExportCenter } = await import('@/pages/bi/ExportCenter');
      render(<ExportCenter />);
      expect(screen.getByText('Export Center')).toBeInTheDocument();
    });

    it('shows export type options', async () => {
      const { default: ExportCenter } = await import('@/pages/bi/ExportCenter');
      render(<ExportCenter />);
      expect(screen.getByText('Promotions')).toBeInTheDocument();
      expect(screen.getByText('Claims')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });

    it('shows column selection', async () => {
      const { default: ExportCenter } = await import('@/pages/bi/ExportCenter');
      render(<ExportCenter />);
      expect(screen.getByText('Select Columns')).toBeInTheDocument();
    });
  });

  describe('ReportBuilder', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ReportBuilder } = await import('@/pages/bi/ReportBuilder');
      render(<ReportBuilder />);
      expect(screen.getByText('Report Builder')).toBeInTheDocument();
    });

    it('shows empty state when no reports', async () => {
      const { default: ReportBuilder } = await import('@/pages/bi/ReportBuilder');
      render(<ReportBuilder />);
      expect(screen.getByText('No Reports')).toBeInTheDocument();
    });

    it('shows new report button', async () => {
      const { default: ReportBuilder } = await import('@/pages/bi/ReportBuilder');
      render(<ReportBuilder />);
      expect(screen.getByText('New Report')).toBeInTheDocument();
    });
  });
});
