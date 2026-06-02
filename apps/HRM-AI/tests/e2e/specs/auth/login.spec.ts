// tests/e2e/specs/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

/**
 * LAC VIET HR - Login Flow E2E Tests
 * Tests authentication, validation, and security features
 */

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FORM DISPLAY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Form Display', () => {
    test('should display login form with all elements', async () => {
      await loginPage.expectFormVisible();
      await expect(loginPage.forgotPasswordLink).toBeVisible();
    });

    test('should have correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/đăng nhập|login/i);
    });

    test('should have email and password fields with correct attributes', async () => {
      await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should display login button as enabled initially', async () => {
      await loginPage.expectLoginButtonEnabled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // SUCCESSFUL LOGIN TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Successful Login', () => {
    test('should login successfully with valid admin credentials', async ({ page }) => {
      await loginPage.login('admin@test.your-domain.com', 'Admin@123456');
      await loginPage.expectRedirectToDashboard();

      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"], [data-testid="user-avatar"]')).toBeVisible();
    });

    test('should login successfully with valid manager credentials', async () => {
      await loginPage.login('manager@test.your-domain.com', 'Manager@123456');
      await loginPage.expectRedirectToDashboard();
    });

    test('should login successfully with valid employee credentials', async () => {
      await loginPage.login('employee@test.your-domain.com', 'Employee@123456');
      await loginPage.expectRedirectToDashboard();
    });

    test('should persist session after successful login', async ({ page }) => {
      await loginPage.login('admin@test.your-domain.com', 'Admin@123456');
      await loginPage.expectRedirectToDashboard();

      // Navigate away and back
      await page.goto('/employees');
      await page.goto('/dashboard');

      // Should still be logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FAILED LOGIN TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Failed Login', () => {
    test('should show error for invalid email', async () => {
      await loginPage.login('invalid@email.com', 'Admin@123456');
      await loginPage.expectErrorMessage(/email hoặc mật khẩu không đúng|invalid credentials/i);
      await loginPage.expectStayOnLoginPage();
    });

    test('should show error for invalid password', async () => {
      await loginPage.login('admin@test.your-domain.com', 'WrongPassword123');
      await loginPage.expectErrorMessage(/email hoặc mật khẩu không đúng|invalid credentials/i);
      await loginPage.expectStayOnLoginPage();
    });

    test('should show error for non-existent user', async () => {
      await loginPage.login('nonexistent@user.com', 'SomePassword123');
      await loginPage.expectErrorMessage(/email hoặc mật khẩu không đúng|invalid credentials/i);
    });

    test('should not reveal if email exists in system', async () => {
      // Try with valid email, wrong password
      await loginPage.login('admin@test.your-domain.com', 'WrongPassword');
      const errorMessage1 = await loginPage.errorMessage.textContent();

      await loginPage.goto();

      // Try with invalid email
      await loginPage.login('nonexistent@user.com', 'WrongPassword');
      const errorMessage2 = await loginPage.errorMessage.textContent();

      // Error messages should be the same (security)
      expect(errorMessage1).toBe(errorMessage2);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // VALIDATION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Form Validation', () => {
    test('should show validation errors for empty fields', async () => {
      await loginPage.submitEmpty();
      await loginPage.expectEmailError(/email là bắt buộc|required/i);
      await loginPage.expectPasswordError(/mật khẩu là bắt buộc|required/i);
    });

    test('should show validation error for invalid email format', async () => {
      await loginPage.fillEmail('invalid-email');
      await loginPage.fillPassword('ValidPassword123');
      await loginPage.loginButton.click();
      await loginPage.expectEmailError(/email không hợp lệ|invalid email/i);
    });

    test('should trim whitespace from email', async () => {
      await loginPage.fillEmail('  admin@test.your-domain.com  ');
      await loginPage.fillPassword('Admin@123456');
      await loginPage.loginButton.click();
      await loginPage.expectRedirectToDashboard();
    });

    test('should clear validation errors when user starts typing', async ({ page }) => {
      await loginPage.submitEmpty();
      await loginPage.expectEmailError();

      await loginPage.fillEmail('a');
      await expect(loginPage.emailError).not.toBeVisible();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // SECURITY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Security', () => {
    test('should not expose password in URL or page', async ({ page }) => {
      await loginPage.login('admin@test.your-domain.com', 'Admin@123456');

      // Check URL doesn't contain password
      expect(page.url()).not.toContain('Admin@123456');

      // Check page content doesn't show password
      const content = await page.content();
      expect(content).not.toContain('Admin@123456');
    });

    test('should mask password input', async () => {
      await loginPage.fillPassword('SecretPassword');
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should redirect authenticated users away from login page', async ({ page }) => {
      // Login first
      await loginPage.login('admin@test.your-domain.com', 'Admin@123456');
      await loginPage.expectRedirectToDashboard();

      // Try to access login page again
      await page.goto('/login');

      // Should be redirected to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should handle SQL injection attempt gracefully', async () => {
      await loginPage.login("admin@test.com'; DROP TABLE users;--", 'password');
      await loginPage.expectErrorMessage(/email hoặc mật khẩu không đúng|invalid/i);
    });

    test('should handle XSS attempt in email field', async ({ page }) => {
      await loginPage.login('<script>alert("xss")</script>', 'password');

      // Should not execute script
      const alerts: string[] = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // REDIRECT TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Redirects', () => {
    test('should redirect to originally requested page after login', async ({ page }) => {
      // Try to access protected page
      await page.goto('/employees');

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);

      // Login
      const loginPage = new LoginPage(page);
      await loginPage.login('admin@test.your-domain.com', 'Admin@123456');

      // Should redirect to originally requested page
      await expect(page).toHaveURL(/.*employees/);
    });

    test('should redirect to dashboard for direct login page access', async ({ page }) => {
      await page.goto('/login');
      const loginPage = new LoginPage(page);
      await loginPage.login('admin@test.your-domain.com', 'Admin@123456');

      // Should go to default dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI/UX TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('UI/UX', () => {
    test('should show loading state during login', async () => {
      await loginPage.fillEmail('admin@test.your-domain.com');
      await loginPage.fillPassword('Admin@123456');

      // Click and immediately check for loading
      await loginPage.loginButton.click();

      // Button should be disabled during loading
      await expect(loginPage.loginButton).toBeDisabled();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await loginPage.emailInput.focus();
      await loginPage.emailInput.fill('admin@test.your-domain.com');

      // Tab to password
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();

      await loginPage.passwordInput.fill('Admin@123456');

      // Tab to login button
      await page.keyboard.press('Tab');

      // Enter to submit
      await page.keyboard.press('Enter');
      await loginPage.expectRedirectToDashboard();
    });

    test('should maintain form values on validation error', async () => {
      const email = 'test@example.com';
      await loginPage.fillEmail(email);
      await loginPage.loginButton.click();

      // Email should still be there
      expect(await loginPage.getEmailValue()).toBe(email);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ACCESSIBILITY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Accessibility', () => {
    test('should have proper labels for form fields', async ({ page }) => {
      const emailLabel = page.locator('label[for="email"], label:has-text("Email")');
      const passwordLabel = page.locator('label[for="password"], label:has-text("Mật khẩu")');

      await expect(emailLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();
    });

    test('should announce errors to screen readers', async ({ page }) => {
      await loginPage.submitEmpty();

      // Error messages should have proper role
      const errorRegion = page.locator('[role="alert"], [aria-live="polite"]');
      await expect(errorRegion).toBeVisible();
    });
  });
});
