import { test, expect } from "@playwright/test"
import { UI_TEXT } from "../../fixtures/test-data"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("shows main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: UI_TEXT.dashboard.title })
    ).toBeVisible()
  })

  test("displays key metric cards", async ({ page }) => {
    const metrics = Object.values(UI_TEXT.dashboard.metrics)
    for (const metricLabel of metrics) {
      await expect(page.getByText(metricLabel).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test("shows attendance trend chart section", async ({ page }) => {
    await expect(
      page.getByText(UI_TEXT.dashboard.sections.attendanceTrend)
    ).toBeVisible()
  })

  test("shows recent activities section", async ({ page }) => {
    await expect(
      page.getByText(UI_TEXT.dashboard.sections.recentActivities)
    ).toBeVisible()
  })
})
