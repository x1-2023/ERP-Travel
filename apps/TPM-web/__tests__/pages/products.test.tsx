/**
 * Products Pages Smoke Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom partially
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '2' }),
    useNavigate: () => vi.fn(),
  };
});

import ProductList from '@/pages/products/ProductList';
import ProductDetail from '@/pages/products/ProductDetail';

describe('ProductList Page', () => {
  it('renders page title', () => {
    render(<ProductList />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders product cards', () => {
    render(<ProductList />);
    expect(screen.getByText('Product SKU-1')).toBeInTheDocument();
    expect(screen.getByText('Product SKU-2')).toBeInTheDocument();
    expect(screen.getByText('Product SKU-3')).toBeInTheDocument();
  });

  it('renders category info', () => {
    render(<ProductList />);
    const categoryTexts = screen.getAllByText('Category: Beverages');
    expect(categoryTexts.length).toBeGreaterThan(0);
  });
});

describe('ProductDetail Page', () => {
  it('renders product heading with id', () => {
    render(<ProductDetail />);
    expect(screen.getByText('Product SKU-2')).toBeInTheDocument();
  });

  it('renders product details card', () => {
    render(<ProductDetail />);
    expect(screen.getByText('Product Details')).toBeInTheDocument();
  });

  it('renders product info', () => {
    render(<ProductDetail />);
    expect(screen.getByText('SKU: SKU-2')).toBeInTheDocument();
    expect(screen.getByText('Category: Beverages')).toBeInTheDocument();
  });
});
