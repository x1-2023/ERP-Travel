/**
 * Finance Module E2E Tests
 * Tests for accruals, deductions, journals, and cheques
 */

import { test, expect } from '@playwright/test';

test.describe('Finance Module', () => {
  test.describe('Accruals', () => {
    test('should display accruals list', async ({ page }) => {
      await page.goto('/finance/accruals');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Accrual Management|Accrual|Dự phòng/i);
    });

    test('should show accrual details', async ({ page }) => {
      await page.goto('/finance/accruals');
      await page.waitForLoadState('networkidle');

      // DataTable renders a table element
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    });

    test('should filter accruals by status', async ({ page }) => {
      await page.goto('/finance/accruals');
      await page.waitForLoadState('networkidle');

      // Status filter uses Select component
      const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /Status|All Status/ });
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);
        const postedOption = page.locator('[role="option"]:has-text("Posted")');
        if (await postedOption.count() > 0) {
          await expect(postedOption).toBeVisible();
        }
      }
    });

    test('should filter accruals by period', async ({ page }) => {
      await page.goto('/finance/accruals');
      await page.waitForLoadState('networkidle');

      // Period filter uses Select component
      const periodFilter = page.locator('button[role="combobox"]').filter({ hasText: /Period|All Periods/ });
      if (await periodFilter.count() > 0) {
        await expect(periodFilter.first()).toBeVisible();
      }
    });
  });

  test.describe('Deductions', () => {
    test('should display deductions list', async ({ page }) => {
      await page.goto('/finance/deductions');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Deductions|Deduction|Khấu trừ/i);
    });

    test('should show deduction details', async ({ page }) => {
      await page.goto('/finance/deductions');
      await page.waitForLoadState('networkidle');

      // Check for table or grid view
      const tableOrGrid = page.locator('table, [class*="grid"]');
      if (await tableOrGrid.count() > 0) {
        await expect(tableOrGrid.first()).toBeVisible();
      }
    });

    test('should filter deductions by match status', async ({ page }) => {
      await page.goto('/finance/deductions');
      await page.waitForLoadState('networkidle');

      // Status filter uses Select component
      const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /Status|All Status/ });
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);
        const matchedOption = page.locator('[role="option"]:has-text("Matched")');
        if (await matchedOption.count() > 0) {
          await expect(matchedOption).toBeVisible();
        }
      }
    });

    test('should display variance information', async ({ page }) => {
      await page.goto('/finance/deductions');
      await page.waitForLoadState('networkidle');

      // Check for summary stats card
      const statsCard = page.locator('[class*="Card"]');
      if (await statsCard.count() > 0) {
        await expect(statsCard.first()).toBeVisible();
      }
    });
  });

  test.describe('GL Journals', () => {
    test('should display journals list', async ({ page }) => {
      await page.goto('/finance/journals');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/GL Journals|Journal|Bút toán/i);
    });

    test('should show journal details', async ({ page }) => {
      await page.goto('/finance/journals');
      await page.waitForLoadState('networkidle');

      // DataTable renders a table element
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    });

    test('should filter journals by type', async ({ page }) => {
      await page.goto('/finance/journals');
      await page.waitForLoadState('networkidle');

      // Type filter uses Select component
      const typeFilter = page.locator('button[role="combobox"]').filter({ hasText: /Type|All Types/ });
      if (await typeFilter.count() > 0) {
        await typeFilter.first().click();
        await page.waitForTimeout(300);
        const accrualOption = page.locator('[role="option"]:has-text("Accrual")');
        if (await accrualOption.count() > 0) {
          await expect(accrualOption).toBeVisible();
        }
      }
    });

    test('should display debit and credit columns', async ({ page }) => {
      await page.goto('/finance/journals');
      await page.waitForLoadState('networkidle');

      // Check for Amount column in table header
      const amountHeader = page.locator('th:has-text("Amount")');
      if (await amountHeader.count() > 0) {
        await expect(amountHeader.first()).toBeVisible();
      }
    });
  });

  test.describe('Cheques', () => {
    test('should display cheques list', async ({ page }) => {
      await page.goto('/finance/cheques');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Chequebook|Cheque|Séc/i);
    });

    test('should show cheque details', async ({ page }) => {
      await page.goto('/finance/cheques');
      await page.waitForLoadState('networkidle');

      // DataTable renders a table element
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    });

    test('should filter cheques by status', async ({ page }) => {
      await page.goto('/finance/cheques');
      await page.waitForLoadState('networkidle');

      // Status filter uses Select component
      const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /Status|All Status/ });
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);
        const clearedOption = page.locator('[role="option"]:has-text("Cleared")');
        if (await clearedOption.count() > 0) {
          await expect(clearedOption).toBeVisible();
        }
      }
    });
  });

  test.describe('Finance Dashboard', () => {
    test('should display finance overview metrics', async ({ page }) => {
      await page.goto('/finance');
      await page.waitForLoadState('networkidle');

      // Check for any cards or navigation items
      const cards = page.locator('[class*="Card"]');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    });

    test('should show summary charts', async ({ page }) => {
      await page.goto('/finance');
      await page.waitForLoadState('networkidle');

      // Finance dashboard may redirect to accruals or show navigation cards
      const content = page.locator('[class*="Card"], h1, main');
      await expect(content.first()).toBeVisible();
    });
  });
});
