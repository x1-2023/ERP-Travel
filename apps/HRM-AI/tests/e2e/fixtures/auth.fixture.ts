// tests/e2e/fixtures/auth.fixture.ts
import { test as base, Page, BrowserContext } from '@playwright/test';
import path from 'path';

/**
 * LAC VIET HR - E2E Auth Fixtures
 * Pre-authenticated browser contexts for different user roles
 */

// Path to auth state files
const AUTH_DIR = path.join(__dirname, '..', '.auth');

// ════════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════════

export interface AuthFixtures {
  /** Page authenticated as admin user */
  adminPage: Page;
  /** Page authenticated as manager user */
  managerPage: Page;
  /** Page authenticated as employee user */
  employeePage: Page;
  /** Context authenticated as admin user */
  adminContext: BrowserContext;
  /** Context authenticated as manager user */
  managerContext: BrowserContext;
  /** Context authenticated as employee user */
  employeeContext: BrowserContext;
}

// ════════════════════════════════════════════════════════════════════════════════
// AUTH FIXTURES
// ════════════════════════════════════════════════════════════════════════════════

export const test = base.extend<AuthFixtures>({
  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN FIXTURES
  // ─────────────────────────────────────────────────────────────────────────────
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'admin.json'),
    });
    await use(context);
    await context.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MANAGER FIXTURES
  // ─────────────────────────────────────────────────────────────────────────────
  managerContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'manager.json'),
    });
    await use(context);
    await context.close();
  },

  managerPage: async ({ managerContext }, use) => {
    const page = await managerContext.newPage();
    await use(page);
    await page.close();
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EMPLOYEE FIXTURES
  // ─────────────────────────────────────────────────────────────────────────────
  employeeContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'employee.json'),
    });
    await use(context);
    await context.close();
  },

  employeePage: async ({ employeeContext }, use) => {
    const page = await employeeContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';

// ════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Get current user role from page
 */
export async function getCurrentUserRole(page: Page): Promise<string | null> {
  try {
    const roleElement = await page.locator('[data-testid="user-role"]');
    if (await roleElement.isVisible()) {
      return await roleElement.textContent();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verify user is logged in
 */
export async function verifyLoggedIn(page: Page): Promise<boolean> {
  try {
    const userMenu = page.locator('[data-testid="user-menu"], [data-testid="user-avatar"]');
    return await userMenu.isVisible({ timeout: 5000 });
  } catch {
    return false;
  }
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('**/login');
}
