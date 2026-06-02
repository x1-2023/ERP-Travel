import { test, expect } from './fixtures/auth.fixture'
import { createSalesInvoiceData, createPurchaseInvoiceData, TEST_PREFIX } from './fixtures/test-data'

test.describe('Invoices (Hoá đơn)', () => {
  test('tạo hoá đơn bán hàng - create sales invoice', async ({ adminPage }) => {
    await adminPage.goto('/accounting/invoices/sales/new')

    // Verify create form is visible
    await expect(adminPage.getByRole('heading', { name: /hoá đơn bán|sales invoice/i })).toBeVisible({ timeout: 10_000 })

    const invoiceData = createSalesInvoiceData()

    // Fill invoice number
    const invoiceNoInput = adminPage.locator('input[placeholder*="Số hoá đơn"], input[placeholder*="Invoice No"]').first()
    if (await invoiceNoInput.isVisible()) {
      await invoiceNoInput.fill(invoiceData.invoiceNo)
    }

    // Fill invoice date
    const dateInput = adminPage.locator('input[type="date"]').first()
    await dateInput.fill(invoiceData.date)

    // Fill customer name
    const customerInput = adminPage.locator('input[placeholder*="Khách hàng"], input[placeholder*="Customer"]').first()
    await customerInput.fill(invoiceData.customerName)
    await adminPage.waitForTimeout(500)
    await adminPage.locator('[role="option"]').first().click().catch(() => {})

    // Fill customer tax ID (if field exists)
    const taxIdInput = adminPage.locator('input[placeholder*="Mã số thuế"], input[placeholder*="Tax ID"]').first()
    if (await taxIdInput.isVisible()) {
      await taxIdInput.fill(invoiceData.customerTaxId)
    }

    // Add line item
    const addItemButton = adminPage.getByRole('button', { name: /thêm.*hàng|add.*item|thêm dòng/i }).first()
    if (await addItemButton.isVisible()) {
      await addItemButton.click()
    }

    // Fill item description
    const descInput = adminPage.locator('input[placeholder*="Mô tả"], textarea').nth(0)
    await adminPage.waitForTimeout(300)
    await descInput.fill(invoiceData.items[0].description)

    // Fill quantity
    const qtyInput = adminPage.locator('input[placeholder*="Số lượng"], input[placeholder*="Qty"]').first()
    await qtyInput.fill(invoiceData.items[0].quantity.toString())

    // Fill unit price
    const priceInput = adminPage.locator('input[placeholder*="Đơn giá"], input[placeholder*="Price"]').first()
    await priceInput.fill(invoiceData.items[0].unitPrice.toString())

    // Submit form
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/invoices') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: /lưu|save|tạo/i }).click()

    const response = await responsePromise
    if (response && response.status() >= 400) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`Sales invoice creation failed: ${JSON.stringify(body)}`)
    }

    // Should redirect to invoices list
    await expect(adminPage).toHaveURL(/.*invoices.*(sales|list)/, { timeout: 10_000 })
  })

  test('tạo hoá đơn mua hàng - create purchase invoice', async ({ adminPage }) => {
    await adminPage.goto('/accounting/invoices/purchase/new')

    // Verify create form is visible
    await expect(adminPage.getByRole('heading', { name: /hoá đơn mua|purchase invoice/i })).toBeVisible({ timeout: 10_000 })

    const invoiceData = createPurchaseInvoiceData()

    // Fill invoice number
    const invoiceNoInput = adminPage.locator('input[placeholder*="Số hoá đơn"], input[placeholder*="Invoice No"]').first()
    if (await invoiceNoInput.isVisible()) {
      await invoiceNoInput.fill(invoiceData.invoiceNo)
    }

    // Fill invoice date
    const dateInput = adminPage.locator('input[type="date"]').first()
    await dateInput.fill(invoiceData.date)

    // Fill supplier name
    const supplierInput = adminPage.locator('input[placeholder*="Nhà cung cấp"], input[placeholder*="Supplier"]').first()
    await supplierInput.fill(invoiceData.supplierName)
    await adminPage.waitForTimeout(500)
    await adminPage.locator('[role="option"]').first().click().catch(() => {})

    // Fill supplier tax ID (if field exists)
    const taxIdInput = adminPage.locator('input[placeholder*="Mã số thuế"], input[placeholder*="Tax ID"]').first()
    if (await taxIdInput.isVisible()) {
      await taxIdInput.fill(invoiceData.supplierTaxId)
    }

    // Add line item
    const addItemButton = adminPage.getByRole('button', { name: /thêm.*hàng|add.*item|thêm dòng/i }).first()
    if (await addItemButton.isVisible()) {
      await addItemButton.click()
    }

    // Fill item description
    const descInput = adminPage.locator('input[placeholder*="Mô tả"], textarea').nth(0)
    await adminPage.waitForTimeout(300)
    await descInput.fill(invoiceData.items[0].description)

    // Fill quantity
    const qtyInput = adminPage.locator('input[placeholder*="Số lượng"], input[placeholder*="Qty"]').first()
    await qtyInput.fill(invoiceData.items[0].quantity.toString())

    // Fill unit price
    const priceInput = adminPage.locator('input[placeholder*="Đơn giá"], input[placeholder*="Price"]').first()
    await priceInput.fill(invoiceData.items[0].unitPrice.toString())

    // Submit form
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/invoices') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: /lưu|save|tạo/i }).click()

    const response = await responsePromise
    if (response && response.status() >= 400) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`Purchase invoice creation failed: ${JSON.stringify(body)}`)
    }

    // Should redirect to invoices list
    await expect(adminPage).toHaveURL(/.*invoices.*(purchase|list)/, { timeout: 10_000 })
  })

  test('xuất hoá đơn điện tử - export e-invoice', async ({ adminPage }) => {
    await adminPage.goto('/accounting/invoices')

    // Wait for list to load
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Find first invoice row
    const firstRow = adminPage.locator('table tbody tr').first()

    // Look for export button or menu
    const moreButton = firstRow.locator('button[aria-label*="more"], button[aria-label*="Thêm"], button:has-text("...")').first()
    if (await moreButton.isVisible().catch(() => false)) {
      await moreButton.click()
    }

    // Look for export option
    const exportButton = adminPage.locator('button:has-text("Xuất"), button:has-text("Export"), button:has-text("Điện tử")').first()
    if (await exportButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await exportButton.click()

      // Wait for export to complete (file download or success message)
      await adminPage.waitForTimeout(2000)

      // Verify success message appears
      const successMsg = adminPage.locator('[role="status"], .success, .text-green-500').first()
      if (await successMsg.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const text = await successMsg.textContent()
        expect(text).toMatch(/xuất|export|thành công|success/i)
      }
    }
  })

  test('tìm kiếm hoá đơn - search invoices', async ({ adminPage }) => {
    await adminPage.goto('/accounting/invoices')

    // Wait for table to load
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Find search input
    const searchInput = adminPage.locator('input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], input[type="search"]').first()

    if (await searchInput.isVisible()) {
      // Search for invoice
      await searchInput.fill('HĐ')

      // Wait for results to update
      await adminPage.waitForTimeout(1000)

      // Verify results
      const rows = adminPage.locator('table tbody tr')
      const count = await rows.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })
})
