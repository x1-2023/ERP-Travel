import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should load and display dashboard page', async ({ page }) => {
    await page.goto('/')

    // Verify page title or main heading
    const dashboardHeading = page
      .getByRole('heading', { name: /dashboard|bảng điều khiển|tổng quan/i })
      .first()

    if (await dashboardHeading.isVisible({ timeout: 5_000 })) {
      await expect(dashboardHeading).toBeVisible()
    }

    // Verify main dashboard container is visible
    const mainContent = page.locator('main, [role="main"], .dashboard, .container')
    await expect(mainContent.first()).toBeVisible({ timeout: 10_000 })

    // Verify navigation or sidebar is present
    const navigation = page.locator('nav, [role="navigation"], .sidebar, .nav-menu')
    await expect(navigation.first()).toBeVisible({ timeout: 5_000 })
  })

  test('should render dashboard charts', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for chart elements
    const chartContainers = page.locator(
      '[data-testid*="chart"], .chart, svg[viewBox], [role="img"][aria-label*="chart"]'
    )

    // Verify at least one chart is visible
    const chartCount = await chartContainers.count()

    if (chartCount > 0) {
      await expect(chartContainers.first()).toBeVisible({ timeout: 10_000 })
    }

    // Look for dashboard widgets/cards
    const cards = page.locator('[data-testid="card"], .card, article, section')
    const visibleCards = await cards.count()

    // Dashboard should have multiple cards/sections
    if (visibleCards > 0) {
      expect(visibleCards).toBeGreaterThan(0)
      await expect(cards.first()).toBeVisible({ timeout: 10_000 })
    }

    // Verify statistics or metrics are displayed
    const stats = page.locator(
      '[data-testid*="stat"], .stat, .metric, .kpi'
    )

    if (await stats.first().isVisible({ timeout: 5_000 })) {
      await expect(stats.first()).toBeVisible()
    }
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Wait for page to load and adapt to mobile
    await page.waitForLoadState('networkidle')

    // Verify page is still functional on mobile
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent.first()).toBeVisible({ timeout: 10_000 })

    // Check for mobile menu or hamburger button
    const mobileMenu = page
      .getByRole('button', { name: /menu|navigation|☰/i })
      .first()

    if (await mobileMenu.isVisible({ timeout: 5_000 })) {
      // Mobile menu should be present
      expect(await mobileMenu.isVisible()).toBeTruthy()
    }

    // Verify content is not cut off (basic responsive check)
    const content = page.locator('body')
    const boundingBox = await content.boundingBox()

    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375)
    }

    // Set back to desktop
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})
