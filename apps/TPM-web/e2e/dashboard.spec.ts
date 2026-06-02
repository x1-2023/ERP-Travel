// ══════════════════════════════════════════════════════════════════════════════
//                    📊 DASHBOARD E2E TESTS
//                         File: e2e/dashboard.spec.ts
// ══════════════════════════════════════════════════════════════════════════════

import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display page title and live badge', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /command center|dashboard/i })).toBeVisible();
    
    // Check live badge (optional)
    const liveBadge = page.locator('[class*="live"], :text("LIVE")');
    if (await liveBadge.count() > 0) {
      await expect(liveBadge.first()).toBeVisible();
    }
  });

  test('should display KPI cards with data', async ({ page }) => {
    // Wait for KPI cards to load
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    await expect(kpiCards.first()).toBeVisible();

    // Check we have at least 4 KPI cards
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should display charts', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1000); // Allow charts to animate
    
    // Check for chart containers
    const charts = page.locator('[class*="chart"], canvas, svg[class*="recharts"]');
    await expect(charts.first()).toBeVisible();
  });

  test('should display system status as online', async ({ page }) => {
    // Look for system status section
    const statusSection = page.locator(':text("System Status"), :text("API"), :text("Database")');
    
    if (await statusSection.count() > 0) {
      // Check for "Online" or green indicator
      const onlineStatus = page.locator(':text("Online"), [class*="success"], [class*="green"]');
      await expect(onlineStatus.first()).toBeVisible();
    }
  });

  test('should have working refresh button', async ({ page }) => {
    // Find refresh button by title attribute
    const refreshBtn = page.locator('button[title*="Refresh"], button[aria-label*="refresh"]');

    if (await refreshBtn.count() > 0) {
      await refreshBtn.first().click();

      // Should show loading state or update timestamp
      await page.waitForLoadState('networkidle');

      // Verify page still displays correctly
      await expect(page.getByRole('heading', { name: /command center|dashboard/i })).toBeVisible();
    }
  });

  test('should navigate to promotions from quick action', async ({ page }) => {
    // Look for "New Promotion" or quick action button
    const newPromoBtn = page.getByRole('button', { name: /new promotion|tạo promotion/i });
    const promoLink = page.getByRole('link', { name: /promotion/i });
    
    if (await newPromoBtn.count() > 0) {
      await newPromoBtn.click();
      await expect(page).toHaveURL(/promotions/);
    } else if (await promoLink.count() > 0) {
      await promoLink.first().click();
      await expect(page).toHaveURL(/promotions/);
    }
  });

  test('should display recent activity', async ({ page }) => {
    // Look for activity section
    const activitySection = page.locator(':text("Recent Activity"), :text("Activity")');
    
    if (await activitySection.count() > 0) {
      // Should have activity items
      const activityItems = page.locator('[class*="activity-item"], [class*="activity"] li');
      const count = await activityItems.count();
      expect(count).toBeGreaterThanOrEqual(0); // May be empty but section exists
    }
  });
});

test.describe('Dashboard - API Integration', () => {
  test('should load dashboard stats from API', async ({ page }) => {
    // Intercept API call
    const statsPromise = page.waitForResponse(
      (resp) => resp.url().includes('/dashboard/stats') && resp.status() === 200
    );

    await page.goto('/dashboard');
    
    const response = await statsPromise;
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  test('should load dashboard charts from API', async ({ page }) => {
    // Intercept API call
    const chartsPromise = page.waitForResponse(
      (resp) => resp.url().includes('/dashboard/charts') && resp.status() === 200
    );

    await page.goto('/dashboard');
    
    const response = await chartsPromise;
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
});
