// tests/e2e/pages/employees.page.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * LAC VIET HR - Employees Page Object Model
 * Handles employee list, CRUD operations, and related interactions
 */

export class EmployeesPage {
  readonly page: Page;

  // ════════════════════════════════════════════════════════════════════════════
  // LOCATORS - List Page
  // ════════════════════════════════════════════════════════════════════════════

  // Header & Actions
  readonly pageTitle: Locator;
  readonly addEmployeeButton: Locator;
  readonly exportButton: Locator;
  readonly importButton: Locator;

  // Search & Filter
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly statusFilter: Locator;
  readonly departmentFilter: Locator;
  readonly clearFiltersButton: Locator;

  // Table
  readonly table: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;

  // Pagination
  readonly pagination: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageInfo: Locator;
  readonly pageSizeSelect: Locator;

  // Bulk Actions
  readonly selectAllCheckbox: Locator;
  readonly bulkDeleteButton: Locator;
  readonly selectedCount: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header & Actions
    this.pageTitle = page.locator('h1, [data-testid="page-title"]');
    this.addEmployeeButton = page.locator('[data-testid="add-employee-button"], button:has-text("Thêm nhân viên")');
    this.exportButton = page.locator('[data-testid="export-button"], button:has-text("Xuất")');
    this.importButton = page.locator('[data-testid="import-button"], button:has-text("Nhập")');

    // Search & Filter
    this.searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Tìm kiếm"]');
    this.filterButton = page.locator('[data-testid="filter-button"], button:has-text("Bộ lọc")');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.departmentFilter = page.locator('[data-testid="department-filter"]');
    this.clearFiltersButton = page.locator('[data-testid="clear-filters"], button:has-text("Xóa bộ lọc")');

    // Table
    this.table = page.locator('[data-testid="employees-table"], table');
    this.tableHeader = page.locator('thead');
    this.tableBody = page.locator('tbody');
    this.tableRows = page.locator('tbody tr');
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    this.loadingState = page.locator('[data-testid="loading"], .loading-skeleton');

    // Pagination
    this.pagination = page.locator('[data-testid="pagination"], .pagination');
    this.prevPageButton = page.locator('[data-testid="prev-page"], button:has-text("Trước")');
    this.nextPageButton = page.locator('[data-testid="next-page"], button:has-text("Sau")');
    this.pageInfo = page.locator('[data-testid="page-info"]');
    this.pageSizeSelect = page.locator('[data-testid="page-size"]');

    // Bulk Actions
    this.selectAllCheckbox = page.locator('thead input[type="checkbox"]');
    this.bulkDeleteButton = page.locator('[data-testid="bulk-delete"]');
    this.selectedCount = page.locator('[data-testid="selected-count"]');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════════════════════

