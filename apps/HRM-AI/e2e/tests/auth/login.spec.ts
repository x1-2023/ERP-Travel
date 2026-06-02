import { test, expect } from "@playwright/test"
import { TEST_USERS, UI_TEXT } from "../../fixtures/test-data"

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.waitForSelector('input[type="email"]')
  })

  test("displays login form with Vietnamese text", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: UI_TEXT.login.title })
    ).toBeVisible()
    await expect(page.getByText(UI_TEXT.login.subtitle)).toBeVisible()
    await expect(
      page.getByPlaceholder(UI_TEXT.login.emailPlaceholder)
    ).toBeVisible()
    await expect(
      page.getByPlaceholder(UI_TEXT.login.passwordPlaceholder)
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: UI_TEXT.login.submitButton })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: UI_TEXT.login.forgotPassword })
    ).toBeVisible()
  })

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USERS.admin.email)
    await page.fill('input[type="password"]', TEST_USERS.admin.password)
    await page.click('button[type="submit"]')

    await page.waitForURL("/", { timeout: 15000 })
    await expect(page).toHaveURL("/")
  })

  test("invalid credentials shows error message", async ({ page }) => {
    await page.fill('input[type="email"]', "wrong@email.com")
    await page.fill('input[type="password"]', "wrongpassword")
    await page.click('button[type="submit"]')

    // NextAuth returns error in a destructive-styled div
    await expect(
      page.locator(".text-destructive, [class*='destructive']")
    ).toBeVisible({ timeout: 10000 })
  })

  test("empty password shows validation error", async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USERS.admin.email)
    // Leave password empty and submit
    await page.click('button[type="submit"]')

    await expect(page.getByText(UI_TEXT.login.requiredPassword)).toBeVisible()
  })
})
