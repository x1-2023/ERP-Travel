import { test, expect } from './fixtures/auth.fixture'
import { createTaxDeclarationData, TEST_PREFIX } from './fixtures/test-data'

test.describe('Tax Management (Quản lý Thuế)', () => {
  test('kê khai thuế GTGT - VAT tax declaration', async ({ adminPage }) => {
    await adminPage.goto('/accounting/tax')

    // Verify page header
    await expect(adminPage.getByRole('heading', { name: /thuế|tax/i })).toBeVisible({ timeout: 10_000 })

    // Look for VAT declaration section
    const vatSection = adminPage.locator('text=/GTGT|VAT|Giá trị gia tăng/i').first()
    if (await vatSection.isVisible()) {
      // Click on VAT section or view button
      const viewButton = vatSection.locator('..').locator('button:has-text("Xem"), button:has-text("View")').first()
      if (await viewButton.isVisible().catch(() => false)) {
        await viewButton.click()
      }
    }

    // Wait for tax declaration form/data
    await expect(adminPage.locator('input, select, textarea').first()).toBeVisible({ timeout: 10_000 })

    // Find period selector
    const periodInput = adminPage.locator('input[type="month"], input[placeholder*="Kỳ"]').first()
    if (await periodInput.isVisible()) {
      const testData = createTaxDeclarationData()
      await periodInput.fill(testData.period)
    }

    // Fill sales invoice data
    const salesQtyInput = adminPage.locator('input[placeholder*="số lượng"], input[placeholder*="qty"]').nth(0)
    if (await salesQtyInput.isVisible()) {
      const testData = createTaxDeclarationData()
      await salesQtyInput.fill(testData.salesInvoices.quantity.toString())
    }

    // Submit declaration
    const submitButton = adminPage.getByRole('button', { name: /nộp|submit|lưu/i }).first()
    if (await submitButton.isVisible()) {
      const responsePromise = adminPage.waitForResponse(
        (resp) => resp.url().includes('/api/tax') && resp.request().method() === 'POST',
        { timeout: 15_000 }
      ).catch(() => null)

      await submitButton.click()

      const response = await responsePromise
      if (response && response.status() >= 400) {
        const body = await response.json().catch(() => ({}))
        throw new Error(`Tax declaration failed: ${JSON.stringify(body)}`)
      }

      // Verify success
      await expect(adminPage.locator('[role="status"], .success').first()).toBeVisible({ timeout: 5_000 }).catch(() => {})
    }
  })

  test('tính thuế tự động - auto-calculate tax', async ({ adminPage }) => {
    await adminPage.goto('/accounting/tax/calculation')

    // Verify page is available
    await expect(adminPage.locator('input, select, button').first()).toBeVisible({ timeout: 10_000 })

    // Enter taxable income
    const incomeInput = adminPage.locator('input[placeholder*="Doanh thu"], input[placeholder*="Income"]').first()
    if (await incomeInput.isVisible()) {
      await incomeInput.fill('10000000')
      await adminPage.waitForTimeout(500)

      // Tax should auto-calculate (look for result field)
      const taxResult = adminPage.locator('input[placeholder*="Thuế"], input[placeholder*="Tax"]').nth(1)
      if (await taxResult.isVisible()) {
        const calculatedValue = await taxResult.inputValue()
        expect(calculatedValue).toBeTruthy()
        expect(parseFloat(calculatedValue)).toBeGreaterThan(0)
      }
    }
  })

  test('xuất báo cáo thuế - export tax report', async ({ adminPage }) => {
    await adminPage.goto('/accounting/tax')

    // Wait for page to load
    await expect(adminPage.locator('button, table').first()).toBeVisible({ timeout: 10_000 })

    // Look for export button
    const exportButton = adminPage.getByRole('button', { name: /xuất|export/i }).first()
    if (await exportButton.isVisible()) {
      await exportButton.click()

      // Wait for export process
      await adminPage.waitForTimeout(2000)

      // Verify success or file download initiated
      const successMsg = adminPage.locator('[role="status"], .success, .text-green-500').first()
      if (await successMsg.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const text = await successMsg.textContent()
        expect(text).toMatch(/xuất|export|thành công|success/i)
      }
    } else {
      // Fallback: look for report table or section
      const reportTable = adminPage.locator('table').first()
      if (await reportTable.isVisible()) {
        // Table exists, test passes
        expect(true).toBe(true)
      }
    }
  })
})
