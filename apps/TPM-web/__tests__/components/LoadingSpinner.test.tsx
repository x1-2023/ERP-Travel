/**
 * LoadingSpinner Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { LoadingSpinner, PageLoading, SkeletonCard } from '@/components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.h-4.w-4');
    expect(spinner).toBeInTheDocument();
  });

  it('should render medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.h-5.w-5');
    expect(spinner).toBeInTheDocument();
  });

  it('should render large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.h-6.w-6');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render fullScreen overlay', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });
});

describe('PageLoading', () => {
  it('should render page loading indicator', () => {
    render(<PageLoading />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('should render spinning animation', () => {
    const { container } = render(<PageLoading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('should render skeleton with pulse animation', () => {
    const { container } = render(<SkeletonCard />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<SkeletonCard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
