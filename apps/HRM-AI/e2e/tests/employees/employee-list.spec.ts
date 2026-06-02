import { test, expect } from "@playwright/test"

test.describe("Employee List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/employees")
    await page.waitForLoadState("networkidle")
  })

  test("page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Nhân viên/i })
    ).toBeVisible({ timeout: 10000 })
  })

  test("displays employee data or empty state", async ({ page }) => {
    // Either a table/list with data, or an empty state is shown
    const hasTable = await page
      .locator("table, [role='table'], [role='grid']")
      .isVisible()
      .catch(() => false)

    const hasCards = await page
      .locator("[class*='card'], [class*='employee']")
      .first()
      .isVisible()
      .catch(() => false)

    const hasEmptyState = await page
      .getByText(/Không có dữ liệu|Chưa có nhân viên/i)
      .isVisible()
      .catch(() => false)

    // At least one of these should be present
    expect(hasTable || hasCards || hasEmptyState).toBeTruthy()
  })
})
