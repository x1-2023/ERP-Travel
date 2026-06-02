import { test as base, type Page } from '@playwright/test'
import { loginAs } from '../helpers/auth.helper'

type AuthFixtures = {
  adminPage: Page
  managerPage: Page
  memberPage: Page
  viewerPage: Page
}

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ page }, use) => {
    await loginAs(page, 'admin')
    await use(page)
  },
  managerPage: async ({ page }, use) => {
    await loginAs(page, 'manager')
    await use(page)
  },
  memberPage: async ({ page }, use) => {
    await loginAs(page, 'member')
    await use(page)
  },
  viewerPage: async ({ page }, use) => {
    await loginAs(page, 'viewer')
    await use(page)
  },
})

export { expect } from '@playwright/test'
