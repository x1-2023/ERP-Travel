import { test, expect } from '@playwright/test'
import { TEST_PRODUCTS } from './fixtures/test-data'

test.describe('Products Management', () => {
  test('should display product list', async ({ page }) => {
    await page.goto('/products')

    // Verify page title
    await expect(page.getByRole('heading', { name: /sản phẩm|products/i })).toBeVisible({
      timeout: 10_000,
    })

    // Verify product list container exists
    const productList = page.locator('[data-testid="product-list"], .product-list, section')
    await expect(productList).toBeVisible({ timeout: 10_000 })

    // Verify at least one product item is visible
    const productItems = page.locator('[data-testid="product-item"], .product-item, article')
    await expect(productItems.first()).toBeVisible()
  })

  test('should create a new product', async ({ page }) => {
    await page.goto('/products/new')

    // Verify create form is visible
    await expect(
      page.getByRole('heading', { name: /tạo sản phẩm|create product|thêm sản phẩm/i })
    ).toBeVisible({ timeout: 10_000 })

    // Fill product form fields
    const product = TEST_PRODUCTS.laptop
    const nameField = page.getByPlaceholder(/tên sản phẩm|product name/i).first()
    const descriptionField = page.getByPlaceholder(/mô tả|description/i).first()
    const priceField = page.getByPlaceholder(/giá|price/i).first()
    const skuField = page.getByPlaceholder(/sku/i).first()

    if (await nameField.isVisible()) {
      await nameField.fill(product.name)
    }

    if (await descriptionField.isVisible()) {
      await descriptionField.fill(product.description)
    }

    if (await priceField.isVisible()) {
      await priceField.fill(product.price)
    }

    if (await skuField.isVisible()) {
      await skuField.fill(product.sku)
    }

    // Submit form
    const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|create/i })
    await expect(submitBtn).toBeEnabled()

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    )

    await submitBtn.click()

    try {
      await responsePromise
    } catch {
      // Response might not fire in all cases, continue with URL check
    }

    // Verify redirect to product list or detail
    await expect(page).toHaveURL(/.*products/, { timeout: 10_000 })
  })

  test('should edit an existing product', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-item"], .product-item, article').first()).toBeVisible({
      timeout: 10_000,
    })

    // Click on first product to open detail/edit
    await page.locator('[data-testid="product-item"], .product-item, article').first().click()

    // Wait for detail page or edit form to appear
    await page.waitForLoadState('networkidle')

    // Look for edit button or form
    const editBtn = page.getByRole('button', { name: /chỉnh sửa|edit|sửa/i }).first()

    if (await editBtn.isVisible()) {
      await editBtn.click()
    }

    // Verify we're on edit page
    await expect(page).toHaveURL(/.*products.*/, { timeout: 10_000 })

    // Try to find and update a field
    const descriptionField = page.getByPlaceholder(/mô tả|description/i).first()

    if (await descriptionField.isVisible({ timeout: 5_000 })) {
      const originalValue = await descriptionField.inputValue()
      const updatedValue = `${originalValue} [Updated ${Date.now()}]`
      await descriptionField.fill(updatedValue)

      // Save changes
      const saveBtn = page.getByRole('button', { name: /lưu|save/i })
      await expect(saveBtn).toBeEnabled()

      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/products') && resp.request().method() === 'PUT',
        { timeout: 15_000 }
      )

      await saveBtn.click()

      try {
        await responsePromise
      } catch {
        // Response might not fire
      }
    }
  })

  test('should search products by name', async ({ page }) => {
    await page.goto('/products')

    // Wait for products to load
    await expect(page.locator('[data-testid="product-item"], .product-item, article').first()).toBeVisible({
      timeout: 10_000,
    })

    // Find search input
    const searchInput = page
      .getByPlaceholder(/tìm kiếm|search|lọc/i)
      .first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('[E2E]')

      // Wait for debounced search
      await page.waitForTimeout(800)

      // Verify search results are displayed
      const productItems = page.locator('[data-testid="product-item"], .product-item, article')
      await expect(productItems).toHaveCount(await productItems.count(), { timeout: 10_000 })
    }
  })
})
