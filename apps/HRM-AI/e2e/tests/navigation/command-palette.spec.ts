import { test, expect } from "@playwright/test"

test.describe("Command Palette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("opens with Cmd+K keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("Meta+k")

    // cmdk dialog should appear with input
    await expect(
      page.locator("[cmdk-input], [cmdk-dialog] input, [role='combobox']")
    ).toBeVisible({ timeout: 5000 })
  })

  test("opens with Ctrl+K keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("Control+k")

    await expect(
      page.locator("[cmdk-input], [cmdk-dialog] input, [role='combobox']")
    ).toBeVisible({ timeout: 5000 })
  })

  test("searches and navigates to employees page", async ({ page }) => {
    await page.keyboard.press("Meta+k")

    const input = page.locator(
      "[cmdk-input], [cmdk-dialog] input, [role='combobox']"
    )
    await input.waitFor({ state: "visible" })
    await input.fill("Nhân viên")

    // Wait for search results and click the employee item
    const employeeItem = page.locator(
      "[cmdk-item]:has-text('Nhân viên'), [role='option']:has-text('Nhân viên')"
    )
    await employeeItem.first().click()

    await expect(page).toHaveURL("/employees", { timeout: 5000 })
  })

  test("closes when clicking backdrop", async ({ page }) => {
    await page.keyboard.press("Meta+k")

    const input = page.locator(
      "[cmdk-input], [cmdk-dialog] input, [role='combobox']"
    )
    await input.waitFor({ state: "visible" })

    // Click the backdrop to close
    await page.locator(".fixed.inset-0 > .absolute.inset-0").first().click({ force: true })
    await page.waitForTimeout(500)

    // Verify the dialog is closed
    await expect(input).not.toBeVisible({ timeout: 3000 })
  })

  test("closes with Cmd+K toggle", async ({ page }) => {
    await page.keyboard.press("Meta+k")

    const input = page.locator(
      "[cmdk-input], [cmdk-dialog] input, [role='combobox']"
    )
    await input.waitFor({ state: "visible" })

    // Pressing Cmd+K again toggles it closed
    await page.keyboard.press("Meta+k")

    await expect(input).not.toBeVisible({ timeout: 3000 })
  })
})
