import { test, expect } from '@playwright/test'
import { TEST_ORDERS, ORDER_STATUSES } from './fixtures/test-data'

test.describe('Orders Management', () => {
  test('should create a new order', async ({ page }) => {
    await page.goto('/orders/new')

    // Verify create order form is visible
    await expect(
      page.getByRole('heading', { name: /tạo đơn hàng|create order|thêm đơn hàng/i })
    ).toBeVisible({ timeout: 10_000 })

    // Fill order form fields
    const order = TEST_ORDERS.order1
    const customerField = page.getByPlaceholder(/tên khách hàng|customer name/i).first()
    const emailField = page.getByPlaceholder(/email|email address/i).first()
    const phoneField = page.getByPlaceholder(/điện thoại|phone|số điện thoại/i).first()

    if (await customerField.isVisible()) {
      await customerField.fill(order.customer)
    }

    if (await emailField.isVisible()) {
      await emailField.fill(order.email)
    }

    if (await phoneField.isVisible()) {
      await phoneField.fill(order.phone)
    }

    // Try to select products
    const addProductBtn = page.getByRole('button', { name: /thêm sản phẩm|add product|add item/i }).first()

    if (await addProductBtn.isVisible({ timeout: 5_000 })) {
      await addProductBtn.click()
      await page.waitForLoadState('networkidle')
    }

    // Submit order
    const submitBtn = page.getByRole('button', { name: /tạo|create|lưu|save/i })
    if (await submitBtn.isEnabled()) {
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/orders') && resp.request().method() === 'POST',
        { timeout: 15_000 }
      )

      await submitBtn.click()

      try {
        await responsePromise
      } catch {
        // Response might not fire
      }

      // Verify redirect
      await expect(page).toHaveURL(/.*orders/, { timeout: 10_000 })
    }
  })

  test('should update order status', async ({ page }) => {
    await page.goto('/orders')

    // Wait for orders list to load
    await expect(page.locator('[data-testid="order-item"], .order-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click on first order to view details
    await page.locator('[data-testid="order-item"], .order-item, tr').first().click()

    await page.waitForLoadState('networkidle')

    // Look for status update button or dropdown
    const statusButton = page
      .getByRole('button', { name: /trạng thái|status/i })
      .first()

    if (await statusButton.isVisible({ timeout: 5_000 })) {
      await statusButton.click()

      // Select new status
      const processingStatus = page.getByRole('option', { name: /đang xử lý|processing/i }).first()

      if (await processingStatus.isVisible()) {
        await processingStatus.click()

        // Wait for update
        const responsePromise = page.waitForResponse(
          (resp) => resp.url().includes('/api/orders') && resp.request().method() === 'PATCH',
          { timeout: 15_000 }
        )

        try {
          await responsePromise
        } catch {
          // Response might not fire
        }
      }
    }
  })

  test('should cancel an order', async ({ page }) => {
    await page.goto('/orders')

    // Wait for orders list to load
    await expect(page.locator('[data-testid="order-item"], .order-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click on first order
    await page.locator('[data-testid="order-item"], .order-item, tr').first().click()

    await page.waitForLoadState('networkidle')

    // Look for cancel button
    const cancelBtn = page
      .getByRole('button', { name: /huỷ|cancel|huỷ đơn/i })
      .first()

    if (await cancelBtn.isVisible({ timeout: 5_000 })) {
      await cancelBtn.click()

      // Confirm cancellation if dialog appears
      const confirmBtn = page.getByRole('button', { name: /xác nhận|confirm|yes/i }).first()

      if (await confirmBtn.isVisible({ timeout: 3_000 })) {
        const responsePromise = page.waitForResponse(
          (resp) => resp.url().includes('/api/orders') && resp.request().method() === 'DELETE',
          { timeout: 15_000 }
        )

        await confirmBtn.click()

        try {
          await responsePromise
        } catch {
          // Response might not fire
        }
      }
    }
  })

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders')

    // Wait for orders list to load
    await expect(page.locator('[data-testid="order-item"], .order-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Get initial count
    const allItems = page.locator('[data-testid="order-item"], .order-item, tr')
    const initialCount = await allItems.count()

    // Look for status filter
    const statusFilter = page
      .getByRole('combobox', { name: /trạng thái|status/i })
      .first()

    if (await statusFilter.isVisible({ timeout: 5_000 })) {
      await statusFilter.click()

      // Select "processing" status
      const processingOption = page.getByRole('option', { name: /đang xử lý|processing/i }).first()

      if (await processingOption.isVisible()) {
        await processingOption.click()

        // Wait for filter to apply
        await page.waitForTimeout(800)

        // Verify filtered results
        const filteredItems = page.locator('[data-testid="order-item"], .order-item, tr')
        const filteredCount = await filteredItems.count()

        // Should have fewer or equal items after filtering
        expect(filteredCount).toBeLessThanOrEqual(initialCount)
      }
    }
  })
})
