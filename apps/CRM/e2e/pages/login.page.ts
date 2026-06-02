import { type Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login', { waitUntil: 'networkidle' })
    await this.page.waitForSelector('#email', { timeout: 10_000 })
  }

  async login(email: string, password: string) {
    await this.page.locator('#email').click()
    await this.page.locator('#email').fill(email)
    await this.page.locator('#password').click()
    await this.page.locator('#password').fill(password)
    await this.page.locator('button[type="submit"]').click()
  }

  async expectError() {
    // Error message uses text-red-400 class in the login form
    await expect(
      this.page.locator('.text-red-400, .text-red-500, .text-destructive, [role="alert"]').first()
    ).toBeVisible({ timeout: 10_000 })
  }

  async expectLoggedIn() {
    await this.page.waitForURL('**/dashboard**', { timeout: 30_000 })
  }

  async expectVisible() {
    await expect(this.page.locator('#email')).toBeVisible()
    await expect(this.page.locator('#password')).toBeVisible()
  }
}
