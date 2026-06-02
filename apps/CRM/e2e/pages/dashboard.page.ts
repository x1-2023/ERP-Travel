import { type Page, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard')
  }

  async expectVisible() {
    await expect(this.page.locator('main')).toBeVisible({ timeout: 10_000 })
  }

  async expectKPICards(count = 4) {
    await expect(this.page.locator(SELECTORS.kpiCard)).toHaveCount(count, {
      timeout: 10_000,
    })
  }

  async expectCharts() {
    await expect(this.page.locator(SELECTORS.chartContainer).first()).toBeVisible({
      timeout: 10_000,
    })
  }

  async expectHeader() {
    await expect(this.page.locator(SELECTORS.header)).toBeVisible()
  }

  async expectSidebar() {
    await expect(this.page.locator(SELECTORS.sidebar)).toBeVisible()
  }
}
