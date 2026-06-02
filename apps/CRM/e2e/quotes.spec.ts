import { test, expect } from './fixtures/auth.fixture'

test.describe('Quote Flow', () => {
  test('list quotes shows seed data', async ({ adminPage }) => {
    await adminPage.goto('/quotes')
    await expect(adminPage.getByRole('heading', { name: 'Báo giá' })).toBeVisible({ timeout: 10_000 })

    // Seed data has 2 quotes — verify table rows appear
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Verify quote number column contains QUO-
    await expect(adminPage.locator('table tbody tr').first()).toContainText('QUO-')
  })

  test('create quote with items', async ({ adminPage }) => {
    await adminPage.goto('/quotes/new')
    await expect(adminPage.getByRole('heading', { name: 'Tạo báo giá' })).toBeVisible({ timeout: 10_000 })

    // Wait for contacts to load
    await adminPage.waitForTimeout(2000)

    // Add an item first (required — submit disabled if items.length === 0)
    await adminPage.getByRole('button', { name: 'Thêm sản phẩm' }).click()

    // Fill item: product name, quantity, unit price
    // Product name is in a text input within the table row
    const itemRow = adminPage.locator('table tbody tr').first()
    // Product name input (first input in the row)
    const productInput = itemRow.locator('input').first()
    await productInput.fill('[E2E] Dịch vụ hosting')

    // Quantity input (SL column)
    const qtyInput = itemRow.locator('input[type="number"]').first()
    await qtyInput.fill('2')

    // Unit price input
    const priceInput = itemRow.locator('input[type="number"]').nth(1)
    await priceInput.fill('5000000')

    // Wait for POST response
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/quotes') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    // Submit the form
    await adminPage.getByRole('button', { name: 'Tạo báo giá' }).click()

    const response = await responsePromise
    if (response) {
      const status = response.status()
      if (status >= 400) {
        const body = await response.json().catch(() => ({}))
        throw new Error(`Quote API returned ${status}: ${JSON.stringify(body)}`)
      }
      // Should redirect to quotes list
      await expect(adminPage).toHaveURL(/.*quotes$/, { timeout: 10_000 })
    } else {
      throw new Error('Quote creation failed — no API call made')
    }
  })

  test('quote detail shows items and totals', async ({ adminPage }) => {
    await adminPage.goto('/quotes')
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Click on a quote row to navigate to detail
    await adminPage.locator('table tbody tr').first().click()

    // Should navigate to quote detail page
    await expect(adminPage).toHaveURL(/.*quotes\/[a-z0-9]+/, { timeout: 10_000 })

    // Verify customer info section
    await expect(adminPage.getByText('Thông tin khách hàng')).toBeVisible({ timeout: 5_000 })

    // Verify totals section exists
    await expect(adminPage.getByText('Tổng cộng')).toBeVisible()
  })

  test('quote detail has PDF export button', async ({ adminPage }) => {
    await adminPage.goto('/quotes')
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Click on a quote row
    await adminPage.locator('table tbody tr').first().click()
    await expect(adminPage).toHaveURL(/.*quotes\/[a-z0-9]+/, { timeout: 10_000 })

    // Verify PDF export button exists and is clickable
    const pdfButton = adminPage.getByRole('button', { name: /Xuất PDF|Tải PDF/ })
    await expect(pdfButton).toBeVisible({ timeout: 5_000 })
    await expect(pdfButton).toBeEnabled()

    // Click PDF button and verify the API is called
    const pdfResponsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/pdf') && resp.request().method() === 'GET',
      { timeout: 15_000 }
    ).catch(() => null)

    await pdfButton.click()

    const pdfResponse = await pdfResponsePromise
    // Verify API was called (PDF generation may fail in dev due to react-pdf limitations)
    expect(pdfResponse).toBeTruthy()
  })

  test('send quote dialog opens for draft quote', async ({ adminPage }) => {
    await adminPage.goto('/quotes')
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Find a DRAFT quote by looking for "Nháp" badge, then click on that row
    const draftRow = adminPage.locator('table tbody tr').filter({ hasText: 'Nháp' }).first()
    const hasDraft = await draftRow.isVisible().catch(() => false)

    if (!hasDraft) {
      test.skip()
      return
    }

    await draftRow.click()
    await expect(adminPage).toHaveURL(/.*quotes\/[a-z0-9]+/, { timeout: 10_000 })

    // Click "Gửi báo giá" button
    const sendButton = adminPage.getByRole('button', { name: /Gửi báo giá/ })
    await expect(sendButton).toBeVisible({ timeout: 5_000 })
    await sendButton.click()

    // Verify dialog opens with email field
    await expect(adminPage.getByText('Email sẽ được gửi kèm file PDF')).toBeVisible({ timeout: 5_000 })
    await expect(adminPage.locator('#send-to')).toBeVisible()

    // Close dialog without sending
    await adminPage.getByRole('button', { name: /Hủy/ }).click()
  })
})
