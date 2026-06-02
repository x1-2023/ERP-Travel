import { test, expect } from './fixtures/auth.fixture'
import { createBankStatementData, TEST_PREFIX } from './fixtures/test-data'

test.describe('Bank Reconciliation (Đối soát Ngân hàng)', () => {
  test('nhập sao kê ngân hàng - import bank statement', async ({ adminPage }) => {
    await adminPage.goto('/accounting/bank-reconciliation')

    // Verify page header
    await expect(adminPage.getByRole('heading', { name: /đối soát|bank reconciliation|sao kê/i })).toBeVisible({ timeout: 10_000 })

    // Look for import button
    const importButton = adminPage.getByRole('button', { name: /nhập|import|tải/i }).first()
    if (await importButton.isVisible()) {
      await importButton.click()

      // Wait for import dialog/form
      await expect(adminPage.locator('input[type="file"], textarea').first()).toBeVisible({ timeout: 5_000 })

      // Fill bank statement data
      const statementData = createBankStatementData()

      // Fill bank name
      const bankInput = adminPage.locator('input[placeholder*="Ngân hàng"], input[placeholder*="Bank"]').first()
      if (await bankInput.isVisible()) {
        await bankInput.fill(statementData.bankName)
      }

      // Fill account number
      const accountInput = adminPage.locator('input[placeholder*="Tài khoản"], input[placeholder*="Account"]').first()
      if (await accountInput.isVisible()) {
        await accountInput.fill(statementData.accountNumber)
      }

      // Fill statement date
      const dateInput = adminPage.locator('input[type="date"]').first()
      if (await dateInput.isVisible()) {
        await dateInput.fill(statementData.statementDate)
      }

      // Fill opening balance
      const openingInput = adminPage.locator('input[placeholder*="Số dư"], input[placeholder*="Opening"]').first()
      if (await openingInput.isVisible()) {
        await openingInput.fill(statementData.openingBalance.toString())
      }

      // Submit import
      const submitButton = adminPage.getRole('button', { name: /nhập|import|tải/i }).nth(1)
      if (await submitButton.isVisible()) {
        const responsePromise = adminPage.waitForResponse(
          (resp) => resp.url().includes('/api/bank-reconciliation') && resp.request().method() === 'POST',
          { timeout: 15_000 }
        ).catch(() => null)

        await submitButton.click()

        const response = await responsePromise
        if (response && response.status() >= 400) {
          const body = await response.json().catch(() => ({}))
          throw new Error(`Bank statement import failed: ${JSON.stringify(body)}`)
        }
      }
    }
  })

  test('đối soát tự động - auto reconciliation', async ({ adminPage }) => {
    await adminPage.goto('/accounting/bank-reconciliation')

    // Wait for page to load
    await expect(adminPage.locator('table, button').first()).toBeVisible({ timeout: 10_000 })

    // Look for auto-reconcile button
    const autoButton = adminPage.getByRole('button', { name: /tự động|auto|reconcile/i }).first()
    if (await autoButton.isVisible()) {
      const responsePromise = adminPage.waitForResponse(
        (resp) => resp.url().includes('/api/bank-reconciliation') && (resp.request().method() === 'PATCH' || resp.request().method() === 'POST'),
        { timeout: 15_000 }
      ).catch(() => null)

      await autoButton.click()

      const response = await responsePromise
      if (response && response.status() >= 400) {
        const body = await response.json().catch(() => ({}))
        throw new Error(`Auto reconciliation failed: ${JSON.stringify(body)}`)
      }

      // Verify success message
      const successMsg = adminPage.locator('[role="status"], .success, .text-green-500').first()
      if (await successMsg.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const text = await successMsg.textContent()
        expect(text).toMatch(/đối soát|reconcil|thành công|success/i)
      }
    }
  })

  test('xử lý chênh lệch - handle discrepancies', async ({ adminPage }) => {
    await adminPage.goto('/accounting/bank-reconciliation')

    // Wait for table to load
    await expect(adminPage.locator('table').first()).toBeVisible({ timeout: 10_000 })

    // Look for discrepancy items in table (rows marked as unmatched)
    const discrepancyRows = adminPage.locator('table tbody tr').filter({ hasText: /chênh lệch|discrepanc|unmatched|không khớp/ })

    if (await discrepancyRows.first().isVisible().catch(() => false)) {
      const firstDiscrepancy = discrepancyRows.first()

      // Look for action button (adjust, mark as pending, etc)
      const actionButton = firstDiscrepancy.locator('button').first()
      if (await actionButton.isVisible()) {
        await actionButton.click()

        // Handle discrepancy dialog
        const reasonInput = adminPage.locator('textarea, input[placeholder*="Lý do"], input[placeholder*="Reason"]').first()
        if (await reasonInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await reasonInput.fill(`${TEST_PREFIX} Chênh lệch xử lý: Phí ngân hàng`)
        }

        // Submit
        const submitButton = adminPage.getByRole('button', { name: /xác nhận|confirm|save|lưu/i }).last()
        if (await submitButton.isVisible()) {
          const responsePromise = adminPage.waitForResponse(
            (resp) => resp.url().includes('/api/bank-reconciliation') && resp.request().method() === 'PATCH',
            { timeout: 15_000 }
          ).catch(() => null)

          await submitButton.click()

          const response = await responsePromise
          if (response && response.status() >= 400) {
            const body = await response.json().catch(() => ({}))
            throw new Error(`Discrepancy handling failed: ${JSON.stringify(body)}`)
          }
        }
      }
    }
  })
})
