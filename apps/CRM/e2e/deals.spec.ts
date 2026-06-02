import { test, expect } from './fixtures/auth.fixture'

test.describe('Deals', () => {
  test('pipeline view shows stages', async ({ adminPage }) => {
    await adminPage.goto('/pipeline')

    // Verify pipeline page loaded
    await expect(adminPage.getByRole('heading', { name: 'Pipeline' })).toBeVisible({ timeout: 10_000 })

    // Wait for kanban board to render — stages appear as columns with kanban-column class
    await expect(adminPage.locator('.kanban-column').first()).toBeVisible({ timeout: 15_000 })
  })

  test('create deal', async ({ adminPage }) => {
    await adminPage.goto('/pipeline/new')
    await expect(adminPage.getByText('Tạo deal mới')).toBeVisible({ timeout: 10_000 })

    // Wait for pipeline data to load — stages populate the combobox
    const stageCombobox = adminPage.locator('text=Giai đoạn').locator('..').locator('[role="combobox"]').first()
    await adminPage.waitForTimeout(2000)

    // Select a stage explicitly
    await stageCombobox.click()
    await adminPage.locator('[role="option"]').first().click()
    await adminPage.waitForTimeout(500)

    // Fill deal title (has id="title")
    await adminPage.locator('#title').fill(`[E2E] Deal Test ${Date.now()}`)
    // Fill value (has id="value")
    await adminPage.locator('#value').fill('25000000')

    // Click submit button and wait for response
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/deals') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: 'Tạo deal' }).click()

    const response = await responsePromise
    if (response) {
      const status = response.status()
      if (status >= 400) {
        const body = await response.json().catch(() => ({}))
        throw new Error(`Deal API returned ${status}: ${JSON.stringify(body)}`)
      }
      // Success — should redirect to pipeline
      await expect(adminPage).toHaveURL(/.*pipeline$/, { timeout: 10_000 })
    } else {
      const toastText = await adminPage.locator('[role="status"]').textContent().catch(() => '')
      throw new Error(`Deal creation failed — no API call made. Toast: ${toastText}`)
    }
  })

  test('deal detail page shows info', async ({ adminPage }) => {
    await adminPage.goto('/pipeline')
    await expect(adminPage.locator('.kanban-column').first()).toBeVisible({ timeout: 15_000 })

    // Deal cards are rendered as <a> links wrapping .deal-card divs
    // Click the first deal link in the kanban board
    const dealLink = adminPage.locator('a[href*="/pipeline/"]').first()
    await dealLink.click()

    // Should navigate to deal detail page
    await expect(adminPage).toHaveURL(/.*pipeline\/[a-z0-9-]+$/, { timeout: 10_000 })

    // Verify detail page has back button
    await expect(adminPage.getByText('Quay lại')).toBeVisible({ timeout: 5_000 })
  })
})
