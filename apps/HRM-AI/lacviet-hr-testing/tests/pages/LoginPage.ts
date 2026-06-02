// tests/pages/LoginPage.ts

/**
 * LAC VIET HR - Login Page Object
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly showPasswordButton: Locator;
  readonly loginError: Locator;
  readonly ssoGoogleButton: Locator;
  readonly ssoMicrosoftButton: Locator;
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('[data-testid="login-email"]');
    this.passwordInput = page.locator('[data-testid="login-password"]');
    this.loginButton = page.locator('[data-testid="login-submit"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"]');
    this.showPasswordButton = page.locator('[data-testid="show-password"]');
    this.loginError = page.locator('[data-testid="login-error"]');
    this.ssoGoogleButton = page.locator('[data-testid="sso-google"]');
    this.ssoMicrosoftButton = page.locator('[data-testid="sso-microsoft"]');
    this.otpInput = page.locator('[data-testid="otp-input"]');
    this.verifyOtpButton = page.locator('[data-testid="verify-otp"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOGIN ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.loginButton.click();
    await this.waitForLoadingComplete();
  }

  async loginWithOTP(email: string, password: string, otp: string): Promise<void> {
    await this.login(email, password);
    
    // Wait for OTP screen
    await expect(this.otpInput).toBeVisible({ timeout: 10000 });
    
    await this.fillInput(this.otpInput, otp);
    await this.verifyOtpButton.click();
    await this.waitForLoadingComplete();
  }

  async loginWithGoogle(): Promise<void> {
    await this.ssoGoogleButton.click();
    // Handle Google OAuth popup
  }

  async loginWithMicrosoft(): Promise<void> {
    await this.ssoMicrosoftButton.click();
    // Handle Microsoft OAuth popup
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async expectLoginSuccess(): Promise<void> {
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  async expectLoginError(message?: string): Promise<void> {
    await expect(this.loginError).toBeVisible();
    if (message) {
      await expect(this.loginError).toContainText(message);
    }
  }

  async expectOTPScreen(): Promise<void> {
    await expect(this.otpInput).toBeVisible();
    await expect(this.verifyOtpButton).toBeVisible();
  }

  async expectAccountLocked(): Promise<void> {
    await expect(this.loginError).toContainText('Tài khoản đã bị khóa');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  async togglePasswordVisibility(): Promise<void> {
    await this.showPasswordButton.click();
  }

  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('**/forgot-password');
  }
}
