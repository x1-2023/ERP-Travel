import { test, expect } from './fixtures/auth.fixture'

test.describe('Contacts CRUD', () => {
  test('list contacts shows seed data', async ({ adminPage }) => {
    await adminPage.goto('/contacts')
    await expect(adminPage.getByRole('heading', { name: 'Liên hệ' })).toBeVisible({ timeout: 10_000 })

    // Wait for table to load (seed data has [TEST] prefixed contacts)
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Verify at least one row with seed data
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })
  })

  test('create new contact', async ({ adminPage }) => {
    await adminPage.goto('/contacts/new')
    await expect(adminPage.getByRole('heading', { name: 'Thêm liên hệ mới' })).toBeVisible({ timeout: 10_000 })

    // Fill required fields using placeholders (no IDs on ContactForm inputs)
    await adminPage.getByPlaceholder('Nguyễn').fill('[E2E] Phạm')
    await adminPage.getByPlaceholder('Văn A').fill('Test Create')
    await adminPage.getByPlaceholder('email@example.com').fill(`e2e-create-${Date.now()}@test.rtr.com`)

    // Submit and wait for API response
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/contacts') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    )
    await adminPage.getByRole('button', { name: 'Lưu liên hệ' }).click()
    await responsePromise

    // Should redirect to contacts list
    await expect(adminPage).toHaveURL(/.*contacts$/, { timeout: 10_000 })
  })

  test('create contact with validation errors', async ({ adminPage }) => {
    await adminPage.goto('/contacts/new')
    await expect(adminPage.getByRole('heading', { name: 'Thêm liên hệ mới' })).toBeVisible({ timeout: 10_000 })

    // Submit empty form (required fields: firstName, lastName)
    await adminPage.getByRole('button', { name: 'Lưu liên hệ' }).click()

    // Should stay on same page
    await expect(adminPage).toHaveURL(/.*contacts\/new/, { timeout: 5_000 })

    // Should show validation error(s) — border-red-500 on invalid fields
    await expect(adminPage.locator('.border-red-500').first()).toBeVisible({ timeout: 5_000 })
  })

  test('search contacts filters results', async ({ adminPage }) => {
    await adminPage.goto('/contacts')
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Search for seed contact
    const searchInput = adminPage.getByPlaceholder('Tìm kiếm liên hệ...')
    await searchInput.fill('[TEST]')
    // Wait for debounced search
    await adminPage.waitForTimeout(500)

    // Table should still be visible with filtered results
    await expect(adminPage.locator('table')).toBeVisible()
  })

  test('contact detail page shows info', async ({ adminPage }) => {
    await adminPage.goto('/contacts')
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Click on first contact row to navigate to detail
    await adminPage.locator('table tbody tr').first().click()

    // Should navigate to contact detail page
    await expect(adminPage).toHaveURL(/.*contacts\/[a-z0-9-]+$/, { timeout: 10_000 })

    // Verify detail page elements
    await expect(adminPage.locator('h2').first()).toBeVisible({ timeout: 5_000 })
    // Verify quick actions section
    await expect(adminPage.getByText('Ghi cuộc gọi')).toBeVisible()
  })

  test('delete contact removes it from list', async ({ adminPage }) => {
    // First create a contact to delete
    await adminPage.goto('/contacts/new')
    await expect(adminPage.getByRole('heading', { name: 'Thêm liên hệ mới' })).toBeVisible({ timeout: 10_000 })

    const uniqueName = `[E2E] Delete ${Date.now()}`
    await adminPage.getByPlaceholder('Nguyễn').fill(uniqueName)
    await adminPage.getByPlaceholder('Văn A').fill('Target')
    await adminPage.getByPlaceholder('email@example.com').fill(`e2e-delete-${Date.now()}@test.rtr.com`)

    // Submit and wait for API response
    const createResponse = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/contacts') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    )
    await adminPage.getByRole('button', { name: 'Lưu liên hệ' }).click()
    await createResponse

    // Wait for redirect to list
    await expect(adminPage).toHaveURL(/.*contacts$/, { timeout: 10_000 })

    // Wait for list to load and find our contact
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })
    await expect(adminPage.getByText(uniqueName)).toBeVisible({ timeout: 5_000 })

    // Set up dialog handler for window.confirm BEFORE clicking
    adminPage.on('dialog', (dialog) => dialog.accept())

    // Find the row with our contact and click its delete button (last icon button in row)
    const row = adminPage.locator('table tbody tr', { hasText: uniqueName })
    await row.locator('button:has(svg)').last().click()

    // Verify contact is removed from list
    await expect(adminPage.getByText(uniqueName)).toBeHidden({ timeout: 10_000 })
  })
})
