/**
 * Smoke Tests for Target Pages
 * Tests: TargetList, TargetNew, TargetAllocation
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
    useParams: () => ({ id: '1' }),
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

// Mock target hooks
vi.mock('@/hooks/useTargets', () => ({
  useTargets: () => ({ data: undefined, isLoading: false }),
  useCreateTarget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTargetProgress: () => ({ data: undefined, isLoading: false }),
  useCreateTargetAllocationNested: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTargetProgress: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getProgressStatusColor: () => 'text-green-600',
}));

// Mock geographic/allocation hooks
vi.mock('@/hooks', () => ({
  useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
  useTargetAllocationTree: () => ({ data: undefined, isLoading: false }),
  getMetricLabel: (key: string) => key,
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock shared components
vi.mock('@/components/shared/DataTable', () => ({
  DataTable: () => <div data-testid="data-table" />,
}));

vi.mock('@/components/shared/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

describe('Target Pages', () => {
  describe('TargetList Page', () => {
    it('renders without crashing', async () => {
      const { default: TargetList } = await import('@/pages/targets/TargetList');
      render(<TargetList />);
      // TargetList uses demo data fallback
      expect(document.body).toBeTruthy();
    });
  });

  describe('TargetNew Page', () => {
    it('renders without crashing', async () => {
      const { default: TargetNew } = await import('@/pages/targets/TargetNew');
      render(<TargetNew />);
      expect(document.body).toBeTruthy();
    });
  });

  describe('TargetAllocation Page', () => {
    it('renders without crashing', async () => {
      const { default: TargetAllocation } = await import('@/pages/targets/TargetAllocation');
      render(<TargetAllocation />);
      expect(document.body).toBeTruthy();
    });
  });
});
