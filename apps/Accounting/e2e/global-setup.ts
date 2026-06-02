import { chromium, type FullConfig } from '@playwright/test'

/**
 * Global setup for E2E tests.
 * Runs once before all test files.
 */
async function globalSetup(config: FullConfig) {
  // Add any global setup logic here:
  // - Database seeding (already done by seed.ts)
  // - Environment validation
  // - API initialization checks

  console.log('E2E Test Suite for Accounting Module - Global Setup')

  const { baseURL } = config.use
  console.log(`Base URL: ${baseURL}`)

  // Verify server is reachable
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(`${baseURL}/`, { timeout: 30_000, waitUntil: 'networkidle' })
    console.log('Server is reachable')
  } catch (error) {
    console.error('Failed to reach server at', baseURL, error)
    // Don't fail global setup, tests will fail instead
  } finally {
    await page.close()
    await browser.close()
  }
}

export default globalSetup
