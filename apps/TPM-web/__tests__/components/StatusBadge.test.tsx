/**
 * StatusBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { StatusBadge } from '@/components/shared/StatusBadge';

describe('StatusBadge', () => {
  it('should render status text', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render with correct variant for ACTIVE', () => {
    render(<StatusBadge status="ACTIVE" />);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('bg-emerald-600');
  });

  it('should render with correct variant for DRAFT', () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('should render with correct variant for PENDING', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render with correct variant for APPROVED', () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('should render with correct variant for REJECTED', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('should render with correct variant for COMPLETED', () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render with correct variant for CANCELLED', () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('should handle unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />);
    // Unknown statuses display as-is (uppercase)
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('should apply additional className', () => {
    render(<StatusBadge status="ACTIVE" className="custom-class" />);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('custom-class');
  });
});

