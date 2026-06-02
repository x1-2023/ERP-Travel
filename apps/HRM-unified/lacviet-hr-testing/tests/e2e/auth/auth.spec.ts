// tests/e2e/auth/auth.spec.ts

/**
 * LAC VIET HR - Authentication E2E Tests
 * Comprehensive testing of login, logout, MFA, and session management
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers, generateRandomEmail } from '../../fixtures/test-data';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOGIN TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Login', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
      
      // Verify user is on dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Verify user info is displayed
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should show error with invalid credentials', async () => {
      await loginPage.login('invalid@test.com', 'wrongpassword');
      await loginPage.expectLoginError('Email hoặc mật khẩu không đúng');
    });

    test('should show error with empty email', async () => {
      await loginPage.login('', 'password123');
      await loginPage.expectValidationError('email', 'Email là bắt buộc');
    });

    test('should show error with empty password', async () => {
      await loginPage.login('test@company.com', '');
      await loginPage.expectValidationError('password', 'Mật khẩu là bắt buộc');
    });

    test('should show error with invalid email format', async () => {
      await loginPage.login('invalid-email', 'password123');
      await loginPage.expectValidationError('email', 'Email không hợp lệ');
    });

    test('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await loginPage.login(testUsers.admin.email, 'wrongpassword');
        await loginPage.page.waitForTimeout(500);
      }
      
      await loginPage.expectAccountLocked();
    });

    test('should remember email when "Remember me" is checked', async ({ page, context }) => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password, true);
      await loginPage.expectLoginSuccess();
      
      // Logout
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout"]').click();
      
      // Go back to login
      await loginPage.goto();
      
      // Email should be pre-filled
      await expect(loginPage.emailInput).toHaveValue(testUsers.admin.email);
    });

    test('should toggle password visibility', async () => {
      await loginPage.fillInput(loginPage.passwordInput, 'testpassword');
      
      // Initially password is hidden
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
      
      // Toggle visibility
      await loginPage.togglePasswordVisibility();
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
      
      // Toggle back
      await loginPage.togglePasswordVisibility();
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // MFA TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Multi-Factor Authentication', () => {
    test('should show OTP screen for MFA-enabled user', async () => {
      await loginPage.login(testUsers.mfaUser.email, testUsers.mfaUser.password);
      await loginPage.expectOTPScreen();
    });

    test('should login successfully with valid OTP', async () => {
      await loginPage.loginWithOTP(
        testUsers.mfaUser.email,
        testUsers.mfaUser.password,
        '123456' // Test OTP
      );
      await loginPage.expectLoginSuccess();
    });

    test('should show error with invalid OTP', async () => {
      await loginPage.login(testUsers.mfaUser.email, testUsers.mfaUser.password);
      await loginPage.expectOTPScreen();
      
      await loginPage.fillInput(loginPage.otpInput, '000000');
      await loginPage.verifyOtpButton.click();
      
      await loginPage.expectLoginError('Mã OTP không đúng');
    });

    test('should show error with expired OTP', async ({ page }) => {
      await loginPage.login(testUsers.mfaUser.email, testUsers.mfaUser.password);
      await loginPage.expectOTPScreen();
      
      // Wait for OTP to expire (simulated with test API)
      await page.waitForTimeout(31000);
      
      await loginPage.fillInput(loginPage.otpInput, '123456');
      await loginPage.verifyOtpButton.click();
      
      await loginPage.expectLoginError('Mã OTP đã hết hạn');
    });

    test('should allow resending OTP', async ({ page }) => {
      await loginPage.login(testUsers.mfaUser.email, testUsers.mfaUser.password);
      await loginPage.expectOTPScreen();
      
      await page.locator('[data-testid="resend-otp"]').click();
      await loginPage.expectToastMessage('Đã gửi lại mã OTP', 'success');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOGOUT TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Logout', () => {
    test.beforeEach(async () => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
    });

    test('should logout successfully', async ({ page }) => {
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout"]').click();
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should clear session on logout', async ({ page, context }) => {
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout"]').click();
      
      // Try to access protected route
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should logout from all devices', async ({ page, browser }) => {
      // Open another browser context (simulating another device)
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      const loginPage2 = new LoginPage(page2);
      
      await loginPage2.goto();
      await loginPage2.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage2.expectLoginSuccess();
      
      // Logout from all devices on first page
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout-all-devices"]').click();
      await page.locator('[data-testid="confirm-logout-all"]').click();
      
      // Wait a moment for session invalidation
      await page.waitForTimeout(2000);
      
      // Second page should be logged out on next navigation
      await page2.reload();
      await expect(page2).toHaveURL(/.*login/);
      
      await context2.close();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Forgot Password', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      await loginPage.goToForgotPassword();
      await expect(page).toHaveURL(/.*forgot-password/);
    });

    test('should send reset email for valid user', async ({ page }) => {
      await loginPage.goToForgotPassword();
      
      await page.locator('[data-testid="reset-email"]').fill(testUsers.admin.email);
      await page.locator('[data-testid="send-reset"]').click();
      
      await expect(page.locator('[data-testid="reset-sent-message"]')).toContainText(
        'Email đặt lại mật khẩu đã được gửi'
      );
    });

    test('should show error for non-existent email', async ({ page }) => {
      await loginPage.goToForgotPassword();
      
      await page.locator('[data-testid="reset-email"]').fill('nonexistent@test.com');
      await page.locator('[data-testid="send-reset"]').click();
      
      await expect(page.locator('[data-testid="reset-error"]')).toContainText(
        'Email không tồn tại trong hệ thống'
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SESSION TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Session Management', () => {
    test('should auto-logout after session timeout', async ({ page }) => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
      
      // Simulate session expiry (API call or localStorage manipulation)
      await page.evaluate(() => {
        localStorage.removeItem('auth_token');
      });
      
      // Trigger any API call
      await page.locator('[data-testid="refresh-dashboard"]').click();
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should refresh token before expiry', async ({ page }) => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
      
      // Get current token
      const initialToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      
      // Wait for token refresh interval
      await page.waitForTimeout(5 * 60 * 1000); // 5 minutes
      
      // Token should be refreshed
      const newToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(newToken).not.toBe(initialToken);
    });

    test('should show active sessions', async ({ page }) => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
      
      // Navigate to security settings
      await page.goto('/settings/security');
      
      // Should show active sessions
      const sessionsList = page.locator('[data-testid="active-sessions"]');
      await expect(sessionsList).toBeVisible();
      await expect(sessionsList.locator('li')).toHaveCount.greaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SSO TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Single Sign-On', () => {
    test('should show SSO options', async () => {
      await expect(loginPage.ssoGoogleButton).toBeVisible();
      await expect(loginPage.ssoMicrosoftButton).toBeVisible();
    });

    test.skip('should redirect to Google OAuth', async ({ page }) => {
      // Skip in CI as it requires actual OAuth setup
      await loginPage.ssoGoogleButton.click();
      await expect(page).toHaveURL(/.*accounts\.google\.com/);
    });

    test.skip('should redirect to Microsoft OAuth', async ({ page }) => {
      // Skip in CI as it requires actual OAuth setup
      await loginPage.ssoMicrosoftButton.click();
      await expect(page).toHaveURL(/.*login\.microsoftonline\.com/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ROLE-BASED ACCESS TESTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Role-Based Access', () => {
    test('admin should access all pages', async ({ page }) => {
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
      
      const adminPages = [
        '/dashboard',
        '/employees',
        '/leave',
        '/attendance',
        '/payroll',
        '/recruitment',
        '/settings',
        '/reports',
      ];
      
      for (const url of adminPages) {
        await page.goto(url);
        await expect(page).not.toHaveURL(/.*403/);
        await expect(page).not.toHaveURL(/.*unauthorized/);
      }
    });

    test('employee should not access admin pages', async ({ page }) => {
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);
      await loginPage.expectLoginSuccess();
      
      const restrictedPages = [
        '/settings/system',
        '/payroll/settings',
        '/reports/admin',
      ];
      
      for (const url of restrictedPages) {
        await page.goto(url);
        await expect(page).toHaveURL(/.*403|unauthorized/);
      }
    });

    test('manager should access team pages only', async ({ page }) => {
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);
      await loginPage.expectLoginSuccess();
      
      // Can access team leave approvals
      await page.goto('/leave/team');
      await expect(page).not.toHaveURL(/.*403/);
      
      // Cannot access payroll settings
      await page.goto('/payroll/settings');
      await expect(page).toHaveURL(/.*403|unauthorized/);
    });
  });
});
