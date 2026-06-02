import { test, expect } from '@playwright/test'

test.describe('Contacts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts')
  })

  test('should display contacts page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /liên hệ/i })).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    const search = page.getByPlaceholder(/tìm kiếm/i)
    await expect(search).toBeVisible()
  })

  test('should have add contact button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /thêm liên hệ/i })).toBeVisible()
  })

  test('should navigate to new contact form', async ({ page }) => {
    await page.getByRole('link', { name: /thêm liên hệ/i }).click()
    await expect(page).toHaveURL('/contacts/new')
    await expect(page.getByRole('heading', { name: /thêm liên hệ/i })).toBeVisible()
  })

  test('should show contact form fields', async ({ page }) => {
    await page.goto('/contacts/new')
    await expect(page.getByLabel(/họ/i).first()).toBeVisible()
    await expect(page.getByLabel(/tên/i).first()).toBeVisible()
  })

  test('should search contacts', async ({ page }) => {
    const search = page.getByPlaceholder(/tìm kiếm/i)
    await search.fill('test')
    // Wait for debounced search
    await page.waitForTimeout(500)
    // Page should still be visible (no crash)
    await expect(page.getByRole('heading', { name: /liên hệ/i })).toBeVisible()
  })
})
