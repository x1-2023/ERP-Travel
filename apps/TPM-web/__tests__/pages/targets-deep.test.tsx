/**
 * Deep Tests for Target Pages
 * Covers: TargetList (demo data, summary, filters),
 *         TargetNew (form fields, interactions, submit),
 *         TargetAllocation (select target, empty state, view modes)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';

// Mock react-router-dom
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
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
const mockCreateMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useTargets', () => ({
  useTargets: () => ({ data: undefined, isLoading: false }),
  useCreateTarget: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
  useTargetProgress: () => ({ data: undefined, isLoading: false }),
  useCreateTargetAllocationNested: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTargetProgress: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getProgressStatusColor: () => 'text-green-600',
}));

// Mock geographic/allocation hooks
vi.mock('@/hooks', () => ({
  useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
  useTargetAllocationTree: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  getMetricLabel: (key: string) => key,
}));

const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock shared components
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

import TargetList from '@/pages/targets/TargetList';
import TargetNew from '@/pages/targets/TargetNew';
import TargetAllocation from '@/pages/targets/TargetAllocation';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// TARGET LIST DEEP TESTS
// ============================================================================

describe('TargetList - Deep Tests', () => {
  it('renders page title in Vietnamese', () => {
    render(<TargetList />);
    expect(screen.getByText('Mục tiêu')).toBeInTheDocument();
  });

  it('renders page description', () => {
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

  it('renders summary card values from demo data', () => {
    render(<TargetList />);
    // 3 demo targets total
    expect(screen.getByText('3')).toBeInTheDocument();
    // 1 achieved target
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders demo target data in table', () => {
    render(<TargetList />);
    expect(screen.getByText(/TGT-2026-001 - Q1 Revenue Target/)).toBeInTheDocument();
    expect(screen.getByText(/TGT-2026-002 - January Volume/)).toBeInTheDocument();
    expect(screen.getByText(/TGT-2026-003 - Distribution Target/)).toBeInTheDocument();
  });

  it('shows percentage of total for achieved targets', () => {
    render(<TargetList />);
    // 1 of 3 = 33% of total
    expect(screen.getByText('33% of total')).toBeInTheDocument();
  });

  it('shows average achievement rate', () => {
    render(<TargetList />);
    // Average of 85 + 112 + 84 = 93.7%
    expect(screen.getByText('93.7%')).toBeInTheDocument();
  });
});

// ============================================================================
// TARGET NEW DEEP TESTS
// ============================================================================

describe('TargetNew - Deep Tests', () => {
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

  it('renders all form fields', () => {
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

  it('allows typing in the code input', () => {
    render(<TargetNew />);
    const codeInput = screen.getByLabelText('Target Code *') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'TGT-TEST-001' } });
    expect(codeInput.value).toBe('TGT-TEST-001');
  });

  it('allows typing in the name input', () => {
    render(<TargetNew />);
    const nameInput = screen.getByLabelText('Target Name *') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Target' } });
    expect(nameInput.value).toBe('Test Target');
  });

  it('allows typing in the target value input', () => {
    render(<TargetNew />);
    const valueInput = screen.getByLabelText('Target Value *') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '5000000' } });
    expect(valueInput.value).toBe('5000000');
  });

  it('has correct placeholders', () => {
    render(<TargetNew />);
    expect(screen.getByPlaceholderText('TGT-2026-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Q1 Revenue Target')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('5000000000')).toBeInTheDocument();
  });

  it('submits form with filled data', async () => {
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
      expect(mockCreateMutateAsync).toHaveBeenCalled();
    });
  });

  it('renders period type labels', () => {
    render(<TargetNew />);
    expect(screen.getByText('Period Type *')).toBeInTheDocument();
  });
});

// ============================================================================
// TARGET ALLOCATION DEEP TESTS
// ============================================================================

describe('TargetAllocation - Deep Tests', () => {
  it('renders page title', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Phân bổ Mục tiêu')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Cấu trúc phân cấp mục tiêu theo vùng miền')).toBeInTheDocument();
  });

  it('renders target selector', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Chọn mục tiêu...')).toBeInTheDocument();
  });

  it('renders create allocation button', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Tạo phân bổ')).toBeInTheDocument();
  });

  it('shows empty state when no target is selected', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Chọn mục tiêu để xem phân bổ')).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng chọn một mục tiêu/)).toBeInTheDocument();
  });

  it('shows warning when no targets exist', () => {
    render(<TargetAllocation />);
    expect(screen.getByText(/Chưa có mục tiêu nào/)).toBeInTheDocument();
  });

  it('create allocation button is disabled when no target selected', () => {
    render(<TargetAllocation />);
    const createButton = screen.getByText('Tạo phân bổ').closest('button');
    expect(createButton).toBeDisabled();
  });
});
