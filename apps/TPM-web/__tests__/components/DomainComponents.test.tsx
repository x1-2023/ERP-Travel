/**
 * Domain Components Tests
 * Tests for Promotion, Contract, and Budget components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks used by PromotionFilters
vi.mock('@/hooks/useCustomers', () => ({
  useCustomerOptions: () => ({ data: [{ value: 'c1', label: 'ABC Corp' }] }),
}));

vi.mock('@/hooks/useFunds', () => ({
  useFundOptions: () => ({ data: [{ value: 'f1', label: 'Trade Fund Q1' }] }),
}));

// Mock hooks used by FundHealthScore
vi.mock('@/hooks/useBudgets', () => ({
  useFundHealthScore: (budgetId: string) => ({
    data: budgetId ? {
      healthScore: 85,
      status: 'EXCELLENT',
      breakdown: {
        utilization: { score: 80, weight: '30%' },
        timeliness: { score: 90, weight: '25%' },
        roi: { score: 85, weight: '25%' },
        coverage: { score: 88, weight: '20%' },
      },
      alerts: [
        { severity: 'WARNING', message: 'Budget nearing 80% utilization' },
      ],
      recommendations: ['Consider reallocating from underperforming regions'],
    } : null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useBudgetComparison: (budgetId: string) => ({
    data: budgetId ? {
      current: { period: 'Q2 2024', totalAmount: 500000, utilization: 75 },
      previous: { period: 'Q1 2024', totalAmount: 450000, utilization: 68 },
      changes: { amount: 50000, amountPercent: 11.1, trend: 'INCREASING' },
      byRegion: [],
      trending: [],
    } : null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock hooks used by FundActivityROI
vi.mock('@/hooks/useFundActivities', () => ({
  useFundActivitySummary: () => ({
    data: {
      overview: {
        totalActivities: 10,
        totalAllocated: 500000,
        totalSpent: 300000,
        totalRevenue: 900000,
        utilizationRate: 60,
        overallRoi: 3.0,
        avgRoi: 2.5,
      },
      byType: [
        { type: 'promotion', label: 'Promotion', count: 5, totalAllocated: 300000, totalSpent: 200000, totalRevenue: 600000, avgRoi: 3.0 },
      ],
      byStatus: { PLANNED: 2, ACTIVE: 3, COMPLETED: 4, CANCELLED: 1 },
      topPerformers: [
        { id: 'a1', activityName: 'Summer Promo', activityType: 'promotion', spent: 100000, revenue: 400000, roi: 4.0 },
      ],
      underperformers: [
        { id: 'a2', activityName: 'Weak Display', activityType: 'display', spent: 50000, revenue: 30000, roi: 0.6 },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useFundActivities: () => ({
    data: {
      activities: [
        {
          id: 'a1',
          activityName: 'Summer Promo',
          activityCode: 'ACT-001',
          activityType: 'promotion',
          allocatedAmount: 100000,
          spentAmount: 80000,
          revenueGenerated: 300000,
          status: 'ACTIVE',
        },
      ],
      metadata: { total: 1 },
    },
    isLoading: false,
  }),
  getActivityTypeLabel: (t: string) => t,
  getActivityTypeColor: () => 'bg-blue-100 text-blue-700',
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'bg-blue-100 text-blue-700',
  formatCurrency: (v: number) => `${v.toLocaleString()} VND`,
  formatRoi: (v: number) => `${v.toFixed(2)}x`,
  getRoiStatus: (v: number) => v >= 3 ? 'excellent' : v >= 1.5 ? 'good' : v >= 1 ? 'warning' : 'critical',
}));

import { PromotionCard } from '@/components/promotions/PromotionCard';
import { PromotionStatusBadge } from '@/components/promotions/PromotionStatusBadge';
import { PromotionFilters } from '@/components/promotions/PromotionFilters';
import ContractCard from '@/components/contracts/ContractCard';
import MilestoneTracker from '@/components/contracts/MilestoneTracker';
import { FundHealthScore } from '@/components/budget/FundHealthScore';
import { FundActivityROI } from '@/components/budget/FundActivityROI';
import { BudgetComparison } from '@/components/budget/BudgetComparison';

// ============================================================================
// PromotionCard
// ============================================================================
describe('PromotionCard', () => {
  const promotion = {
    id: 'promo-1',
    code: 'PROMO-001',
    name: 'Summer Sale 2024',
    status: 'ACTIVE' as const,
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    budget: 100000000,
    actualSpend: 45000000,
    customer: { id: 'c1', name: 'ABC Corp' },
  } as any;

  it('renders without crashing', () => {
    render(<PromotionCard promotion={promotion} />);
    expect(screen.getByText('PROMO-001')).toBeInTheDocument();
  });

  it('displays promotion name', () => {
    render(<PromotionCard promotion={promotion} />);
    expect(screen.getByText('Summer Sale 2024')).toBeInTheDocument();
  });

  it('displays customer name', () => {
    render(<PromotionCard promotion={promotion} />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('displays budget utilization percentage', () => {
    render(<PromotionCard promotion={promotion} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('displays Budget Utilization label', () => {
    render(<PromotionCard promotion={promotion} />);
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
  });

  it('renders as a link to promotion detail', () => {
    render(<PromotionCard promotion={promotion} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/promotions/promo-1');
  });
});

// ============================================================================
// PromotionStatusBadge
// ============================================================================
describe('PromotionStatusBadge', () => {
  it('renders DRAFT status', () => {
    render(<PromotionStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders ACTIVE status', () => {
    render(<PromotionStatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders PENDING_APPROVAL status', () => {
    render(<PromotionStatusBadge status="PENDING_APPROVAL" />);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('renders COMPLETED status', () => {
    render(<PromotionStatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders CANCELLED status', () => {
    render(<PromotionStatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});

// ============================================================================
// PromotionFilters
// ============================================================================
describe('PromotionFilters', () => {
  const filters = { search: '', status: '' as const, customerId: '', fundId: '' };
  const onFiltersChange = vi.fn();

  it('renders without crashing', () => {
    render(<PromotionFilters filters={filters} onFiltersChange={onFiltersChange} />);
    expect(screen.getByText('More Filters')).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(<PromotionFilters filters={filters} onFiltersChange={onFiltersChange} />);
    expect(screen.getByPlaceholderText('Search promotions...')).toBeInTheDocument();
  });

  it('shows status select', () => {
    render(<PromotionFilters filters={filters} onFiltersChange={onFiltersChange} />);
    // The status select renders with the default "All Status" text
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });
});

// ============================================================================
// ContractCard
// ============================================================================
describe('ContractCard', () => {
  const contract = {
    id: 'ctr-1',
    code: 'CTR-001',
    name: 'Annual Volume Agreement',
    customer: { name: 'ABC Corp', code: 'CUST001' },
    targetVolume: 10000,
    currentVolume: 7500,
    completionRate: 75,
    riskLevel: 'ON_TRACK',
    status: 'ACTIVE',
    nextMilestone: { name: 'Q3 Target', deadline: '2024-09-30' },
  };

  it('renders without crashing', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('CTR-001')).toBeInTheDocument();
  });

  it('displays contract name', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('Annual Volume Agreement')).toBeInTheDocument();
  });

  it('displays customer name', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('displays volume numbers', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('7,500')).toBeInTheDocument();
    expect(screen.getByText('10,000 cases')).toBeInTheDocument();
  });

  it('displays risk level', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('ON TRACK')).toBeInTheDocument();
  });

  it('displays next milestone', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('Next: Q3 Target')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<ContractCard contract={contract} onClick={onClick} />);
    // Click on the card content area
    screen.getByText('CTR-001').click();
    expect(onClick).toHaveBeenCalled();
  });
});

// ============================================================================
// MilestoneTracker
// ============================================================================
describe('MilestoneTracker', () => {
  const milestones = [
    {
      id: 'm1',
      name: 'Q1 Target',
      targetVolume: 2500,
      achievedVolume: 2600,
      deadline: '2024-03-31',
      achievedDate: '2024-03-25',
      isAchieved: true,
    },
    {
      id: 'm2',
      name: 'Q2 Target',
      targetVolume: 5000,
      achievedVolume: 4800,
      deadline: '2024-06-30',
      achievedDate: null,
      isAchieved: false,
    },
    {
      id: 'm3',
      name: 'Q3 Target',
      targetVolume: 7500,
      achievedVolume: 0,
      deadline: '2099-09-30',
      achievedDate: null,
      isAchieved: false,
    },
  ];

  it('renders without crashing', () => {
    render(<MilestoneTracker milestones={milestones} />);
    expect(screen.getByText('Q1 Target')).toBeInTheDocument();
  });

  it('displays all milestones', () => {
    render(<MilestoneTracker milestones={milestones} />);
    expect(screen.getByText('Q1 Target')).toBeInTheDocument();
    expect(screen.getByText('Q2 Target')).toBeInTheDocument();
    expect(screen.getByText('Q3 Target')).toBeInTheDocument();
  });

  it('displays volume progress for each milestone', () => {
    render(<MilestoneTracker milestones={milestones} />);
    expect(screen.getByText('2,600 / 2,500')).toBeInTheDocument();
    expect(screen.getByText('4,800 / 5,000')).toBeInTheDocument();
  });

  it('shows Mark as Achieved button when progress >= 95%', () => {
    const nearlyComplete = [
      {
        id: 'm1',
        name: 'Almost Done',
        targetVolume: 100,
        achievedVolume: 96,
        deadline: '2099-12-31',
        achievedDate: null,
        isAchieved: false,
      },
    ];
    const onAchieve = vi.fn();
    render(<MilestoneTracker milestones={nearlyComplete} onAchieve={onAchieve} />);
    expect(screen.getByText('Mark as Achieved')).toBeInTheDocument();
  });
});

// ============================================================================
// FundHealthScore
// ============================================================================
describe('FundHealthScore', () => {
  it('renders without crashing', () => {
    render(<FundHealthScore budgetId="budget-1" />);
    expect(screen.getByText('Fund Health Score')).toBeInTheDocument();
  });

  it('displays health score value', () => {
    render(<FundHealthScore budgetId="budget-1" />);
    // Score 85 appears in the gauge and in the breakdown (ROI score is also 85)
    expect(screen.getAllByText('85').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('/ 100')).toBeInTheDocument();
  });

  it('displays status badge', () => {
    render(<FundHealthScore budgetId="budget-1" />);
    expect(screen.getByText('EXCELLENT')).toBeInTheDocument();
  });

  it('displays breakdown metrics', () => {
    render(<FundHealthScore budgetId="budget-1" />);
    expect(screen.getByText('Utilization')).toBeInTheDocument();
    expect(screen.getByText('Timeliness')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Coverage')).toBeInTheDocument();
  });

  it('displays alerts when present', () => {
    render(<FundHealthScore budgetId="budget-1" />);
    expect(screen.getByText('Budget nearing 80% utilization')).toBeInTheDocument();
  });

  it('displays recommendations', () => {
    render(<FundHealthScore budgetId="budget-1" />);
    expect(screen.getByText('Consider reallocating from underperforming regions')).toBeInTheDocument();
  });

  it('renders compact mode', () => {
    render(<FundHealthScore budgetId="budget-1" compact={true} />);
    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });

  it('returns null when no budgetId', () => {
    const { container } = render(<FundHealthScore budgetId="" />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================================
// FundActivityROI
// ============================================================================
describe('FundActivityROI', () => {
  it('renders without crashing', () => {
    render(<FundActivityROI budgetId="budget-1" />);
    // Should show activities count
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays top performers', () => {
    render(<FundActivityROI budgetId="budget-1" />);
    expect(screen.getByText('Top ROI')).toBeInTheDocument();
    // "Summer Promo" appears in both top performers and activity list
    expect(screen.getAllByText('Summer Promo').length).toBeGreaterThanOrEqual(1);
  });

  it('displays underperformers section', () => {
    render(<FundActivityROI budgetId="budget-1" />);
    expect(screen.getByText(/Weak Display/)).toBeInTheDocument();
  });
});

// ============================================================================
// BudgetComparison
// ============================================================================
describe('BudgetComparison', () => {
  it('renders without crashing', () => {
    render(<BudgetComparison budgetId="budget-1" />);
    expect(screen.getByText('Period Comparison')).toBeInTheDocument();
  });

  it('displays current period', () => {
    render(<BudgetComparison budgetId="budget-1" />);
    expect(screen.getByText('Current Period')).toBeInTheDocument();
    expect(screen.getByText('Q2 2024')).toBeInTheDocument();
  });

  it('displays previous period', () => {
    render(<BudgetComparison budgetId="budget-1" />);
    expect(screen.getByText('Previous Period')).toBeInTheDocument();
    expect(screen.getByText('Q1 2024')).toBeInTheDocument();
  });

  it('displays trend badge', () => {
    render(<BudgetComparison budgetId="budget-1" />);
    expect(screen.getByText('Increasing')).toBeInTheDocument();
  });

  it('returns null when no budgetId', () => {
    const { container } = render(<BudgetComparison budgetId="" />);
    expect(container.innerHTML).toBe('');
  });
});
