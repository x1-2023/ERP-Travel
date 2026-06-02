import { type Page, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'

export class ContactsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/contacts')
  }

  async expectListVisible() {
    // Wait for either a table or a list of contacts to appear
    await expect(
      this.page.locator('table, [data-testid="contacts-list"]').first()
    ).toBeVisible({ timeout: 10_000 })
  }

  async expectPageHeading() {
    // Check for Vietnamese or English heading
    await expect(
      this.page.locator('h1').first()
    ).toBeVisible({ timeout: 10_000 })
  }

  async clickCreate() {
    await this.page
      .locator('button:has-text("Thêm"), a:has-text("Thêm"), button:has-text("Add")')
      .first()
      .click()
  }

  async searchFor(query: string) {
    const searchInput = this.page.locator(SELECTORS.searchInput).first()
    await searchInput.fill(query)
  }

  async expectRowCount(count: number) {
    await expect(this.page.locator(SELECTORS.tableRow)).toHaveCount(count, {
      timeout: 10_000,
    })
  }

  async expectSearchResults(minRows: number) {
    const rows = this.page.locator(SELECTORS.tableRow)
    await expect(rows).toHaveCount(minRows, { timeout: 10_000 })
  }
}
