/**
 * BI Components Tests
 * Tests for ChartWidget, DataGrid, ExportButton, FilterPanel
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// Mock hooks used by ExportButton
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  }),
}));

vi.mock('@/hooks/bi', () => ({
  useExport: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ url: 'http://example.com/file.xlsx', filename: 'export.xlsx' }),
    isPending: false,
  }),
}));

// Mock Radix Select to avoid ResizeObserver issues
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// ============================================================================
// ChartWidget
// ============================================================================
import { ChartWidget } from '@/components/bi/ChartWidget';

describe('ChartWidget', () => {
  const sampleData = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 200 },
    { label: 'Mar', value: 150 },
  ];

  it('renders empty state when no data', () => {
    render(<ChartWidget type="BAR" data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders BAR chart with data', () => {
    render(<ChartWidget type="BAR" data={sampleData} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders PIE chart with data', () => {
    render(<ChartWidget type="PIE" data={sampleData} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
  });

  it('renders LINE chart with data', () => {
    render(<ChartWidget type="LINE" data={sampleData} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  it('renders AREA chart with data', () => {
    render(<ChartWidget type="AREA" data={sampleData} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  it('renders unsupported chart type message', () => {
    render(<ChartWidget type={'UNKNOWN' as any} data={sampleData} />);
    expect(screen.getByText(/Unsupported chart type/)).toBeInTheDocument();
  });

  it('accepts custom height', () => {
    const { container } = render(<ChartWidget type="BAR" data={sampleData} height={500} />);
    expect(container.firstChild).toBeTruthy();
  });
});

// ============================================================================
// DataGrid
// ============================================================================
import { DataGrid } from '@/components/bi/DataGrid';

describe('DataGrid', () => {
  const columns = [
    { field: 'name', header: 'Name', type: 'TEXT' as const },
    { field: 'amount', header: 'Amount', type: 'CURRENCY' as const },
    { field: 'percent', header: 'Percent', type: 'PERCENTAGE' as const },
    { field: 'count', header: 'Count', type: 'NUMBER' as const },
  ];

  const data = [
    { name: 'Item A', amount: 1000000, percent: 25.5, count: 42 },
    { name: 'Item B', amount: 2000000, percent: 74.5, count: 88 },
  ];

  it('renders empty state when no data', () => {
    render(<DataGrid columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataGrid columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Percent')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataGrid columns={columns} data={data} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('formats percentage values', () => {
    render(<DataGrid columns={columns} data={data} />);
    expect(screen.getByText('25.5%')).toBeInTheDocument();
  });
});

// ============================================================================
// ExportButton
// ============================================================================
import { ExportButton } from '@/components/bi/ExportButton';

describe('ExportButton', () => {
  it('renders export button', () => {
    render(<ExportButton type="REPORT" />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<ExportButton type="REPORT" disabled />);
    const button = screen.getByText('Export').closest('button');
    expect(button).toBeDisabled();
  });
});

// ============================================================================
// FilterPanel
// ============================================================================
import { FilterPanel } from '@/components/bi/FilterPanel';

describe('FilterPanel', () => {
  const options = [
    { field: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]},
    { field: 'name', label: 'Name', type: 'text' as const },
  ];

  it('renders filter button', () => {
    render(<FilterPanel options={options} value={{}} onChange={vi.fn()} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('shows active filter count badge', () => {
    render(<FilterPanel options={options} value={{ status: 'active' }} onChange={vi.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders active filter badges', () => {
    render(
      <FilterPanel
        options={options}
        value={{ status: 'active' }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Status: active/)).toBeInTheDocument();
  });
});
