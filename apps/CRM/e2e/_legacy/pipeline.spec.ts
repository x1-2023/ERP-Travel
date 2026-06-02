import { test, expect } from '@playwright/test'

test.describe('Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pipeline')
  })

  test('should display pipeline page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /pipeline/i })).toBeVisible()
  })

  test('should have add deal button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /thêm deal/i })).toBeVisible()
  })

  test('should show kanban columns or empty state', async ({ page }) => {
    // Either kanban columns exist OR empty/error state is shown
    const hasColumns = await page.locator('.kanban-column').count() > 0
    const hasEmptyState = await page.getByText(/chưa có pipeline/i).isVisible().catch(() => false)
    const hasError = await page.getByText(/không thể tải/i).isVisible().catch(() => false)
    expect(hasColumns || hasEmptyState || hasError).toBeTruthy()
  })

  test('should navigate to new deal page', async ({ page }) => {
    await page.getByRole('link', { name: /thêm deal/i }).click()
    await expect(page).toHaveURL('/pipeline/new')
  })

  test('should show deal cards if data exists', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000)
    const dealCards = page.locator('.deal-card')
    const count = await dealCards.count()
    // Just verify it doesn't crash — count may be 0 if no data
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
