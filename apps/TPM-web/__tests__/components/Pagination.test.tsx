/**
 * Pagination Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/shared/Pagination';

describe('Pagination', () => {
  it('should render current page info', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
  });

  it('should render total count info', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        pageSize={10}
        totalCount={50}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/Showing 1 to 10 of 50 results/)).toBeInTheDocument();
  });

  it('should disable previous buttons on first page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    // Get all buttons - first two are "go to first" and "go to previous"
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled(); // First page
    expect(buttons[1]).toBeDisabled(); // Previous page
    expect(buttons[2]).not.toBeDisabled(); // Next page
    expect(buttons[3]).not.toBeDisabled(); // Last page
  });

  it('should disable next buttons on last page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={10}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled(); // First page
    expect(buttons[1]).not.toBeDisabled(); // Previous page
    expect(buttons[2]).toBeDisabled(); // Next page
    expect(buttons[3]).toBeDisabled(); // Last page
  });

  it('should call onPageChange when clicking next', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[2]); // Next page

    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it('should call onPageChange when clicking previous', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // Previous page

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('should go to first page when clicking first button', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // First page

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should go to last page when clicking last button', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[3]); // Last page

    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it('should handle single page correctly', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    // All navigation buttons should be disabled on single page
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should show correct range for middle pages', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        pageSize={10}
        totalCount={50}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/Showing 21 to 30 of 50 results/)).toBeInTheDocument();
  });

  it('should show correct range for last page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/Showing 21 to 25 of 25 results/)).toBeInTheDocument();
  });
});
