/**
 * EmptyState Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { EmptyState, NoSearchResults, ErrorState } from '@/components/shared/EmptyState';
import { Search } from 'lucide-react';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <EmptyState
        title="No items"
        description="Get started by creating your first item"
      />
    );
    expect(screen.getByText('Get started by creating your first item')).toBeInTheDocument();
  });

  it('should render with custom icon', () => {
    render(
      <EmptyState
        title="Search"
        icon={<Search data-testid="custom-icon" />}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should render action button object', async () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Create Item', onClick: handleClick }}
      />
    );

    const button = screen.getByRole('button', { name: /Create Item/i });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render action as ReactNode', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Custom Button</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
  });

  it('should render actionLabel and onAction', async () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No items"
        actionLabel="Add New"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: /Add New/i });
    await userEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState title="Test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('NoSearchResults', () => {
  it('should render default message', () => {
    render(<NoSearchResults />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('No items match your filters.')).toBeInTheDocument();
  });

  it('should render with search query', () => {
    render(<NoSearchResults query="test query" />);
    expect(screen.getByText(/No results for "test query"/)).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('should render default error message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should render custom error message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render retry button when onRetry provided', async () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);

    const button = screen.getByRole('button', { name: /Try Again/i });
    await userEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
