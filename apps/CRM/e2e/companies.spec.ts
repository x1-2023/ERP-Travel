import { test, expect } from './fixtures/auth.fixture'

test.describe('Companies CRUD', () => {
  test('list companies shows seed data', async ({ adminPage }) => {
    await adminPage.goto('/companies')
    await expect(adminPage.getByRole('heading', { name: 'Công ty' })).toBeVisible({ timeout: 10_000 })

    // Seed data has [TEST] companies — displayed as cards
    await expect(adminPage.locator('.glass-card-static').first()).toBeVisible({ timeout: 10_000 })
  })

  test('create company', async ({ adminPage }) => {
    await adminPage.goto('/companies/new')
    await expect(adminPage.getByRole('heading', { name: 'Thêm công ty mới' })).toBeVisible({ timeout: 10_000 })

    // Fill company name (required field, placeholder "Công ty ABC")
    await adminPage.getByPlaceholder('Công ty ABC').fill(`[E2E] Công ty Test ${Date.now()}`)
    await adminPage.getByPlaceholder('contact@abc.com').fill(`e2e-company-${Date.now()}@test.rtr.com`)
    await adminPage.getByPlaceholder('Ho Chi Minh').fill('Ho Chi Minh')

    // Submit — mutation calls POST /api/companies
    await adminPage.getByRole('button', { name: 'Lưu công ty' }).click()

    // Should redirect to companies list after successful creation
    await expect(adminPage).toHaveURL(/.*companies$/, { timeout: 15_000 })
  })

  test('company detail shows contacts tab', async ({ adminPage }) => {
    await adminPage.goto('/companies')
    await expect(adminPage.locator('.glass-card-static').first()).toBeVisible({ timeout: 10_000 })

    // Click on the first company card to navigate to detail
    await adminPage.locator('.glass-card-static').first().click()

    // Should navigate to company detail page
    await expect(adminPage).toHaveURL(/.*companies\/[a-z0-9-]+$/, { timeout: 10_000 })

    // Verify detail page loaded with company name
    await expect(adminPage.locator('h2').first()).toBeVisible({ timeout: 5_000 })

    // Verify tabs exist
    await expect(adminPage.getByRole('tab', { name: /Liên hệ/ })).toBeVisible()
    await expect(adminPage.getByRole('tab', { name: /Deal/ })).toBeVisible()
  })
})
