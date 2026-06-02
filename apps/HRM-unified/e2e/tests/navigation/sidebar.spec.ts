import { test, expect } from "@playwright/test"
import { UI_TEXT } from "../../fixtures/test-data"

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("shows all main navigation sections", async ({ page }) => {
    const sidebar = page.locator("aside, nav, [role='navigation']").first()
    const sections = Object.values(UI_TEXT.sidebar.sections)

    for (const sectionLabel of sections) {
      await expect(sidebar.getByText(sectionLabel)).toBeVisible()
    }
  })

  test("clicking Nhân viên navigates to employees page", async ({ page }) => {
    const sidebar = page.locator("aside").first()
    await sidebar.getByText(UI_TEXT.sidebar.items.employees).click()
    await expect(page).toHaveURL("/employees")
  })

  test("sub-menu expansion works for items with children", async ({ page }) => {
    const sidebar = page.locator("aside").first()

    // Click on "Tổ chức" which has children (Phòng ban, Chức danh, Chi nhánh)
    await sidebar.getByText(UI_TEXT.sidebar.items.organization).click()

    // After expanding, child items should be visible
    await expect(sidebar.getByText("Phòng ban")).toBeVisible({ timeout: 5000 })
  })
})
