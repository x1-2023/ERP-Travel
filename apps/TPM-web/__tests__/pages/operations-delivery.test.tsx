/**
 * Smoke tests for Operations > Delivery pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/operations/useDelivery', () => ({
  useDeliveryOrders: () => ({ data: undefined, isLoading: false, error: null }),
  useDeliveryOrder: () => ({ data: undefined, isLoading: false, error: null }),
  useDeliveryTracking: () => ({ data: undefined }),
  useDeliveryCalendar: () => ({ data: undefined, isLoading: false, error: null }),
  useCreateDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDeliveryStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/usePromotions', () => ({
  usePromotions: () => ({ data: undefined, isLoading: false }),
}));

// Mock operations components
vi.mock('@/components/operations', () => ({
  DeliveryCard: () => <div data-testid="delivery-card" />,
  DeliveryStatusBadge: ({ status }: { status: string }) => <span data-testid="delivery-status">{status}</span>,
  DeliveryTimeline: () => <div data-testid="delivery-timeline" />,
  DeliveryForm: () => <div data-testid="delivery-form" />,
  DeliveryCalendar: () => <div data-testid="delivery-calendar" />,
}));

// Mock types
vi.mock('@/types/operations', () => ({
  DELIVERY_STATUS_TRANSITIONS: {},
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

import DeliveryList from '@/pages/operations/delivery/DeliveryList';
import DeliveryDetail from '@/pages/operations/delivery/DeliveryDetail';
import DeliveryNew from '@/pages/operations/delivery/DeliveryNew';
import DeliveryCalendarPage from '@/pages/operations/delivery/DeliveryCalendarPage';

describe('DeliveryList', () => {
  it('renders without crashing', () => {
    render(<DeliveryList />);
    expect(screen.getByText('Delivery Orders')).toBeInTheDocument();
  });

  it('shows no orders empty state', () => {
    render(<DeliveryList />);
    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('displays calendar view and new order buttons', () => {
    render(<DeliveryList />);
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
    expect(screen.getByText('New Order')).toBeInTheDocument();
  });
});

describe('DeliveryDetail', () => {
  it('renders without crashing and shows not found', () => {
    render(<DeliveryDetail />);
    expect(screen.getByText('Order not found')).toBeInTheDocument();
  });
});

describe('DeliveryNew', () => {
  it('renders without crashing', () => {
    render(<DeliveryNew />);
    expect(screen.getByText('Create Delivery Order')).toBeInTheDocument();
  });

  it('shows the delivery form', () => {
    render(<DeliveryNew />);
    expect(screen.getByTestId('delivery-form')).toBeInTheDocument();
  });
});

describe('DeliveryCalendarPage', () => {
  it('renders without crashing', () => {
    render(<DeliveryCalendarPage />);
    expect(screen.getByText('Delivery Calendar')).toBeInTheDocument();
  });

  it('displays list view and new order links', () => {
    render(<DeliveryCalendarPage />);
    expect(screen.getByText('List View')).toBeInTheDocument();
    expect(screen.getByText('New Order')).toBeInTheDocument();
  });
});
