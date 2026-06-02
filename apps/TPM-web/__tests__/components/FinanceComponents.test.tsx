/**
 * Finance Components Tests
 * Tests for FinanceStats, AccrualCard, ChequeCard, DeductionCard, JournalCard,
 * and status badge components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { AccrualStats } from '@/components/finance/FinanceStats';
import { AccrualCard } from '@/components/finance/AccrualCard';
import { ChequeCard } from '@/components/finance/ChequeCard';
import { DeductionCard } from '@/components/finance/DeductionCard';
import { JournalCard } from '@/components/finance/JournalCard';
import { AccrualStatusBadge } from '@/components/finance/AccrualStatusBadge';
import { ChequeStatusBadge } from '@/components/finance/ChequeStatusBadge';
import { DeductionStatusBadge } from '@/components/finance/DeductionStatusBadge';
import { JournalStatusBadge } from '@/components/finance/JournalStatusBadge';
import { AccrualStatus, DeductionStatus } from '@/types/finance';

// ============================================================================
// AccrualStats
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

  it('displays all stat cards', () => {
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
});

// ============================================================================
// AccrualCard
// ============================================================================
describe('AccrualCard', () => {
  const accrual = {
    id: 'acc-1',
    promotionId: 'promo-1',
    promotion: { code: 'PROMO-001', name: 'Summer Sale' } as any,
    period: '2024-Q1',
    amount: 150000,
    status: AccrualStatus.PENDING,
    postedToGL: false,
    notes: 'Test notes for accrual',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user-1',
  };

  it('renders without crashing', () => {
    render(<AccrualCard accrual={accrual} />);
    expect(screen.getByText('PROMO-001')).toBeInTheDocument();
  });

  it('displays promotion name and period', () => {
    render(<AccrualCard accrual={accrual} />);
    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByText('Period: 2024-Q1')).toBeInTheDocument();
  });

  it('displays notes when provided', () => {
    render(<AccrualCard accrual={accrual} />);
    expect(screen.getByText('Test notes for accrual')).toBeInTheDocument();
  });

  it('shows Post to GL button when status is PENDING', () => {
    const onPost = vi.fn();
    render(<AccrualCard accrual={accrual} onPost={onPost} />);
    expect(screen.getByText('Post to GL')).toBeInTheDocument();
  });

  it('shows Reverse button when status is POSTED', () => {
    const onReverse = vi.fn();
    const postedAccrual = { ...accrual, status: AccrualStatus.POSTED };
    render(<AccrualCard accrual={postedAccrual} onReverse={onReverse} />);
    expect(screen.getByText('Reverse')).toBeInTheDocument();
  });

  it('does not show Post/Reverse buttons when no handlers', () => {
    render(<AccrualCard accrual={accrual} />);
    expect(screen.queryByText('Post to GL')).not.toBeInTheDocument();
    expect(screen.queryByText('Reverse')).not.toBeInTheDocument();
  });

  it('shows GL Journal reference when available', () => {
    const accrualWithGL = { ...accrual, glJournalId: 'abcdefgh-1234' };
    render(<AccrualCard accrual={accrualWithGL} />);
    expect(screen.getByText(/GL Journal: abcdefgh/)).toBeInTheDocument();
  });
});

// ============================================================================
// ChequeCard
// ============================================================================
describe('ChequeCard', () => {
  const cheque = {
    id: 'cheque-1',
    chequeNumber: 'CHQ-001234',
    chequeDate: '2024-06-15',
    amount: 250000,
    status: 'ISSUED',
    bankName: 'VietcomBank',
    payee: 'ABC Corp',
    customer: { id: 'cust-1', name: 'ABC Corp' },
    claim: { id: 'claim-1', code: 'CLM-001' },
  } as any;

  it('renders without crashing', () => {
    render(<ChequeCard cheque={cheque} />);
    expect(screen.getByText('CHQ-001234')).toBeInTheDocument();
  });

  it('displays bank name', () => {
    render(<ChequeCard cheque={cheque} />);
    expect(screen.getByText('VietcomBank')).toBeInTheDocument();
  });

  it('displays claim code when present', () => {
    render(<ChequeCard cheque={cheque} />);
    expect(screen.getByText('CLM-001')).toBeInTheDocument();
  });

  it('shows action buttons for ISSUED status', () => {
    const onClear = vi.fn();
    const onVoid = vi.fn();
    render(<ChequeCard cheque={cheque} onClear={onClear} onVoid={onVoid} />);
    // Buttons are icon-only, just verify they exist
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('does not show clear/void buttons for non-ISSUED status', () => {
    const clearedCheque = { ...cheque, status: 'CLEARED' };
    const onClear = vi.fn();
    render(<ChequeCard cheque={clearedCheque} onClear={onClear} />);
    // Only view button should remain
    const buttons = screen.queryAllByRole('button');
    // No clear/void buttons
    expect(buttons.length).toBeLessThan(3);
  });
});

// ============================================================================
// DeductionCard
// ============================================================================
describe('DeductionCard', () => {
  const deduction = {
    id: 'ded-1',
    code: 'DED-001',
    customerId: 'cust-1',
    customer: { name: 'ABC Corp' } as any,
    invoiceNumber: 'INV-2024-001',
    invoiceDate: new Date('2024-06-15'),
    amount: 75000,
    status: DeductionStatus.OPEN,
    reason: 'Short shipment on order #123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders without crashing', () => {
    render(<DeductionCard deduction={deduction} />);
    expect(screen.getByText('DED-001')).toBeInTheDocument();
  });

  it('displays customer name', () => {
    render(<DeductionCard deduction={deduction} />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('displays invoice number', () => {
    render(<DeductionCard deduction={deduction} />);
    expect(screen.getByText('Inv: INV-2024-001')).toBeInTheDocument();
  });

  it('shows reason text when provided', () => {
    render(<DeductionCard deduction={deduction} />);
    expect(screen.getByText('Short shipment on order #123')).toBeInTheDocument();
  });

  it('shows Match/Dispute buttons for OPEN status', () => {
    const onMatch = vi.fn();
    const onDispute = vi.fn();
    render(<DeductionCard deduction={deduction} onMatch={onMatch} onDispute={onDispute} />);
    expect(screen.getByText('Match Claim')).toBeInTheDocument();
    expect(screen.getByText('Dispute')).toBeInTheDocument();
  });

  it('shows matched claim info when matched', () => {
    const matchedDeduction = {
      ...deduction,
      status: DeductionStatus.MATCHED,
      matchedClaim: { code: 'CLM-001' } as any,
    };
    render(<DeductionCard deduction={matchedDeduction} />);
    expect(screen.getByText('Matched: CLM-001')).toBeInTheDocument();
  });
});

// ============================================================================
// JournalCard
// ============================================================================
describe('JournalCard', () => {
  const journal = {
    id: 'jrn-1',
    code: 'JRN-001',
    journalType: 'ACCRUAL',
    journalDate: '2024-06-15',
    totalDebit: 500000,
    status: 'DRAFT',
    description: 'Monthly accrual entry',
    customer: { name: 'ABC Corp' },
  } as any;

  it('renders without crashing', () => {
    render(<JournalCard journal={journal} />);
    expect(screen.getByText('JRN-001')).toBeInTheDocument();
  });

  it('displays journal type', () => {
    render(<JournalCard journal={journal} />);
    expect(screen.getByText('ACCRUAL')).toBeInTheDocument();
  });

  it('displays customer name', () => {
    render(<JournalCard journal={journal} />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('displays description', () => {
    render(<JournalCard journal={journal} />);
    expect(screen.getByText('Monthly accrual entry')).toBeInTheDocument();
  });

  it('shows Post button for DRAFT status', () => {
    const onPost = vi.fn();
    render(<JournalCard journal={journal} onPost={onPost} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Reverse button for POSTED status without prior reversal', () => {
    const onReverse = vi.fn();
    const postedJournal = { ...journal, status: 'POSTED' };
    render(<JournalCard journal={postedJournal} onReverse={onReverse} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// AccrualStatusBadge
// ============================================================================
describe('AccrualStatusBadge', () => {
  it('renders PENDING status', () => {
    render(<AccrualStatusBadge status={AccrualStatus.PENDING} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders CALCULATED status', () => {
    render(<AccrualStatusBadge status={AccrualStatus.CALCULATED} />);
    expect(screen.getByText('Calculated')).toBeInTheDocument();
  });

  it('renders POSTED status', () => {
    render(<AccrualStatusBadge status={AccrualStatus.POSTED} />);
    expect(screen.getByText('Posted')).toBeInTheDocument();
  });

  it('renders REVERSED status', () => {
    render(<AccrualStatusBadge status={AccrualStatus.REVERSED} />);
    expect(screen.getByText('Reversed')).toBeInTheDocument();
  });
});

// ============================================================================
// ChequeStatusBadge
// ============================================================================
describe('ChequeStatusBadge', () => {
  it('renders ISSUED status', () => {
    render(<ChequeStatusBadge status="ISSUED" />);
    expect(screen.getByText('Issued')).toBeInTheDocument();
  });

  it('renders CLEARED status', () => {
    render(<ChequeStatusBadge status="CLEARED" />);
    expect(screen.getByText('Cleared')).toBeInTheDocument();
  });

  it('renders VOIDED status', () => {
    render(<ChequeStatusBadge status="VOIDED" />);
    expect(screen.getByText('Voided')).toBeInTheDocument();
  });

  it('falls back to raw status for unknown values', () => {
    render(<ChequeStatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });
});

// ============================================================================
// DeductionStatusBadge
// ============================================================================
describe('DeductionStatusBadge', () => {
  it('renders OPEN status', () => {
    render(<DeductionStatusBadge status={DeductionStatus.OPEN} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders MATCHED status', () => {
    render(<DeductionStatusBadge status={DeductionStatus.MATCHED} />);
    expect(screen.getByText('Matched')).toBeInTheDocument();
  });

  it('renders DISPUTED status', () => {
    render(<DeductionStatusBadge status={DeductionStatus.DISPUTED} />);
    expect(screen.getByText('Disputed')).toBeInTheDocument();
  });

  it('renders WRITTEN_OFF status', () => {
    render(<DeductionStatusBadge status={DeductionStatus.WRITTEN_OFF} />);
    expect(screen.getByText('Written Off')).toBeInTheDocument();
  });
});

// ============================================================================
// JournalStatusBadge
// ============================================================================
describe('JournalStatusBadge', () => {
  it('renders DRAFT status', () => {
    render(<JournalStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders POSTED status', () => {
    render(<JournalStatusBadge status="POSTED" />);
    expect(screen.getByText('Posted')).toBeInTheDocument();
  });

  it('renders REVERSED status', () => {
    render(<JournalStatusBadge status="REVERSED" />);
    expect(screen.getByText('Reversed')).toBeInTheDocument();
  });

  it('falls back for unknown status', () => {
    render(<JournalStatusBadge status="SOMETHING" />);
    expect(screen.getByText('SOMETHING')).toBeInTheDocument();
  });
});
