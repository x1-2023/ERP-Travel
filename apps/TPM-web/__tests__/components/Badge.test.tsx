/**
 * Badge Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('should render badge text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render as div element', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText('Test').tagName).toBe('DIV');
  });

  it('should render default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-surface');
  });

  it('should render draft variant', () => {
    render(<Badge variant="draft">Draft</Badge>);
    expect(screen.getByText('Draft')).toHaveClass('bg-slate-500');
  });

  it('should render pending variant', () => {
    render(<Badge variant="pending">Pending</Badge>);
    expect(screen.getByText('Pending')).toHaveClass('bg-amber-500');
  });

  it('should render approved variant', () => {
    render(<Badge variant="approved">Approved</Badge>);
    expect(screen.getByText('Approved')).toHaveClass('bg-blue-500');
  });

  it('should render active variant', () => {
    render(<Badge variant="active">Active</Badge>);
    expect(screen.getByText('Active')).toHaveClass('bg-emerald-600');
  });

  it('should render completed variant', () => {
    render(<Badge variant="completed">Completed</Badge>);
    expect(screen.getByText('Completed')).toHaveClass('bg-violet-500');
  });

  it('should render cancelled variant', () => {
    render(<Badge variant="cancelled">Cancelled</Badge>);
    expect(screen.getByText('Cancelled')).toHaveClass('bg-red-500');
  });

  it('should render rejected variant', () => {
    render(<Badge variant="rejected">Rejected</Badge>);
    expect(screen.getByText('Rejected')).toHaveClass('bg-red-500');
  });

  it('should render paid variant', () => {
    render(<Badge variant="paid">Paid</Badge>);
    expect(screen.getByText('Paid')).toHaveClass('bg-emerald-600');
  });

  it('should render success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-emerald-600');
  });

  it('should render warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-amber-500');
  });

  it('should render danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-500');
  });

  it('should render info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('bg-blue-500');
  });

  it('should render secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-slate-500');
  });

  it('should render destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-red-500');
  });

  it('should render error variant', () => {
    render(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-500');
  });

  it('should render outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('bg-transparent');
  });

  it('should render outline-primary variant', () => {
    render(<Badge variant="outline-primary">Primary Outline</Badge>);
    expect(screen.getByText('Primary Outline')).toHaveClass('bg-transparent', 'text-primary');
  });

  it('should render outline-success variant', () => {
    render(<Badge variant="outline-success">Success Outline</Badge>);
    expect(screen.getByText('Success Outline')).toHaveClass('bg-transparent', 'text-success');
  });

  it('should render outline-warning variant', () => {
    render(<Badge variant="outline-warning">Warning Outline</Badge>);
    expect(screen.getByText('Warning Outline')).toHaveClass('bg-transparent', 'text-warning');
  });

  it('should render outline-danger variant', () => {
    render(<Badge variant="outline-danger">Danger Outline</Badge>);
    expect(screen.getByText('Danger Outline')).toHaveClass('bg-transparent', 'text-danger');
  });

  it('should render default size', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('text-2xs');
  });

  it('should render sm size', () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('py-0');
  });

  it('should render lg size', () => {
    render(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('text-xs');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    expect(screen.getByText('Test')).toHaveClass('custom-class');
  });

  it('should have base styles', () => {
    render(<Badge>Base</Badge>);
    const badge = screen.getByText('Base');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded', 'font-semibold', 'uppercase');
  });

  it('should pass through HTML attributes', () => {
    render(<Badge data-testid="my-badge" id="badge-1">Attr</Badge>);
    expect(screen.getByTestId('my-badge')).toHaveAttribute('id', 'badge-1');
  });
});
