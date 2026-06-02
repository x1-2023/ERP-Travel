import { loadEnvLocal } from './helpers/load-env'
import { cleanupTestData, disconnect } from './helpers/seed.helper'

async function globalTeardown() {
  loadEnvLocal()

  console.log('\n[E2E Global Teardown] Starting...')

  try {
    console.log('[E2E Global Teardown] Cleaning up test data...')
    await cleanupTestData()
    console.log('[E2E Global Teardown] Done.\n')
  } catch (error) {
    console.error('[E2E Global Teardown] Failed:', error)
  } finally {
    await disconnect()
  }
}

export default globalTeardown
