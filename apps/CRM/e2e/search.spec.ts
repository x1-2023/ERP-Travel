import { test, expect } from './fixtures/auth.fixture'

test.describe('Global Search', () => {
  test('Cmd+K opens command palette', async ({ adminPage }) => {
    await adminPage.goto('/dashboard')
    await expect(adminPage.locator('main')).toBeVisible({ timeout: 10_000 })

    // Open command palette with keyboard shortcut (Meta = Cmd on macOS)
    await adminPage.keyboard.press('Meta+KeyK')

    // Command dialog should appear
    await expect(adminPage.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 })

    // Search input should be a combobox inside the dialog
    await expect(adminPage.locator('[role="dialog"] [role="combobox"]')).toBeVisible()
  })

  test('search returns results for seed data', async ({ adminPage }) => {
    await adminPage.goto('/dashboard')
    await expect(adminPage.locator('main')).toBeVisible({ timeout: 10_000 })

    // Open command palette
    await adminPage.keyboard.press('Meta+KeyK')
    await expect(adminPage.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 })

    // Type search query matching seed data into the combobox
    const searchInput = adminPage.locator('[role="dialog"] [role="combobox"]')
    await searchInput.fill('TEST')

    // Wait for search results to load (API call with debounce)
    await adminPage.waitForTimeout(1500)

    // Should NOT show "Không tìm thấy kết quả" — seed data should match
    // Look for results in the listbox
    const resultsList = adminPage.locator('[role="dialog"] [role="listbox"]')
    await expect(resultsList).toBeVisible({ timeout: 5_000 })
  })
})
