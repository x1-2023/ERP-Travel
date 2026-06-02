import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { TEST_USERS } from './helpers/auth.helper'
import { SELECTORS } from './helpers/selectors'

test.describe('Smoke Tests — Setup Verification', () => {
  test('app loads and redirects to login page', async ({ page }) => {
    await page.goto('/')
    // Unauthenticated user should be redirected to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('can login as admin', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password)
    await loginPage.expectLoggedIn()

    // Verify dashboard loaded with main content
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Verify header is present
    await expect(page.locator(SELECTORS.header)).toBeVisible()
    // Verify sidebar is present
    await expect(page.locator(SELECTORS.sidebar)).toBeVisible()
  })

  test('invalid login shows error', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('wrong@email.com', 'wrongpassword')

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/, { timeout: 10_000 })
    // Should show an error message
    await loginPage.expectError()
  })

  test('Cmd/Ctrl+K opens command palette', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password)
    await loginPage.expectLoggedIn()

    // Wait for dashboard to fully load
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })

    // Open command palette with keyboard shortcut
    await page.keyboard.press('Meta+KeyK')
    await expect(
      page.locator(SELECTORS.commandPalette)
    ).toBeVisible({ timeout: 5_000 })
  })
})
