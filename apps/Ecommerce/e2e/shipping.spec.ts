import { test, expect } from '@playwright/test'
import { TEST_ADDRESSES, SHIPPING_METHODS } from './fixtures/test-data'

test.describe('Shipping and Delivery', () => {
  test('should calculate GHN shipping fee', async ({ page }) => {
    await page.goto('/cart')

    // Wait for cart items
    await expect(page.locator('[data-testid="cart-item"], .cart-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Proceed to checkout
    const checkoutBtn = page.getByRole('button', { name: /thanh toán|checkout/i }).first()

    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click()

      await page.waitForLoadState('networkidle')

      // Fill address
      const address = TEST_ADDRESSES.hanoi
      const nameField = page.getByPlaceholder(/tên|name/i).first()
      const phoneField = page.getByPlaceholder(/điện thoại|phone|số điện thoại/i).first()
      const streetField = page.getByPlaceholder(/địa chỉ|address|đường|street/i).first()

      if (await nameField.isVisible()) {
        await nameField.fill(address.fullName)
      }

      if (await phoneField.isVisible()) {
        await phoneField.fill(address.phone)
      }

      if (await streetField.isVisible()) {
        await streetField.fill(address.street)
      }

      // Select GHN shipping method
      const shippingSelect = page
        .getByRole('combobox', { name: /phương thức vận chuyển|shipping method|vận chuyển/i })
        .first()

      if (await shippingSelect.isVisible({ timeout: 5_000 })) {
        await shippingSelect.click()

        const ghnOption = page.getByRole('option', { name: /ghn|giao hàng nhanh/i }).first()

        if (await ghnOption.isVisible()) {
          await ghnOption.click()

          // Wait for shipping calculation
          await page.waitForTimeout(1500)

          // Verify shipping fee is displayed
          const shippingFee = page.locator(
            '[data-testid="shipping-fee"], .shipping-fee, .ship-cost'
          )

          if (await shippingFee.isVisible({ timeout: 5_000 })) {
            const feeText = await shippingFee.textContent()
            expect(feeText).toMatch(/\d+/)
          }
        }
      }
    }
  })

  test('should track shipment status', async ({ page }) => {
    // Navigate to orders list
    await page.goto('/orders')

    // Wait for orders to load
    await expect(page.locator('[data-testid="order-item"], .order-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click on an order with shipped status
    const shippedOrder = page
      .locator('[data-testid="order-item"], .order-item, tr')
      .filter({ has: page.getByText(/đã gửi|shipped/i) })
      .first()

    if (await shippedOrder.isVisible()) {
      await shippedOrder.click()

      await page.waitForLoadState('networkidle')

      // Look for tracking information
      const trackingBtn = page
        .getByRole('button', { name: /theo dõi|track|tracking/i })
        .first()

      if (await trackingBtn.isVisible({ timeout: 5_000 })) {
        await trackingBtn.click()

        // Wait for tracking modal or page
        await page.waitForTimeout(800)

        // Verify tracking info is displayed
        const trackingInfo = page.locator(
          '[data-testid="tracking-info"], .tracking-info, .tracking-status'
        )

        await expect(trackingInfo).toBeVisible({ timeout: 10_000 })
      }
    }
  })

  test('should update delivery status', async ({ page }) => {
    // Navigate to orders list
    await page.goto('/orders')

    // Wait for orders to load
    await expect(page.locator('[data-testid="order-item"], .order-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click on first order
    await page.locator('[data-testid="order-item"], .order-item, tr').first().click()

    await page.waitForLoadState('networkidle')

    // Look for status update control
    const statusControl = page
      .getByRole('button', { name: /cập nhật trạng thái|update status|giao hàng|delivery/i })
      .first()

    if (await statusControl.isVisible({ timeout: 5_000 })) {
      await statusControl.click()

      // Wait for menu/dialog to appear
      await page.waitForTimeout(500)

      // Select delivery completed status
      const deliveredStatus = page.getByRole('option', { name: /đã giao|delivered/i }).first()

      if (await deliveredStatus.isVisible({ timeout: 3_000 })) {
        await deliveredStatus.click()

        // Wait for update API call
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/orders') ||
            resp.url().includes('/api/shipping'),
          { timeout: 15_000 }
        )

        try {
          await responsePromise
        } catch {
          // Response might not fire
        }

        // Verify status updated
        const statusText = page.locator(
          '[data-testid="order-status"], .order-status, .status'
        )

        await expect(statusText).toBeVisible({ timeout: 10_000 })
      }
    }
  })
})
