// =============================================================================
// Tests for src/mocks/utils/date-helpers.ts (the project's date-helpers utility)
// Note: src/lib/date-helpers.ts does not exist; this tests the actual
// date-helpers implementation at src/mocks/utils/date-helpers.ts
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

describe('date-helpers (src/mocks/utils/date-helpers)', () => {
  const fixedDate = new Date('2026-06-20T14:00:00.000Z');

  describe('formatDate', () => {
    it('should return yyyy-MM-dd format', () => {
      expect(formatDate(fixedDate)).toBe('2026-06-20');
    });

    it('should handle February 28 non-leap year', () => {
      const feb28 = new Date('2025-02-28T12:00:00.000Z');
      expect(formatDate(feb28)).toBe('2025-02-28');
    });

    it('should handle leap year Feb 29', () => {
      const feb29 = new Date('2024-02-29T12:00:00.000Z');
      expect(formatDate(feb29)).toBe('2024-02-29');
    });
  });

  describe('formatISO', () => {
    it('should return full ISO string', () => {
      expect(formatISO(fixedDate)).toBe('2026-06-20T14:00:00.000Z');
    });

    it('should be parseable back to the same date', () => {
      const iso = formatISO(fixedDate);
      expect(new Date(iso).getTime()).toBe(fixedDate.getTime());
    });
  });

  describe('formatPeriod', () => {
    it('should return yyyy-MM format', () => {
      expect(formatPeriod(fixedDate)).toBe('2026-06');
    });

    it('should pad single digit month', () => {
      const jan = new Date('2026-01-01T00:00:00.000Z');
      expect(formatPeriod(jan)).toBe('2026-01');
    });

    it('should handle month 10 (October) without extra padding', () => {
      const oct = new Date('2026-10-01T00:00:00.000Z');
      expect(formatPeriod(oct)).toBe('2026-10');
    });
  });

  describe('formatShort', () => {
    it('should return dd/MM format', () => {
      expect(formatShort(fixedDate)).toBe('20/06');
    });

    it('should pad single digit day and month', () => {
      const d = new Date('2026-01-02T00:00:00.000Z');
      expect(formatShort(d)).toBe('02/01');
    });
  });

  describe('subDays', () => {
    it('should subtract the correct number of days', () => {
      const result = subDays(fixedDate, 10);
      expect(formatDate(result)).toBe('2026-06-10');
    });

    it('should handle month boundary', () => {
      const startOfMonth = new Date('2026-06-01T00:00:00.000Z');
      const result = subDays(startOfMonth, 1);
      expect(formatDate(result)).toBe('2026-05-31');
    });
  });

  describe('addDays', () => {
    it('should add the correct number of days', () => {
      const result = addDays(fixedDate, 5);
      expect(formatDate(result)).toBe('2026-06-25');
    });

    it('should handle month boundary', () => {
      const endOfMonth = new Date('2026-06-30T00:00:00.000Z');
      const result = addDays(endOfMonth, 1);
      expect(formatDate(result)).toBe('2026-07-01');
    });
  });

  describe('addMonths', () => {
    it('should add the correct number of months', () => {
      const result = addMonths(fixedDate, 3);
      expect(result.getMonth()).toBe(8); // September (0-indexed)
    });

    it('should wrap around year boundary', () => {
      const dec = new Date('2025-12-15T00:00:00.000Z');
      const result = addMonths(dec, 2);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getFullYear()).toBe(2026);
    });

    it('should subtract months with negative value', () => {
      const result = addMonths(fixedDate, -6);
      expect(result.getMonth()).toBe(11); // December of prior year
      expect(result.getFullYear()).toBe(2025);
    });
  });

  describe('today', () => {
    it('should return a Date', () => {
      expect(today()).toBeInstanceOf(Date);
    });

    it('should return a date very close to now', () => {
      const now = Date.now();
      const result = today().getTime();
      expect(Math.abs(result - now)).toBeLessThan(1000);
    });
  });

  describe('default export object', () => {
    it('should contain all 8 functions', () => {
      const keys = Object.keys(dateHelpers);
      expect(keys).toContain('formatDate');
      expect(keys).toContain('formatISO');
      expect(keys).toContain('formatPeriod');
      expect(keys).toContain('formatShort');
      expect(keys).toContain('subDays');
      expect(keys).toContain('addDays');
      expect(keys).toContain('addMonths');
      expect(keys).toContain('today');
      expect(keys.length).toBe(8);
    });
  });
});
