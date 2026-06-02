// tests/pages/BasePage.ts

/**
 * LAC VIET HR - Base Page Object Model
 * Foundation for all page objects
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly loadingSpinner: Locator;
  readonly toastMessage: Locator;
  readonly errorAlert: Locator;
  readonly confirmDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.toastMessage = page.locator('[data-testid="toast-message"]');
    this.errorAlert = page.locator('[data-testid="error-alert"]');
    this.confirmDialog = page.locator('[data-testid="confirm-dialog"]');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════════

  abstract goto(): Promise<void>;

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForLoadingComplete();
  }

  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading spinners to disappear
    const spinner = this.loadingSpinner;
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // COMMON ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async clickAndWait(locator: Locator): Promise<void> {
    await locator.click();
    await this.waitForLoadingComplete();
  }

  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async selectDropdownOption(
    triggerLocator: Locator,
    optionText: string
  ): Promise<void> {
    await triggerLocator.click();
    await this.page
      .locator(`[role="option"]:has-text("${optionText}")`)
      .click();
  }

  async uploadFile(locator: Locator, filePath: string): Promise<void> {
    await locator.setInputFiles(filePath);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TOAST & ALERTS
  // ═══════════════════════════════════════════════════════════════════════════════

  async expectToastMessage(message: string, type?: 'success' | 'error' | 'warning'): Promise<void> {
    const toast = this.toastMessage;
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
    
    if (type) {
      await expect(toast).toHaveAttribute('data-type', type);
    }
  }

  async expectErrorAlert(message: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  async dismissToast(): Promise<void> {
    const closeBtn = this.toastMessage.locator('[data-testid="toast-close"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONFIRM DIALOG
  // ═══════════════════════════════════════════════════════════════════════════════

  async confirmAction(): Promise<void> {
    await this.confirmDialog.locator('button:has-text("Xác nhận")').click();
    await this.waitForLoadingComplete();
  }

  async cancelAction(): Promise<void> {
    await this.confirmDialog.locator('button:has-text("Hủy")').click();
  }

  async expectConfirmDialog(title: string): Promise<void> {
    await expect(this.confirmDialog).toBeVisible();
    await expect(this.confirmDialog).toContainText(title);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TABLE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  async getTableRowCount(tableLocator: Locator): Promise<number> {
    const rows = tableLocator.locator('tbody tr');
    return await rows.count();
  }

  async getTableCellText(
    tableLocator: Locator,
    rowIndex: number,
    columnIndex: number
  ): Promise<string> {
    const cell = tableLocator.locator(`tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`);
    return await cell.textContent() || '';
  }

  async clickTableRowAction(
    tableLocator: Locator,
    rowIndex: number,
    actionName: string
  ): Promise<void> {
    const row = tableLocator.locator(`tbody tr:nth-child(${rowIndex + 1})`);
    await row.locator(`[data-testid="action-${actionName}"]`).click();
  }

  async searchInTable(searchInput: Locator, searchTerm: string): Promise<void> {
    await this.fillInput(searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingComplete();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════════════════════

  async goToNextPage(): Promise<void> {
    await this.page.locator('[data-testid="pagination-next"]').click();
    await this.waitForLoadingComplete();
  }

  async goToPreviousPage(): Promise<void> {
    await this.page.locator('[data-testid="pagination-prev"]').click();
    await this.waitForLoadingComplete();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.locator(`[data-testid="pagination-page-${pageNumber}"]`).click();
    await this.waitForLoadingComplete();
  }

  async setPageSize(size: number): Promise<void> {
    await this.selectOption(
      this.page.locator('[data-testid="pagination-size"]'),
      size.toString()
    );
    await this.waitForLoadingComplete();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FORM HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  async fillForm(fields: Record<string, string | boolean | number>): Promise<void> {
    for (const [fieldName, value] of Object.entries(fields)) {
      const field = this.page.locator(`[name="${fieldName}"], [data-testid="field-${fieldName}"]`);
      
      if (typeof value === 'boolean') {
        const checkbox = field.locator('input[type="checkbox"]');
        if (value) {
          await checkbox.check();
        } else {
          await checkbox.uncheck();
        }
      } else {
        await this.fillInput(field, String(value));
      }
    }
  }

  async submitForm(): Promise<void> {
    await this.page.locator('[type="submit"], [data-testid="form-submit"]').click();
    await this.waitForLoadingComplete();
  }

  async expectValidationError(fieldName: string, message: string): Promise<void> {
    const errorLocator = this.page.locator(`[data-testid="error-${fieldName}"]`);
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(message);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // DATE PICKER
  // ═══════════════════════════════════════════════════════════════════════════════

  async selectDate(
    datePickerLocator: Locator,
    date: Date
  ): Promise<void> {
    await datePickerLocator.click();
    
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Navigate to correct month/year
    const monthYearBtn = this.page.locator('[data-testid="datepicker-month-year"]');
    await monthYearBtn.click();
    
    // Select year
    await this.page.locator(`[data-testid="datepicker-year-${year}"]`).click();
    
    // Select month
    await this.page.locator(`[data-testid="datepicker-month-${month}"]`).click();
    
    // Select day
    await this.page.locator(`[data-testid="datepicker-day-${day}"]`).click();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCREENSHOT
  // ═══════════════════════════════════════════════════════════════════════════════

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
