// ══════════════════════════════════════════════════════════════════════════════
//                    DATE HELPERS (No external dependencies)
//                    Alternative if you don't have date-fns installed
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Format date to 'yyyy-MM-dd'
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date to ISO string
 */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Format date to 'yyyy-MM' (period)
 */
export function formatPeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format date to 'dd/MM' 
 */
export function formatShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Subtract days from date
 */
export function subDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Add months to date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get today's date
 */
export function today(): Date {
  return new Date();
}

// ══════════════════════════════════════════════════════════════════════════════
// USAGE IN MOCK DATA:
// 
// Instead of:
//   import { addDays, subDays, format } from 'date-fns';
//   format(subDays(today, 5), 'yyyy-MM-dd')
//
// Use:
//   import { addDays, subDays, formatDate, today } from './date-helpers';
//   formatDate(subDays(today(), 5))
// ══════════════════════════════════════════════════════════════════════════════

export default {
  formatDate,
  formatISO,
  formatPeriod,
  formatShort,
  subDays,
  addDays,
  addMonths,
  today,
};
