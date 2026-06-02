import { test as setup } from "@playwright/test"
import path from "path"

const ADMIN_EMAIL = "admin@demo.com"
const ADMIN_PASSWORD = "Admin@123"
const authFile = path.join(__dirname, ".auth/admin.json")

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login")
  await page.waitForSelector('input[type="email"]')

  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL("/", { timeout: 15000 })

  // Save authenticated state
  await page.context().storageState({ path: authFile })
})
