import { test, expect } from "@playwright/test"

test.describe("Auth Redirects", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login/)
  })

  test("redirect preserves callbackUrl for deep links", async ({ page }) => {
    await page.goto("/employees")
    await expect(page).toHaveURL(/\/login/)
    // callbackUrl should be encoded in URL
    const url = page.url()
    expect(url).toContain("callbackUrl")
    expect(url).toContain("employees")
  })

  test("login page is accessible without auth", async ({ page }) => {
    const response = await page.goto("/login")
    expect(response?.status()).toBeLessThan(400)
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" })
    ).toBeVisible()
  })
})
