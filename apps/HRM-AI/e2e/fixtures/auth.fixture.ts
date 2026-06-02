import { test as base, type Page } from "@playwright/test"
import path from "path"

type AuthFixtures = {
  adminPage: Page
}

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, "../.auth/admin.json"),
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from "@playwright/test"
