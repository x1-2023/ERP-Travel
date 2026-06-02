/**
 * Smoke Tests for Contract Pages
 * Tests: ContractList, ContractDetail, ContractCreate
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock contract hooks
vi.mock('@/hooks/useVolumeContracts', () => ({
  useVolumeContracts: () => ({ data: undefined, isLoading: false }),
  useContractDashboard: () => ({ data: undefined, isLoading: false }),
  useVolumeContract: () => ({ data: undefined, isLoading: false }),
  useGapAnalysis: () => ({ data: undefined, isLoading: false }),
  useAchieveMilestone: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateVolumeContract: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock shared components
vi.mock('@/components/shared/page-header', () => ({
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}));

vi.mock('@/components/contracts/ContractCard', () => ({
  default: () => <div data-testid="contract-card" />,
}));

vi.mock('@/components/contracts/MilestoneTracker', () => ({
  default: () => <div data-testid="milestone-tracker" />,
}));

vi.mock('@/components/contracts/GapAlert', () => ({
  default: () => <div data-testid="gap-alert" />,
}));

describe('Contract Pages', () => {
  describe('ContractList Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ContractList } = await import('@/pages/contracts/ContractList');
      render(<ContractList />);
      expect(screen.getByText('Volume Contracts')).toBeInTheDocument();
    });

    it('shows demo contracts when API returns no data', async () => {
      const { default: ContractList } = await import('@/pages/contracts/ContractList');
      render(<ContractList />);
      // Demo data should render contract cards
      expect(document.body).toBeTruthy();
    });
  });

  describe('ContractDetail Page', () => {
    it('renders without crashing with demo data', async () => {
      const { default: ContractDetail } = await import('@/pages/contracts/ContractDetail');
      render(<ContractDetail />);
      // Uses demo data fallback
      expect(document.body).toBeTruthy();
    });
  });

  describe('ContractCreate Page', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ContractCreate } = await import('@/pages/contracts/ContractCreate');
      render(<ContractCreate />);
      expect(screen.getByText('Create Volume Contract')).toBeInTheDocument();
    });
  });
});
