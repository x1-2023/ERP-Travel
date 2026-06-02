/**
 * Deep Coverage Tests for AI, Operations, Targets, Contracts, Baselines pages
 * Covers:
 *   - RecommendationsList (empty state, filters, generate button, reject dialog)
 *   - InsightsList (heading, filters, generate button, description, empty insight feed)
 *   - BIDashboard (date range, KPI fallbacks, quick reports, nav cards, charts)
 *   - ReportBuilder (empty state, new report dialog, form fields)
 *   - InventoryImport (heading, upload section, CSV format guide table)
 *   - SellTrackingImport (heading, upload section, CSV format guide table)
 *   - TargetList (demo data, summary cards, filters)
 *   - TargetNew (form fields, placeholders, submit)
 *   - ContractCreate (form fields, labels, submit button)
 *   - BaselineList (demo data, summary cards, filters)
 *   - BaselineNew (form fields, labels, submit button)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
    useParams: () => ({ id: 'test-1' }),
  };
});

// Mock recharts
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    ResponsiveContainer: MockComponent,
    BarChart: MockComponent,
    LineChart: MockComponent,
    PieChart: MockComponent,
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

// --- AI Insight hooks ---
const mockGenerateInsights = vi.fn();
vi.mock('@/hooks/ai/useInsights', () => ({
  useInsights: () => ({ data: { data: [], summary: undefined, pagination: undefined }, isLoading: false, refetch: vi.fn() }),
  useGenerateInsights: () => ({ mutateAsync: mockGenerateInsights, isPending: false }),
  useDismissInsight: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTakeInsightAction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- AI Recommendation hooks ---
const mockGenerateRecommendations = vi.fn();
vi.mock('@/hooks/ai/useRecommendations', () => ({
  useRecommendations: () => ({ data: { data: [], summary: undefined, pagination: undefined }, isLoading: false, refetch: vi.fn() }),
  useGenerateRecommendations: () => ({ mutateAsync: mockGenerateRecommendations, isPending: false }),
  useAcceptRecommendation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectRecommendation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- BI hooks ---
vi.mock('@/hooks/bi', () => ({
  useDashboard: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useTrends: () => ({ data: undefined, isLoading: false }),
  useExport: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReports: () => ({ data: { data: [] }, isLoading: false, refetch: vi.fn() }),
  useCreateReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExecuteReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Operations hooks ---
vi.mock('@/hooks/operations', () => ({
  useInventoryList: () => ({ data: undefined, isLoading: false }),
  useInventorySummary: () => ({ data: undefined }),
  useInventorySnapshot: () => ({ data: undefined, isLoading: false }),
  useDeleteInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useInventoryHistory: () => ({ data: undefined }),
  useCreateInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportInventory: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSellTrackingList: () => ({ data: undefined, isLoading: false }),
  useSellTrackingSummary: () => ({ data: undefined }),
  useCreateSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Target hooks ---
const mockCreateTargetMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useTargets', () => ({
  useTargets: () => ({ data: undefined, isLoading: false }),
  useCreateTarget: () => ({ mutateAsync: mockCreateTargetMutateAsync, isPending: false }),
  useTargetProgress: () => ({ data: undefined, isLoading: false }),
}));

// --- Baseline hooks ---
const mockCreateBaselineMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useBaselines', () => ({
  useBaselines: () => ({ data: undefined, isLoading: false }),
  useCreateBaseline: () => ({ mutateAsync: mockCreateBaselineMutateAsync, isPending: false }),
}));

// --- Contract hooks ---
const mockCreateContractMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useVolumeContracts', () => ({
  useVolumeContracts: () => ({ data: undefined, isLoading: false }),
  useContractDashboard: () => ({ data: undefined, isLoading: false }),
  useVolumeContract: () => ({ data: undefined, isLoading: false }),
  useGapAnalysis: () => ({ data: undefined, isLoading: false }),
  useAchieveMilestone: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateVolumeContract: () => ({ mutateAsync: mockCreateContractMutateAsync, isPending: false }),
}));

// --- useToast ---
const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// --- Mock hooks used by geographic/allocation ---
vi.mock('@/hooks', () => ({
  useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
  useTargetAllocationTree: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  getMetricLabel: (key: string) => key,
}));

// --- AI components ---
vi.mock('@/components/ai', () => ({
  InsightFeed: ({ insights }: any) => <div data-testid="insight-feed">{insights?.length || 0} insights</div>,
  RecommendationCard: () => <div data-testid="recommendation-card" />,
  AnomalyAlert: () => <div data-testid="anomaly-alert" />,
}));

// --- BI components ---
vi.mock('@/components/bi', () => ({
  ChartWidget: ({ type }: any) => <div data-testid={`chart-widget-${type}`} />,
  ExportButton: () => <button data-testid="export-button">Export</button>,
}));

// --- Shared components ---
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock('@/components/shared/page-header', () => ({
  PageHeader: ({ title, description, actions }: any) => (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {actions && <div>{actions}</div>}
    </div>
  ),
}));

vi.mock('@/components/shared/DataTable', () => ({
  DataTable: ({ data }: any) => (
    <div data-testid="data-table">
      {data?.map((item: any, i: number) => (
        <div key={i} data-testid={`row-${i}`}>{item.code} - {item.name}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/shared/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

// --- types/advanced constants ---
vi.mock('@/types/advanced', () => ({
  INSIGHT_TYPES: ['ANOMALY', 'TREND', 'OPPORTUNITY'],
  INSIGHT_TYPE_LABELS: { ANOMALY: 'Anomaly', TREND: 'Trend', OPPORTUNITY: 'Opportunity' },
  SEVERITIES: ['CRITICAL', 'WARNING', 'INFO'],
  SEVERITY_LABELS: { CRITICAL: 'Critical', WARNING: 'Warning', INFO: 'Info' },
  RECOMMENDATION_TYPES: ['PROMOTION_OPTIMIZATION', 'BUDGET_REALLOCATION'],
  RECOMMENDATION_TYPE_LABELS: { PROMOTION_OPTIMIZATION: 'Promotion Optimization', BUDGET_REALLOCATION: 'Budget Reallocation' },
  RECOMMENDATION_STATUSES: ['PENDING', 'ACCEPTED', 'REJECTED'],
  RECOMMENDATION_STATUS_LABELS: { PENDING: 'Pending', ACCEPTED: 'Accepted', REJECTED: 'Rejected' },
  REPORT_TYPES: ['TABLE', 'CHART', 'SUMMARY'],
  DATA_SOURCES: ['PROMOTIONS', 'CLAIMS', 'CUSTOMERS'],
  CHART_TYPES: ['BAR', 'LINE', 'PIE'],
  VOICE_COMMAND_EXAMPLES: [],
}));

// ============================================================================
// IMPORTS (after mocks)
// ============================================================================

import RecommendationsList from '@/pages/ai/RecommendationsList';
import InsightsList from '@/pages/ai/InsightsList';
import BIDashboard from '@/pages/bi/BIDashboard';
import ReportBuilder from '@/pages/bi/ReportBuilder';
import InventoryImport from '@/pages/operations/inventory/InventoryImport';
import SellTrackingImport from '@/pages/operations/sell-tracking/SellTrackingImport';
import TargetList from '@/pages/targets/TargetList';
import TargetNew from '@/pages/targets/TargetNew';
import ContractCreate from '@/pages/contracts/ContractCreate';
import BaselineList from '@/pages/baselines/BaselineList';
import BaselineNew from '@/pages/baselines/BaselineNew';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// RECOMMENDATIONS LIST - DEEP COVERAGE
// ============================================================================

describe('RecommendationsList - Deep Coverage', () => {
  it('renders page heading', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('Suggestions for improving your promotions and operations')).toBeInTheDocument();
  });

  it('renders Get Recommendations button in header', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
  });

  it('renders Filters card', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders empty state No Recommendations', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('No Recommendations')).toBeInTheDocument();
  });

  it('renders empty state description text', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('Generate new recommendations to get AI suggestions')).toBeInTheDocument();
  });

  it('renders Generate Recommendations button in empty state', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('Generate Recommendations')).toBeInTheDocument();
  });

  it('does not contain NaN in output', () => {
    const { container } = render(<RecommendationsList />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('clicking Get Recommendations calls generateMutation', () => {
    render(<RecommendationsList />);
    fireEvent.click(screen.getByText('Get Recommendations'));
    expect(mockGenerateRecommendations).toHaveBeenCalled();
  });
});

// ============================================================================
// INSIGHTS LIST - DEEP COVERAGE
// ============================================================================

describe('InsightsList - Deep Coverage', () => {
  it('renders page heading', () => {
    render(<InsightsList />);
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<InsightsList />);
    expect(screen.getByText('Anomalies, trends, and opportunities detected by AI')).toBeInTheDocument();
  });

  it('renders Generate Insights button', () => {
    render(<InsightsList />);
    expect(screen.getByText('Generate Insights')).toBeInTheDocument();
  });

  it('renders Filters card header', () => {
    render(<InsightsList />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders the insight feed component', () => {
    render(<InsightsList />);
    expect(screen.getByTestId('insight-feed')).toBeInTheDocument();
  });

  it('shows 0 insights in the insight feed', () => {
    render(<InsightsList />);
    expect(screen.getByText('0 insights')).toBeInTheDocument();
  });

  it('does not contain NaN in output', () => {
    const { container } = render(<InsightsList />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('clicking Generate Insights triggers mutation', () => {
    render(<InsightsList />);
    fireEvent.click(screen.getByText('Generate Insights'));
    expect(mockGenerateInsights).toHaveBeenCalled();
  });
});

// ============================================================================
// BI DASHBOARD - DEEP COVERAGE
// ============================================================================

describe('BIDashboard - Deep Coverage', () => {
  it('renders page title', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Business Intelligence')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Analytics, reports, and insights')).toBeInTheDocument();
  });

  it('renders date range From and To inputs', () => {
    render(<BIDashboard />);
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('renders Reports button', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders fallback KPI cards', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Total Promotions')).toBeInTheDocument();
    expect(screen.getByText('Active Budget')).toBeInTheDocument();
    expect(screen.getByText('Claims Processed')).toBeInTheDocument();
    expect(screen.getByText('Avg ROI')).toBeInTheDocument();
  });

  it('renders fallback chart titles', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Promotions by Type')).toBeInTheDocument();
    expect(screen.getByText('Monthly Spend')).toBeInTheDocument();
  });

  it('renders chart widgets', () => {
    render(<BIDashboard />);
    expect(screen.getByTestId('chart-widget-PIE')).toBeInTheDocument();
    expect(screen.getByTestId('chart-widget-BAR')).toBeInTheDocument();
  });

  it('renders Quick Reports section', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Quick Reports')).toBeInTheDocument();
    expect(screen.getByText('Pre-built reports for common analyses')).toBeInTheDocument();
  });

  it('renders all four quick report buttons', () => {
    render(<BIDashboard />);
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

  it('renders navigation card descriptions', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Create custom reports')).toBeInTheDocument();
    expect(screen.getByText('Deep dive into data')).toBeInTheDocument();
    expect(screen.getByText('Download data')).toBeInTheDocument();
  });

  it('navigates when quick report is clicked', () => {
    render(<BIDashboard />);
    fireEvent.click(screen.getByText('Promotion Summary'));
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports?preset=promotion-summary');
  });

  it('does not contain NaN', () => {
    const { container } = render(<BIDashboard />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// REPORT BUILDER - DEEP COVERAGE
// ============================================================================

describe('ReportBuilder - Deep Coverage', () => {
  it('renders page title', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('Report Builder')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('Create and manage custom reports')).toBeInTheDocument();
  });

  it('renders New Report button', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('New Report')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('No Reports')).toBeInTheDocument();
    expect(screen.getByText('Create your first custom report')).toBeInTheDocument();
  });

  it('renders Create Report button in empty state', () => {
    render(<ReportBuilder />);
    expect(screen.getByText('Create Report')).toBeInTheDocument();
  });

  it('opens dialog when New Report is clicked', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByText('Configure your custom report')).toBeInTheDocument();
  });

  it('dialog has Report Name and Description fields', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByLabelText('Report Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('dialog has Report Type and Data Source selectors', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByLabelText('Report Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Data Source')).toBeInTheDocument();
  });

  it('dialog has Cancel button', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('dialog has correct placeholders', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    expect(screen.getByPlaceholderText('Monthly Sales Report')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional description')).toBeInTheDocument();
  });

  it('allows typing in report name', () => {
    render(<ReportBuilder />);
    fireEvent.click(screen.getByText('New Report'));
    const nameInput = screen.getByLabelText('Report Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Custom Report' } });
    expect(nameInput.value).toBe('My Custom Report');
  });

  it('does not contain NaN', () => {
    const { container } = render(<ReportBuilder />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// INVENTORY IMPORT - DEEP COVERAGE
// ============================================================================

describe('InventoryImport - Deep Coverage', () => {
  it('renders page heading', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Import Inventory Data')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Upload a CSV file to bulk import inventory snapshots')).toBeInTheDocument();
  });

  it('renders Upload File card', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('renders upload description', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Upload a CSV file with inventory data')).toBeInTheDocument();
  });

  it('renders click to upload label', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('renders CSV files only text', () => {
    render(<InventoryImport />);
    expect(screen.getByText('CSV files only')).toBeInTheDocument();
  });

  it('renders Start Import button', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Start Import')).toBeInTheDocument();
  });

  it('Start Import button is disabled initially', () => {
    render(<InventoryImport />);
    const btn = screen.getByText('Start Import').closest('button');
    expect(btn).toBeDisabled();
  });

  it('renders CSV Format card', () => {
    render(<InventoryImport />);
    expect(screen.getByText('CSV Format')).toBeInTheDocument();
  });

  it('renders Required columns description', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Required columns for import')).toBeInTheDocument();
  });

  it('renders CSV format table headers', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Column')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });

  it('renders required column names', () => {
    render(<InventoryImport />);
    expect(screen.getByText('customerCode')).toBeInTheDocument();
    expect(screen.getByText('productSku')).toBeInTheDocument();
    expect(screen.getByText('snapshotDate')).toBeInTheDocument();
    expect(screen.getByText('quantity')).toBeInTheDocument();
  });

  it('renders example values in CSV format table', () => {
    render(<InventoryImport />);
    expect(screen.getByText('CUST001')).toBeInTheDocument();
    expect(screen.getByText('SKU-12345')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('renders optional columns', () => {
    render(<InventoryImport />);
    expect(screen.getByText('location')).toBeInTheDocument();
    expect(screen.getByText('expiryDate')).toBeInTheDocument();
  });

  it('renders Required and Optional badges', () => {
    render(<InventoryImport />);
    const requiredBadges = screen.getAllByText('Required');
    expect(requiredBadges.length).toBeGreaterThanOrEqual(5);
    const optionalBadges = screen.getAllByText('Optional');
    expect(optionalBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('does not contain NaN', () => {
    const { container } = render(<InventoryImport />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// SELL TRACKING IMPORT - DEEP COVERAGE
// ============================================================================

describe('SellTrackingImport - Deep Coverage', () => {
  it('renders page heading', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Import Sell Tracking Data')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Upload a CSV file to bulk import records')).toBeInTheDocument();
  });

  it('renders Upload File card', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('renders upload description', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Upload a CSV file with sell tracking data')).toBeInTheDocument();
  });

  it('renders click to upload label', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('renders CSV files only text', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('CSV files only')).toBeInTheDocument();
  });

  it('renders Start Import button', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Start Import')).toBeInTheDocument();
  });

  it('Start Import button is disabled initially', () => {
    render(<SellTrackingImport />);
    const btn = screen.getByText('Start Import').closest('button');
    expect(btn).toBeDisabled();
  });

  it('renders CSV Format card', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('CSV Format')).toBeInTheDocument();
  });

  it('renders Required columns description', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Required columns for import')).toBeInTheDocument();
  });

  it('renders CSV format table headers', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Column')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });

  it('renders required column names', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('customerCode')).toBeInTheDocument();
    expect(screen.getByText('productSku')).toBeInTheDocument();
    expect(screen.getByText('period')).toBeInTheDocument();
  });

  it('renders sell tracking specific columns', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('sellInQty')).toBeInTheDocument();
    expect(screen.getByText('sellInValue')).toBeInTheDocument();
    expect(screen.getByText('sellOutQty')).toBeInTheDocument();
  });

  it('renders example values', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('CUST001')).toBeInTheDocument();
    expect(screen.getByText('SKU-12345')).toBeInTheDocument();
    expect(screen.getByText('2024-01')).toBeInTheDocument();
  });

  it('renders Required and Optional badges', () => {
    render(<SellTrackingImport />);
    const requiredBadges = screen.getAllByText('Required');
    expect(requiredBadges.length).toBeGreaterThanOrEqual(3);
    const optionalBadges = screen.getAllByText('Optional');
    expect(optionalBadges.length).toBeGreaterThanOrEqual(3);
  });

  it('does not contain NaN', () => {
    const { container } = render(<SellTrackingImport />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// TARGET LIST - DEEP COVERAGE
// ============================================================================

describe('TargetList - Deep Coverage', () => {
  it('renders page title in Vietnamese', () => {
    render(<TargetList />);
    expect(screen.getByText('Mục tiêu')).toBeInTheDocument();
  });

  it('renders page description in Vietnamese', () => {
    render(<TargetList />);
    expect(screen.getByText('Quản lý mục tiêu bán hàng và theo dõi tiến độ')).toBeInTheDocument();
  });

  it('renders allocation link button', () => {
    render(<TargetList />);
    expect(screen.getByText('Phân bổ mục tiêu')).toBeInTheDocument();
  });

  it('renders create new button', () => {
    render(<TargetList />);
    expect(screen.getByText('Tạo mới')).toBeInTheDocument();
  });

  it('renders three summary cards', () => {
    render(<TargetList />);
    expect(screen.getByText('Total Targets')).toBeInTheDocument();
    expect(screen.getByText('Achieved')).toBeInTheDocument();
    expect(screen.getByText('Avg Achievement')).toBeInTheDocument();
  });

  it('renders total targets count from demo data', () => {
    render(<TargetList />);
    // 3 demo targets
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders achieved count from demo data', () => {
    render(<TargetList />);
    // 1 achieved
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders percentage of total', () => {
    render(<TargetList />);
    expect(screen.getByText('33% of total')).toBeInTheDocument();
  });

  it('renders average achievement rate', () => {
    render(<TargetList />);
    // (85 + 112 + 84) / 3 = 93.7%
    expect(screen.getByText('93.7%')).toBeInTheDocument();
  });

  it('renders demo target data in table', () => {
    render(<TargetList />);
    expect(screen.getByText(/TGT-2026-001 - Q1 Revenue Target/)).toBeInTheDocument();
    expect(screen.getByText(/TGT-2026-002 - January Volume/)).toBeInTheDocument();
    expect(screen.getByText(/TGT-2026-003 - Distribution Target/)).toBeInTheDocument();
  });

  it('does not contain NaN', () => {
    const { container } = render(<TargetList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// TARGET NEW - DEEP COVERAGE
// ============================================================================

describe('TargetNew - Deep Coverage', () => {
  it('renders page title', () => {
    render(<TargetNew />);
    expect(screen.getByText('New Target')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<TargetNew />);
    expect(screen.getByText('Create a new sales target')).toBeInTheDocument();
  });

  it('renders Target Details card header', () => {
    render(<TargetNew />);
    expect(screen.getByText('Target Details')).toBeInTheDocument();
  });

  it('renders all form labels', () => {
    render(<TargetNew />);
    expect(screen.getByText('Target Code *')).toBeInTheDocument();
    expect(screen.getByText('Year *')).toBeInTheDocument();
    expect(screen.getByText('Target Name *')).toBeInTheDocument();
    expect(screen.getByText('Target Type *')).toBeInTheDocument();
    expect(screen.getByText('Target Value *')).toBeInTheDocument();
    expect(screen.getByText('Period Type *')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(<TargetNew />);
    expect(screen.getByLabelText('Target Code *')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Value *')).toBeInTheDocument();
  });

  it('renders Create Target button', () => {
    render(<TargetNew />);
    expect(screen.getByText('Create Target')).toBeInTheDocument();
  });

  it('renders Cancel link', () => {
    render(<TargetNew />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('has correct placeholders', () => {
    render(<TargetNew />);
    expect(screen.getByPlaceholderText('TGT-2026-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Q1 Revenue Target')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('5000000000')).toBeInTheDocument();
  });

  it('allows typing in the code input', () => {
    render(<TargetNew />);
    const codeInput = screen.getByLabelText('Target Code *') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'TGT-TEST-001' } });
    expect(codeInput.value).toBe('TGT-TEST-001');
  });

  it('allows typing in the name input', () => {
    render(<TargetNew />);
    const nameInput = screen.getByLabelText('Target Name *') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Test Target' } });
    expect(nameInput.value).toBe('My Test Target');
  });

  it('allows typing in the target value input', () => {
    render(<TargetNew />);
    const valueInput = screen.getByLabelText('Target Value *') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '999999' } });
    expect(valueInput.value).toBe('999999');
  });

  it('submits form', async () => {
    render(<TargetNew />);
    const codeInput = screen.getByLabelText('Target Code *') as HTMLInputElement;
    const nameInput = screen.getByLabelText('Target Name *') as HTMLInputElement;
    const valueInput = screen.getByLabelText('Target Value *') as HTMLInputElement;

    fireEvent.change(codeInput, { target: { value: 'TGT-TEST' } });
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(valueInput, { target: { value: '1000' } });

    const submitButton = screen.getByText('Create Target');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTargetMutateAsync).toHaveBeenCalled();
    });
  });

  it('does not contain NaN', () => {
    const { container } = render(<TargetNew />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// CONTRACT CREATE - DEEP COVERAGE
// ============================================================================

describe('ContractCreate - Deep Coverage', () => {
  it('renders page heading via PageHeader', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Create Volume Contract')).toBeInTheDocument();
  });

  it('renders page description via PageHeader', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Set up a new volume contract with a key account')).toBeInTheDocument();
  });

  it('renders Back button', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('renders Contract Details card', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Contract Details')).toBeInTheDocument();
  });

  it('renders Volume & Bonus card', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Volume & Bonus')).toBeInTheDocument();
  });

  it('renders all form labels', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Contract Code *')).toBeInTheDocument();
    expect(screen.getByText('Contract Name *')).toBeInTheDocument();
    expect(screen.getByText('Customer ID *')).toBeInTheDocument();
    expect(screen.getByText('Start Date *')).toBeInTheDocument();
    expect(screen.getByText('End Date *')).toBeInTheDocument();
    expect(screen.getByText('Target Volume (cases) *')).toBeInTheDocument();
    expect(screen.getByText('Bonus Type')).toBeInTheDocument();
    expect(screen.getByText('Bonus Value')).toBeInTheDocument();
    expect(screen.getByText('Channel')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders correct placeholders', () => {
    render(<ContractCreate />);
    expect(screen.getByPlaceholderText('VC-BIGC-2026')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Big C Volume Contract 2026')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Customer ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('120000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('3.5')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Additional notes...')).toBeInTheDocument();
  });

  it('renders Create Contract button', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Create Contract')).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders channel select with options', () => {
    render(<ContractCreate />);
    expect(screen.getByText('All Channels')).toBeInTheDocument();
  });

  it('renders region select with options', () => {
    render(<ContractCreate />);
    expect(screen.getByText('All Regions')).toBeInTheDocument();
  });

  it('renders bonus type default value', () => {
    render(<ContractCreate />);
    expect(screen.getByText('Percentage')).toBeInTheDocument();
  });

  it('allows typing in contract code', () => {
    render(<ContractCreate />);
    const codeInput = screen.getByPlaceholderText('VC-BIGC-2026') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'VC-TEST-2026' } });
    expect(codeInput.value).toBe('VC-TEST-2026');
  });

  it('allows typing in contract name', () => {
    render(<ContractCreate />);
    const nameInput = screen.getByPlaceholderText('Big C Volume Contract 2026') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Contract' } });
    expect(nameInput.value).toBe('Test Contract');
  });

  it('does not contain NaN', () => {
    const { container } = render(<ContractCreate />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// BASELINE LIST - DEEP COVERAGE
// ============================================================================

describe('BaselineList - Deep Coverage', () => {
  it('renders page heading', () => {
    render(<BaselineList />);
    expect(screen.getByText('Baselines')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<BaselineList />);
    expect(screen.getByText('Manage baseline data for ROI calculations')).toBeInTheDocument();
  });

  it('renders New Baseline button', () => {
    render(<BaselineList />);
    expect(screen.getByText('New Baseline')).toBeInTheDocument();
  });

  it('renders three summary cards', () => {
    render(<BaselineList />);
    expect(screen.getByText('Average Variance')).toBeInTheDocument();
    expect(screen.getByText('Above Baseline')).toBeInTheDocument();
    expect(screen.getByText('Below Baseline')).toBeInTheDocument();
  });

  it('renders average variance value from demo data', () => {
    render(<BaselineList />);
    // avgVariance = (7.78 + (-5.0) + 3.33) / 3 = 2.04%
    expect(screen.getByText('+2.04%')).toBeInTheDocument();
  });

  it('renders positive variances count', () => {
    render(<BaselineList />);
    // 2 positive variances (7.78 and 3.33)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders negative variances count', () => {
    render(<BaselineList />);
    // 1 negative variance (-5.0)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders demo baseline data in table', () => {
    render(<BaselineList />);
    expect(screen.getByText(/BL-2026-001 - Q1 Revenue Baseline/)).toBeInTheDocument();
    expect(screen.getByText(/BL-2026-002 - January Volume/)).toBeInTheDocument();
    expect(screen.getByText(/BL-2026-003 - Product A Price/)).toBeInTheDocument();
  });

  it('does not contain NaN', () => {
    const { container } = render(<BaselineList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// BASELINE NEW - DEEP COVERAGE
// ============================================================================

describe('BaselineNew - Deep Coverage', () => {
  it('renders page title', () => {
    render(<BaselineNew />);
    expect(screen.getByText('New Baseline')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<BaselineNew />);
    expect(screen.getByText('Create a new baseline for ROI calculations')).toBeInTheDocument();
  });

  it('renders Baseline Details card header', () => {
    render(<BaselineNew />);
    expect(screen.getByText('Baseline Details')).toBeInTheDocument();
  });

  it('renders all form labels', () => {
    render(<BaselineNew />);
    expect(screen.getByText('Baseline Code *')).toBeInTheDocument();
    expect(screen.getByText('Year *')).toBeInTheDocument();
    expect(screen.getByText('Baseline Name *')).toBeInTheDocument();
    expect(screen.getByText('Baseline Type *')).toBeInTheDocument();
    expect(screen.getByText('Baseline Value *')).toBeInTheDocument();
    expect(screen.getByText('Period *')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(<BaselineNew />);
    expect(screen.getByLabelText('Baseline Code *')).toBeInTheDocument();
    expect(screen.getByLabelText('Baseline Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Baseline Value *')).toBeInTheDocument();
  });

  it('renders correct placeholders', () => {
    render(<BaselineNew />);
    expect(screen.getByPlaceholderText('BL-2026-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Q1 Revenue Baseline')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('4500000000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Additional notes...')).toBeInTheDocument();
  });

  it('renders Create Baseline button', () => {
    render(<BaselineNew />);
    expect(screen.getByText('Create Baseline')).toBeInTheDocument();
  });

  it('renders Cancel link', () => {
    render(<BaselineNew />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('allows typing in the code input', () => {
    render(<BaselineNew />);
    const codeInput = screen.getByLabelText('Baseline Code *') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'BL-TEST-001' } });
    expect(codeInput.value).toBe('BL-TEST-001');
  });

  it('allows typing in the name input', () => {
    render(<BaselineNew />);
    const nameInput = screen.getByLabelText('Baseline Name *') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Baseline' } });
    expect(nameInput.value).toBe('My Baseline');
  });

  it('allows typing in the value input', () => {
    render(<BaselineNew />);
    const valueInput = screen.getByLabelText('Baseline Value *') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '5000000' } });
    expect(valueInput.value).toBe('5000000');
  });

  it('submits form', async () => {
    render(<BaselineNew />);
    const codeInput = screen.getByLabelText('Baseline Code *') as HTMLInputElement;
    const nameInput = screen.getByLabelText('Baseline Name *') as HTMLInputElement;
    const valueInput = screen.getByLabelText('Baseline Value *') as HTMLInputElement;

    fireEvent.change(codeInput, { target: { value: 'BL-TEST' } });
    fireEvent.change(nameInput, { target: { value: 'Test Baseline' } });
    fireEvent.change(valueInput, { target: { value: '1000' } });

    const submitButton = screen.getByText('Create Baseline');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBaselineMutateAsync).toHaveBeenCalled();
    });
  });

  it('does not contain NaN', () => {
    const { container } = render(<BaselineNew />);
    expect(container.textContent).not.toContain('NaN');
  });
});
