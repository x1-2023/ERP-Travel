import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tổng quan/i })).toBeVisible()
  })

  test('should show KPI cards', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForSelector('.kpi-card', { timeout: 10_000 })
    const kpiCards = page.locator('.kpi-card')
    await expect(kpiCards).toHaveCount(4)
  })

  test('should show charts section', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 10_000 })
    const charts = page.locator('.chart-container')
    await expect(charts.first()).toBeVisible()
  })

  test('should show recent activities section', async ({ page }) => {
    await expect(page.getByText('Hoạt động gần đây')).toBeVisible()
  })

  test('should show integration status widget', async ({ page }) => {
    await expect(page.getByText('Tích hợp hệ thống')).toBeVisible()
  })
})
