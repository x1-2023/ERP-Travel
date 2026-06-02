import { type FullConfig } from '@playwright/test'

/**
 * Global teardown for E2E tests.
 * Runs once after all test files.
 */
async function globalTeardown(config: FullConfig) {
  // Add any cleanup logic here:
  // - Close connections
  // - Clean up temporary files
  // - Generate reports

  console.log('E2E Test Suite for Accounting Module - Global Teardown')
}

export default globalTeardown
