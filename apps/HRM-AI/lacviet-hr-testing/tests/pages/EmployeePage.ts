// tests/pages/EmployeePage.ts

/**
 * LAC VIET HR - Employee Management Page Object
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface EmployeeFormData {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  positionId: string;
  hireDate: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  idNumber?: string;
  address?: string;
  bankAccount?: string;
  bankName?: string;
  taxCode?: string;
  insuranceNumber?: string;
}

export class EmployeePage extends BasePage {
  // List page
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly departmentFilter: Locator;
  readonly statusFilter: Locator;
  readonly employeeTable: Locator;
  readonly exportButton: Locator;
  readonly importButton: Locator;
  readonly bulkActionButton: Locator;

  // Form
  readonly employeeForm: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly departmentSelect: Locator;
  readonly positionSelect: Locator;
  readonly hireDatePicker: Locator;
  readonly birthDatePicker: Locator;
  readonly genderSelect: Locator;
  readonly idNumberInput: Locator;
  readonly addressInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Tabs
  readonly tabPersonal: Locator;
  readonly tabJob: Locator;
  readonly tabBank: Locator;
  readonly tabDocuments: Locator;
  readonly tabHistory: Locator;

  constructor(page: Page) {
    super(page);
    
    // List page
    this.createButton = page.locator('[data-testid="create-employee"]');
    this.searchInput = page.locator('[data-testid="employee-search"]');
    this.departmentFilter = page.locator('[data-testid="filter-department"]');
    this.statusFilter = page.locator('[data-testid="filter-status"]');
    this.employeeTable = page.locator('[data-testid="employee-table"]');
    this.exportButton = page.locator('[data-testid="export-employees"]');
    this.importButton = page.locator('[data-testid="import-employees"]');
    this.bulkActionButton = page.locator('[data-testid="bulk-actions"]');

    // Form
    this.employeeForm = page.locator('[data-testid="employee-form"]');
    this.firstNameInput = page.locator('[data-testid="field-firstName"]');
    this.lastNameInput = page.locator('[data-testid="field-lastName"]');
    this.emailInput = page.locator('[data-testid="field-email"]');
    this.phoneInput = page.locator('[data-testid="field-phone"]');
    this.departmentSelect = page.locator('[data-testid="field-departmentId"]');
    this.positionSelect = page.locator('[data-testid="field-positionId"]');
    this.hireDatePicker = page.locator('[data-testid="field-hireDate"]');
    this.birthDatePicker = page.locator('[data-testid="field-birthDate"]');
    this.genderSelect = page.locator('[data-testid="field-gender"]');
    this.idNumberInput = page.locator('[data-testid="field-idNumber"]');
    this.addressInput = page.locator('[data-testid="field-address"]');
    this.saveButton = page.locator('[data-testid="save-employee"]');
    this.cancelButton = page.locator('[data-testid="cancel-employee"]');

    // Tabs
    this.tabPersonal = page.locator('[data-testid="tab-personal"]');
    this.tabJob = page.locator('[data-testid="tab-job"]');
    this.tabBank = page.locator('[data-testid="tab-bank"]');
    this.tabDocuments = page.locator('[data-testid="tab-documents"]');
    this.tabHistory = page.locator('[data-testid="tab-history"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/employees');
    await this.waitForPageLoad();
  }

  async gotoCreate(): Promise<void> {
    await this.page.goto('/employees/new');
    await this.waitForPageLoad();
  }

  async gotoDetail(employeeId: string): Promise<void> {
    await this.page.goto(`/employees/${employeeId}`);
    await this.waitForPageLoad();
  }

  async gotoEdit(employeeId: string): Promise<void> {
    await this.page.goto(`/employees/${employeeId}/edit`);
    await this.waitForPageLoad();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LIST ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async searchEmployee(term: string): Promise<void> {
    await this.searchInTable(this.searchInput, term);
  }

  async filterByDepartment(departmentName: string): Promise<void> {
    await this.selectDropdownOption(this.departmentFilter, departmentName);
    await this.waitForLoadingComplete();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.selectDropdownOption(this.statusFilter, status);
    await this.waitForLoadingComplete();
  }

  async clickCreateEmployee(): Promise<void> {
    await this.createButton.click();
    await this.page.waitForURL('**/employees/new');
  }

  async clickEmployeeRow(employeeId: string): Promise<void> {
    await this.employeeTable
      .locator(`tr[data-employee-id="${employeeId}"]`)
      .click();
    await this.page.waitForURL(`**/employees/${employeeId}`);
  }

  async getEmployeeCount(): Promise<number> {
    return this.getTableRowCount(this.employeeTable);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FORM ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async fillEmployeeForm(data: EmployeeFormData): Promise<void> {
    await this.fillInput(this.firstNameInput, data.firstName);
    await this.fillInput(this.lastNameInput, data.lastName);
    await this.fillInput(this.emailInput, data.email);
    
    if (data.phone) {
      await this.fillInput(this.phoneInput, data.phone);
    }
    
    await this.selectDropdownOption(this.departmentSelect, data.departmentId);
    await this.selectDropdownOption(this.positionSelect, data.positionId);
    
    await this.hireDatePicker.fill(data.hireDate);
    
    if (data.birthDate) {
      await this.birthDatePicker.fill(data.birthDate);
    }
    
    if (data.gender) {
      await this.selectDropdownOption(this.genderSelect, data.gender);
    }
    
    if (data.idNumber) {
      await this.fillInput(this.idNumberInput, data.idNumber);
    }
    
    if (data.address) {
      await this.fillInput(this.addressInput, data.address);
    }
  }

  async createEmployee(data: EmployeeFormData): Promise<void> {
    await this.gotoCreate();
    await this.fillEmployeeForm(data);
    await this.saveButton.click();
    await this.waitForLoadingComplete();
  }

  async updateEmployee(employeeId: string, data: Partial<EmployeeFormData>): Promise<void> {
    await this.gotoEdit(employeeId);
    
    if (data.firstName) await this.fillInput(this.firstNameInput, data.firstName);
    if (data.lastName) await this.fillInput(this.lastNameInput, data.lastName);
    if (data.email) await this.fillInput(this.emailInput, data.email);
    if (data.phone) await this.fillInput(this.phoneInput, data.phone);
    
    await this.saveButton.click();
    await this.waitForLoadingComplete();
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    await this.gotoDetail(employeeId);
    await this.page.locator('[data-testid="delete-employee"]').click();
    await this.confirmAction();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════════

  async goToPersonalTab(): Promise<void> {
    await this.tabPersonal.click();
    await this.waitForLoadingComplete();
  }

  async goToJobTab(): Promise<void> {
    await this.tabJob.click();
    await this.waitForLoadingComplete();
  }

  async goToBankTab(): Promise<void> {
    await this.tabBank.click();
    await this.waitForLoadingComplete();
  }

  async goToDocumentsTab(): Promise<void> {
    await this.tabDocuments.click();
    await this.waitForLoadingComplete();
  }

  async goToHistoryTab(): Promise<void> {
    await this.tabHistory.click();
    await this.waitForLoadingComplete();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // BULK ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async selectAllEmployees(): Promise<void> {
    await this.employeeTable.locator('thead input[type="checkbox"]').check();
  }

  async selectEmployees(employeeIds: string[]): Promise<void> {
    for (const id of employeeIds) {
      await this.employeeTable
        .locator(`tr[data-employee-id="${id}"] input[type="checkbox"]`)
        .check();
    }
  }

  async bulkUpdateDepartment(departmentName: string): Promise<void> {
    await this.bulkActionButton.click();
    await this.page.locator('[data-testid="bulk-change-department"]').click();
    await this.selectDropdownOption(
      this.page.locator('[data-testid="bulk-department-select"]'),
      departmentName
    );
    await this.page.locator('[data-testid="bulk-confirm"]').click();
    await this.waitForLoadingComplete();
  }

  async exportEmployees(): Promise<void> {
    await this.exportButton.click();
    // Wait for download to start
    await this.page.waitForEvent('download');
  }

  async importEmployees(filePath: string): Promise<void> {
    await this.importButton.click();
    await this.uploadFile(
      this.page.locator('[data-testid="import-file-input"]'),
      filePath
    );
    await this.page.locator('[data-testid="import-confirm"]').click();
    await this.waitForLoadingComplete();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async expectEmployeeInList(employeeName: string): Promise<void> {
    await expect(this.employeeTable).toContainText(employeeName);
  }

  async expectEmployeeNotInList(employeeName: string): Promise<void> {
    await expect(this.employeeTable).not.toContainText(employeeName);
  }

  async expectEmployeeCount(count: number): Promise<void> {
    const actualCount = await this.getEmployeeCount();
    expect(actualCount).toBe(count);
  }

  async expectFormError(fieldName: string, message: string): Promise<void> {
    await this.expectValidationError(fieldName, message);
  }

  async expectCreateSuccess(): Promise<void> {
    await this.expectToastMessage('Tạo nhân viên thành công', 'success');
  }

  async expectUpdateSuccess(): Promise<void> {
    await this.expectToastMessage('Cập nhật nhân viên thành công', 'success');
  }

  async expectDeleteSuccess(): Promise<void> {
    await this.expectToastMessage('Xóa nhân viên thành công', 'success');
  }
}
