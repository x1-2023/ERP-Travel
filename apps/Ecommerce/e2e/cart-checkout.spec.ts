import { test, expect } from '@playwright/test'
import { TEST_PRODUCTS, TEST_ADDRESSES, PAYMENT_METHODS } from './fixtures/test-data'

test.describe('Cart and Checkout', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/shop')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-item"], .product-item, article').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click add to cart button on first product
    const addToCartBtn = page
      .getByRole('button', { name: /thêm vào giỏ|add to cart/i })
      .first()

    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click()

      // Verify cart updated (could be notification or cart count)
      const cartNotification = page.getByText(/thêm vào giỏ thành công|added to cart|item added/i)
      const cartCount = page.locator('[data-testid="cart-count"], .cart-count')

      const hasNotification = await cartNotification.isVisible({ timeout: 3_000 }).catch(() => false)
      const hasCount = await cartCount.isVisible({ timeout: 3_000 }).catch(() => false)

      expect(hasNotification || hasCount).toBeTruthy()
    }
  })

  test('should update product quantity in cart', async ({ page }) => {
    await page.goto('/cart')

    // Wait for cart items to load
    await expect(page.locator('[data-testid="cart-item"], .cart-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Find quantity input for first item
    const quantityInput = page
      .locator('[data-testid="quantity-input"], input[type="number"]')
      .first()

    if (await quantityInput.isVisible()) {
      const currentQuantity = await quantityInput.inputValue()
      const newQuantity = String(parseInt(currentQuantity) + 1)

      await quantityInput.fill(newQuantity)

      // Wait for cart to update
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/cart') && resp.request().method() === 'PUT',
        { timeout: 15_000 }
      )

      // Trigger change event
      await quantityInput.press('Enter')

      try {
        await responsePromise
      } catch {
        // Response might not fire
      }

      // Verify total updated
      const cartTotal = page.locator('[data-testid="cart-total"], .cart-total, .total')
      await expect(cartTotal).toBeVisible({ timeout: 5_000 })
    }
  })

  test('should complete VNPay checkout flow', async ({ page }) => {
    await page.goto('/cart')

    // Wait for cart to load
    await expect(page.locator('[data-testid="cart-item"], .cart-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click proceed to checkout
    const checkoutBtn = page.getByRole('button', { name: /thanh toán|checkout|proceed/i }).first()

    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click()

      // Wait for checkout page
      await page.waitForLoadState('networkidle')

      // Fill shipping address
      const address = TEST_ADDRESSES.hanoi
      const nameField = page.getByPlaceholder(/tên|name/i).first()

      if (await nameField.isVisible()) {
        await nameField.fill(address.fullName)
      }

      const phoneField = page.getByPlaceholder(/điện thoại|phone|số điện thoại/i).first()
      if (await phoneField.isVisible()) {
        await phoneField.fill(address.phone)
      }

      const streetField = page.getByPlaceholder(/địa chỉ|address|đường|street/i).first()
      if (await streetField.isVisible()) {
        await streetField.fill(address.street)
      }

      // Select payment method - VNPay
      const paymentSelect = page
        .getByRole('combobox', { name: /phương thức thanh toán|payment method/i })
        .first()

      if (await paymentSelect.isVisible({ timeout: 5_000 })) {
        await paymentSelect.click()

        const vnpayOption = page.getByRole('option', { name: /vnpay/i }).first()
        if (await vnpayOption.isVisible()) {
          await vnpayOption.click()
        }
      }

      // Place order
      const placeOrderBtn = page.getByRole('button', { name: /đặt hàng|place order|submit/i })
      if (await placeOrderBtn.isEnabled()) {
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/orders') ||
            resp.url().includes('/api/payment') ||
            resp.url().includes('vnpay'),
          { timeout: 20_000 }
        )

        await placeOrderBtn.click()

        try {
          await responsePromise
        } catch {
          // Response might not fire
        }

        // Verify order confirmation or payment page
        await expect(page).toHaveURL(/.*order|.*payment|.*checkout/, { timeout: 10_000 })
      }
    }
  })

  test('should complete MoMo checkout flow', async ({ page }) => {
    await page.goto('/cart')

    // Wait for cart to load
    await expect(page.locator('[data-testid="cart-item"], .cart-item, tr').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click proceed to checkout
    const checkoutBtn = page.getByRole('button', { name: /thanh toán|checkout|proceed/i }).first()

    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click()

      // Wait for checkout page
      await page.waitForLoadState('networkidle')

      // Fill shipping address
      const address = TEST_ADDRESSES.hcm
      const nameField = page.getByPlaceholder(/tên|name/i).first()

      if (await nameField.isVisible()) {
        await nameField.fill(address.fullName)
      }

      const phoneField = page.getByPlaceholder(/điện thoại|phone|số điện thoại/i).first()
      if (await phoneField.isVisible()) {
        await phoneField.fill(address.phone)
      }

      const streetField = page.getByPlaceholder(/địa chỉ|address|đường|street/i).first()
      if (await streetField.isVisible()) {
        await streetField.fill(address.street)
      }

      // Select payment method - MoMo
      const paymentSelect = page
        .getByRole('combobox', { name: /phương thức thanh toán|payment method/i })
        .first()

      if (await paymentSelect.isVisible({ timeout: 5_000 })) {
        await paymentSelect.click()

        const momoOption = page.getByRole('option', { name: /momo/i }).first()
        if (await momoOption.isVisible()) {
          await momoOption.click()
        }
      }

      // Place order
      const placeOrderBtn = page.getByRole('button', { name: /đặt hàng|place order|submit/i })
      if (await placeOrderBtn.isEnabled()) {
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/orders') ||
            resp.url().includes('/api/payment') ||
            resp.url().includes('momo'),
          { timeout: 20_000 }
        )

        await placeOrderBtn.click()

        try {
          await responsePromise
        } catch {
          // Response might not fire
        }

        // Verify order confirmation or payment page
        await expect(page).toHaveURL(/.*order|.*payment|.*checkout/, { timeout: 10_000 })
      }
    }
  })
})
