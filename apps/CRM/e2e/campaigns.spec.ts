import { test, expect } from './fixtures/auth.fixture'

test.describe('Campaign Flow', () => {
  test('campaign list page shows seed data', async ({ adminPage }) => {
    await adminPage.goto('/campaigns')
    await expect(adminPage.getByRole('heading', { name: 'Chiến dịch' })).toBeVisible({ timeout: 10_000 })

    // Seed data has 1 DRAFT campaign — verify at least the page loaded
    // Campaign cards use glass-card-static with cursor-pointer for clickable rows
    const campaignCard = adminPage.locator('.glass-card-static').first()
    await expect(campaignCard).toBeVisible({ timeout: 10_000 })
  })

  test('create campaign via wizard', async ({ adminPage }) => {
    await adminPage.goto('/campaigns/new')
    await expect(adminPage.getByRole('heading', { name: 'Tạo chiến dịch' })).toBeVisible({ timeout: 10_000 })

    // Step 0 — Thông tin: fill name and subject
    await adminPage.getByPlaceholder(/Khuyến mãi tháng/).fill('[E2E] Chiến dịch Test')
    await adminPage.getByPlaceholder(/ưu đãi đặc biệt/).fill('[E2E] Ưu đãi dành cho bạn')

    // Click "Tiếp tục" to go to Step 1 (Audience)
    await adminPage.getByRole('button', { name: 'Tiếp tục' }).click()
    await adminPage.waitForTimeout(1000)

    // Step 1 — Đối tượng: try to select audience (optional)
    const audienceCombobox = adminPage.locator('[role="combobox"]').first()
    const hasCombobox = await audienceCombobox.isVisible({ timeout: 3_000 }).catch(() => false)
    if (hasCombobox) {
      await audienceCombobox.click()
      const firstOption = adminPage.locator('[role="option"]').first()
      const hasOption = await firstOption.isVisible({ timeout: 2_000 }).catch(() => false)
      if (hasOption) {
        await firstOption.click()
        await adminPage.waitForTimeout(500)
      } else {
        // Close the select if no options
        await adminPage.keyboard.press('Escape')
      }
    }

    // Click "Tiếp tục" to go to Step 2 (Content)
    await adminPage.getByRole('button', { name: 'Tiếp tục' }).click()
    await adminPage.waitForTimeout(500)

    // Step 2 — Nội dung: fill email content (TipTap rich text editor)
    const editor = adminPage.locator('.tiptap').first()
    await expect(editor).toBeVisible({ timeout: 10_000 })
    await editor.click()
    await adminPage.keyboard.type('Xin chào, đây là ưu đãi [E2E] test.')

    // Click "Tiếp tục" to go to Step 3 (Send)
    await adminPage.getByRole('button', { name: 'Tiếp tục' }).click()
    await adminPage.waitForTimeout(500)

    // Step 3 — Gửi: verify overview heading (not sidebar link)
    await expect(adminPage.getByRole('heading', { name: 'Tổng quan' })).toBeVisible({ timeout: 5_000 })

    // Click "Tạo chiến dịch"
    const createResponsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/campaigns') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: /Tạo chiến dịch/ }).click()

    const response = await createResponsePromise
    if (response) {
      const status = response.status()
      if (status >= 400) {
        const body = await response.json().catch(() => ({}))
        throw new Error(`Campaign API returned ${status}: ${JSON.stringify(body)}`)
      }
      // Should redirect to campaign detail
      await expect(adminPage).toHaveURL(/.*campaigns\/[a-z0-9]+/, { timeout: 10_000 })
    } else {
      throw new Error('Campaign creation failed — no API call made')
    }
  })

  test('campaign detail shows info', async ({ adminPage }) => {
    await adminPage.goto('/campaigns')
    await expect(adminPage.getByRole('heading', { name: 'Chiến dịch' })).toBeVisible({ timeout: 10_000 })

    // Click on the first clickable campaign card (cursor-pointer class)
    const campaignCard = adminPage.locator('.glass-card-static.cursor-pointer, .glass-card-static[class*="cursor-pointer"]').first()
    await expect(campaignCard).toBeVisible({ timeout: 10_000 })
    await campaignCard.click()

    // Should navigate to campaign detail
    await expect(adminPage).toHaveURL(/.*campaigns\/[a-z0-9]+/, { timeout: 10_000 })

    // Verify the detail page loaded with some content
    const mainContent = adminPage.locator('main')
    await expect(mainContent).toBeVisible({ timeout: 5_000 })
  })
})
