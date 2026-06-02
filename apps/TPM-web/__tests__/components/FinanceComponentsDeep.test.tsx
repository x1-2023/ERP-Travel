/**
 * Finance & Domain Components Deep Tests
 * Covers: ChequeStats, AccrualStats, DeductionStats, JournalStats,
 * ClaimStatusBadge, AccrualStatusBadge, ChequeStatusBadge, DeductionStatusBadge,
 * JournalStatusBadge, GapAlert, ContractCard, MilestoneTracker, FundUtilizationCard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

import { ChequeStats } from '@/components/finance/ChequeStats';
import { AccrualStats } from '@/components/finance/FinanceStats';
import { DeductionStats } from '@/components/finance/DeductionStats';
import { JournalStats } from '@/components/finance/JournalStats';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { AccrualStatusBadge } from '@/components/finance/AccrualStatusBadge';
import { ChequeStatusBadge } from '@/components/finance/ChequeStatusBadge';
import { DeductionStatusBadge } from '@/components/finance/DeductionStatusBadge';
import { JournalStatusBadge } from '@/components/finance/JournalStatusBadge';
import GapAlert from '@/components/contracts/GapAlert';
import ContractCard from '@/components/contracts/ContractCard';
import MilestoneTracker from '@/components/contracts/MilestoneTracker';
import { FundUtilizationCard } from '@/components/funds/FundUtilizationCard';

import { AccrualStatus, DeductionStatus } from '@/types/finance';

// ============================================================================
// 1. ChequeStats
// ============================================================================
describe('ChequeStats', () => {
  const summary = {
    totalIssued: 12,
    totalCleared: 8,
    totalVoided: 2,
    totalPending: 5,
    issuedAmount: 3000000,
    clearedAmount: 2000000,
    pendingAmount: 1000000,
  };

  it('renders without crashing', () => {
    render(<ChequeStats summary={summary} />);
    expect(screen.getByText('Issued Cheques')).toBeInTheDocument();
  });

  it('displays all four stat card titles', () => {
    render(<ChequeStats summary={summary} />);
    expect(screen.getByText('Issued Cheques')).toBeInTheDocument();
    expect(screen.getByText('Cleared')).toBeInTheDocument();
    expect(screen.getByText('Voided')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('displays subtitle counts', () => {
    render(<ChequeStats summary={summary} />);
    expect(screen.getByText('12 outstanding')).toBeInTheDocument();
    expect(screen.getByText('8 processed')).toBeInTheDocument();
    expect(screen.getByText('Cancelled cheques')).toBeInTheDocument();
    expect(screen.getByText('5 awaiting')).toBeInTheDocument();
  });
});

// ============================================================================
// 2. AccrualStats
// ============================================================================
describe('AccrualStats', () => {
  const summary = {
    totalAmount: 500000,
    pendingAmount: 200000,
    postedAmount: 250000,
    reversedAmount: 50000,
    entryCount: 15,
  };

  it('renders without crashing', () => {
    render(<AccrualStats summary={summary} />);
    expect(screen.getByText('Total Accrued')).toBeInTheDocument();
  });

  it('displays all four stat card titles', () => {
    render(<AccrualStats summary={summary} />);
    expect(screen.getByText('Total Accrued')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Posted to GL')).toBeInTheDocument();
    expect(screen.getByText('Reversed')).toBeInTheDocument();
  });

  it('displays entry count subtitle', () => {
    render(<AccrualStats summary={summary} />);
    expect(screen.getByText('15 entries')).toBeInTheDocument();
  });

  it('handles missing reversedAmount gracefully', () => {
    const summaryNoReversed = {
      totalAmount: 500000,
      pendingAmount: 200000,
      postedAmount: 250000,
      entryCount: 10,
    };
    render(<AccrualStats summary={summaryNoReversed} />);
    expect(screen.getByText('Reversed')).toBeInTheDocument();
  });
});

// ============================================================================
// 3. DeductionStats
// ============================================================================
describe('DeductionStats', () => {
  const summary = {
    totalOpen: 10,
    totalMatched: 6,
    totalDisputed: 3,
    totalResolved: 4,
    openAmount: 800000,
    matchedAmount: 500000,
    disputedAmount: 300000,
  };

  it('renders without crashing', () => {
    render(<DeductionStats summary={summary} />);
    expect(screen.getByText('Open Deductions')).toBeInTheDocument();
  });

  it('displays all four stat card titles', () => {
    render(<DeductionStats summary={summary} />);
    expect(screen.getByText('Open Deductions')).toBeInTheDocument();
    expect(screen.getByText('Matched')).toBeInTheDocument();
    expect(screen.getByText('Disputed')).toBeInTheDocument();
    expect(screen.getByText('Resolved/Written Off')).toBeInTheDocument();
  });

  it('displays subtitle counts', () => {
    render(<DeductionStats summary={summary} />);
    expect(screen.getByText('10 pending')).toBeInTheDocument();
    expect(screen.getByText('6 resolved')).toBeInTheDocument();
    expect(screen.getByText('3 in review')).toBeInTheDocument();
    expect(screen.getByText('Closed cases')).toBeInTheDocument();
  });
});

// ============================================================================
// 4. JournalStats
// ============================================================================
describe('JournalStats', () => {
  const summary = {
    totalDraft: 5,
    totalPosted: 20,
    totalReversed: 3,
    draftAmount: 150000,
    postedAmount: 900000,
  };

  it('renders without crashing', () => {
    render(<JournalStats summary={summary} />);
    expect(screen.getByText('Draft Journals')).toBeInTheDocument();
  });

  it('displays all four stat card titles', () => {
    render(<JournalStats summary={summary} />);
    expect(screen.getByText('Draft Journals')).toBeInTheDocument();
    expect(screen.getByText('Posted')).toBeInTheDocument();
    expect(screen.getByText('Reversed')).toBeInTheDocument();
    expect(screen.getByText('Total Posted Value')).toBeInTheDocument();
  });

  it('displays subtitle details', () => {
    render(<JournalStats summary={summary} />);
    expect(screen.getByText('5 pending')).toBeInTheDocument();
    expect(screen.getByText('20 journals')).toBeInTheDocument();
    expect(screen.getByText('Reversed entries')).toBeInTheDocument();
    expect(screen.getByText('GL impact')).toBeInTheDocument();
  });
});

// ============================================================================
// 5. ClaimStatusBadge
// ============================================================================
describe('ClaimStatusBadge', () => {
  it('renders without crashing', () => {
    render(<ClaimStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders all status variations', () => {
    const statuses: Array<{ status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'; label: string }> = [
      { status: 'DRAFT', label: 'Draft' },
      { status: 'SUBMITTED', label: 'Submitted' },
      { status: 'UNDER_REVIEW', label: 'Under Review' },
      { status: 'APPROVED', label: 'Approved' },
      { status: 'REJECTED', label: 'Rejected' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<ClaimStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders PAID and CANCELLED statuses', () => {
    const { unmount } = render(<ClaimStatusBadge status={'PAID' as any} />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
    unmount();

    render(<ClaimStatusBadge status={'CANCELLED' as any} />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});

// ============================================================================
// 6. AccrualStatusBadge
// ============================================================================
describe('AccrualStatusBadge', () => {
  it('renders without crashing', () => {
    render(<AccrualStatusBadge status={AccrualStatus.PENDING} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders all accrual status variations', () => {
    const statuses: Array<{ status: AccrualStatus; label: string }> = [
      { status: AccrualStatus.PENDING, label: 'Pending' },
      { status: AccrualStatus.CALCULATED, label: 'Calculated' },
      { status: AccrualStatus.POSTED, label: 'Posted' },
      { status: AccrualStatus.REVERSED, label: 'Reversed' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<AccrualStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});

// ============================================================================
// 7. ChequeStatusBadge
// ============================================================================
describe('ChequeStatusBadge', () => {
  it('renders without crashing', () => {
    render(<ChequeStatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders all cheque status variations', () => {
    const statuses = [
      { status: 'PENDING', label: 'Pending' },
      { status: 'ISSUED', label: 'Issued' },
      { status: 'CLEARED', label: 'Cleared' },
      { status: 'VOIDED', label: 'Voided' },
      { status: 'STALE', label: 'Stale' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<ChequeStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('falls back to raw status for unknown values', () => {
    render(<ChequeStatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });
});

// ============================================================================
// 8. DeductionStatusBadge
// ============================================================================
describe('DeductionStatusBadge', () => {
  it('renders without crashing', () => {
    render(<DeductionStatusBadge status={DeductionStatus.OPEN} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders all deduction status variations', () => {
    const statuses: Array<{ status: DeductionStatus; label: string }> = [
      { status: DeductionStatus.OPEN, label: 'Open' },
      { status: DeductionStatus.MATCHED, label: 'Matched' },
      { status: DeductionStatus.DISPUTED, label: 'Disputed' },
      { status: DeductionStatus.RESOLVED, label: 'Resolved' },
      { status: DeductionStatus.WRITTEN_OFF, label: 'Written Off' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<DeductionStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});

// ============================================================================
// 9. JournalStatusBadge
// ============================================================================
describe('JournalStatusBadge', () => {
  it('renders without crashing', () => {
    render(<JournalStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders all journal status variations', () => {
    const statuses = [
      { status: 'DRAFT', label: 'Draft' },
      { status: 'POSTED', label: 'Posted' },
      { status: 'REVERSED', label: 'Reversed' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(<JournalStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('falls back to raw status for unknown values', () => {
    render(<JournalStatusBadge status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});

// ============================================================================
// 10. GapAlert
// ============================================================================
describe('GapAlert', () => {
  it('renders on-track message when gap is zero', () => {
    render(
      <GapAlert
        gap={0}
        requiredMonthlyRun={100}
        avgMonthlyVolume={120}
        projectedAchievement={105.5}
        riskLevel="ON_TRACK"
      />
    );
    expect(screen.getByText('Contract is on track or ahead of target')).toBeInTheDocument();
  });

  it('renders on-track message when gap is negative', () => {
    render(
      <GapAlert
        gap={-50}
        requiredMonthlyRun={100}
        avgMonthlyVolume={150}
        projectedAchievement={112.0}
        riskLevel="ON_TRACK"
      />
    );
    expect(screen.getByText('Contract is on track or ahead of target')).toBeInTheDocument();
  });

  it('renders gap warning when gap is positive', () => {
    render(
      <GapAlert
        gap={500}
        requiredMonthlyRun={200}
        avgMonthlyVolume={150}
        projectedAchievement={75.0}
        riskLevel="AT_RISK"
      />
    );
    expect(screen.getByText(/Volume gap of.*cases to close/)).toBeInTheDocument();
  });

  it('shows required monthly run and current average', () => {
    render(
      <GapAlert
        gap={1000}
        requiredMonthlyRun={300}
        avgMonthlyVolume={200}
        projectedAchievement={66.7}
        riskLevel="CRITICAL"
      />
    );
    expect(screen.getByText('Required monthly run')).toBeInTheDocument();
    expect(screen.getByText('Current avg monthly')).toBeInTheDocument();
  });
});

// ============================================================================
// 11. ContractCard
// ============================================================================
describe('ContractCard', () => {
  const contract = {
    id: 'c-1',
    code: 'CTR-2024-001',
    name: 'Annual Volume Agreement',
    customer: { name: 'Acme Corp', code: 'ACME' },
    targetVolume: 10000,
    currentVolume: 6500,
    completionRate: 65.0,
    riskLevel: 'ON_TRACK',
    status: 'ACTIVE',
    nextMilestone: { name: 'Q2 Target', deadline: '2024-06-30' },
  };

  it('renders without crashing', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('CTR-2024-001')).toBeInTheDocument();
  });

  it('displays contract code and name', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('CTR-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Annual Volume Agreement')).toBeInTheDocument();
  });

  it('shows volume progress section', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('Volume Progress')).toBeInTheDocument();
    expect(screen.getByText('65.0%')).toBeInTheDocument();
  });

  it('displays customer name when present', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows next milestone when present', () => {
    render(<ContractCard contract={contract} />);
    expect(screen.getByText('Next: Q2 Target')).toBeInTheDocument();
  });

  it('handles click callback', () => {
    const onClick = vi.fn();
    render(<ContractCard contract={contract} onClick={onClick} />);
    screen.getByText('CTR-2024-001').closest('[class*="cursor-pointer"]')?.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('renders without customer', () => {
    const contractNoCustomer = { ...contract, customer: undefined };
    render(<ContractCard contract={contractNoCustomer} />);
    expect(screen.getByText('CTR-2024-001')).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('renders without next milestone', () => {
    const contractNoMilestone = { ...contract, nextMilestone: null };
    render(<ContractCard contract={contractNoMilestone} />);
    expect(screen.getByText('CTR-2024-001')).toBeInTheDocument();
    expect(screen.queryByText(/Next:/)).not.toBeInTheDocument();
  });
});

// ============================================================================
// 12. MilestoneTracker
// ============================================================================
describe('MilestoneTracker', () => {
  const milestones = [
    {
      id: 'm-1',
      name: 'Q1 Milestone',
      targetVolume: 2500,
      achievedVolume: 2500,
      deadline: '2024-03-31',
      achievedDate: '2024-03-15',
      isAchieved: true,
    },
    {
      id: 'm-2',
      name: 'Q2 Milestone',
      targetVolume: 5000,
      achievedVolume: 3200,
      deadline: '2024-06-30',
      achievedDate: null,
      isAchieved: false,
    },
    {
      id: 'm-3',
      name: 'Q3 Milestone',
      targetVolume: 7500,
      achievedVolume: 0,
      deadline: '2024-09-30',
      achievedDate: null,
      isAchieved: false,
    },
  ];

  it('renders without crashing', () => {
    render(<MilestoneTracker milestones={milestones} />);
    expect(screen.getByText('Q1 Milestone')).toBeInTheDocument();
  });

  it('renders all milestone names', () => {
    render(<MilestoneTracker milestones={milestones} />);
    expect(screen.getByText('Q1 Milestone')).toBeInTheDocument();
    expect(screen.getByText('Q2 Milestone')).toBeInTheDocument();
    expect(screen.getByText('Q3 Milestone')).toBeInTheDocument();
  });

  it('displays volume progress for each milestone', () => {
    render(<MilestoneTracker milestones={milestones} />);
    expect(screen.getByText(/2,500\s*\/\s*2,500/)).toBeInTheDocument();
    expect(screen.getByText(/3,200\s*\/\s*5,000/)).toBeInTheDocument();
    expect(screen.getByText(/0\s*\/\s*7,500/)).toBeInTheDocument();
  });

  it('renders empty state for empty milestones array', () => {
    const { container } = render(<MilestoneTracker milestones={[]} />);
    expect(container.querySelector('.space-y-1')).toBeInTheDocument();
  });

  it('shows Mark as Achieved button when progress >= 95% and onAchieve is provided', () => {
    const nearCompleteMilestones = [
      {
        id: 'm-near',
        name: 'Almost Done',
        targetVolume: 1000,
        achievedVolume: 960,
        deadline: '2030-12-31',
        achievedDate: null,
        isAchieved: false,
      },
    ];
    const onAchieve = vi.fn();
    render(<MilestoneTracker milestones={nearCompleteMilestones} onAchieve={onAchieve} />);
    expect(screen.getByText('Mark as Achieved')).toBeInTheDocument();
  });
});

// ============================================================================
// 13. FundUtilizationCard
// ============================================================================
describe('FundUtilizationCard', () => {
  const fund = {
    id: 'fund-1',
    code: 'TF-001',
    name: 'Trade Fund Q1',
    fundType: 'TRADE_FUND' as const,
    totalBudget: 1000000,
    allocatedBudget: 700000,
    utilizedBudget: 450000,
    availableBudget: 300000,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  };

  it('renders without crashing', () => {
    render(<FundUtilizationCard fund={fund} />);
    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
  });

  it('displays all budget labels', () => {
    render(<FundUtilizationCard fund={fund} />);
    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    expect(screen.getByText('Allocated')).toBeInTheDocument();
    expect(screen.getByText('Utilized')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
  });

  it('calculates and displays correct percentages', () => {
    render(<FundUtilizationCard fund={fund} />);
    // allocatedPercent = round(700000 / 1000000 * 100) = 70%
    // utilizationPercent = round(450000 / 1000000 * 100) = 45%
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('handles zero budget without division error', () => {
    const zeroBudgetFund = {
      ...fund,
      totalBudget: 0,
      allocatedBudget: 0,
      utilizedBudget: 0,
      availableBudget: 0,
    };
    render(<FundUtilizationCard fund={zeroBudgetFund} />);
    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    const zeroPercents = screen.getAllByText('0%');
    expect(zeroPercents.length).toBe(2);
  });
});
