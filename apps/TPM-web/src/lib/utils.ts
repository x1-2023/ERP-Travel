/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date
 */
export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

/**
 * Format currency (VND)
 */
export function formatCurrency(
  amount: number | string,
  currency = 'VND',
  locale = 'vi-VN'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) return '-';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format number with separators
 */
export function formatNumber(num: number | string, locale = 'vi-VN'): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(n)) return '-';

  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  if (value == null || isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Safely divide two numbers, returning fallback if division would fail
 */
export function safeDivide(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  fallback = 0,
): number {
  if (numerator == null || isNaN(numerator)) return fallback;
  if (denominator == null || isNaN(denominator) || denominator === 0) return fallback;
  const result = numerator / denominator;
  if (!isFinite(result)) return fallback;
  return result;
}

/**
 * Calculate percentage safely, returning '0' for invalid inputs
 */
export function safePercentage(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  decimals = 1,
): string {
  if (!numerator || !denominator || denominator === 0) return '0';
  const pct = (numerator / denominator) * 100;
  if (isNaN(pct) || !isFinite(pct)) return '0';
  return pct.toFixed(decimals);
}

/**
 * Calculate percentage safely as a number (0-100 scale)
 */
export function safePercentageNumber(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  fallback = 0,
): number {
  if (numerator == null || isNaN(numerator)) return fallback;
  if (denominator == null || isNaN(denominator) || denominator === 0) return fallback;
  const pct = (numerator / denominator) * 100;
  if (!isFinite(pct)) return fallback;
  return pct;
}

/**
 * Format number safely, returning fallback for invalid inputs
 */
export function safeNumber(
  value: number | null | undefined,
  fallback = '0',
): string {
  if (value == null || isNaN(value)) return fallback;
  return formatNumber(value);
}

/**
 * Truncate text
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(d, 'MMM d');
}
