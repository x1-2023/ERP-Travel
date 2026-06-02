// playwright.config.ts

/**
 * LAC VIET HR - Playwright E2E Test Configuration
 * Comprehensive end-to-end testing setup
 */

import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Test file pattern
  testMatch: '**/*.spec.ts',
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Number of workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['junit', { outputFile: 'reports/playwright-junit.xml' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL
    baseURL,
    
    // Collect trace when retrying failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Locale
    locale: 'vi-VN',
    
    // Timezone
    timezoneId: 'Asia/Ho_Chi_Minh',
    
    // Navigation timeout
    navigationTimeout: 15000,
    
    // Action timeout
    actionTimeout: 10000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    },
  },
  
  // Configure projects for major browsers
  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Desktop Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    // Desktop Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro 11'] },
    },
    
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Tests that need authentication
    {
      name: 'authenticated',
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
    
    // Admin tests
    {
      name: 'admin',
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/admin.json',
      },
    },
  ],
  
  // Global setup
  globalSetup: require.resolve('./tests/fixtures/global-setup.ts'),
  
  // Global teardown
  globalTeardown: require.resolve('./tests/fixtures/global-teardown.ts'),
  
  // Web server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Output folder for test artifacts
  outputDir: 'reports/test-results',
});
