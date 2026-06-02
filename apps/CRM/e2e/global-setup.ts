import { loadEnvLocal } from './helpers/load-env'
import { seedTestUsers, seedTestData } from './helpers/seed.helper'

async function globalSetup() {
  loadEnvLocal()

  console.log('\n[E2E Global Setup] Starting...')

  try {
    console.log('[E2E Global Setup] Seeding test users...')
    await seedTestUsers()

    console.log('[E2E Global Setup] Seeding test data...')
    await seedTestData()

    console.log('[E2E Global Setup] Done.\n')
  } catch (error) {
    console.error('[E2E Global Setup] Failed:', error)
    // Don't throw — allow tests to run even if seed fails
    // Tests that need seeded data will fail individually
    console.warn('[E2E Global Setup] Continuing despite errors...\n')
  }
}

export default globalSetup
