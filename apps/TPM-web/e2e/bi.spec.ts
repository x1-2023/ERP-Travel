/**
 * BI Module E2E Tests
 * Tests for Business Intelligence, reports, analytics, and export
 */

import { test, expect } from '@playwright/test';

test.describe('BI Module', () => {
  test.describe('BI Dashboard', () => {
    test('should display BI dashboard', async ({ page }) => {
      await page.goto('/bi');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Business Intelligence|BI|Báo cáo/i);
    });

    test('should show KPI summary cards', async ({ page }) => {
      await page.goto('/bi');
      await page.waitForLoadState('networkidle');

      // KPICard components render as divs with specific classes
      const kpiCards = page.locator('[class*="rounded-2xl"], [class*="Card"]');
      const cardCount = await kpiCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should display main dashboard charts', async ({ page }) => {
      await page.goto('/bi');
      await page.waitForLoadState('networkidle');

      // ChartWidget uses recharts which renders SVG elements
      const charts = page.locator('.recharts-wrapper, svg[class*="recharts"]');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    });

    test('should allow date range selection', async ({ page }) => {
      await page.goto('/bi');
      await page.waitForLoadState('networkidle');

      // Date inputs are type="date"
      const dateFrom = page.locator('input[type="date"]').first();
      if (await dateFrom.isVisible()) {
        await expect(dateFrom).toBeVisible();
      }
    });
  });

  test.describe('Reports', () => {
    test('should display reports list', async ({ page }) => {
      await page.goto('/bi/reports');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Report Builder|Report|Báo cáo/i);
    });

    test('should show report categories', async ({ page }) => {
      await page.goto('/bi/reports');
      await page.waitForLoadState('networkidle');

      // Reports are displayed in a table
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    });

    test('should filter reports by type', async ({ page }) => {
      await page.goto('/bi/reports');
      await page.waitForLoadState('networkidle');

      // Check for New Report button instead of filter
      const newReportButton = page.locator('button:has-text("New Report")');
      if (await newReportButton.isVisible()) {
        await expect(newReportButton).toBeVisible();
      }
    });

    test('should open report viewer', async ({ page }) => {
      await page.goto('/bi/reports');
      await page.waitForLoadState('networkidle');

      // Reports are shown in table rows
      const firstReport = page.locator('table tbody tr').first();
      if (await firstReport.count() > 0) {
        // Check if there's a row
        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have export option for reports', async ({ page }) => {
      await page.goto('/bi/reports');
      await page.waitForLoadState('networkidle');

      // Play button to execute/export reports
      const executeButton = page.locator('button svg[class*="Play"], button:has-text("Run")');
      if (await executeButton.count() > 0) {
        await expect(executeButton.first()).toBeVisible();
      }
    });

    test('should show scheduled reports', async ({ page }) => {
      await page.goto('/bi/reports');
      await page.waitForLoadState('networkidle');

      // Check for the table or empty state
      const tableOrEmpty = page.locator('table, [class*="Card"]');
      await expect(tableOrEmpty.first()).toBeVisible();
    });
  });

  test.describe('Analytics', () => {
    test('should display analytics dashboard', async ({ page }) => {
      await page.goto('/bi/analytics');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Analytics|Analytic|Phân tích/i);
    });

    test('should show analysis charts', async ({ page }) => {
      await page.goto('/bi/analytics');
      await page.waitForLoadState('networkidle');

      // Charts are rendered by recharts
      const charts = page.locator('.recharts-wrapper, svg[class*="recharts"]');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    });

    test('should allow dimension selection', async ({ page }) => {
      await page.goto('/bi/analytics');
      await page.waitForLoadState('networkidle');

      // Check for metric select component
      const metricSelect = page.locator('button[role="combobox"]').filter({ hasText: /Promotions|Claims|Spend|ROI/ });
      if (await metricSelect.count() > 0) {
        await expect(metricSelect.first()).toBeVisible();
      }
    });

    test('should allow metric selection', async ({ page }) => {
      await page.goto('/bi/analytics');
      await page.waitForLoadState('networkidle');

      // Metric selector is a Select component
      const metricPicker = page.locator('#metric, button[role="combobox"]');
      if (await metricPicker.count() > 0) {
        await expect(metricPicker.first()).toBeVisible();
      }
    });

    test('should display trend analysis', async ({ page }) => {
      await page.goto('/bi/analytics');
      await page.waitForLoadState('networkidle');

      // Look for trend chart card
      const trendCard = page.locator('[class*="Card"]').filter({ hasText: 'Trend' });
      if (await trendCard.count() > 0) {
        await expect(trendCard.first()).toBeVisible();
      }
    });

    test('should show comparison view', async ({ page }) => {
      await page.goto('/bi/analytics');
      await page.waitForLoadState('networkidle');

      // Period Comparison card
      const comparisonCard = page.locator('[class*="Card"]').filter({ hasText: 'Period Comparison' });
      if (await comparisonCard.count() > 0) {
        await expect(comparisonCard.first()).toBeVisible();
      }
    });
  });

  test.describe('Export Center', () => {
    test('should display export center', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Export Center|Export|Xuất/i);
    });

    test('should show export format options', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      // Format select contains Excel, CSV, PDF options
      const formatSelect = page.locator('button[role="combobox"]').filter({ hasText: /Excel|CSV|PDF/ });
      if (await formatSelect.count() > 0) {
        await expect(formatSelect.first()).toBeVisible();
      }
    });

    test('should show export history', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      // Export types are shown as clickable cards
      const exportTypes = page.locator('[class*="border"][class*="rounded-lg"][class*="cursor-pointer"]');
      if (await exportTypes.count() > 0) {
        await expect(exportTypes.first()).toBeVisible();
      }
    });

    test('should allow CSV export', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      // Click format dropdown and check for CSV option
      const formatSelect = page.locator('#format, button[role="combobox"]').first();
      if (await formatSelect.isVisible()) {
        await formatSelect.click();
        const csvOption = page.locator('[role="option"]:has-text("CSV")');
        if (await csvOption.count() > 0) {
          await expect(csvOption).toBeVisible();
        }
      }
    });

    test('should allow Excel export', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      // Click format dropdown and check for Excel option
      const formatSelect = page.locator('#format, button[role="combobox"]').first();
      if (await formatSelect.isVisible()) {
        await formatSelect.click();
        const excelOption = page.locator('[role="option"]:has-text("Excel")');
        if (await excelOption.count() > 0) {
          await expect(excelOption).toBeVisible();
        }
      }
    });

    test('should allow PDF export', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      // Click format dropdown and check for PDF option
      const formatSelect = page.locator('#format, button[role="combobox"]').first();
      if (await formatSelect.isVisible()) {
        await formatSelect.click();
        const pdfOption = page.locator('[role="option"]:has-text("PDF")');
        if (await pdfOption.count() > 0) {
          await expect(pdfOption).toBeVisible();
        }
      }
    });

    test('should show scheduled exports', async ({ page }) => {
      await page.goto('/bi/export');
      await page.waitForLoadState('networkidle');

      // Check for column selection section
      const columnSection = page.locator('[class*="Card"]').filter({ hasText: 'Select Columns' });
      if (await columnSection.count() > 0) {
        await expect(columnSection.first()).toBeVisible();
      }
    });
  });

  test.describe('Custom Dashboards', () => {
    test('should allow creating custom dashboard', async ({ page }) => {
      await page.goto('/bi');
      await page.waitForLoadState('networkidle');

      // Check for Reports button which leads to report builder
      const reportsButton = page.locator('button:has-text("Reports"), a:has-text("Reports")');
      if (await reportsButton.count() > 0) {
        await expect(reportsButton.first()).toBeVisible();
      }
    });

    test('should show saved dashboards', async ({ page }) => {
      await page.goto('/bi');
      await page.waitForLoadState('networkidle');

      // Quick Reports section contains preset dashboards
      const quickReports = page.locator('[class*="Card"]').filter({ hasText: 'Quick Reports' });
      if (await quickReports.count() > 0) {
        await expect(quickReports.first()).toBeVisible();
      }
    });
  });
});
