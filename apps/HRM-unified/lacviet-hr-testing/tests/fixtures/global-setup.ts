// tests/fixtures/global-setup.ts

/**
 * LAC VIET HR - Playwright Global Setup
 * Runs once before all tests
 */

import { chromium, FullConfig } from '@playwright/test';
import { TEST_USERS } from './test-fixtures';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  // Ensure auth directory exists
  const authDir = path.join(process.cwd(), 'playwright', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const screenshotsDir = path.join(reportsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Launch browser for authentication
  const browser = await chromium.launch();
  
  try {
    // Authenticate as regular user
    console.log('🔐 Authenticating as regular user...');
    await authenticateUser(browser, baseURL, TEST_USERS.employee, 'playwright/.auth/user.json');
    
    // Authenticate as admin
    console.log('🔐 Authenticating as admin...');
    await authenticateUser(browser, baseURL, TEST_USERS.admin, 'playwright/.auth/admin.json');
    
    // Authenticate as HR manager
    console.log('🔐 Authenticating as HR manager...');
    await authenticateUser(browser, baseURL, TEST_USERS.hrManager, 'playwright/.auth/hr-manager.json');
    
    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function authenticateUser(
  browser: any,
  baseURL: string,
  user: typeof TEST_USERS.admin,
  storagePath: string
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', user.email);
    await page.fill('input[name="password"], input[type="password"]', user.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/(dashboard|home)/, { timeout: 30000 });
    
    // Save storage state
    await context.storageState({ path: storagePath });
    
    console.log(`  ✓ Authenticated: ${user.email}`);
  } catch (error) {
    console.error(`  ✗ Failed to authenticate: ${user.email}`);
    
    // Take screenshot on failure
    await page.screenshot({ 
      path: `reports/screenshots/auth-failure-${user.role}.png`,
      fullPage: true 
    });
    
    // Create empty storage state to prevent test failures
    fs.writeFileSync(storagePath, JSON.stringify({
      cookies: [],
      origins: []
    }));
  } finally {
    await context.close();
  }
}

export default globalSetup;
