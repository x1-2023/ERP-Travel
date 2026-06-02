/**
 * SearchInput Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/shared/SearchInput';
import { act } from '@testing-library/react';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with placeholder', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} placeholder="Search items..." />);

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('should render with default placeholder', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should render with initial value', () => {
    const onChange = vi.fn();
    render(<SearchInput value="initial" onChange={onChange} />);

    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
  });

  it('should update internal value on input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'test');

    expect(input).toHaveValue('test');
  });

  it('should debounce onChange calls', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} debounceMs={300} />);

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'test');

    // Should not be called immediately after typing
    expect(onChange).not.toHaveBeenCalled();

    // Fast forward past debounce time
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Now it should be called
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('should show clear button when there is input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search...');

    // No clear button initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    await user.type(input, 'test');

    // Clear button should appear
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onChange = vi.fn();
    render(<SearchInput value="initial" onChange={onChange} />);

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(screen.getByPlaceholderText('Search...')).toHaveValue('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should apply custom className', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SearchInput onChange={onChange} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
