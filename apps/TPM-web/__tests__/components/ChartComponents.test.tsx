/**
 * Chart Component Tests
 * Tests for src/components/charts/ - AreaChart, BarChart, LineChart, PieChart
 * Recharts is mocked since it requires browser canvas which jsdom does not support.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock recharts before importing chart components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area-element" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar-element">{children}</div>,
  Line: () => <div data-testid="line-element" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie-element">{children}</div>,
  Cell: () => <div data-testid="cell-element" />,
}));

// Mock chart-theme
vi.mock('@/components/charts/chart-theme', () => ({
  chartTheme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      purple: '#a855f7',
      series: ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#ec4899', '#6366f1'],
      background: '#ffffff',
      grid: '#e5e7eb',
      axis: '#9ca3af',
      text: '#6b7280',
      tooltip: '#ffffff',
    },
    fontSize: { axis: 10, label: 11, legend: 11 },
    fontFamily: 'monospace',
    strokeWidth: { line: 2, area: 1, bar: 0 },
    animationDuration: 400,
  },
  tooltipStyle: {
    contentStyle: {},
    labelStyle: {},
    itemStyle: {},
    cursor: { fill: 'rgba(128, 128, 128, 0.1)' },
  },
  axisStyle: {
    tick: { fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' },
    axisLine: { stroke: '#e5e7eb' },
    tickLine: { stroke: '#e5e7eb' },
  },
  gridStyle: {
    stroke: '#e5e7eb',
    strokeDasharray: '3 3',
  },
}));

// Mock currency display
vi.mock('@/components/ui/currency-display', () => ({
  formatCurrencyCompact: (value: number, currency: string) => `${value} ${currency}`,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Import components after mocks are set up
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';

describe('AreaChart', () => {
  const defaultProps = {
    data: [
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 200 },
      { name: 'Mar', value: 150 },
    ],
    dataKeys: [{ key: 'value', name: 'Sales' }],
  };

  it('renders without crashing', () => {
    const { container } = render(<AreaChart {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders with a title', () => {
    render(<AreaChart {...defaultProps} title="Revenue Trend" />);
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
  });

  it('renders with a title and description', () => {
    render(
      <AreaChart
        {...defaultProps}
        title="Revenue Trend"
        description="Monthly revenue over time"
      />,
    );
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Monthly revenue over time')).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    const { container } = render(<AreaChart {...defaultProps} />);
    const titleElement = container.querySelector('h3');
    expect(titleElement).toBeNull();
  });

  it('renders the recharts ResponsiveContainer', () => {
    render(<AreaChart {...defaultProps} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders the recharts AreaChart', () => {
    render(<AreaChart {...defaultProps} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <AreaChart {...defaultProps} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders multiple data keys', () => {
    const multiDataProps = {
      ...defaultProps,
      dataKeys: [
        { key: 'revenue', name: 'Revenue', color: '#ff0000' },
        { key: 'cost', name: 'Cost', color: '#00ff00' },
      ],
    };
    render(<AreaChart {...multiDataProps} />);
    // Should render area-chart without error
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders with stacked mode', () => {
    render(<AreaChart {...defaultProps} stacked />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders with showLegend', () => {
    render(<AreaChart {...defaultProps} showLegend />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders with showGrid disabled', () => {
    render(<AreaChart {...defaultProps} showGrid={false} />);
    // Grid should not be rendered
    expect(screen.queryByTestId('cartesian-grid')).toBeNull();
  });
});

describe('BarChart', () => {
  const defaultProps = {
    data: [
      { name: 'Q1', value: 300 },
      { name: 'Q2', value: 450 },
      { name: 'Q3', value: 350 },
      { name: 'Q4', value: 500 },
    ],
  };

  it('renders without crashing', () => {
    const { container } = render(<BarChart {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders with a title', () => {
    render(<BarChart {...defaultProps} title="Quarterly Sales" />);
    expect(screen.getByText('Quarterly Sales')).toBeInTheDocument();
  });

  it('renders with a title and description', () => {
    render(
      <BarChart
        {...defaultProps}
        title="Quarterly Sales"
        description="Sales by quarter"
      />,
    );
    expect(screen.getByText('Quarterly Sales')).toBeInTheDocument();
    expect(screen.getByText('Sales by quarter')).toBeInTheDocument();
  });

  it('renders the recharts BarChart', () => {
    render(<BarChart {...defaultProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with custom colors', () => {
    render(
      <BarChart {...defaultProps} colors={['#ff0000', '#00ff00', '#0000ff']} />,
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders in vertical layout', () => {
    render(<BarChart {...defaultProps} layout="vertical" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders in horizontal layout by default', () => {
    render(<BarChart {...defaultProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <BarChart {...defaultProps} className="bar-custom" />,
    );
    expect(container.firstChild).toHaveClass('bar-custom');
  });

  it('renders with showLegend', () => {
    render(<BarChart {...defaultProps} showLegend />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders with custom dataKey', () => {
    const data = [
      { name: 'A', amount: 100 },
      { name: 'B', amount: 200 },
    ];
    render(<BarChart data={data} dataKey="amount" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with showGrid disabled', () => {
    render(<BarChart {...defaultProps} showGrid={false} />);
    expect(screen.queryByTestId('cartesian-grid')).toBeNull();
  });
});

describe('LineChart', () => {
  const defaultProps = {
    data: [
      { name: 'Week 1', value: 50 },
      { name: 'Week 2', value: 75 },
      { name: 'Week 3', value: 60 },
      { name: 'Week 4', value: 90 },
    ],
    dataKey: 'value',
  };

  it('renders without crashing', () => {
    const { container } = render(<LineChart {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders with a title', () => {
    render(<LineChart {...defaultProps} title="Weekly Trend" />);
    expect(screen.getByText('Weekly Trend')).toBeInTheDocument();
  });

  it('renders with a title and description', () => {
    render(
      <LineChart
        {...defaultProps}
        title="Weekly Trend"
        description="Performance over weeks"
      />,
    );
    expect(screen.getByText('Weekly Trend')).toBeInTheDocument();
    expect(screen.getByText('Performance over weeks')).toBeInTheDocument();
  });

  it('renders the recharts LineChart', () => {
    render(<LineChart {...defaultProps} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders with custom stroke color', () => {
    render(<LineChart {...defaultProps} stroke="#ff0000" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <LineChart {...defaultProps} className="line-custom" />,
    );
    expect(container.firstChild).toHaveClass('line-custom');
  });

  it('renders with showLegend', () => {
    render(<LineChart {...defaultProps} showLegend />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<LineChart {...defaultProps} height={400} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders with showGrid disabled', () => {
    render(<LineChart {...defaultProps} showGrid={false} />);
    expect(screen.queryByTestId('cartesian-grid')).toBeNull();
  });

  it('renders with percent format', () => {
    render(<LineChart {...defaultProps} formatValue="percent" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});

describe('PieChart', () => {
  const defaultProps = {
    data: [
      { name: 'Modern Trade', value: 450000 },
      { name: 'General Trade', value: 300000 },
      { name: 'E-Commerce', value: 150000 },
      { name: 'HORECA', value: 100000 },
    ],
  };

  it('renders without crashing', () => {
    const { container } = render(<PieChart {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders with a title', () => {
    render(<PieChart {...defaultProps} title="Channel Distribution" />);
    expect(screen.getByText('Channel Distribution')).toBeInTheDocument();
  });

  it('renders with a title and description', () => {
    render(
      <PieChart
        {...defaultProps}
        title="Channel Distribution"
        description="Revenue by channel"
      />,
    );
    expect(screen.getByText('Channel Distribution')).toBeInTheDocument();
    expect(screen.getByText('Revenue by channel')).toBeInTheDocument();
  });

  it('renders the recharts PieChart', () => {
    render(<PieChart {...defaultProps} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders as donut chart by default', () => {
    render(<PieChart {...defaultProps} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders as solid pie chart', () => {
    render(<PieChart {...defaultProps} donut={false} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with custom innerRadius', () => {
    render(<PieChart {...defaultProps} innerRadius={30} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <PieChart {...defaultProps} className="pie-custom" />,
    );
    expect(container.firstChild).toHaveClass('pie-custom');
  });

  it('renders with showLegend disabled', () => {
    render(<PieChart {...defaultProps} showLegend={false} />);
    expect(screen.queryByTestId('legend')).toBeNull();
  });

  it('renders with showLegend enabled (default)', () => {
    render(<PieChart {...defaultProps} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders Cell elements for each data point', () => {
    render(<PieChart {...defaultProps} />);
    const cells = screen.getAllByTestId('cell-element');
    expect(cells).toHaveLength(4);
  });

  it('renders with custom colors in data', () => {
    const dataWithColors = [
      { name: 'A', value: 100, color: '#ff0000' },
      { name: 'B', value: 200, color: '#00ff00' },
    ];
    render(<PieChart data={dataWithColors} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with currency format', () => {
    render(<PieChart {...defaultProps} formatValue="currency" />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with custom formatter function', () => {
    render(
      <PieChart
        {...defaultProps}
        formatValue={(v: number) => `${v} units`}
      />,
    );
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});
