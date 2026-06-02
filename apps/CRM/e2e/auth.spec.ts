import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { TEST_USERS } from './helpers/auth.helper'

test.describe('Authentication', () => {
  test('redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })
    await expect(page.locator('#email')).toBeVisible()
  })

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password)
    await loginPage.expectLoggedIn()

    // Verify dashboard content loaded
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Verify user name in header
    await expect(page.getByText(TEST_USERS.admin.name)).toBeVisible({ timeout: 5_000 })
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USERS.admin.email, 'WrongPassword999!')

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })
    // Should show Vietnamese error message
    await expect(page.locator('.text-red-400')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.text-red-400')).toContainText('Email hoặc mật khẩu không đúng')
  })

  test('login with non-existent email shows error', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('nonexistent@test.rtr.com', 'SomePassword123!')

    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })
    await expect(page.locator('.text-red-400')).toBeVisible({ timeout: 10_000 })
  })

  test('logout clears session and redirects to login', async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password)
    await loginPage.expectLoggedIn()
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })

    // Open user dropdown — button contains the user name text
    await page.getByRole('button', { name: /Admin User/ }).click()

    // Wait for dropdown menu to appear then click logout
    const logoutItem = page.getByText('Đăng xuất')
    await expect(logoutItem).toBeVisible({ timeout: 5_000 })
    await logoutItem.click()

    // Verify redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })

    // Verify cannot access dashboard anymore
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })
  })
})
