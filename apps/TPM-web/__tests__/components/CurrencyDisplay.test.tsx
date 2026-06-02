/**
 * CurrencyDisplay Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { CurrencyDisplay, formatCurrencyCompact, CurrencyToggle } from '@/components/ui/currency-display';

// ═══════════════════════════════════════════════════════════════
// CurrencyDisplay Component
// ═══════════════════════════════════════════════════════════════

describe('CurrencyDisplay', () => {
  it('should render VND amount by default', () => {
    render(<CurrencyDisplay amount={5000000} />);
    expect(screen.getByText('5 triệu')).toBeInTheDocument();
    expect(screen.getByText('VND')).toBeInTheDocument();
  });

  it('should render USD amount when defaultCurrency is USD', () => {
    render(<CurrencyDisplay amount={25000000} defaultCurrency="USD" exchangeRate={25000} />);
    expect(screen.getByText('$1K')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('should toggle between VND and USD on badge click', () => {
    render(<CurrencyDisplay amount={50000000} />);
    expect(screen.getByText('VND')).toBeInTheDocument();
    expect(screen.getByText('50 triệu')).toBeInTheDocument();

    // Click the currency badge to toggle
    fireEvent.click(screen.getByText('VND'));

    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('$2K')).toBeInTheDocument();
  });

  it('should not show toggle badge when showToggle is false', () => {
    render(<CurrencyDisplay amount={5000000} showToggle={false} />);
    expect(screen.queryByText('VND')).not.toBeInTheDocument();
  });

  it('should show toggle badge by default', () => {
    render(<CurrencyDisplay amount={5000000} />);
    expect(screen.getByText('VND')).toBeInTheDocument();
  });

  it('should render dash for undefined amount', () => {
    render(<CurrencyDisplay amount={undefined as any} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render dash for NaN amount', () => {
    render(<CurrencyDisplay amount={NaN} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render VND billions correctly', () => {
    render(<CurrencyDisplay amount={2500000000} />);
    expect(screen.getByText('2.5 tỷ')).toBeInTheDocument();
  });

  it('should render VND trillions correctly', () => {
    render(<CurrencyDisplay amount={1500000000000} />);
    expect(screen.getByText('1.5 nghìn tỷ')).toBeInTheDocument();
  });

  it('should render VND thousands correctly', () => {
    render(<CurrencyDisplay amount={5000} />);
    expect(screen.getByText('5K')).toBeInTheDocument();
  });

  it('should render small VND amounts with dong symbol', () => {
    render(<CurrencyDisplay amount={500} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should use custom exchange rate', () => {
    // 50M VND / 20000 = $2500
    render(<CurrencyDisplay amount={50000000} defaultCurrency="USD" exchangeRate={20000} />);
    expect(screen.getByText('$2.5K')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<CurrencyDisplay amount={1000000} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// formatCurrencyCompact Utility
// ═══════════════════════════════════════════════════════════════

describe('formatCurrencyCompact', () => {
  it('should format VND millions', () => {
    expect(formatCurrencyCompact(5000000)).toBe('5 triệu');
  });

  it('should format VND billions', () => {
    expect(formatCurrencyCompact(2500000000)).toBe('2.5 tỷ');
  });

  it('should format VND trillions', () => {
    expect(formatCurrencyCompact(1000000000000)).toBe('1 nghìn tỷ');
  });

  it('should format VND thousands', () => {
    expect(formatCurrencyCompact(5000)).toBe('5K');
  });

  it('should format USD millions', () => {
    // 250B VND / 25000 = $10M
    expect(formatCurrencyCompact(250000000000, 'USD', 25000)).toBe('$10M');
  });

  it('should format USD thousands', () => {
    // 50M VND / 25000 = $2K
    expect(formatCurrencyCompact(50000000, 'USD', 25000)).toBe('$2K');
  });

  it('should format USD billions', () => {
    // 25T VND / 25000 = $1B
    expect(formatCurrencyCompact(25000000000000, 'USD', 25000)).toBe('$1B');
  });

  it('should return dash for null', () => {
    expect(formatCurrencyCompact(null)).toBe('-');
  });

  it('should return dash for undefined', () => {
    expect(formatCurrencyCompact(undefined)).toBe('-');
  });

  it('should return dash for NaN', () => {
    expect(formatCurrencyCompact(NaN)).toBe('-');
  });

  it('should use default exchange rate', () => {
    // Default rate is 25000
    // 25M VND / 25000 = $1K
    expect(formatCurrencyCompact(25000000, 'USD')).toBe('$1K');
  });

  it('should handle zero amount', () => {
    const result = formatCurrencyCompact(0);
    expect(result).toContain('0');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrencyCompact(-5000000);
    expect(result).toContain('triệu');
  });
});

// ═══════════════════════════════════════════════════════════════
// CurrencyToggle Component
// ═══════════════════════════════════════════════════════════════

describe('CurrencyToggle', () => {
  it('should render VND and USD buttons', () => {
    render(<CurrencyToggle currency="VND" onChange={vi.fn()} />);
    expect(screen.getByText('VND')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('should highlight active currency', () => {
    render(<CurrencyToggle currency="VND" onChange={vi.fn()} />);
    const vndButton = screen.getByText('VND');
    expect(vndButton).toHaveClass('bg-background');
  });

  it('should call onChange when clicking USD', () => {
    const onChange = vi.fn();
    render(<CurrencyToggle currency="VND" onChange={onChange} />);
    fireEvent.click(screen.getByText('USD'));
    expect(onChange).toHaveBeenCalledWith('USD');
  });

  it('should call onChange when clicking VND', () => {
    const onChange = vi.fn();
    render(<CurrencyToggle currency="USD" onChange={onChange} />);
    fireEvent.click(screen.getByText('VND'));
    expect(onChange).toHaveBeenCalledWith('VND');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CurrencyToggle currency="VND" onChange={vi.fn()} className="custom-toggle" />
    );
    expect(container.querySelector('.custom-toggle')).toBeInTheDocument();
  });
});
