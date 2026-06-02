import { test, expect } from '@playwright/test'

test.describe('Quotes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes')
  })

  test('should display quotes page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /báo giá/i })).toBeVisible()
  })

  test('should have create quote button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /tạo báo giá/i })).toBeVisible()
  })

  test('should have status filter', async ({ page }) => {
    await expect(page.getByText(/tất cả trạng thái/i)).toBeVisible()
  })

  test('should navigate to new quote page', async ({ page }) => {
    await page.getByRole('link', { name: /tạo báo giá/i }).click()
    await expect(page).toHaveURL('/quotes/new')
  })

  test('should show quotes table or empty state', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000)
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasEmpty = await page.getByText(/chưa có báo giá/i).isVisible().catch(() => false)
    expect(hasTable || hasEmpty).toBeTruthy()
  })
})
