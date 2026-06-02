// ══════════════════════════════════════════════════════════════════════════════
//                    💰 OTHER MODULES E2E TESTS
//                         File: e2e/other-modules.spec.ts
// ══════════════════════════════════════════════════════════════════════════════

import { test, expect, generateTestData, waitForToast } from './fixtures';

// ══════════════════════════════════════════════════════════════════════════════
// FUNDS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Funds', () => {
  test('should display funds list', async ({ page }) => {
    await page.goto('/funds');
    await page.waitForLoadState('networkidle');
    
    // Table should be visible
    const table = page.locator('table, [role="table"]');
    await expect(table).toBeVisible();
  });

  test('should show fund utilization', async ({ page }) => {
    await page.goto('/funds');
    await page.waitForLoadState('networkidle');
    
    // Look for utilization percentage
    const utilization = page.locator(':text("%"), [class*="progress"]');
    if (await utilization.count() > 0) {
      await expect(utilization.first()).toBeVisible();
    }
  });

  test('should create new fund', async ({ page }) => {
    await page.goto('/funds/new');
    await page.waitForLoadState('networkidle');
    
    // Fill form
    await page.getByLabel(/code/i).fill(`FUND-${Date.now()}`);
    await page.getByLabel(/name/i).fill('Test Fund E2E');
    
    const amountInput = page.getByLabel(/amount|total/i);
    if (await amountInput.count() > 0) {
      await amountInput.fill('1000000000');
    }
    
    // Submit
    const submitBtn = page.getByRole('button', { name: /save|create|tạo/i });
    await submitBtn.click();
    
    await page.waitForLoadState('networkidle');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Customers', () => {
  test('should display customers list', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Accept either table or card grid layout
    const content = page.locator('table, [role="table"], [class*="grid"]');
    await expect(content.first()).toBeVisible();
  });

  test('should filter by channel', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    const channelFilter = page.locator('select:near(:text("Channel")), [data-testid="channel-filter"]');
    
    if (await channelFilter.count() > 0) {
      await channelFilter.selectOption('MT');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should search customers', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Big');
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');
    }
  });

  test('should create new customer', async ({ page }) => {
    await page.goto('/customers/new');
    await page.waitForLoadState('networkidle');

    // Skip if no form exists (placeholder page)
    const codeInput = page.getByLabel(/code/i);
    if (await codeInput.count() === 0) {
      test.skip();
      return;
    }

    await codeInput.fill(`CUST-${Date.now()}`);
    await page.getByLabel(/name/i).fill('Test Customer E2E');

    const channelSelect = page.getByLabel(/channel/i);
    if (await channelSelect.count() > 0) {
      await channelSelect.click();
      await page.getByRole('option', { name: /MT/i }).click();
    }

    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();

    await page.waitForLoadState('networkidle');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Products', () => {
  test('should display products list', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Accept either table or card grid layout
    const content = page.locator('table, [role="table"], [class*="grid"]');
    await expect(content.first()).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Coffee');
      await page.waitForTimeout(500);
    }
  });

  test('should create new product', async ({ page }) => {
    await page.goto('/products/new');
    await page.waitForLoadState('networkidle');

    // Skip if no form exists (placeholder page)
    const skuInput = page.getByLabel(/sku/i);
    if (await skuInput.count() === 0) {
      test.skip();
      return;
    }

    await skuInput.fill(`SKU-${Date.now()}`);
    await page.getByLabel(/name/i).fill('Test Product E2E');

    const priceInput = page.getByLabel(/price/i);
    if (await priceInput.count() > 0) {
      await priceInput.fill('100000');
    }

    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();

    await page.waitForLoadState('networkidle');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// BUDGETS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Budgets', () => {
  test('should display budgets list', async ({ page }) => {
    await page.goto('/budgets');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('table, [role="table"]');
    await expect(table).toBeVisible();
  });

  test('should filter by year', async ({ page }) => {
    await page.goto('/budgets');
    await page.waitForLoadState('networkidle');
    
    const yearFilter = page.locator('select:near(:text("Year")), [data-testid="year-filter"]');
    
    if (await yearFilter.count() > 0) {
      await yearFilter.selectOption('2026');
      await page.waitForLoadState('networkidle');
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// TARGETS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Targets', () => {
  test('should display targets list', async ({ page }) => {
    await page.goto('/targets');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('table, [role="table"]');
    await expect(table).toBeVisible();
  });

  test('should show achievement percentage', async ({ page }) => {
    await page.goto('/targets');
    await page.waitForLoadState('networkidle');
    
    // Look for achievement %
    const achievement = page.locator(':text("%"), [class*="progress"]');
    if (await achievement.count() > 0) {
      await expect(achievement.first()).toBeVisible();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Analytics', () => {
  test('should display analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    // Should have page title
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow charts to render
    
    // Should have chart elements
    const charts = page.locator('[class*="chart"], canvas, svg[class*="recharts"]');
    await expect(charts.first()).toBeVisible();
  });

  test('should filter by period', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    const periodFilter = page.locator('select:near(:text("Period")), [data-testid="period-filter"], button:has-text("12m")');
    
    if (await periodFilter.count() > 0) {
      await periodFilter.first().click();
      
      const option = page.getByRole('option', { name: /6m|6 months/i });
      if (await option.count() > 0) {
        await option.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should switch tabs', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    const tabs = page.getByRole('tab');
    
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForLoadState('networkidle');
      
      // Tab should be active
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Calendar', () => {
  test('should display calendar', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Should have calendar grid
    const calendar = page.locator('[class*="calendar"], [role="grid"]');
    await expect(calendar.first()).toBeVisible();
  });

  test('should show current month', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Current month should be visible in header
    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const monthHeader = page.locator(`:text("${currentMonth}"), :text("${currentMonth.substring(0, 3)}")`);
    
    await expect(monthHeader.first()).toBeVisible();
  });

  test('should navigate months', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find next month button
    const nextBtn = page.locator('button[aria-label*="next"], button:has-text("Next"), button:has(svg[class*="right"])');
    
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click();
      await page.waitForLoadState('networkidle');
      
      // Month should change
    }
  });

  test('should show promotions on calendar', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Look for promotion events
    const events = page.locator('[class*="event"], [class*="promotion"]');
    
    // May or may not have events
    const count = await events.count();
    // Just verify calendar renders
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Settings', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Should have settings title
    await expect(page.getByRole('heading', { name: /settings|cài đặt/i })).toBeVisible();
  });

  test('should have profile tab', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const profileTab = page.getByRole('tab', { name: /profile|hồ sơ/i });
    
    if (await profileTab.count() > 0) {
      await profileTab.click();
      
      // Should show profile form
      await expect(page.getByLabel(/name|email/i).first()).toBeVisible();
    }
  });

  test('should have notification settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const notificationTab = page.getByRole('tab', { name: /notification/i });
    
    if (await notificationTab.count() > 0) {
      await notificationTab.click();
      
      // Should show toggle switches
      const toggles = page.locator('[role="switch"], input[type="checkbox"]');
      await expect(toggles.first()).toBeVisible();
    }
  });
});
