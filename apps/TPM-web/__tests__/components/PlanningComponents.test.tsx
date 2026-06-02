/**
 * Planning Components Tests
 * Tests for ScenarioForm, ScenarioResults, ComparisonChart, TemplateForm, TemplatePreview
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock Radix UI components that use ResizeObserver internally
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value, defaultValue }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input type="checkbox" checked={checked} onChange={(e: any) => onCheckedChange?.(e.target.checked)} {...props} />
  ),
}));

import { ScenarioForm } from '@/components/planning/ScenarioForm';
import { ScenarioResults } from '@/components/planning/ScenarioResults';
import { ComparisonChart } from '@/components/planning/ComparisonChart';
import { TemplateForm } from '@/components/planning/TemplateForm';
import { TemplatePreview } from '@/components/planning/TemplatePreview';

// ============================================================================
// ScenarioForm
// ============================================================================
describe('ScenarioForm', () => {
  const onSubmit = vi.fn();

  it('renders without crashing', () => {
    render(<ScenarioForm onSubmit={onSubmit} />);
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
  });

  it('displays all tab triggers', () => {
    render(<ScenarioForm onSubmit={onSubmit} />);
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(screen.getByText('Assumptions')).toBeInTheDocument();
  });

  it('shows Scenario Details card in basic tab', () => {
    render(<ScenarioForm onSubmit={onSubmit} />);
    expect(screen.getByText('Scenario Details')).toBeInTheDocument();
  });

  it('shows scenario name input', () => {
    render(<ScenarioForm onSubmit={onSubmit} />);
    expect(screen.getByLabelText('Scenario Name *')).toBeInTheDocument();
  });

  it('uses custom submit label', () => {
    render(<ScenarioForm onSubmit={onSubmit} submitLabel="Run Simulation" />);
    expect(screen.getByText('Run Simulation')).toBeInTheDocument();
  });

  it('shows loading state on submit button', () => {
    render(<ScenarioForm onSubmit={onSubmit} isLoading={true} />);
    expect(screen.getByText('Create Scenario').closest('button')).toBeDisabled();
  });

  it('renders baselines dropdown when provided', () => {
    const baselines = [{ id: 'b1', code: 'BASE-001', name: 'Q1 Baseline' }];
    render(<ScenarioForm onSubmit={onSubmit} baselines={baselines} />);
    expect(screen.getByText('Baseline (Optional)')).toBeInTheDocument();
  });
});

// ============================================================================
// ScenarioResults
// ============================================================================
describe('ScenarioResults', () => {
  const results = {
    roi: 150,
    netMargin: 250000,
    salesLiftPercent: 25,
    paybackDays: 7,
    baselineSales: 1000000,
    projectedSales: 1250000,
    incrementalSales: 250000,
    promotionCost: 50000,
    fundingRequired: 55000,
    costPerIncrementalUnit: 10,
    grossMargin: 300000,
    projectedUnits: 5000,
    incrementalUnits: 1000,
    redemptions: 750,
    dailyProjections: [] as any[],
  };

  it('renders without crashing', () => {
    render(<ScenarioResults results={results} />);
    expect(screen.getByText('Key Performance Metrics')).toBeInTheDocument();
  });

  it('displays ROI metric', () => {
    render(<ScenarioResults results={results} />);
    expect(screen.getAllByText('ROI').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Sales Impact section', () => {
    render(<ScenarioResults results={results} />);
    expect(screen.getByText('Sales Impact')).toBeInTheDocument();
    expect(screen.getByText('Baseline Sales')).toBeInTheDocument();
    expect(screen.getByText('Projected Sales')).toBeInTheDocument();
    expect(screen.getByText('Incremental Sales')).toBeInTheDocument();
  });

  it('displays Cost Analysis section', () => {
    render(<ScenarioResults results={results} />);
    expect(screen.getByText('Cost Analysis')).toBeInTheDocument();
    expect(screen.getByText('Promotion Cost')).toBeInTheDocument();
  });

  it('displays Profitability section', () => {
    render(<ScenarioResults results={results} />);
    expect(screen.getByText('Profitability')).toBeInTheDocument();
    expect(screen.getByText('Gross Margin')).toBeInTheDocument();
  });

  it('displays Volume section', () => {
    render(<ScenarioResults results={results} />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Projected Units')).toBeInTheDocument();
    expect(screen.getByText('Incremental Units')).toBeInTheDocument();
    expect(screen.getByText('Redemptions')).toBeInTheDocument();
  });
});

// ============================================================================
// ComparisonChart
// ============================================================================
describe('ComparisonChart', () => {
  const comparison = {
    scenarios: [
      { id: 's1', name: 'Scenario A' },
      { id: 's2', name: 'Scenario B' },
    ] as any[],
    comparison: {
      values: {
        s1: { roi: 150, netMargin: 250000, salesLiftPercent: 25, paybackDays: 7, incrementalSales: 200000, promotionCost: 50000, costPerIncrementalUnit: 10, grossMargin: 300000 },
        s2: { roi: 120, netMargin: 200000, salesLiftPercent: 20, paybackDays: 10, incrementalSales: 180000, promotionCost: 45000, costPerIncrementalUnit: 12, grossMargin: 270000 },
      },
      rankings: {
        roi: ['s1', 's2'],
        netMargin: ['s1', 's2'],
      },
      winner: {
        roi: 's1',
        netMargin: 's1',
        salesLiftPercent: 's1',
        paybackDays: 's1',
        incrementalSales: 's1',
        promotionCost: 's2',
        costPerIncrementalUnit: 's1',
        grossMargin: 's1',
      },
    },
    recommendation: '**Scenario A is recommended.**\n\nIt delivers superior ROI and margin.\n\n• Higher incremental sales\n• Better payback period',
  };

  it('renders without crashing', () => {
    render(<ComparisonChart comparison={comparison} />);
    expect(screen.getByText('Scenarios Being Compared')).toBeInTheDocument();
  });

  it('displays scenario names', () => {
    render(<ComparisonChart comparison={comparison} />);
    expect(screen.getAllByText('Scenario A').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Scenario B').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Metrics Comparison table', () => {
    render(<ComparisonChart comparison={comparison} />);
    expect(screen.getByText('Metrics Comparison')).toBeInTheDocument();
  });

  it('displays ROI Comparison', () => {
    render(<ComparisonChart comparison={comparison} />);
    expect(screen.getByText('ROI Comparison')).toBeInTheDocument();
  });

  it('displays AI Recommendation', () => {
    render(<ComparisonChart comparison={comparison} />);
    expect(screen.getByText('AI Recommendation')).toBeInTheDocument();
  });

  it('renders Best Overall badge for winner', () => {
    render(<ComparisonChart comparison={comparison} />);
    expect(screen.getByText('Best Overall')).toBeInTheDocument();
  });
});

// ============================================================================
// TemplateForm
// ============================================================================
describe('TemplateForm', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  it('renders without crashing', () => {
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });

  it('shows all form sections', () => {
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Default Settings')).toBeInTheDocument();
    expect(screen.getByText('Promotion Mechanics')).toBeInTheDocument();
    expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();
  });

  it('shows template code input', () => {
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByLabelText('Template Code *')).toBeInTheDocument();
  });

  it('shows Cancel and Create Template buttons', () => {
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Template')).toBeInTheDocument();
  });

  it('shows Update Template when editing existing template', () => {
    const template = {
      id: 't1',
      code: 'TPL-001',
      name: 'Test Template',
      type: 'DISCOUNT',
      isActive: true,
    } as any;
    render(<TemplateForm template={template} onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText('Update Template')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} isLoading={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('displays customer type buttons', () => {
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText('Modern Trade')).toBeInTheDocument();
    expect(screen.getByText('General Trade')).toBeInTheDocument();
  });
});

// ============================================================================
// TemplatePreview
// ============================================================================
describe('TemplatePreview', () => {
  const template = {
    id: 't1',
    code: 'TPL-001',
    name: 'Summer Sale Template',
    description: 'Template for summer promotional campaigns',
    type: 'DISCOUNT',
    category: 'SEASONAL',
    isActive: true,
    defaultDuration: 30,
    defaultBudget: 50000000,
    usageCount: 5,
    mechanics: {
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 100000,
      stackable: false,
    },
    eligibility: {
      customerTypes: ['MT', 'GT'],
      regions: ['North', 'South'],
      minOrderValue: 50000,
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-06-15',
  } as any;

  it('renders without crashing', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('Summer Sale Template')).toBeInTheDocument();
  });

  it('displays template code', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('TPL-001')).toBeInTheDocument();
  });

  it('displays template type badge', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
  });

  it('displays Active badge for active template', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays Default Settings section', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('Default Settings')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
  });

  it('displays Promotion Mechanics section', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('Promotion Mechanics')).toBeInTheDocument();
    expect(screen.getByText('PERCENTAGE')).toBeInTheDocument();
  });

  it('displays Eligibility section with customer types', () => {
    render(<TemplatePreview template={template} />);
    expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();
    expect(screen.getByText('MT')).toBeInTheDocument();
    expect(screen.getByText('GT')).toBeInTheDocument();
  });

  it('displays version history when provided', () => {
    const versions = [
      { id: 'v1', version: 1, createdAt: '2024-01-15', changes: { name: true } },
    ];
    render(<TemplatePreview template={template} versions={versions as any} />);
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
  });

  it('displays recent promotions when provided', () => {
    const recentPromotions = [
      { id: 'p1', code: 'PROMO-001', name: 'Summer Promo', status: 'ACTIVE', startDate: '2024-06-01', endDate: '2024-06-30' },
    ];
    render(<TemplatePreview template={template} recentPromotions={recentPromotions} />);
    expect(screen.getByText('Recent Promotions')).toBeInTheDocument();
    expect(screen.getByText('Summer Promo')).toBeInTheDocument();
  });
});
