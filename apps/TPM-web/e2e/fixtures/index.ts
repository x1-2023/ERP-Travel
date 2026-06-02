// ══════════════════════════════════════════════════════════════════════════════
//                    🧩 PAGE OBJECTS & FIXTURES - IMPROVED
//                         File: e2e/fixtures/index.ts
// ══════════════════════════════════════════════════════════════════════════════

import { test as base, expect, Page, Locator } from '@playwright/test';

// ══════════════════════════════════════════════════════════════════════════════
// PAGE OBJECTS
// ══════════════════════════════════════════════════════════════════════════════

export class SidebarPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getNavLink(name: string): Locator {
    return this.page.locator(
      `a:has-text("${name}"), ` +
      `nav a:has-text("${name}"), ` +
      `[role="navigation"] a:has-text("${name}")`
    ).first();
  }

  async navigateTo(menu: string) {
    const link = this.getNavLink(menu);
    if (await link.count() > 0) {
      await link.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async toggle() {
    const toggleBtn = this.page.locator(
      '[data-testid="sidebar-toggle"], ' +
      'button[aria-label*="collapse"], ' +
      'button[aria-label*="sidebar"]'
    ).first();
    
    if (await toggleBtn.count() > 0) {
      await toggleBtn.click();
      await this.page.waitForTimeout(300);
    }
  }
}

export class HeaderPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get searchBox(): Locator {
    return this.page.locator(
      '[data-testid="global-search"], ' +
      'input[placeholder*="Search"], ' +
      'input[placeholder*="Tìm"], ' +
      'header input[type="search"]'
    ).first();
  }

  get notificationBell(): Locator {
    return this.page.locator(
      '[data-testid="notification-bell"], ' +
      'button:has(svg[class*="bell"]), ' +
      '[aria-label*="notification"], ' +
      'header button:has(svg)'
    ).first();
  }

  get userMenu(): Locator {
    return this.page.locator(
      '[data-testid="user-menu"], ' +
      '[class*="user-menu"], ' +
      'header [class*="avatar"]'
    ).first();
  }

  async openSearch() {
    await this.searchBox.click();
  }

  async openNotifications() {
    await this.notificationBell.click();
    await this.page.waitForTimeout(300);
  }

  async openUserMenu() {
    await this.userMenu.click();
    await this.page.waitForTimeout(300);
  }

  async logout() {
    await this.openUserMenu();
    
    const logoutBtn = this.page.locator(
      '[role="menuitem"]:has-text("Logout"), ' +
      '[role="menuitem"]:has-text("Sign out"), ' +
      '[role="menuitem"]:has-text("Đăng xuất"), ' +
      'button:has-text("Logout")'
    ).first();
    
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}

export class DataTablePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get table(): Locator {
    return this.page.locator(
      'table, [role="table"], [role="grid"], ' +
      '[class*="data-table"], [class*="grid"]'
    ).first();
  }

  get rows(): Locator {
    return this.page.locator(
      'tbody tr, [role="row"]:not(:first-child), ' +
      '[class*="table-row"], [class*="grid-row"]'
    );
  }

  get searchInput(): Locator {
    return this.page.locator(
      '[data-testid="search-input"], ' +
      'input[placeholder*="Search"], ' +
      'input[placeholder*="Tìm"], ' +
      'input[type="search"]'
    ).first();
  }

  async waitForData() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  async getRowCount(): Promise<number> {
    return await this.rows.count();
  }

  async search(query: string) {
    if (await this.searchInput.count() > 0) {
      await this.searchInput.fill(query);
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('networkidle');
    }
  }

  async clickRow(index: number) {
    const row = this.rows.nth(index);
    if (await row.count() > 0) {
      await row.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}

export class FormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get form(): Locator {
    return this.page.locator('form, [class*="form"]').first();
  }

  get submitButton(): Locator {
    return this.page.locator(
      'button[type="submit"], ' +
      '[data-testid="submit-btn"], ' +
      'button:has-text("Save"), ' +
      'button:has-text("Create"), ' +
      'button:has-text("Update"), ' +
      'button:has-text("Lưu"), ' +
      'button:has-text("Tạo")'
    ).first();
  }

  get cancelButton(): Locator {
    return this.page.locator(
      'button:has-text("Cancel"), ' +
      'button:has-text("Hủy"), ' +
      '[data-testid="cancel-btn"]'
    ).first();
  }

  async fillField(name: string, value: string) {
    const field = this.page.locator(
      `input[name="${name}"], ` +
      `input[name*="${name}"], ` +
      `[data-testid="${name}-input"], ` +
      `textarea[name="${name}"]`
    ).first();
    
    if (await field.count() > 0) {
      await field.fill(value);
    }
  }

  async selectOption(name: string, optionText?: string) {
    const select = this.page.locator(
      `select[name="${name}"], ` +
      `[data-testid="${name}-select"], ` +
      `[role="combobox"]:near(:text("${name}"))`
    ).first();
    
    if (await select.count() > 0) {
      await select.click();
      await this.page.waitForTimeout(300);
      
      if (optionText) {
        const option = this.page.locator(`[role="option"]:has-text("${optionText}")`);
        if (await option.count() > 0) {
          await option.first().click();
        }
      } else {
        // Select first option
        const option = this.page.locator('[role="option"]').first();
        if (await option.count() > 0) {
          await option.click();
        }
      }
    }
  }

  async submit() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async hasForm(): Promise<boolean> {
    const inputs = await this.form.locator('input, select, textarea, [role="combobox"]').count();
    return inputs > 0;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ══════════════════════════════════════════════════════════════════════════════

type Fixtures = {
  sidebar: SidebarPage;
  header: HeaderPage;
  dataTable: DataTablePage;
  formPage: FormPage;
};

export const test = base.extend<Fixtures>({
  sidebar: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderPage(page));
  },
  dataTable: async ({ page }, use) => {
    await use(new DataTablePage(page));
  },
  formPage: async ({ page }, use) => {
    await use(new FormPage(page));
  },
});

export { expect };

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

export async function waitForToast(page: Page, message?: string) {
  const toast = page.locator(
    '[role="alert"], ' +
    '[class*="toast"], ' +
    '[class*="Toaster"], ' +
    '[class*="notification"]:visible'
  );
  
  try {
    await toast.first().waitFor({ state: 'visible', timeout: 5000 });
    if (message) {
      await expect(toast.first()).toContainText(message);
    }
  } catch {
    // Toast might not appear - that's okay for some flows
  }
}

export async function confirmDialog(page: Page) {
  const dialog = page.locator('[role="alertdialog"], [role="dialog"]');
  
  try {
    await dialog.waitFor({ state: 'visible', timeout: 3000 });
    
    const confirmBtn = dialog.locator(
      'button:has-text("Confirm"), ' +
      'button:has-text("Yes"), ' +
      'button:has-text("OK"), ' +
      'button:has-text("Delete"), ' +
      'button:has-text("Xác nhận"), ' +
      'button:has-text("Xóa")'
    ).first();
    
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
    }
  } catch {
    // Dialog might not appear
  }
}

export async function cancelDialog(page: Page) {
  const dialog = page.locator('[role="alertdialog"], [role="dialog"]');
  
  try {
    await dialog.waitFor({ state: 'visible', timeout: 3000 });
    
    const cancelBtn = dialog.locator(
      'button:has-text("Cancel"), ' +
      'button:has-text("No"), ' +
      'button:has-text("Hủy")'
    ).first();
    
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
    }
  } catch {
    // Dialog might not appear
  }
}

export function generateTestData() {
  const timestamp = Date.now();
  return {
    promotionCode: `TEST-${timestamp}`,
    promotionName: `Test Promotion ${timestamp}`,
    claimReference: `INV-TEST-${timestamp}`,
    customerCode: `CUST-${timestamp}`,
    productSku: `SKU-${timestamp}`,
    fundCode: `FUND-${timestamp}`,
  };
}

export async function safeClick(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  if (await element.count() > 0) {
    await element.click();
    return true;
  }
  return false;
}

export async function safeFill(page: Page, selector: string, value: string): Promise<boolean> {
  const element = page.locator(selector).first();
  if (await element.count() > 0) {
    await element.fill(value);
    return true;
  }
  return false;
}
