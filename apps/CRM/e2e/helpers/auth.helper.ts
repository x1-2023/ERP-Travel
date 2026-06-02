import type { Page } from '@playwright/test'

export const TEST_USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@test.rtr.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'TestAdmin123!',
    role: 'ADMIN' as const,
    name: '[TEST] Admin User',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL || 'manager@test.rtr.com',
    password: process.env.E2E_MANAGER_PASSWORD || 'TestManager123!',
    role: 'MANAGER' as const,
    name: '[TEST] Manager User',
  },
  member: {
    email: process.env.E2E_MEMBER_EMAIL || 'member@test.rtr.com',
    password: process.env.E2E_MEMBER_PASSWORD || 'TestMember123!',
    role: 'MEMBER' as const,
    name: '[TEST] Member User',
  },
  viewer: {
    email: process.env.E2E_VIEWER_EMAIL || 'viewer@test.rtr.com',
    password: process.env.E2E_VIEWER_PASSWORD || 'TestViewer123!',
    role: 'VIEWER' as const,
    name: '[TEST] Viewer User',
  },
} as const

export type TestRole = keyof typeof TEST_USERS

/**
 * Log in as a test user of the given role.
 * Navigates to /login, fills credentials, waits for dashboard redirect.
 */
export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const user = TEST_USERS[role]

  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('#email', { timeout: 10_000 })

  // Clear fields first, then fill
  await page.locator('#email').click()
  await page.locator('#email').fill(user.email)
  await page.locator('#password').click()
  await page.locator('#password').fill(user.password)

  // Click submit and wait for navigation
  await Promise.all([
    page.waitForURL('**/dashboard**', { timeout: 30_000 }),
    page.locator('button[type="submit"]').click(),
  ])
}

/**
 * Log out the current user.
 */
export async function logout(page: Page): Promise<void> {
  // Open user dropdown menu (last button group in header)
  const userMenuTrigger = page.locator(
    'header button:has(span.truncate), header button:has(.rounded-full)'
  ).first()
  await userMenuTrigger.click()

  // Click logout item
  const logoutItem = page.getByText('Đăng xuất').or(page.getByText('Logout'))
  await logoutItem.click()

  // Wait for redirect to login
  await page.waitForURL('**/login**', { timeout: 10_000 })
}
