/**
 * Progress Component Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Progress } from '@/components/ui/progress';

describe('Progress', () => {
  it('should render progress bar', () => {
    render(<Progress value={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render with value 75 and set indicator transform', () => {
    const { container } = render(<Progress value={75} />);
    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
  });

  it('should render with zero value', () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('should render with 100 value', () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('should render without value (default to 0)', () => {
    render(<Progress />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Progress value={50} className="custom-progress" />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('custom-progress');
  });

  it('should have base styles', () => {
    render(<Progress value={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('relative');
    expect(progressBar).toHaveClass('overflow-hidden');
    expect(progressBar).toHaveClass('rounded-full');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Progress value={50} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should set indicator transform based on value', () => {
    const { container } = render(<Progress value={60} />);
    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ transform: 'translateX(-40%)' });
  });

  it('should set indicator to -100% for value 0', () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('should set indicator to 0% for value 100', () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.querySelector('[class*="bg-primary"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });
});
