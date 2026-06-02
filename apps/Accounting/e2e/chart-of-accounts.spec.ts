import { test, expect } from './fixtures/auth.fixture'
import { chartOfAccounts, TEST_PREFIX } from './fixtures/test-data'

test.describe('Chart of Accounts (TT200 Compliant)', () => {
  test('hiển thị danh sách tài khoản - display chart of accounts list', async ({ adminPage }) => {
    await adminPage.goto('/accounting/chart-of-accounts')

    // Verify page header
    await expect(adminPage.getByRole('heading', { name: /tài khoản|chart of accounts/i })).toBeVisible({ timeout: 10_000 })

    // Wait for table to load
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Verify at least one row exists
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
  })

  test('tạo tài khoản mới theo TT200 - create new account per TT200', async ({ adminPage }) => {
    await adminPage.goto('/accounting/chart-of-accounts/new')

    // Verify create form is visible
    await expect(adminPage.getByRole('heading', { name: /thêm.*tài khoản|create account/i })).toBeVisible({ timeout: 10_000 })

    const timestamp = Date.now()
    const testAccount = {
      code: `${testPrefix}-${timestamp}`,
      name: `${TEST_PREFIX} Tài khoản Kiểm tra`,
      type: 'ASSET',
    }

    // Fill account code
    await adminPage.locator('input[placeholder*="Mã tài khoản"], input[placeholder*="Account Code"]').first().fill(testAccount.code)

    // Fill account name
    await adminPage.locator('input[placeholder*="Tên tài khoản"], input[placeholder*="Account Name"]').fill(testAccount.name)

    // Select account type (assume combobox or select)
    const typeSelector = adminPage.locator('select, [role="combobox"]').first()
    await typeSelector.click()
    await adminPage.locator('[role="option"]').filter({ hasText: /ASSET|TÀI SẢN/i }).first().click()

    // Submit form and wait for API response
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/chart-of-accounts') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: /lưu|save|tạo/i }).click()

    const response = await responsePromise
    if (response && response.status() >= 400) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`Account creation failed: ${JSON.stringify(body)}`)
    }

    // Should redirect to chart of accounts list
    await expect(adminPage).toHaveURL(/.*chart-of-accounts/, { timeout: 10_000 })
  })

  test('sửa tài khoản - edit account', async ({ adminPage }) => {
    await adminPage.goto('/accounting/chart-of-accounts')

    // Wait for table to load
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 10_000 })

    // Click edit button (typically an icon in the first row)
    const firstRow = adminPage.locator('table tbody tr').first()
    const editButton = firstRow.locator('button[aria-label*="Edit"], button[title*="Sửa"], a:has-text("Sửa")').first()

    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click()
    } else {
      // Fallback: click the first cell to open detail
      await firstRow.locator('td').first().click()
    }

    // Wait for edit form
    await expect(adminPage.locator('input[placeholder*="Tên"], input[placeholder*="Name"]').first()).toBeVisible({ timeout: 10_000 })

    // Update account name
    const nameInput = adminPage.locator('input[placeholder*="Tên"], input[placeholder*="Name"]').first()
    const currentValue = await nameInput.inputValue()
    await nameInput.clear()
    await nameInput.fill(`${currentValue} - Updated ${Date.now()}`)

    // Submit form
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/chart-of-accounts') && resp.request().method() === 'PUT',
      { timeout: 15_000 }
    ).catch(() => null)

    await adminPage.getByRole('button', { name: /cập nhật|update|save/i }).click()

    const response = await responsePromise
    if (response && response.status() >= 400) {
      const body = await response.json().catch(() => ({}))
      throw new Error(`Account update failed: ${JSON.stringify(body)}`)
    }

    // Should redirect back to list
    await expect(adminPage).toHaveURL(/.*chart-of-accounts(?!\/new|\/\d+\/edit)/, { timeout: 10_000 })
  })

  test('tìm kiếm tài khoản - search accounts', async ({ adminPage }) => {
    await adminPage.goto('/accounting/chart-of-accounts')

    // Wait for table to load
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 })

    // Find search input
    const searchInput = adminPage.locator('input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], input[type="search"]').first()

    if (await searchInput.isVisible()) {
      // Search for specific account
      await searchInput.fill('Tiền')

      // Wait for results to update
      await adminPage.waitForTimeout(1000)

      // Verify results
      const rows = adminPage.locator('table tbody tr')
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('hiển thị cây tài khoản - display chart tree view', async ({ adminPage }) => {
    await adminPage.goto('/accounting/chart-of-accounts')

    // Look for tree view toggle button
    const treeViewButton = adminPage.locator('button[aria-label*="Tree"], button:has-text("Cây")').first()

    if (await treeViewButton.isVisible().catch(() => false)) {
      await treeViewButton.click()

      // Wait for tree structure to render
      await expect(adminPage.locator('[role="tree"], .tree-view, .account-tree').first()).toBeVisible({ timeout: 10_000 })

      // Verify hierarchical structure (look for indentation or tree nodes)
      const treeNodes = adminPage.locator('[role="treeitem"], .tree-node, li.account-item')
      const nodeCount = await treeNodes.count()
      expect(nodeCount).toBeGreaterThan(0)
    } else {
      // If no toggle, assume tree view is default
      await expect(adminPage.locator('[role="tree"], .tree-view, .account-tree').first()).toBeVisible({ timeout: 10_000 })
    }
  })
})

const testPrefix = `[E2E-${Date.now()}]`
