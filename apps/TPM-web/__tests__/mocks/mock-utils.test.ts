// =============================================================================
// Tests for src/mocks/utils/date-helpers.ts
// =============================================================================

import { describe, it, expect } from 'vitest';

import {
  formatDate,
  formatISO,
  formatPeriod,
  formatShort,
  subDays,
  addDays,
  addMonths,
  today,
} from '@/mocks/utils/date-helpers';
import dateHelpers from '@/mocks/utils/date-helpers';

describe('mocks/utils/date-helpers', () => {
  // Use a fixed date for predictable tests
  const fixedDate = new Date('2026-03-15T10:30:00.000Z');

  describe('formatDate', () => {
    it('should format date to yyyy-MM-dd', () => {
      expect(formatDate(fixedDate)).toBe('2026-03-15');
    });

    it('should handle start of year', () => {
      const newYear = new Date('2026-01-01T00:00:00.000Z');
      expect(formatDate(newYear)).toBe('2026-01-01');
    });

    it('should handle end of year', () => {
      const endYear = new Date('2025-12-31T23:59:59.000Z');
      expect(formatDate(endYear)).toBe('2025-12-31');
    });
  });

  describe('formatISO', () => {
    it('should return an ISO string', () => {
      const result = formatISO(fixedDate);
      expect(result).toBe('2026-03-15T10:30:00.000Z');
    });

    it('should be a valid ISO date string', () => {
      const result = formatISO(fixedDate);
      expect(new Date(result).toISOString()).toBe(result);
    });
  });

  describe('formatPeriod', () => {
    it('should format date to yyyy-MM', () => {
      const result = formatPeriod(fixedDate);
      expect(result).toBe('2026-03');
    });

    it('should zero-pad single-digit months', () => {
      const jan = new Date('2026-01-15T00:00:00.000Z');
      expect(formatPeriod(jan)).toBe('2026-01');
    });

    it('should handle December correctly', () => {
      const dec = new Date('2025-12-15T00:00:00.000Z');
      expect(formatPeriod(dec)).toBe('2025-12');
    });
  });

  describe('formatShort', () => {
    it('should format date to dd/MM', () => {
      const result = formatShort(fixedDate);
      expect(result).toBe('15/03');
    });

    it('should zero-pad single-digit days', () => {
      const earlyDay = new Date('2026-01-05T00:00:00.000Z');
      expect(formatShort(earlyDay)).toBe('05/01');
    });
  });

  describe('subDays', () => {
    it('should subtract days from a date', () => {
      const result = subDays(fixedDate, 5);
      expect(result.getTime()).toBe(fixedDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    });

    it('should return same date when subtracting 0 days', () => {
      const result = subDays(fixedDate, 0);
      expect(result.getTime()).toBe(fixedDate.getTime());
    });

    it('result should be a Date instance', () => {
      const result = subDays(fixedDate, 1);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle large day values', () => {
      const result = subDays(fixedDate, 365);
      expect(formatDate(result)).toBe('2025-03-15');
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const result = addDays(fixedDate, 10);
      expect(result.getTime()).toBe(fixedDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    });

    it('should return same date when adding 0 days', () => {
      const result = addDays(fixedDate, 0);
      expect(result.getTime()).toBe(fixedDate.getTime());
    });

    it('result should be a Date instance', () => {
      const result = addDays(fixedDate, 1);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('addMonths', () => {
    it('should add months to a date', () => {
      const result = addMonths(fixedDate, 2);
      expect(result.getMonth()).toBe(fixedDate.getMonth() + 2);
    });

    it('should handle year boundary', () => {
      const nov = new Date('2025-11-15T00:00:00.000Z');
      const result = addMonths(nov, 3);
      expect(result.getMonth()).toBe(1); // February (0-indexed)
      expect(result.getFullYear()).toBe(2026);
    });

    it('should handle negative months', () => {
      const result = addMonths(fixedDate, -1);
      expect(result.getMonth()).toBe(fixedDate.getMonth() - 1);
    });

    it('result should be a Date instance', () => {
      const result = addMonths(fixedDate, 1);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('today', () => {
    it('should return a Date instance', () => {
      const result = today();
      expect(result).toBeInstanceOf(Date);
    });

    it('should return approximately the current time', () => {
      const before = Date.now();
      const result = today();
      const after = Date.now();
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('default export', () => {
    it('should export all functions', () => {
      expect(dateHelpers).toHaveProperty('formatDate');
      expect(dateHelpers).toHaveProperty('formatISO');
      expect(dateHelpers).toHaveProperty('formatPeriod');
      expect(dateHelpers).toHaveProperty('formatShort');
      expect(dateHelpers).toHaveProperty('subDays');
      expect(dateHelpers).toHaveProperty('addDays');
      expect(dateHelpers).toHaveProperty('addMonths');
      expect(dateHelpers).toHaveProperty('today');
    });

    it('default export functions should be the same as named exports', () => {
      expect(dateHelpers.formatDate).toBe(formatDate);
      expect(dateHelpers.formatISO).toBe(formatISO);
      expect(dateHelpers.formatPeriod).toBe(formatPeriod);
      expect(dateHelpers.formatShort).toBe(formatShort);
      expect(dateHelpers.subDays).toBe(subDays);
      expect(dateHelpers.addDays).toBe(addDays);
      expect(dateHelpers.addMonths).toBe(addMonths);
      expect(dateHelpers.today).toBe(today);
    });
  });
});
