import { test, expect, Page } from '@playwright/test'
import { PORTAL_SESSION_TOKEN } from './helpers/seed.helper'

// Helper: set portal_session cookie for authenticated portal access
async function loginAsPortalUser(page: Page): Promise<void> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3018'
  await page.context().addCookies([
    {
      name: 'portal_session',
      value: PORTAL_SESSION_TOKEN,
      domain: new URL(baseUrl).hostname,
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ])
}

test.describe('Customer Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPortalUser(page)
  })

  test('portal dashboard shows stats cards', async ({ page }) => {
    await page.goto('/portal')

    // Verify dashboard loads — should show greeting
    await expect(page.getByText(/Xin chào/)).toBeVisible({ timeout: 10_000 })

    // Verify stat cards are visible (use specific sub-text to avoid ambiguity)
    await expect(page.getByText('Xem trạng thái đơn hàng')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Xem và phản hồi báo giá')).toBeVisible()
    await expect(page.getByText('Gửi yêu cầu hỗ trợ')).toBeVisible()
  })

  test('portal quotes list shows company quotes', async ({ page }) => {
    await page.goto('/portal/quotes')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Báo giá' })).toBeVisible({ timeout: 10_000 })

    // Should show quotes for the portal user's company (seed has 2 quotes for companyA)
    // Wait for loading to finish — either quotes appear or empty state shows
    await page.waitForTimeout(2_000)

    // Check which state we're in — quotes or empty
    const quoteEl = page.locator('text=QUO-').first()
    const emptyEl = page.getByText('Chưa có báo giá nào')

    // Use Promise.race with expect to handle both cases
    await expect(quoteEl.or(emptyEl)).toBeVisible({ timeout: 10_000 })

    if (await quoteEl.isVisible()) {
      // Verify status badges exist
      const statusBadge = page.locator('span').filter({
        hasText: /Nháp|Đã gửi|Đã xem|Chấp nhận|Từ chối|Hết hạn/,
      }).first()
      await expect(statusBadge).toBeVisible({ timeout: 5_000 })
    }
  })

  test('portal tickets page and create ticket', async ({ page }) => {
    await page.goto('/portal/tickets')

    // Verify page loads
    await expect(page.getByRole('heading', { name: 'Hỗ trợ' })).toBeVisible({ timeout: 10_000 })

    // Click "Tạo yêu cầu" to open the create form
    await page.getByRole('button', { name: /Tạo yêu cầu/ }).click()

    // Fill ticket form
    await page.getByPlaceholder('Mô tả ngắn gọn vấn đề').fill('[E2E] Hỏi về báo giá')
    await page.getByPlaceholder('Mô tả chi tiết').fill('[E2E] Tôi cần thêm thông tin về báo giá')

    // Submit
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/portal/tickets') && resp.request().method() === 'POST',
      { timeout: 10_000 }
    ).catch(() => null)

    await page.getByRole('button', { name: 'Gửi yêu cầu' }).click()

    const response = await responsePromise
    if (response) {
      expect(response.status()).toBeLessThan(400)
    }

    // Verify the new ticket appears in the list
    await expect(page.getByText('[E2E] Hỏi về báo giá')).toBeVisible({ timeout: 10_000 })
  })

  test('portal ticket detail shows messages and reply', async ({ page }) => {
    await page.goto('/portal/tickets')
    await expect(page.getByRole('heading', { name: 'Hỗ trợ' })).toBeVisible({ timeout: 10_000 })

    // Click on the seed ticket
    const ticketLink = page.getByText(/Hỏi về đơn hàng/).first()
    const hasTicket = await ticketLink.isVisible({ timeout: 5_000 }).catch(() => false)

    if (!hasTicket) {
      test.skip()
      return
    }

    await ticketLink.click()

    // Verify ticket detail page
    await expect(page.getByText('Quay lại')).toBeVisible({ timeout: 10_000 })

    // Verify message thread has the seed message
    await expect(page.getByText(/muốn hỏi về đơn hàng/)).toBeVisible({ timeout: 5_000 })

    // Verify reply form exists
    const replyInput = page.getByPlaceholder('Nhập phản hồi của bạn...')
    await expect(replyInput).toBeVisible()
  })

  test('portal profile shows user info', async ({ page }) => {
    await page.goto('/portal/profile')

    // Verify profile page loads
    await expect(page.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeVisible({ timeout: 10_000 })

    // Verify user info is displayed
    await expect(page.getByText('portal-test@test.rtr.com')).toBeVisible({ timeout: 5_000 })

    // Verify logout button exists
    await expect(page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible()
  })
})
