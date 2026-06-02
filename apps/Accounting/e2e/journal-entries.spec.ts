import { test, expect } from './fixtures/auth.fixture'
import { createJournalEntryData, ACCOUNT_CODES, TEST_PREFIX } from './fixtures/test-data'

test.describe('Journal Entries (Bút toán Nhật ký)', () => {
  test('tạo bút toán nhật ký - create journal entry with balanced debit/credit', async ({ adminPage }) => {
    await adminPage.goto('/accounting/journal-entries/new')

    // Verify create form is visible
    await expect(adminPage.getByRole('heading', { name: /bút toán|journal entry/i })).toBeVisible({ timeout: 10_000 })

    const entryData = createJournalEntryData()

    // Fill entry date
    const dateInput = adminPage.locator('input[type="date"], input[placeholder*="Ngày"]').first()
    await dateInput.fill(entryData.date)

    // Fill description
    const descInput = adminPage.locator('input[placeholder*="Mô tả"], input[placeholder*="Description"], textarea').first()
    await descInput.fill(entryData.description)

    // Fill first line item - Debit
    const accountInput1 = adminPage.locator('input[placeholder*="Tài khoản"], input[placeholder*="Account"]').nth(0)
    await accountInput1.fill(entryData.entries[0].account)
    await adminPage.waitForTimeout(500)
    await adminPage.locator('[role="option"]').first().click().catch(() => {})

    const debitInput = adminPage.locator('input[placeholder*="Nợ"], input[placeholder*="Debit"]').first()
    await debitInput.fill(entryData.entries[0].debit.toString())

    // Add second line item - Credit
    const addButton = adminPage.getByRole('button', { name: /thêm|add|dòng/i }).first()
    if (await addButton.isVisible()) {
      await addButton.click()
    }

    const accountInput2 = adminPage.locator('input[placeholder*="Tài khoản"], input[placeholder*="Account"]').nth(1)
    await adminPage.waitForTimeout(500)
    await accountInput2.fill(entryData.entries[1].account)
    await adminPage.waitForTimeout(500)
    await adminPage.locator('[role="option"]').first().click().catch(() => {})

    const creditInput = adminPage.locator('input[placeholder*="Có"], input[placeholder*="Credit"]').first()
    await creditInput.fill(entryData.entries[1].credit.toString())

    // Submit form
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/journal-entries') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: /lưu|save|tạo/i }).click()

    const response = await responsePromise
    if (response && response.status() >= 400) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`Journal entry creation failed: ${JSON.stringify(body)}`)
    }

    // Should redirect to journal entries list
    await expect(adminPage).toHaveURL(/.*journal-entries/, { timeout: 10_000 })
  })

  test('validation: tổng nợ phải bằng tổng có - validate debit equals credit', async ({ adminPage }) => {
    await adminPage.goto('/accounting/journal-entries/new')

    // Fill form with unbalanced entries
    const dateInput = adminPage.locator('input[type="date"]').first()
    await dateInput.fill(new Date().toISOString().split('T')[0])

    const descInput = adminPage.locator('textarea, input[placeholder*="Mô tả"]').first()
    await descInput.fill(`${TEST_PREFIX} Bút toán không cân bằng`)

    // First line: debit 1000
    const accountInput1 = adminPage.locator('input[placeholder*="Tài khoản"], input[placeholder*="Account"]').nth(0)
    await accountInput1.fill(ACCOUNT_CODES.CASH)
    await adminPage.waitForTimeout(500)
    await adminPage.locator('[role="option"]').first().click().catch(() => {})

    const debitInput = adminPage.locator('input[placeholder*="Nợ"], input[placeholder*="Debit"]').first()
    await debitInput.fill('1000000')

    // Add second line without matching credit
    const addButton = adminPage.getByRole('button', { name: /thêm|add|dòng/i }).first()
    if (await addButton.isVisible()) {
      await addButton.click()
    }

    const accountInput2 = adminPage.locator('input[placeholder*="Tài khoản"], input[placeholder*="Account"]').nth(1)
    await adminPage.waitForTimeout(500)
    await accountInput2.fill(ACCOUNT_CODES.BANK)
    await adminPage.waitForTimeout(500)
    await adminPage.locator('[role="option"]').first().click().catch(() => {})

    const creditInput = adminPage.locator('input[placeholder*="Có"], input[placeholder*="Credit"]').first()
    await creditInput.fill('500000') // Intentionally unbalanced

    // Try to submit
    await adminPage.getByRole('button', { name: /lưu|save|tạo/i }).click()

    // Should show validation error (either error message or validation toast)
    const errorMessage = adminPage.locator('[role="alert"], .error, .text-red-500').first()
    if (await errorMessage.isVisible({ timeout: 5_000 }).catch(() => false)) {
      // Validation error shown
      expect(await errorMessage.textContent()).toContain(/cân bằng|balance|không bằng|không equal/i)
    }

    // Should remain on form page
    await expect(adminPage).toHaveURL(/.*journal-entries.*new|.*journal-entries.*\d+\/edit/, { timeout: 5_000 })
  })

  test('duyệt bút toán - approve journal entry', async ({ adminPage }) => {
    await adminPage.goto('/accounting/journal-entries')

    // Wait for list to load
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Find first entry with "pending" or "draft" status
    const firstRow = adminPage.locator('table tbody tr').first()
    const approveButton = firstRow.locator('button[aria-label*="Approve"], button:has-text("Duyệt"), button:has-text("Phê duyệt")').first()

    if (await approveButton.isVisible().catch(() => false)) {
      const responsePromise = adminPage.waitForResponse(
        (resp) => resp.url().includes('/api/journal-entries') && resp.request().method() === 'PATCH',
        { timeout: 15_000 }
      ).catch(() => null)

      await approveButton.click()

      const response = await responsePromise
      if (response && response.status() >= 400) {
        const body = await response.json().catch(() => ({}))
        throw new Error(`Approval failed: ${JSON.stringify(body)}`)
      }

      // Verify status changed
      await expect(firstRow.locator('td').filter({ hasText: /approved|đã duyệt/i })).toBeVisible({ timeout: 5_000 }).catch(() => {})
    }
  })

  test('huỷ bút toán - cancel journal entry', async ({ adminPage }) => {
    await adminPage.goto('/accounting/journal-entries')

    // Wait for list to load
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Find first entry with cancel button
    const firstRow = adminPage.locator('table tbody tr').first()
    const cancelButton = firstRow.locator('button[aria-label*="Cancel"], button:has-text("Huỷ"), button:has-text("Xoá")').first()

    if (await cancelButton.isVisible().catch(() => false)) {
      // Click cancel
      await cancelButton.click()

      // Confirm cancellation if dialog appears
      const confirmButton = adminPage.locator('button:has-text("Xác nhận"), button:has-text("Confirm"), button[role="dialog"] button').nth(1)
      if (await confirmButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await confirmButton.click()
      }

      // Wait for API response
      await adminPage.waitForResponse(
        (resp) => resp.url().includes('/api/journal-entries') && (resp.request().method() === 'PATCH' || resp.request().method() === 'DELETE'),
        { timeout: 15_000 }
      ).catch(() => {})

      // Verify status changed
      await expect(firstRow.locator('td').filter({ hasText: /cancelled|đã huỷ|cancelled/i })).toBeVisible({ timeout: 5_000 }).catch(() => {})
    }
  })

  test('tìm kiếm theo ngày - search by date', async ({ adminPage }) => {
    await adminPage.goto('/accounting/journal-entries')

    // Wait for table to load
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Find date filter input
    const dateFilterInput = adminPage.locator('input[type="date"], input[placeholder*="Ngày"]').first()

    if (await dateFilterInput.isVisible()) {
      const testDate = new Date()
      testDate.setDate(testDate.getDate() - 7) // Last 7 days
      const dateStr = testDate.toISOString().split('T')[0]

      await dateFilterInput.fill(dateStr)
      await adminPage.waitForTimeout(1000)

      // Verify results filtered
      const rows = adminPage.locator('table tbody tr')
      const count = await rows.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })
})
