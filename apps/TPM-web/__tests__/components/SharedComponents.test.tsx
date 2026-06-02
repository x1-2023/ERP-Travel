/**
 * Shared Components Tests
 * Tests for LoadingSpinner, PageLoading, EmptyState, SearchInput, Pagination, PageHeader
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '../test-utils';
import { LoadingSpinner, PageLoading, SkeletonCard } from '@/components/shared/LoadingSpinner';
import { EmptyState, NoSearchResults, ErrorState } from '@/components/shared/EmptyState';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { PageHeader } from '@/components/shared/page-header';

// ═══════════════════════════════════════════════════════════════
// LoadingSpinner
// ═══════════════════════════════════════════════════════════════

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render with text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should not render text when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const spans = container.querySelectorAll('span');
    // Should not have a text span
    expect(spans.length).toBe(0);
  });

  it('should apply sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.querySelector('.h-4')).toBeInTheDocument();
  });

  it('should apply md size by default', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.h-5')).toBeInTheDocument();
  });

  it('should apply lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.querySelector('.h-6')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);
    expect(container.querySelector('.custom-spinner')).toBeInTheDocument();
  });

  it('should render fullScreen variant', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });
});

describe('PageLoading', () => {
  it('should render page loading state', () => {
    render(<PageLoading />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('should render spinning indicator', () => {
    const { container } = render(<PageLoading />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('should render skeleton card', () => {
    const { container } = render(<SkeletonCard />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<SkeletonCard className="custom-skeleton" />);
    expect(container.querySelector('.custom-skeleton')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// EmptyState
// ═══════════════════════════════════════════════════════════════

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<EmptyState title="No items" description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should render without description', () => {
    render(<EmptyState title="No items" />);
    expect(screen.queryByText('Try adjusting')).not.toBeInTheDocument();
  });

  it('should render action button from object config', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Add Item', onClick }}
      />
    );
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render action as ReactNode', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Custom Action</button>}
      />
    );
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('should render actionLabel + onAction', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No items"
        actionLabel="Create New"
        onAction={onAction}
      />
    );
    const button = screen.getByText('Create New');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(<EmptyState title="No items" className="custom-empty" />);
    expect(container.querySelector('.custom-empty')).toBeInTheDocument();
  });
});

describe('NoSearchResults', () => {
  it('should render no results message', () => {
    render(<NoSearchResults />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should show query in message', () => {
    render(<NoSearchResults query="test search" />);
    expect(screen.getByText(/No results for "test search"/)).toBeInTheDocument();
  });

  it('should show generic message without query', () => {
    render(<NoSearchResults />);
    expect(screen.getByText('No items match your filters.')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('should render error message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render default error message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should render retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const button = screen.getByText('Try Again');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// SearchInput
// ═══════════════════════════════════════════════════════════════

describe('SearchInput', () => {
  it('should render with placeholder', () => {
    render(<SearchInput onChange={vi.fn()} placeholder="Search items..." />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('should render default placeholder', () => {
    render(<SearchInput onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should update input value on type', () => {
    render(<SearchInput onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input).toHaveValue('hello');
  });

  it('should show clear button when there is text', () => {
    render(<SearchInput onChange={vi.fn()} value="test" />);
    // The clear button should be visible (X icon)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should clear input when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} value="test" />);
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should call onChange with debounced value', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} debounceMs={300} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    // onChange should not be called immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(onChange).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });
});

// ═══════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════

describe('Pagination', () => {
  it('should render page info', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should render total count info', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        pageSize={10}
        totalCount={50}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Showing 1 to 10 of 50 results/)).toBeInTheDocument();
  });

  it('should disable previous buttons on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    // First two buttons (first page, prev page) should be disabled
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('should disable next buttons on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    // Last two buttons (next page, last page) should be disabled
    expect(buttons[buttons.length - 1]).toBeDisabled();
    expect(buttons[buttons.length - 2]).toBeDisabled();
  });

  it('should enable all navigation buttons on middle page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).not.toBeDisabled();
    });
  });

  it('should call onPageChange with correct page on next', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    const buttons = screen.getAllByRole('button');
    // Next page button is the 3rd button (index 2)
    fireEvent.click(buttons[2]);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with 1 on first page button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    const buttons = screen.getAllByRole('button');
    // First button goes to page 1
    fireEvent.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange with totalPages on last page button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    const buttons = screen.getAllByRole('button');
    // Last button goes to last page
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('should show correct count info for last page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Showing 21 to 25 of 25 results/)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// PageHeader
// ═══════════════════════════════════════════════════════════════

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<PageHeader title="Dashboard" description="Overview of your data" />);
    expect(screen.getByText('Overview of your data')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  it('should render actions', () => {
    render(
      <PageHeader
        title="Dashboard"
        actions={<button>Create New</button>}
      />
    );
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });

  it('should render breadcrumbs', () => {
    render(
      <PageHeader
        title="Detail Page"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'List', href: '/list' },
          { label: 'Current' },
        ]}
      />
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should render breadcrumb links', () => {
    render(
      <PageHeader
        title="Detail"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ]}
      />
    );
    const homeLink = screen.getByText('Home');
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should render status badge', () => {
    render(
      <PageHeader
        title="Promotion"
        status={{ label: 'Active', variant: 'success' }}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should not render breadcrumbs when not provided', () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });

  it('should not render breadcrumbs when empty array', () => {
    const { container } = render(<PageHeader title="Dashboard" breadcrumbs={[]} />);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });
});
