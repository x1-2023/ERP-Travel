/**
 * Smoke Tests for Analysis Pages
 * Tests: ROI, WhatIf, Efficiency
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock Radix components that use ResizeObserver internally
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, ...props }: any) => <input type="range" data-testid="slider" defaultValue={value?.[0] ?? 0} {...props} />,
}));

// Mock recharts - won't work in jsdom
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    ResponsiveContainer: MockComponent,
    AreaChart: MockComponent,
    BarChart: MockComponent,
    LineChart: MockComponent,
    PieChart: MockComponent,
    ScatterChart: MockComponent,
    RadarChart: MockComponent,
    ComposedChart: MockComponent,
    Area: MockComponent,
    Bar: MockComponent,
    Line: MockComponent,
    Pie: MockComponent,
    Scatter: MockComponent,
    Radar: MockComponent,
    Cell: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    ZAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    Legend: MockComponent,
    PolarGrid: MockComponent,
    PolarAngleAxis: MockComponent,
    PolarRadiusAxis: MockComponent,
  };
});

// Mock useTPO hooks used by WhatIf.tsx
vi.mock('@/hooks/useTPO', () => ({
  useWhatIfSimulation: () => ({
    simulate: vi.fn(),
    result: null,
    isLoading: false,
    reset: vi.fn(),
  }),
  useTPOHealth: () => ({ isSuccess: false, isLoading: false }),
  useTPOMechanics: () => ({ data: [] }),
  useTPOChannels: () => ({ data: [] }),
  useTPO: () => ({
    isConnected: false,
    isLoading: false,
    mechanics: [],
    channels: [],
  }),
  usePromotionSuggestions: () => ({
    getSuggestions: vi.fn(),
    suggestions: null,
    isLoading: false,
    reset: vi.fn(),
  }),
  useROIPrediction: () => ({
    predict: vi.fn(),
    result: null,
    isLoading: false,
    reset: vi.fn(),
  }),
}));

// Mock i18n
vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
  }),
}));

describe('Analysis Pages', () => {
  describe('ROI Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ROIPage } = await import('@/pages/analysis/ROI');
      render(<ROIPage />);
      expect(screen.getByText('Phân Tích ROI')).toBeInTheDocument();
    });

    it('shows summary metrics', async () => {
      const { default: ROIPage } = await import('@/pages/analysis/ROI');
      render(<ROIPage />);
      expect(screen.getByText('Gross ROI')).toBeInTheDocument();
      expect(screen.getByText('Net ROI')).toBeInTheDocument();
    });

    it('shows AI insights section', async () => {
      const { default: ROIPage } = await import('@/pages/analysis/ROI');
      render(<ROIPage />);
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('Top Performer')).toBeInTheDocument();
    });
  });

  describe('WhatIf Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: WhatIfPage } = await import('@/pages/analysis/WhatIf');
      render(<WhatIfPage />);
      expect(screen.getByText('What-If Analysis')).toBeInTheDocument();
    });

    it('shows scenario controls', async () => {
      const { default: WhatIfPage } = await import('@/pages/analysis/WhatIf');
      render(<WhatIfPage />);
      expect(screen.getAllByText(/Scenarios/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Conservative')).toBeInTheDocument();
      expect(screen.getByText('Aggressive')).toBeInTheDocument();
    });

    it('shows comparison section', async () => {
      const { default: WhatIfPage } = await import('@/pages/analysis/WhatIf');
      render(<WhatIfPage />);
      expect(screen.getByText(/So sánh Scenarios/)).toBeInTheDocument();
    });
  });

  describe('Efficiency Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: EfficiencyPage } = await import('@/pages/analysis/Efficiency');
      render(<EfficiencyPage />);
      expect(screen.getByText('Phân Tích Hiệu Quả')).toBeInTheDocument();
    });

    it('shows efficiency metrics', async () => {
      const { default: EfficiencyPage } = await import('@/pages/analysis/Efficiency');
      render(<EfficiencyPage />);
      expect(screen.getByText('Overall Score')).toBeInTheDocument();
      expect(screen.getByText('Volume Uplift')).toBeInTheDocument();
    });

    it('shows promotions table', async () => {
      const { default: EfficiencyPage } = await import('@/pages/analysis/Efficiency');
      render(<EfficiencyPage />);
      expect(screen.getByText('Chi tiết Efficiency theo Promotion')).toBeInTheDocument();
    });
  });
});
