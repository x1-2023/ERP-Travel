/**
 * Form Components Tests
 * Tests for ClaimForm, FundForm, PromotionForm
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/usePromotions', () => ({
  usePromotionOptions: () => ({
    data: [
      { value: 'promo-1', label: 'Q1 Trade Discount', budget: 100000000, availableBudget: 80000000 },
      { value: 'promo-2', label: 'Q2 Rebate Program', budget: 50000000, availableBudget: 50000000 },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomerOptions: () => ({
    data: [
      { value: 'cust-1', label: 'Acme Corp' },
      { value: 'cust-2', label: 'Beta Inc' },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useFunds', () => ({
  useFundOptions: () => ({
    data: [
      { value: 'fund-1', label: 'Q1 Trade Fund' },
      { value: 'fund-2', label: 'Marketing Fund' },
    ],
    isLoading: false,
  }),
}));

// Mock Radix Select to avoid ResizeObserver issues
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue, disabled }: any) => (
    <div data-testid="mock-select">{children}</div>
  ),
  SelectTrigger: ({ children, id }: any) => <button data-testid="mock-select-trigger" id={id}>{children}</button>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Mock DatePicker to avoid Popover/Calendar issues
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <button data-testid="mock-date-picker">
      {value ? value.toLocaleDateString() : placeholder || 'Pick a date'}
    </button>
  ),
}));

// Mock CurrencyDisplay
vi.mock('@/components/ui/currency-display', () => ({
  CurrencyDisplay: ({ amount }: any) => <span>{amount.toLocaleString()} VND</span>,
}));

// Mock zod validation schemas
vi.mock('@/lib/validations', () => ({
  claimFormSchema: {
    parse: vi.fn(),
  },
  fundFormSchema: {
    parse: vi.fn(),
  },
  promotionFormSchema: {
    parse: vi.fn(),
  },
}));

// Mock zodResolver to not validate in tests
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (values: any) => ({ values, errors: {} }),
}));

// ============================================================================
// ClaimForm
// ============================================================================
import { ClaimForm } from '@/components/forms/ClaimForm';

describe('ClaimForm', () => {
  it('renders form with promotion selection', () => {
    render(<ClaimForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Select Promotion')).toBeInTheDocument();
  });

  it('renders claim details section', () => {
    render(<ClaimForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Claim Details')).toBeInTheDocument();
  });

  it('renders claim amount input', () => {
    render(<ClaimForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Claim Amount (VND) *')).toBeInTheDocument();
  });

  it('renders invoice number input', () => {
    render(<ClaimForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Invoice Number')).toBeInTheDocument();
  });

  it('renders description field', () => {
    render(<ClaimForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders submit and cancel buttons', () => {
    render(<ClaimForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Create Claim')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables submit button when submitting', () => {
    render(<ClaimForm onSubmit={vi.fn()} isSubmitting />);
    const submitButton = screen.getByText('Create Claim').closest('button');
    expect(submitButton).toBeDisabled();
  });
});

// ============================================================================
// FundForm
// ============================================================================
import { FundForm } from '@/components/forms/FundForm';

describe('FundForm', () => {
  it('renders fund information section', () => {
    render(<FundForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Fund Information')).toBeInTheDocument();
  });

  it('renders fund code input', () => {
    render(<FundForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Fund Code *')).toBeInTheDocument();
  });

  it('renders fund name input', () => {
    render(<FundForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Fund Name *')).toBeInTheDocument();
  });

  it('renders budget and period section', () => {
    render(<FundForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Budget & Period')).toBeInTheDocument();
  });

  it('renders total budget input', () => {
    render(<FundForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Total Budget (VND) *')).toBeInTheDocument();
  });

  it('renders Create Fund button for new fund', () => {
    render(<FundForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Create Fund')).toBeInTheDocument();
  });

  it('renders Update Fund button for existing fund', () => {
    const initialData = {
      id: '1',
      code: 'FUND-001',
      name: 'Test Fund',
      description: 'Test',
      totalBudget: 100000000,
      allocatedBudget: 0,
      spentBudget: 0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      fundType: 'TRADE_FUND' as const,
      status: 'ACTIVE' as const,
    };
    render(<FundForm onSubmit={vi.fn()} initialData={initialData as any} />);
    expect(screen.getByText('Update Fund')).toBeInTheDocument();
  });
});

// ============================================================================
// PromotionForm
// ============================================================================
import { PromotionForm } from '@/components/forms/PromotionForm';

describe('PromotionForm', () => {
  it('renders basic information section', () => {
    render(<PromotionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });

  it('renders promotion code input', () => {
    render(<PromotionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Promotion Code *')).toBeInTheDocument();
  });

  it('renders customer and fund section', () => {
    render(<PromotionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Customer & Fund')).toBeInTheDocument();
  });

  it('renders period and budget section', () => {
    render(<PromotionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Period & Budget')).toBeInTheDocument();
  });

  it('renders promotion type section', () => {
    render(<PromotionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Promotion Type')).toBeInTheDocument();
  });

  it('renders Create Promotion button', () => {
    render(<PromotionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Create Promotion')).toBeInTheDocument();
  });

  it('renders Update Promotion for existing data', () => {
    const initialData = {
      id: '1',
      code: 'PROMO-001',
      name: 'Test Promo',
      description: 'Test description',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      budget: 50000000,
      customer: { id: 'cust-1' },
      fund: { id: 'fund-1' },
      promotionType: 'TRADE_PROMOTION',
      mechanicType: 'DISCOUNT',
    };
    render(<PromotionForm onSubmit={vi.fn()} initialData={initialData as any} />);
    expect(screen.getByText('Update Promotion')).toBeInTheDocument();
  });

  it('disables submit when submitting', () => {
    render(<PromotionForm onSubmit={vi.fn()} isSubmitting />);
    const submitButton = screen.getByText('Create Promotion').closest('button');
    expect(submitButton).toBeDisabled();
  });
});
