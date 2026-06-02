import { test, expect } from "@playwright/test"

test.describe("Attendance Module", () => {
  test("page loads successfully", async ({ page }) => {
    await page.goto("/attendance")
    await page.waitForLoadState("networkidle")

    // Page should show the main attendance heading (h1)
    await expect(
      page.locator("h1", { hasText: /Chấm công/i })
    ).toBeVisible({ timeout: 10000 })
  })
})
