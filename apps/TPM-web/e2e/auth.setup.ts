// ══════════════════════════════════════════════════════════════════════════════
//                    🔐 AUTH SETUP - Creates authenticated session
//                         File: e2e/auth.setup.ts
// ══════════════════════════════════════════════════════════════════════════════

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Wait for login form
  await expect(page.locator('form')).toBeVisible();
  
  // Fill credentials
  await page.getByLabel(/email/i).fill('admin@your-domain.com');
  await page.getByLabel(/password/i).fill('admin123');
  
  // Click login button
  await page.getByRole('button', { name: /login|sign in|đăng nhập/i }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Verify we're logged in
  await expect(page).toHaveURL(/dashboard/);
  
  // Save storage state (cookies, localStorage)
  await page.context().storageState({ path: authFile });
  
  console.log('✅ Authentication successful, session saved');
});
