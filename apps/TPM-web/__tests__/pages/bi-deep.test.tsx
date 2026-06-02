/**
 * Deep Tests for BI Pages
 * Covers: BIDashboard (date range, KPI cards, quick reports, navigation cards),
 *         AnalyticsDashboard (metric selection, date filters, comparison cards),
 *         ExportCenter (type selection, column toggle, format selection),
 *         ReportBuilder (new report dialog, empty state)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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
const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock BI components
vi.mock('@/components/bi', () => ({
  ChartWidget: ({ type }: any) => <div data-testid={`chart-widget-${type}`} />,
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

import BIDashboard from '@/pages/bi/BIDashboard';
import AnalyticsDashboard from '@/pages/bi/AnalyticsDashboard';
import ExportCenter from '@/pages/bi/ExportCenter';
import ReportBuilder from '@/pages/bi/ReportBuilder';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// BI DASHBOARD DEEP TESTS
// ============================================================================

describe('BIDashboard - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Business Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Analytics, reports, and insights')).toBeInTheDocument();
  });

  it('renders fallback KPI cards when no data', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Total Promotions')).toBeInTheDocument();
    expect(screen.getByText('Active Budget')).toBeInTheDocument();
    expect(screen.getByText('Claims Processed')).toBeInTheDocument();
    expect(screen.getByText('Avg ROI')).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    render(<BIDashboard />);
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('renders Reports button', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders quick reports section with all four reports', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Quick Reports')).toBeInTheDocument();
    expect(screen.getByText('Promotion Summary')).toBeInTheDocument();
    expect(screen.getByText('Claim Analysis')).toBeInTheDocument();
    expect(screen.getByText('Customer Performance')).toBeInTheDocument();
    expect(screen.getByText('ROI Report')).toBeInTheDocument();
  });

  it('renders navigation cards', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Report Builder')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Export Center')).toBeInTheDocument();
  });

  it('navigates to reports when quick report is clicked', () => {
    render(<BIDashboard />);
    fireEvent.click(screen.getByText('Promotion Summary'));
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports?preset=promotion-summary');
  });

  it('navigates to analytics when card is clicked', () => {
    render(<BIDashboard />);
    // Click the card that has text "Analytics" and "Deep dive into data"
    const analyticsCard = screen.getByText('Deep dive into data').closest('[class*="cursor-pointer"]');
    if (analyticsCard) fireEvent.click(analyticsCard);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/analytics');
  });

  it('renders fallback charts', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Promotions by Type')).toBeInTheDocument();
    expect(screen.getByText('Monthly Spend')).toBeInTheDocument();
  });

  it('renders chart widgets with correct types', () => {
    render(<BIDashboard />);
    expect(screen.getByTestId('chart-widget-PIE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-widget-BAR')).toBeInTheDocument();
  });
});

// ============================================================================
// ANALYTICS DASHBOARD DEEP TESTS
// ============================================================================

describe('AnalyticsDashboard - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Deep dive into your data')).toBeInTheDocument();
  });

  it('renders Refresh button', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('renders metric selector', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByLabelText('Metric')).toBeInTheDocument();
  });

  it('renders fallback stat cards when no data', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Total Promotions')).toBeInTheDocument();
    expect(screen.getByText('Claims Processed')).toBeInTheDocument();
    expect(screen.getByText('Avg ROI')).toBeInTheDocument();
  });

  it('renders period comparison section', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Period Comparison')).toBeInTheDocument();
    expect(screen.getByText('This Period')).toBeInTheDocument();
    expect(screen.getByText('Previous Period')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
    expect(screen.getByText('+12.2%')).toBeInTheDocument();
  });

  it('renders top performers section', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Top Performers')).toBeInTheDocument();
    expect(screen.getByText('Discount Promotions')).toBeInTheDocument();
    expect(screen.getByText('Customer ABC Corp')).toBeInTheDocument();
    expect(screen.getByText('Product Category A')).toBeInTheDocument();
  });

  it('renders breakdown charts', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('By Promotion Type')).toBeInTheDocument();
    expect(screen.getByText('By Region')).toBeInTheDocument();
  });

  it('shows Promotions Trend heading by default', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Promotions Trend')).toBeInTheDocument();
    expect(screen.getByText('Performance over the selected period')).toBeInTheDocument();
  });
});

// ============================================================================
// EXPORT CENTER DEEP TESTS
// ============================================================================

describe('ExportCenter - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Export Center')).toBeInTheDocument();
    expect(screen.getByText('Download data in various formats')).toBeInTheDocument();
  });

  it('renders all four export type options', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Claims')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders export type descriptions', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Export all promotions with status, budget, and metrics')).toBeInTheDocument();
    expect(screen.getByText('Export claims with approval status and amounts')).toBeInTheDocument();
  });

  it('renders column selection section', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Select Columns')).toBeInTheDocument();
    expect(screen.getByText('Choose which columns to include in the export')).toBeInTheDocument();
  });

  it('renders Select All and Clear All buttons', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('renders export options card', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Export Options')).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    render(<ExportCenter />);
    expect(screen.getByLabelText('From Date')).toBeInTheDocument();
    expect(screen.getByLabelText('To Date')).toBeInTheDocument();
  });

  it('renders format selector', () => {
    render(<ExportCenter />);
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
  });

  it('renders Export PROMOTIONS button by default', () => {
    render(<ExportCenter />);
    expect(screen.getByText('Export PROMOTIONS')).toBeInTheDocument();
  });

  it('renders column checkboxes for promotions', () => {
    render(<ExportCenter />);
    // Promotions columns: Code, Name, Type, Status, Budget, Spent Amount, Start Date, End Date, Customer
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  it('switches columns when export type changes', () => {
    render(<ExportCenter />);
    // Click on Claims card
    const claimsCard = screen.getByText('Export claims with approval status and amounts').closest('[class*="cursor-pointer"]');
    if (claimsCard) fireEvent.click(claimsCard);

    // Should now show Claims columns
    expect(screen.getByText('Submitted At')).toBeInTheDocument();
    expect(screen.getByText('Approved At')).toBeInTheDocument();
  });
});

// ============================================================================
// REPORT BUILDER DEEP TESTS
// ============================================================================

describe('ReportBuilder - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('Report Builder')).toBeInTheDocument();
    expect(screen.getByText('Create and manage custom reports')).toBeInTheDocument();
  });

  it('renders New Report button', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('New Report')).toBeInTheDocument();
  });

  it('renders empty state when no reports', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('No Reports')).toBeInTheDocument();
    expect(screen.getByText('Create your first custom report')).toBeInTheDocument();
    expect(screen.getByText('Create Report')).toBeInTheDocument();
  });

  it('opens new report dialog when button clicked', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    // Dialog opens with the title "Create Report" (may already exist in empty state)
    expect(screen.getAllByText('Create Report').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Configure your custom report')).toBeInTheDocument();
  });

  it('dialog has form fields', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByLabelText('Report Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Report Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Data Source')).toBeInTheDocument();
  });

  it('dialog has Cancel button', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('allows typing report name in dialog', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    const nameInput = screen.getByLabelText('Report Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Report' } });
    expect(nameInput.value).toBe('My Report');
  });

  it('has correct placeholders in dialog', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByPlaceholderText('Monthly Sales Report')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional description')).toBeInTheDocument();
  });
});
