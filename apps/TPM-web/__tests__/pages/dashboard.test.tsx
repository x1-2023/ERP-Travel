/**
 * Dashboard Page Smoke Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/useDashboard', () => ({
  useDashboardStats: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useSpendTrend: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useStatusDistribution: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useTopCustomers: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
}));

// Mock charts (recharts won't work in jsdom)
vi.mock('@/components/charts/AreaChart', () => ({
  AreaChart: (props: any) => <div data-testid="area-chart">{props.title}</div>,
}));
vi.mock('@/components/charts/BarChart', () => ({
  BarChart: (props: any) => <div data-testid="bar-chart">{props.title}</div>,
}));
vi.mock('@/components/charts/PieChart', () => ({
  PieChart: (props: any) => <div data-testid="pie-chart">{props.title}</div>,
}));

import Dashboard from '@/pages/dashboard/Dashboard';

describe('Dashboard Page', () => {
  it('renders the page title and header', () => {
    render(<Dashboard />);
    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('New Promotion')).toBeInTheDocument();
  });

  it('renders stat cards with fallback data', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Total Spend')).toBeInTheDocument();
    expect(screen.getByText('Active Promotions')).toBeInTheDocument();
    expect(screen.getByText('Pending Claims')).toBeInTheDocument();
  });

  it('renders secondary metrics', () => {
    render(<Dashboard />);
    expect(screen.getByText('Remaining Budget')).toBeInTheDocument();
    expect(screen.getByText('Approval Rate')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
  });

  it('renders recent activity section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Create New Promotion')).toBeInTheDocument();
    expect(screen.getByText('Submit New Claim')).toBeInTheDocument();
    expect(screen.getByText('Review Pending Claims')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
    expect(screen.getByText('Promotion Calendar')).toBeInTheDocument();
  });

  it('renders system health section', () => {
    render(<Dashboard />);
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('API Status')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });

  it('renders alert banner with demo data', () => {
    render(<Dashboard />);
    expect(screen.getByText('Attention Required')).toBeInTheDocument();
  });
});
