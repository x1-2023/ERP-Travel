// tests/e2e/pages/login.page.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * LAC VIET HR - Login Page Object Model
 * Handles all login page interactions and verifications
 */

export class LoginPage {
  readonly page: Page;

  // ════════════════════════════════════════════════════════════════════════════
  // LOCATORS
  // ════════════════════════════════════════════════════════════════════════════

  // Form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;

  // Links
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  // Validation errors
  readonly emailError: Locator;
  readonly passwordError: Locator;

  // Loading state
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form elements
    this.emailInput = page.locator('[data-testid="email-input"], input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('[data-testid="password-input"], input[name="password"], input[type="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], button[type="submit"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"], input[name="remember"]');

    // Links
    this.forgotPasswordLink = page.locator('a[href*="forgot-password"], [data-testid="forgot-password-link"]');
    this.registerLink = page.locator('a[href*="register"], [data-testid="register-link"]');

    // Messages
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, [role="alert"]');
    this.successMessage = page.locator('[data-testid="success-message"], .success-message');

    // Validation errors
    this.emailError = page.locator('[data-testid="email-error"], [data-field="email"] .error');
    this.passwordError = page.locator('[data-testid="password-error"], [data-field="password"] .error');

    // Loading state
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading-spinner');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to forgot password page
   */
  async gotoForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('**/forgot-password');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Fill email field
   */
  async fillEmail(email: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string, options?: { rememberMe?: boolean }) {
    await this.fillEmail(email);
    await this.fillPassword(password);

    if (options?.rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.loginButton.click();
  }

  /**
   * Submit form without filling (for validation testing)
   */
  async submitEmpty() {
    await this.loginButton.click();
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe() {
    await this.rememberMeCheckbox.click();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Expect login form to be visible
   */
  async expectFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Expect redirect to dashboard after login
   */
  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  }

  /**
   * Expect redirect to specific URL after login
   */
  async expectRedirectTo(urlPattern: string | RegExp) {
    await expect(this.page).toHaveURL(urlPattern, { timeout: 10000 });
  }

  /**
   * Expect error message with specific text
   */
  async expectErrorMessage(message: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  /**
   * Expect email validation error
   */
  async expectEmailError(message?: string | RegExp) {
    await expect(this.emailError).toBeVisible();
    if (message) {
      await expect(this.emailError).toHaveText(message);
    }
  }

  /**
   * Expect password validation error
   */
  async expectPasswordError(message?: string | RegExp) {
    await expect(this.passwordError).toBeVisible();
    if (message) {
      await expect(this.passwordError).toHaveText(message);
    }
  }

  /**
   * Expect to stay on login page
   */
  async expectStayOnLoginPage() {
    await expect(this.page).toHaveURL(/.*login/);
  }

  /**
   * Expect loading state
   */
  async expectLoading() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  /**
   * Expect login button to be disabled
   */
  async expectLoginButtonDisabled() {
    await expect(this.loginButton).toBeDisabled();
  }

  /**
   * Expect login button to be enabled
   */
  async expectLoginButtonEnabled() {
    await expect(this.loginButton).toBeEnabled();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get current email value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  /**
   * Wait for login to complete
   */
  async waitForLoginComplete() {
    await this.page.waitForLoadState('networkidle');
    // Wait for either error message or redirect
    await Promise.race([
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      this.page.waitForURL(/.*dashboard/, { timeout: 5000 }).catch(() => {}),
    ]);
  }
}
