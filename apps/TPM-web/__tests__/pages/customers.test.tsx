/**
 * Customers Pages Smoke Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom partially
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '3' }),
    useNavigate: () => vi.fn(),
  };
});

import CustomerList from '@/pages/customers/CustomerList';
import CustomerDetail from '@/pages/customers/CustomerDetail';

describe('CustomerList Page', () => {
  it('renders page title', () => {
    render(<CustomerList />);
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('renders customer cards', () => {
    render(<CustomerList />);
    expect(screen.getByText('Customer 1')).toBeInTheDocument();
    expect(screen.getByText('Customer 2')).toBeInTheDocument();
    expect(screen.getByText('Customer 3')).toBeInTheDocument();
  });

  it('renders active promotions info', () => {
    render(<CustomerList />);
    const promoTexts = screen.getAllByText('5 active promotions');
    expect(promoTexts.length).toBeGreaterThan(0);
  });
});

describe('CustomerDetail Page', () => {
  it('renders customer heading with id', () => {
    render(<CustomerDetail />);
    expect(screen.getByText('Customer 3')).toBeInTheDocument();
  });

  it('renders customer details card', () => {
    render(<CustomerDetail />);
    expect(screen.getByText('Customer Details')).toBeInTheDocument();
  });

  it('renders customer details info', () => {
    render(<CustomerDetail />);
    expect(screen.getByText('Name: Customer 3')).toBeInTheDocument();
    expect(screen.getByText('Active Promotions: 5')).toBeInTheDocument();
  });
});
