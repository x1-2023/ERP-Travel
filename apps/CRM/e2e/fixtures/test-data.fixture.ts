import { test as base } from './auth.fixture'
import { TEST_PREFIX } from '../helpers/seed.helper'

/**
 * Extended fixture that provides test data context.
 * Test data is seeded by global-setup.ts before tests run.
 */
type TestDataFixtures = {
  testPrefix: string
  testCompanyName: string
  testContactName: string
}

export const test = base.extend<TestDataFixtures>({
  testPrefix: TEST_PREFIX,
  testCompanyName: `${TEST_PREFIX} Công ty ABC`,
  testContactName: `${TEST_PREFIX} Nguyễn`,
})

export { expect } from '@playwright/test'
