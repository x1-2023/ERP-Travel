import { test, expect } from "@playwright/test"
import { TEST_USERS } from "../../fixtures/test-data"

test.describe("Logout", () => {
  test("logout redirects to login page", async ({ page }) => {
    // First authenticate inline
    await page.goto("/login")
    await page.waitForSelector('input[type="email"]')
    await page.fill('input[type="email"]', TEST_USERS.admin.email)
    await page.fill('input[type="password"]', TEST_USERS.admin.password)
    await page.click('button[type="submit"]')
    await page.waitForURL("/", { timeout: 15000 })

    // Now sign out via NextAuth signout endpoint
    await page.goto("/api/auth/signout")
    await page.waitForLoadState("networkidle")

    // NextAuth shows a confirmation page with a CSRF form
    const confirmBtn = page.locator('button[type="submit"]')
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click()
    }

    // Should redirect back to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})
