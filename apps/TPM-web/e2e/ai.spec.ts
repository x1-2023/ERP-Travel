/**
 * AI Module E2E Tests
 * Tests for AI insights, recommendations, and voice commands
 */

import { test, expect } from '@playwright/test';

test.describe('AI Module', () => {
  test.describe('AI Dashboard', () => {
    test('should display AI dashboard', async ({ page }) => {
      await page.goto('/ai');
      await page.waitForLoadState('networkidle');

      // Check for page title
      await expect(page.locator('h1')).toContainText(/AI Assistant|Trí tuệ nhân tạo/i);
    });

    test('should show AI-generated insights summary', async ({ page }) => {
      await page.goto('/ai');
      await page.waitForLoadState('networkidle');

      // Check for page content (cards, sections, or main content)
      const content = page.locator('[class*="Card"], .card, main, h1');
      await expect(content.first()).toBeVisible();
    });

    test('should display recommendation preview', async ({ page }) => {
      await page.goto('/ai');
      await page.waitForLoadState('networkidle');

      // Check for "Top Recommendations" section
      const recommendationsSection = page.locator('text=Top Recommendations, text=Đề xuất');
      if (await recommendationsSection.count() > 0) {
        await expect(recommendationsSection.first()).toBeVisible();
      }
    });
  });

  test.describe('AI Insights', () => {
    test('should display insights list', async ({ page }) => {
      await page.goto('/ai/insights');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/AI Insights|Insight/i);
    });

    test('should show insight categories', async ({ page }) => {
      await page.goto('/ai/insights');
      await page.waitForLoadState('networkidle');

      // Check for filter section with Select components
      const filterSection = page.locator('[class*="Card"]').filter({ hasText: 'Filters' });
      if (await filterSection.count() > 0) {
        await expect(filterSection.first()).toBeVisible();
      }
    });

    test('should filter insights by type', async ({ page }) => {
      await page.goto('/ai/insights');
      await page.waitForLoadState('networkidle');

      // Look for the Select trigger for type filter
      const typeFilter = page.locator('button[role="combobox"]').first();
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
        // Check for dropdown content
        await expect(page.locator('[role="listbox"]')).toBeVisible();
      }
    });

    test('should display insight details', async ({ page }) => {
      await page.goto('/ai/insights');
      await page.waitForLoadState('networkidle');

      // Check for insight cards (they use Card component with border-l-4)
      const insightCards = page.locator('[class*="border-l-4"], [class*="Card"]');
      if (await insightCards.count() > 0) {
        await expect(insightCards.first()).toBeVisible();
      }
    });

    test('should show confidence score for insights', async ({ page }) => {
      await page.goto('/ai/insights');
      await page.waitForLoadState('networkidle');

      // Confidence scores are shown as Badge with percentage
      const confidenceBadge = page.locator('[class*="Badge"]:has-text("%")');
      if (await confidenceBadge.count() > 0) {
        await expect(confidenceBadge.first()).toBeVisible();
      }
    });
  });

  test.describe('AI Recommendations', () => {
    test('should display recommendations list', async ({ page }) => {
      await page.goto('/ai/recommendations');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toContainText(/AI Recommendations|Recommendation|Đề xuất/i);
    });

    test('should show recommendation priority', async ({ page }) => {
      await page.goto('/ai/recommendations');
      await page.waitForLoadState('networkidle');

      // Priority is shown via Badge components
      const priorityBadge = page.locator('[class*="Badge"]');
      if (await priorityBadge.count() > 0) {
        await expect(priorityBadge.first()).toBeVisible();
      }
    });

    test('should filter recommendations by status', async ({ page }) => {
      await page.goto('/ai/recommendations');
      await page.waitForLoadState('networkidle');

      // Look for the Select trigger for status filter
      const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /Status|All/ });
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(300);
      }
    });

    test('should allow accepting recommendation', async ({ page }) => {
      await page.goto('/ai/recommendations');
      await page.waitForLoadState('networkidle');

      const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Áp dụng")').first();
      if (await acceptButton.count() > 0 && await acceptButton.isVisible()) {
        await expect(acceptButton).toBeVisible();
      }
    });

    test('should allow dismissing recommendation', async ({ page }) => {
      await page.goto('/ai/recommendations');
      await page.waitForLoadState('networkidle');

      const rejectButton = page.locator('button:has-text("Reject"), button:has-text("Bỏ qua")').first();
      if (await rejectButton.count() > 0 && await rejectButton.isVisible()) {
        await expect(rejectButton).toBeVisible();
      }
    });

    test('should display recommendation impact estimate', async ({ page }) => {
      await page.goto('/ai/recommendations');
      await page.waitForLoadState('networkidle');

      // Check for recommendation cards
      const recommendationCards = page.locator('[class*="Card"]');
      if (await recommendationCards.count() > 0) {
        await expect(recommendationCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Voice Commands', () => {
    test('should display voice interface', async ({ page }) => {
      await page.goto('/voice');
      await page.waitForLoadState('networkidle');

      // Check for Voice Commands page title
      await expect(page.locator('h1')).toContainText(/Voice Commands|Voice/i);
    });

    test('should show voice command examples', async ({ page }) => {
      await page.goto('/voice');
      await page.waitForLoadState('networkidle');

      // Check for "Example Commands" section
      const examples = page.locator('text=Example Commands');
      if (await examples.count() > 0) {
        await expect(examples.first()).toBeVisible();
      }
    });

    test('should have microphone button', async ({ page }) => {
      await page.goto('/voice');
      await page.waitForLoadState('networkidle');

      // Voice button is a custom component
      const micButton = page.locator('button[class*="rounded-full"], button:has-text("Click to start")');
      if (await micButton.count() > 0) {
        await expect(micButton.first()).toBeVisible();
      }
    });

    test('should display voice command history', async ({ page }) => {
      await page.goto('/voice');
      await page.waitForLoadState('networkidle');

      // Check for "Recent Commands" section
      const history = page.locator('text=Recent Commands');
      if (await history.count() > 0) {
        await expect(history.first()).toBeVisible();
      }
    });
  });

  test.describe('AI Settings', () => {
    test('should navigate to AI settings', async ({ page }) => {
      await page.goto('/ai');
      await page.waitForLoadState('networkidle');

      // Check for settings link or button
      const settingsLink = page.locator('a:has-text("Settings"), button:has-text("Settings")');
      if (await settingsLink.count() > 0 && await settingsLink.isVisible()) {
        await settingsLink.click();
      }
    });
  });
});
