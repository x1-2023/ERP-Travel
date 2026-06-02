/**
 * Utils Test Suite
 * Tests for utility functions in lib/utils.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatDate,
  formatCurrency,
  formatNumber,
  formatPercent,
  truncate,
  getInitials,
  sleep,
  isEmpty,
  formatRelativeTime,
  safeDivide,
  safePercentage,
  safePercentageNumber,
  safeNumber,
} from '@/lib/utils';

// ══════════════════════════════════════════════════════════════════════════════
// cn (class name merge)
// ══════════════════════════════════════════════════════════════════════════════

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('should handle undefined', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('should handle null', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('should return empty string for no arguments', () => {
    expect(cn()).toBe('');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// formatDate
// ══════════════════════════════════════════════════════════════════════════════

describe('formatDate', () => {
  it('should format ISO date string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });

  it('should format Date object', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('should use custom format pattern', () => {
    expect(formatDate('2024-01-15', 'dd/MM/yyyy')).toBe('15/01/2024');
  });

  it('should return dash for empty input', () => {
    expect(formatDate('')).toBe('-');
  });

  it('should handle ISO datetime string', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('Jan 15, 2024');
  });

  it('should format with time pattern', () => {
    expect(formatDate('2024-01-15T10:30:00', 'MMM d, yyyy HH:mm')).toBe('Jan 15, 2024 10:30');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// formatCurrency
// ══════════════════════════════════════════════════════════════════════════════

describe('formatCurrency', () => {
  it('should format number to VND currency', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
    expect(result).toContain('₫');
  });

  it('should format string number', () => {
    const result = formatCurrency('500000');
    expect(result).toContain('500.000');
  });

  it('should format with different currency', () => {
    const result = formatCurrency(1000, 'USD', 'en-US');
    expect(result).toContain('$');
    expect(result).toContain('1,000');
  });

  it('should return dash for NaN', () => {
    expect(formatCurrency(NaN)).toBe('-');
  });

  it('should return dash for invalid string', () => {
    expect(formatCurrency('invalid')).toBe('-');
  });

  it('should handle zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should handle negative numbers', () => {
    const result = formatCurrency(-1000000);
    expect(result).toContain('-');
    expect(result).toContain('1.000.000');
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1000000000000);
    expect(result).toContain('1.000.000.000.000');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// formatNumber
// ══════════════════════════════════════════════════════════════════════════════

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000000)).toBe('1.000.000');
  });

  it('should format string number', () => {
    expect(formatNumber('500000')).toBe('500.000');
  });

  it('should handle decimal numbers', () => {
    expect(formatNumber(1234.56)).toContain('1.234');
  });

  it('should return dash for NaN', () => {
    expect(formatNumber(NaN)).toBe('-');
  });

  it('should return dash for invalid string', () => {
    expect(formatNumber('invalid')).toBe('-');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    const result = formatNumber(-1000000);
    expect(result).toContain('-');
    expect(result).toContain('1.000.000');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// formatPercent
// ══════════════════════════════════════════════════════════════════════════════

describe('formatPercent', () => {
  it('should format percentage with default decimals', () => {
    expect(formatPercent(75.5)).toBe('75.5%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercent(75.555, 2)).toBe('75.56%');
  });

  it('should format percentage with zero decimals', () => {
    expect(formatPercent(75.5, 0)).toBe('76%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('should handle negative percentages', () => {
    expect(formatPercent(-15.5)).toBe('-15.5%');
  });

  it('should handle percentages over 100', () => {
    expect(formatPercent(150)).toBe('150.0%');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// truncate
// ══════════════════════════════════════════════════════════════════════════════

describe('truncate', () => {
  it('should truncate long string', () => {
    expect(truncate('Hello, World!', 5)).toBe('Hello...');
  });

  it('should not truncate short string', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('should handle zero length', () => {
    expect(truncate('Hello', 0)).toBe('...');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// getInitials
// ══════════════════════════════════════════════════════════════════════════════

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should get initials from single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should handle multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('should handle lowercase names', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('should handle mixed case', () => {
    expect(getInitials('jOHN dOE')).toBe('JD');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// sleep
// ══════════════════════════════════════════════════════════════════════════════

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should wait for specified milliseconds', async () => {
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should return a promise', () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// isEmpty
// ══════════════════════════════════════════════════════════════════════════════

describe('isEmpty', () => {
  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty object', () => {
    expect(isEmpty({ key: 'value' })).toBe(false);
  });

  it('should return false for object with multiple keys', () => {
    expect(isEmpty({ a: 1, b: 2 })).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// formatRelativeTime
// ══════════════════════════════════════════════════════════════════════════════

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for recent time', () => {
    expect(formatRelativeTime('2024-01-15T12:00:00Z')).toBe('just now');
  });

  it('should return minutes ago', () => {
    expect(formatRelativeTime('2024-01-15T11:45:00Z')).toBe('15m ago');
  });

  it('should return hours ago', () => {
    expect(formatRelativeTime('2024-01-15T09:00:00Z')).toBe('3h ago');
  });

  it('should return days ago', () => {
    expect(formatRelativeTime('2024-01-13T12:00:00Z')).toBe('2d ago');
  });

  it('should return formatted date for old dates', () => {
    expect(formatRelativeTime('2024-01-01T12:00:00Z')).toBe('Jan 1');
  });

  it('should handle Date object', () => {
    const date = new Date('2024-01-15T11:30:00Z');
    expect(formatRelativeTime(date)).toBe('30m ago');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// safeDivide
// ══════════════════════════════════════════════════════════════════════════════

describe('safeDivide', () => {
  it('should divide normally', () => {
    expect(safeDivide(10, 2)).toBe(5);
  });

  it('should handle decimal results', () => {
    expect(safeDivide(7, 3)).toBeCloseTo(2.333, 2);
  });

  it('should return fallback for division by zero', () => {
    expect(safeDivide(10, 0)).toBe(0);
  });

  it('should return custom fallback for division by zero', () => {
    expect(safeDivide(10, 0, -1)).toBe(-1);
  });

  it('should return fallback for null numerator', () => {
    expect(safeDivide(null, 10)).toBe(0);
  });

  it('should return fallback for undefined numerator', () => {
    expect(safeDivide(undefined, 10)).toBe(0);
  });

  it('should return fallback for null denominator', () => {
    expect(safeDivide(10, null)).toBe(0);
  });

  it('should return fallback for undefined denominator', () => {
    expect(safeDivide(10, undefined)).toBe(0);
  });

  it('should return fallback for NaN numerator', () => {
    expect(safeDivide(NaN, 10)).toBe(0);
  });

  it('should return fallback for NaN denominator', () => {
    expect(safeDivide(10, NaN)).toBe(0);
  });

  it('should return fallback for Infinity result', () => {
    expect(safeDivide(1, Number.MIN_VALUE * 0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(safeDivide(-10, 2)).toBe(-5);
    expect(safeDivide(10, -2)).toBe(-5);
  });

  it('should handle zero numerator', () => {
    expect(safeDivide(0, 10)).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// safePercentage (returns string)
// ══════════════════════════════════════════════════════════════════════════════

describe('safePercentage', () => {
  it('should calculate percentage as string', () => {
    expect(safePercentage(50, 100)).toBe('50.0');
  });

  it('should handle custom decimals', () => {
    expect(safePercentage(33, 100, 2)).toBe('33.00');
  });

  it('should return "0" for zero denominator', () => {
    expect(safePercentage(50, 0)).toBe('0');
  });

  it('should return "0" for null numerator', () => {
    expect(safePercentage(null, 100)).toBe('0');
  });

  it('should return "0" for null denominator', () => {
    expect(safePercentage(50, null)).toBe('0');
  });

  it('should return "0" for undefined inputs', () => {
    expect(safePercentage(undefined, 100)).toBe('0');
    expect(safePercentage(50, undefined)).toBe('0');
  });

  it('should handle percentages over 100', () => {
    const result = parseFloat(safePercentage(150, 100));
    expect(result).toBe(150);
  });

  it('should handle very small percentages', () => {
    expect(safePercentage(1, 10000)).toBe('0.0');
    expect(safePercentage(1, 10000, 3)).toBe('0.010');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// safePercentageNumber (returns number)
// ══════════════════════════════════════════════════════════════════════════════

describe('safePercentageNumber', () => {
  it('should calculate percentage as number', () => {
    expect(safePercentageNumber(50, 100)).toBe(50);
  });

  it('should handle 100% case', () => {
    expect(safePercentageNumber(100, 100)).toBe(100);
  });

  it('should handle over 100%', () => {
    expect(safePercentageNumber(150, 100)).toBe(150);
  });

  it('should return fallback for zero denominator', () => {
    expect(safePercentageNumber(50, 0)).toBe(0);
  });

  it('should return custom fallback', () => {
    expect(safePercentageNumber(50, 0, -1)).toBe(-1);
  });

  it('should return fallback for null numerator', () => {
    expect(safePercentageNumber(null, 100)).toBe(0);
  });

  it('should return fallback for undefined denominator', () => {
    expect(safePercentageNumber(50, undefined)).toBe(0);
  });

  it('should return fallback for NaN inputs', () => {
    expect(safePercentageNumber(NaN, 100)).toBe(0);
    expect(safePercentageNumber(50, NaN)).toBe(0);
  });

  it('should handle fractional results', () => {
    expect(safePercentageNumber(1, 3)).toBeCloseTo(33.33, 1);
  });

  it('should handle negative numerator', () => {
    expect(safePercentageNumber(-50, 100)).toBe(-50);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// safeNumber
// ══════════════════════════════════════════════════════════════════════════════

describe('safeNumber', () => {
  it('should format valid number', () => {
    expect(safeNumber(1000000)).toBe('1.000.000');
  });

  it('should return fallback for null', () => {
    expect(safeNumber(null)).toBe('0');
  });

  it('should return fallback for undefined', () => {
    expect(safeNumber(undefined)).toBe('0');
  });

  it('should return fallback for NaN', () => {
    expect(safeNumber(NaN)).toBe('0');
  });

  it('should return custom fallback', () => {
    expect(safeNumber(null, 'N/A')).toBe('N/A');
  });

  it('should handle zero', () => {
    expect(safeNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    const result = safeNumber(-1000);
    expect(result).toContain('1.000');
  });
});
