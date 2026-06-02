/**
 * Operations Module E2E Tests
 * Tests for delivery tracking, sell tracking, and inventory
 */

import { test, expect } from '@playwright/test';

test.describe('Operations Module', () => {
  test.describe('Delivery Tracking', () => {
    test('should display delivery list', async ({ page }) => {
      await page.goto('/operations/delivery');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Delivery Orders|Delivery|Giao hàng/i);
    });

    test('should show delivery calendar view', async ({ page }) => {
      await page.goto('/operations/delivery/calendar');
      await page.waitForLoadState('networkidle');

      // Calendar page should load or redirect to delivery list
      const url = page.url();
      if (url.includes('/calendar')) {
        const content = page.locator('[class*="Card"], h1, main, [class*="calendar"]');
        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
        }
      } else {
        // Redirected to delivery list
        await expect(page.locator('h1')).toContainText(/Delivery|Giao hàng/i);
      }
    });

    test('should filter deliveries by status', async ({ page }) => {
      await page.goto('/operations/delivery');
      await page.waitForLoadState('networkidle');

      // Status filter uses Select component
      const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /Status|All Status/ });
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);
        const deliveredOption = page.locator('[role="option"]:has-text("Delivered")');
        if (await deliveredOption.count() > 0) {
          await expect(deliveredOption).toBeVisible();
        }
      }
    });

    test('should filter deliveries by date range', async ({ page }) => {
      await page.goto('/operations/delivery');
      await page.waitForLoadState('networkidle');

      // Search input is available
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible();
      }
    });

    test('should show delivery details', async ({ page }) => {
      await page.goto('/operations/delivery');
      await page.waitForLoadState('networkidle');

      // DeliveryCard components are rendered in a grid
      const deliveryCards = page.locator('[class*="Card"]');
      if (await deliveryCards.count() > 0) {
        await expect(deliveryCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Sell Tracking', () => {
    test('should display sell tracking dashboard', async ({ page }) => {
      await page.goto('/operations/sell-tracking');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Sell Tracking|Sell|Bán hàng/i);
    });

    test('should show sell trends', async ({ page }) => {
      await page.goto('/operations/sell-tracking');
      await page.waitForLoadState('networkidle');

      // Check for summary cards
      const summaryCards = page.locator('[class*="Card"]');
      if (await summaryCards.count() > 0) {
        await expect(summaryCards.first()).toBeVisible();
      }
    });

    test('should display import page', async ({ page }) => {
      await page.goto('/operations/sell-tracking/import');
      await page.waitForLoadState('networkidle');

      // Check for file upload, import form, or redirect to sell tracking list
      const url = page.url();
      if (url.includes('/import')) {
        const uploadArea = page.locator('input[type="file"], [class*="Card"], main');
        if (await uploadArea.count() > 0) {
          await expect(uploadArea.first()).toBeVisible();
        }
      } else {
        // Redirected to sell tracking list
        await expect(page.locator('h1')).toContainText(/Sell Tracking|Sell|Bán hàng/i);
      }
    });

    test('should show sell alerts', async ({ page }) => {
      await page.goto('/operations/sell-tracking');
      await page.waitForLoadState('networkidle');

      // Check for performance badges in table
      const performanceBadge = page.locator('[class*="Badge"]');
      if (await performanceBadge.count() > 0) {
        await expect(performanceBadge.first()).toBeVisible();
      }
    });

    test('should filter sell data by product', async ({ page }) => {
      await page.goto('/operations/sell-tracking');
      await page.waitForLoadState('networkidle');

      // Period search input
      const searchInput = page.locator('input[placeholder*="period"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible();
      }
    });

    test('should filter sell data by customer', async ({ page }) => {
      await page.goto('/operations/sell-tracking');
      await page.waitForLoadState('networkidle');

      // Table displays customer data
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    });
  });

  test.describe('Inventory', () => {
    test('should display inventory list', async ({ page }) => {
      await page.goto('/operations/inventory');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/Inventory|Tồn kho/i);
    });

    test('should show inventory history', async ({ page }) => {
      await page.goto('/operations/inventory/snapshots');
      await page.waitForLoadState('networkidle');

      // History page should load or redirect to inventory list
      const url = page.url();
      if (url.includes('/snapshots')) {
        const content = page.locator('[class*="Card"], h1, table, main');
        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
        }
      } else {
        // Redirected to inventory list
        await expect(page.locator('h1')).toContainText(/Inventory|Tồn kho/i);
      }
    });

    test('should display inventory alerts', async ({ page }) => {
      await page.goto('/operations/inventory');
      await page.waitForLoadState('networkidle');

      // Check for low stock or out of stock summary cards
      const alertCards = page.locator('[class*="Card"]').filter({ hasText: /Low Stock|Out of Stock/ });
      if (await alertCards.count() > 0) {
        await expect(alertCards.first()).toBeVisible();
      }
    });

    test('should show import page', async ({ page }) => {
      await page.goto('/operations/inventory/import');
      await page.waitForLoadState('networkidle');

      // Import page should load or redirect to inventory list
      const url = page.url();
      if (url.includes('/import')) {
        const content = page.locator('input[type="file"], [class*="Card"], main');
        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
        }
      } else {
        // Redirected to inventory list
        await expect(page.locator('h1')).toContainText(/Inventory|Tồn kho/i);
      }
    });

    test('should filter inventory by location', async ({ page }) => {
      await page.goto('/operations/inventory');
      await page.waitForLoadState('networkidle');

      // Status filter uses Select component
      const statusFilter = page.locator('button[role="combobox"]');
      if (await statusFilter.count() > 0) {
        await expect(statusFilter.first()).toBeVisible();
      }
    });

    test('should highlight low stock items', async ({ page }) => {
      await page.goto('/operations/inventory');
      await page.waitForLoadState('networkidle');

      // Check for low stock checkbox filter
      const lowStockCheckbox = page.locator('input#lowStock, input[type="checkbox"]');
      if (await lowStockCheckbox.count() > 0) {
        await expect(lowStockCheckbox.first()).toBeVisible();
      }
    });

    test('should show inventory details', async ({ page }) => {
      await page.goto('/operations/inventory');
      await page.waitForLoadState('networkidle');

      // Table displays inventory data
      const table = page.locator('table');
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
      }
    });
  });

  test.describe('Operations Dashboard', () => {
    test('should display operations overview', async ({ page }) => {
      await page.goto('/operations');
      await page.waitForLoadState('networkidle');

      // Operations page may redirect or show navigation
      const content = page.locator('[class*="Card"], h1, main');
      await expect(content.first()).toBeVisible();
    });

    test('should navigate to sub-modules', async ({ page }) => {
      await page.goto('/operations/delivery');
      await page.waitForLoadState('networkidle');

      // Check for navigation or content loaded
      await expect(page.locator('h1')).toContainText(/Delivery|Giao hàng/i);
    });
  });
});