  async goto() {
    await this.page.goto('/employees');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoEmployeeDetail(employeeId: string) {
    await this.page.goto(`/employees/${employeeId}`);
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SEARCH & FILTER
  // ════════════════════════════════════════════════════════════════════════════

  async search(query: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status: 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'TERMINATED') {
    await this.filterButton.click();
    await this.statusFilter.click();
    await this.page.locator(`[data-value="${status}"]`).click();
    await this.page.locator('button:has-text("Áp dụng")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByDepartment(departmentName: string) {
    await this.filterButton.click();
    await this.departmentFilter.click();
    await this.page.locator(`role=option >> text=${departmentName}`).click();
    await this.page.locator('button:has-text("Áp dụng")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TABLE OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getRowByIndex(index: number): Promise<Locator> {
    return this.tableRows.nth(index);
  }

  async getRowByEmployeeCode(code: string): Promise<Locator> {
    return this.page.locator(`tr:has-text("${code}")`);
  }

  async clickRow(index: number) {
    await this.tableRows.nth(index).click();
  }

  async clickRowByEmployeeCode(code: string) {
    await this.page.locator(`tr:has-text("${code}")`).click();
  }

  async getRowData(index: number): Promise<{
    code: string;
    name: string;
    email: string;
    department: string;
    status: string;
  }> {
    const row = this.tableRows.nth(index);
    const cells = row.locator('td');

    return {
      code: await cells.nth(1).textContent() || '',
      name: await cells.nth(2).textContent() || '',
      email: await cells.nth(3).textContent() || '',
      department: await cells.nth(4).textContent() || '',
      status: await cells.nth(5).textContent() || '',
    };
  }

  async sortByColumn(columnName: string) {
    await this.page.locator(`th:has-text("${columnName}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async clickAddEmployee() {
    await this.addEmployeeButton.click();
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
  }

  async deleteEmployee(employeeCode: string) {
    const row = await this.getRowByEmployeeCode(employeeCode);
    await row.locator('[data-testid="delete-button"], button:has-text("Xóa")').click();

    // Confirm dialog
    await expect(this.page.locator('[role="alertdialog"]')).toBeVisible();
    await this.page.locator('button:has-text("Xác nhận")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async editEmployee(employeeCode: string) {
    const row = await this.getRowByEmployeeCode(employeeCode);
    await row.locator('[data-testid="edit-button"], button:has-text("Sửa")').click();
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
  }

  async viewEmployeeDetail(employeeCode: string) {
    const row = await this.getRowByEmployeeCode(employeeCode);
    await row.locator('[data-testid="view-button"], button:has-text("Xem")').click();
    await this.page.waitForURL(/.*employees\/[a-z0-9-]+/);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BULK OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async selectAll() {
    await this.selectAllCheckbox.check();
  }

  async deselectAll() {
    await this.selectAllCheckbox.uncheck();
  }

  async selectRows(indices: number[]) {
    for (const index of indices) {
      await this.tableRows.nth(index).locator('input[type="checkbox"]').check();
    }
  }

  async bulkDelete() {
    await this.bulkDeleteButton.click();
    await this.page.locator('button:has-text("Xác nhận")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async getSelectedCount(): Promise<number> {
    const text = await this.selectedCount.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGINATION
  // ════════════════════════════════════════════════════════════════════════════

  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPrevPage() {
    await this.prevPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPage(pageNumber: number) {
    await this.page.locator(`[data-testid="page-${pageNumber}"], button:has-text("${pageNumber}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async setPageSize(size: number) {
    await this.pageSizeSelect.click();
    await this.page.locator(`[data-value="${size}"]`).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EXPORT/IMPORT
  // ════════════════════════════════════════════════════════════════════════════

  async exportToExcel(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ════════════════════════════════════════════════════════════════════════════

  async expectPageVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.table).toBeVisible();
  }

  async expectRowToContain(index: number, text: string) {
    await expect(this.tableRows.nth(index)).toContainText(text);
  }

  async expectRowCount(count: number) {
    await expect(this.tableRows).toHaveCount(count);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectNoEmptyState() {
    await expect(this.emptyState).not.toBeVisible();
  }

  async expectLoading() {
    await expect(this.loadingState).toBeVisible();
  }

  async expectNoLoading() {
    await expect(this.loadingState).not.toBeVisible();
  }

  async expectEmployeeInList(employeeCode: string) {
    await expect(this.page.locator(`tr:has-text("${employeeCode}")`)).toBeVisible();
  }

  async expectEmployeeNotInList(employeeCode: string) {
    await expect(this.page.locator(`tr:has-text("${employeeCode}")`)).not.toBeVisible();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EMPLOYEE FORM DIALOG
// ════════════════════════════════════════════════════════════════════════════════

export class EmployeeFormDialog {
  readonly page: Page;

  readonly dialog: Locator;
  readonly title: Locator;

  // Form fields
  readonly employeeCodeInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly departmentSelect: Locator;
  readonly positionSelect: Locator;
  readonly hireDateInput: Locator;
  readonly statusSelect: Locator;

  // Actions
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.locator('[role="dialog"]');
    this.title = this.dialog.locator('h2, [data-testid="dialog-title"]');

    // Form fields
    this.employeeCodeInput = this.dialog.locator('[name="employeeCode"], [data-testid="employee-code-input"]');
    this.firstNameInput = this.dialog.locator('[name="firstName"], [data-testid="first-name-input"]');
    this.lastNameInput = this.dialog.locator('[name="lastName"], [data-testid="last-name-input"]');
    this.emailInput = this.dialog.locator('[name="email"], [data-testid="email-input"]');
    this.phoneInput = this.dialog.locator('[name="phone"], [data-testid="phone-input"]');
    this.departmentSelect = this.dialog.locator('[data-testid="department-select"]');
    this.positionSelect = this.dialog.locator('[data-testid="position-select"]');
    this.hireDateInput = this.dialog.locator('[name="hireDate"], [data-testid="hire-date-input"]');
    this.statusSelect = this.dialog.locator('[data-testid="status-select"]');

    // Actions
    this.saveButton = this.dialog.locator('button:has-text("Lưu"), [data-testid="save-button"]');
    this.cancelButton = this.dialog.locator('button:has-text("Hủy"), [data-testid="cancel-button"]');

    // Messages
    this.errorMessage = this.dialog.locator('[data-testid="error-message"], .error-message');
    this.successMessage = page.locator('[data-testid="success-toast"], .success-message');
  }

  async fillForm(data: {
    employeeCode?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    status?: string;
  }) {
    if (data.employeeCode) {
      await this.employeeCodeInput.fill(data.employeeCode);
    }
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);

    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }

    if (data.department) {
      await this.departmentSelect.click();
      await this.page.locator(`[role="option"]:has-text("${data.department}")`).click();
    }

    if (data.position) {
      await this.positionSelect.click();
      await this.page.locator(`[role="option"]:has-text("${data.position}")`).click();
    }

    if (data.hireDate) {
      await this.hireDateInput.fill(data.hireDate);
    }

    if (data.status) {
      await this.statusSelect.click();
      await this.page.locator(`[role="option"]:has-text("${data.status}")`).click();
    }
  }

  async submit() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async expectNotVisible() {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectValidationError(fieldName: string, message?: string) {
    const errorLocator = this.dialog.locator(`[data-field="${fieldName}"] .error, [name="${fieldName}"] ~ .error`);
    await expect(errorLocator).toBeVisible();
    if (message) {
      await expect(errorLocator).toHaveText(message);
    }
  }

  async expectErrorMessage(message: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }
}
