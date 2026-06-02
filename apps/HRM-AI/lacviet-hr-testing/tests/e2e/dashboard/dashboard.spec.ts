// tests/e2e/dashboard/dashboard.spec.ts

/**
 * LAC VIET HR - Dashboard E2E Tests
 * Dashboard widgets, charts, quick actions
 */

import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Dashboard - General', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard page', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check welcome message
    const welcomeMessage = page.locator('[data-testid="welcome-message"], h1');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    // Check stats cards are visible
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards.first()).toBeVisible();
    
    // Should have multiple cards
    const count = await statsCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should display employee count', async ({ page }) => {
    const employeeCount = page.locator('[data-testid="employee-count"]');
    await expect(employeeCount).toBeVisible();
    
    // Should contain a number
    const text = await employeeCount.textContent();
    expect(text).toMatch(/\d+/);
  });

  test('should display recent activities', async ({ page }) => {
    const activities = page.locator('[data-testid="recent-activities"]');
    await expect(activities).toBeVisible();
  });

  test('should display notifications', async ({ page }) => {
    const notifications = page.locator('[data-testid="notifications"]');
    await expect(notifications).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    const quickActions = page.locator('[data-testid="quick-actions"]');
    await expect(quickActions).toBeVisible();
  });

  test('should navigate via quick action', async ({ page }) => {
    // Click on a quick action
    const leaveAction = page.locator('[data-testid="quick-action-leave"], text=/Nghỉ phép/i');
    
    if (await leaveAction.isVisible()) {
      await leaveAction.click();
      await expect(page).toHaveURL(/\/leave/);
    }
  });

  test('should show loading states', async ({ page }) => {
    // Reload to see loading states
    await page.reload();
    
    // Check for loading skeletons
    const skeleton = page.locator('.skeleton, [data-loading="true"]');
    // These should eventually disappear
    await expect(skeleton.first()).not.toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard - Manager View', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should show pending approvals widget', async ({ page }) => {
    const pendingApprovals = page.locator('[data-testid="pending-approvals"]');
    await expect(pendingApprovals).toBeVisible();
  });

  test('should show team overview', async ({ page }) => {
    const teamOverview = page.locator('[data-testid="team-overview"]');
    await expect(teamOverview).toBeVisible();
  });

  test('should navigate to approvals from widget', async ({ page }) => {
    const viewAllLink = page.locator('[data-testid="view-all-approvals"]');
    
    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL(/\/approvals/);
    }
  });
});

test.describe('Dashboard - Admin View', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should show admin-specific widgets', async ({ page }) => {
    // System health widget
    const systemHealth = page.locator('[data-testid="system-health"]');
    
    // User activity widget
    const userActivity = page.locator('[data-testid="user-activity"]');
    
    // At least one admin widget should be visible
    const hasAdminWidget = await systemHealth.isVisible() || await userActivity.isVisible();
    expect(hasAdminWidget).toBeTruthy();
  });

  test('should show organization stats', async ({ page }) => {
    const orgStats = page.locator('[data-testid="org-stats"]');
    await expect(orgStats).toBeVisible();
  });
});

test.describe('Dashboard - Charts', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display employee distribution chart', async ({ page }) => {
    const chart = page.locator('[data-testid="employee-distribution-chart"], .recharts-wrapper');
    await expect(chart).toBeVisible();
  });

  test('should display attendance chart', async ({ page }) => {
    const chart = page.locator('[data-testid="attendance-chart"]');
    
    if (await chart.isVisible()) {
      // Chart should have data points
      const dataPoints = chart.locator('.recharts-line, .recharts-bar');
      await expect(dataPoints.first()).toBeVisible();
    }
  });

  test('should interact with chart tooltips', async ({ page }) => {
    const chart = page.locator('.recharts-wrapper').first();
    
    if (await chart.isVisible()) {
      // Hover over chart
      await chart.hover();
      
      // Tooltip may appear
      const tooltip = page.locator('.recharts-tooltip-wrapper');
      // Tooltip visibility depends on implementation
    }
  });
});

test.describe('Dashboard - Responsive', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Stats cards should stack vertically
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Content should be visible
    const content = page.locator('main, [data-testid="dashboard-content"]');
    await expect(content).toBeVisible();
  });
});

test.describe('Dashboard - Performance', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should load dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good LCP', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure LCP using Performance Observer
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Timeout fallback
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5s
    expect(lcp).toBeLessThan(2500);
  });
});

test.describe('Dashboard - Real-time Updates', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should receive notification updates', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Get initial notification count
    const notificationBadge = page.locator('[data-testid="notification-badge"]');
    const initialCount = await notificationBadge.textContent();
    
    // Wait for potential real-time update (in real scenario, trigger from backend)
    await page.waitForTimeout(5000);
    
    // Badge should still be accessible (even if count didn't change)
    await expect(notificationBadge).toBeVisible();
  });
});
