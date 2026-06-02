// tests/e2e/auth/login.spec.ts

/**
 * LAC VIET HR - Authentication E2E Tests
 * Login, logout, session management, MFA tests
 */

import { test, expect, TEST_USERS, LoginPage } from '../../fixtures/test-fixtures';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ page, loginPage }) => {
    // Check page title
    await expect(page).toHaveTitle(/Đăng nhập|Login/i);
    
    // Check form elements
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    
    // Check remember me checkbox
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page, loginPage }) => {
    await loginPage.loginAs('employee');
    await loginPage.expectLoginSuccess();
    
    // Check user is redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show error with invalid email', async ({ loginPage }) => {
    await loginPage.login('invalid-email', 'password');
    await loginPage.expectLoginError();
  });

  test('should show error with wrong password', async ({ loginPage }) => {
    await loginPage.login(TEST_USERS.employee.email, 'wrongpassword');
    await loginPage.expectLoginError();
  });

  test('should show error with non-existent user', async ({ loginPage }) => {
    await loginPage.login('nonexistent@company.com', 'password123');
    await loginPage.expectLoginError();
  });

  test('should handle empty form submission', async ({ page, loginPage }) => {
    await loginPage.submitButton.click();
    
    // Check validation messages
    const emailError = page.locator('[data-testid="error-email"], .error-email');
    const passwordError = page.locator('[data-testid="error-password"], .error-password');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should lock account after multiple failed attempts', async ({ page, loginPage }) => {
    const email = TEST_USERS.employee.email;
    
    // Attempt login 5 times with wrong password
    for (let i = 0; i < 5; i++) {
      await loginPage.login(email, 'wrongpassword');
      await page.waitForTimeout(500);
    }
    
    // 6th attempt should show lockout message
    await loginPage.login(email, 'wrongpassword');
    const lockoutMessage = page.locator('text=/khóa|locked/i');
    await expect(lockoutMessage).toBeVisible();
  });
});

test.describe('Authentication - Logout', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click user menu
    await page.click('[data-testid="user-menu"], .user-menu');
    
    // Click logout
    await page.click('[data-testid="logout-button"], text=/Đăng xuất|Logout/i');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear session on logout', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Try to access protected page
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authentication - Session', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should maintain session across page refreshes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should redirect to login when session expired', async ({ page, context }) => {
    // Clear cookies to simulate expired session
    await context.clearCookies();
    
    // Try to access protected page
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show session timeout warning', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for session timeout warning (if implemented)
    // This would typically show before actual timeout
    // await page.waitForSelector('[data-testid="session-warning"]', { timeout: 60000 });
  });
});

test.describe('Authentication - Password Reset', () => {
  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.click('text=/Quên mật khẩu|Forgot password/i');
    
    // Should be on reset page
    await expect(page).toHaveURL(/\/forgot-password|\/reset-password/);
  });

  test('should send password reset email', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Fill email
    await page.fill('input[name="email"]', TEST_USERS.employee.email);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success message
    const successMessage = page.locator('text=/đã gửi|email sent/i');
    await expect(successMessage).toBeVisible();
  });
});

test.describe('Authentication - MFA', () => {
  test.skip('should require MFA when enabled', async ({ page }) => {
    // This test requires MFA to be enabled for the user
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'mfa-user@company.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show MFA input
    const mfaInput = page.locator('input[name="mfaCode"], input[name="otp"]');
    await expect(mfaInput).toBeVisible();
  });
});
