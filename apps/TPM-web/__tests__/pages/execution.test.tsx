/**
 * Smoke Tests for Execution Pages
 * Tests: PSPBudget, Reallocation, Spending
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock recharts
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    ResponsiveContainer: MockComponent,
    AreaChart: MockComponent,
    BarChart: MockComponent,
    LineChart: MockComponent,
    PieChart: MockComponent,
    ComposedChart: MockComponent,
    Treemap: MockComponent,
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

describe('Execution Pages', () => {
  describe('PSPBudget Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: PSPBudget } = await import('@/pages/execution/PSPBudget');
      render(<PSPBudget />);
      expect(screen.getByText('PSP Budget Monitor')).toBeInTheDocument();
    });

    it('shows summary cards', async () => {
      const { default: PSPBudget } = await import('@/pages/execution/PSPBudget');
      render(<PSPBudget />);
      expect(screen.getByText('Planned Budget')).toBeInTheDocument();
      expect(screen.getAllByText('Committed').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Actual Spend')).toBeInTheDocument();
      expect(screen.getAllByText('Over Budget').length).toBeGreaterThanOrEqual(1);
    });

    it('shows PSP details table', async () => {
      const { default: PSPBudget } = await import('@/pages/execution/PSPBudget');
      render(<PSPBudget />);
      expect(screen.getByText('PSP Details')).toBeInTheDocument();
    });

    it('shows live badge', async () => {
      const { default: PSPBudget } = await import('@/pages/execution/PSPBudget');
      render(<PSPBudget />);
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  describe('Reallocation Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: Reallocation } = await import('@/pages/execution/Reallocation');
      render(<Reallocation />);
      expect(screen.getByText('Budget Reallocation')).toBeInTheDocument();
    });

    it('shows summary cards', async () => {
      const { default: Reallocation } = await import('@/pages/execution/Reallocation');
      render(<Reallocation />);
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('Pending Amount')).toBeInTheDocument();
      expect(screen.getByText('Approved (MTD)')).toBeInTheDocument();
    });

    it('shows reallocation requests table', async () => {
      const { default: Reallocation } = await import('@/pages/execution/Reallocation');
      render(<Reallocation />);
      expect(screen.getByText('Reallocation Requests')).toBeInTheDocument();
      expect(screen.getByText('REAL-2026-001')).toBeInTheDocument();
    });

    it('shows new request button', async () => {
      const { default: Reallocation } = await import('@/pages/execution/Reallocation');
      render(<Reallocation />);
      expect(screen.getByText('New Request')).toBeInTheDocument();
    });
  });

  describe('Spending Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: Spending } = await import('@/pages/execution/Spending');
      render(<Spending />);
      expect(screen.getByText('Spending Analysis')).toBeInTheDocument();
    });

    it('shows summary cards', async () => {
      const { default: Spending } = await import('@/pages/execution/Spending');
      render(<Spending />);
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
      expect(screen.getByText('Avg Daily Spend')).toBeInTheDocument();
    });

    it('shows spending tabs', async () => {
      const { default: Spending } = await import('@/pages/execution/Spending');
      render(<Spending />);
      expect(screen.getByText('By Category')).toBeInTheDocument();
      expect(screen.getByText('By Channel')).toBeInTheDocument();
      expect(screen.getByText('Monthly Trend')).toBeInTheDocument();
    });
  });
});
