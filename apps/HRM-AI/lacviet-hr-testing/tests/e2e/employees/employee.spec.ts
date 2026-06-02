// tests/e2e/employees/employee.spec.ts

/**
 * LAC VIET HR - Employee Management E2E Tests
 * Comprehensive testing of CRUD operations, search, filtering, and bulk actions
 */

import { test, expect } from '@playwright/test';
import { EmployeePage, EmployeeFormData } from '../../pages/EmployeePage';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers, generateEmployeeData, testDepartments } from '../../fixtures/test-data';

test.describe('Employee Management', () => {
  let employeePage: EmployeePage;

  test.beforeEach(async ({ page }) => {
    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.expectLoginSuccess();
    
    employeePage = new EmployeePage(page);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // CREATE EMPLOYEE
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Create Employee', () => {
    test('should create new employee with valid data', async () => {
      const employeeData = generateEmployeeData();
      
      await employeePage.createEmployee(employeeData);
      
      await employeePage.expectCreateSuccess();
      
      // Verify employee appears in list
      await employeePage.goto();
      await employeePage.expectEmployeeInList(`${employeeData.firstName} ${employeeData.lastName}`);
    });

    test('should show validation errors for required fields', async () => {
      await employeePage.gotoCreate();
      await employeePage.saveButton.click();
      
      await employeePage.expectFormError('firstName', 'Họ là bắt buộc');
      await employeePage.expectFormError('lastName', 'Tên là bắt buộc');
      await employeePage.expectFormError('email', 'Email là bắt buộc');
      await employeePage.expectFormError('departmentId', 'Phòng ban là bắt buộc');
      await employeePage.expectFormError('positionId', 'Chức vụ là bắt buộc');
      await employeePage.expectFormError('hireDate', 'Ngày vào làm là bắt buộc');
    });

    test('should show error for duplicate email', async () => {
      const employeeData = generateEmployeeData();
      employeeData.email = testUsers.existingEmployee.email;
      
      await employeePage.gotoCreate();
      await employeePage.fillEmployeeForm(employeeData);
      await employeePage.saveButton.click();
      
      await employeePage.expectFormError('email', 'Email đã tồn tại');
    });

    test('should show error for invalid email format', async () => {
      const employeeData = generateEmployeeData();
      employeeData.email = 'invalid-email';
      
      await employeePage.gotoCreate();
      await employeePage.fillEmployeeForm(employeeData);
      await employeePage.saveButton.click();
      
      await employeePage.expectFormError('email', 'Email không hợp lệ');
    });

    test('should show error for invalid phone number', async () => {
      const employeeData = generateEmployeeData();
      employeeData.phone = '123'; // Too short
      
      await employeePage.gotoCreate();
      await employeePage.fillEmployeeForm(employeeData);
      await employeePage.saveButton.click();
      
      await employeePage.expectFormError('phone', 'Số điện thoại không hợp lệ');
    });

    test('should auto-generate employee code', async ({ page }) => {
      await employeePage.gotoCreate();
      
      // Employee code should be auto-generated
      const codeInput = page.locator('[data-testid="field-employeeCode"]');
      const code = await codeInput.inputValue();
      
      expect(code).toMatch(/^NV\d{6}$/);
    });

    test('should cancel creation and return to list', async ({ page }) => {
      await employeePage.gotoCreate();
      
      const employeeData = generateEmployeeData();
      await employeePage.fillEmployeeForm(employeeData);
      
      await employeePage.cancelButton.click();
      
      // Confirm dialog should appear
      await employeePage.expectConfirmDialog('Bạn có chắc muốn hủy?');
      await employeePage.confirmAction();
      
      await expect(page).toHaveURL(/.*employees$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // READ/VIEW EMPLOYEE
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('View Employee', () => {
    test('should display employee list', async () => {
      await employeePage.goto();
      
      const count = await employeePage.getEmployeeCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should display employee details', async ({ page }) => {
      await employeePage.gotoDetail(testUsers.existingEmployee.id);
      
      // Verify personal info
      await expect(page.locator('[data-testid="employee-name"]')).toContainText(
        testUsers.existingEmployee.fullName
      );
      await expect(page.locator('[data-testid="employee-email"]')).toContainText(
        testUsers.existingEmployee.email
      );
      await expect(page.locator('[data-testid="employee-department"]')).toContainText(
        testUsers.existingEmployee.department
      );
    });

    test('should navigate through employee tabs', async ({ page }) => {
      await employeePage.gotoDetail(testUsers.existingEmployee.id);
      
      // Personal tab (default)
      await expect(page.locator('[data-testid="personal-info"]')).toBeVisible();
      
      // Job tab
      await employeePage.goToJobTab();
      await expect(page.locator('[data-testid="job-info"]')).toBeVisible();
      
      // Bank tab
      await employeePage.goToBankTab();
      await expect(page.locator('[data-testid="bank-info"]')).toBeVisible();
      
      // Documents tab
      await employeePage.goToDocumentsTab();
      await expect(page.locator('[data-testid="documents-list"]')).toBeVisible();
      
      // History tab
      await employeePage.goToHistoryTab();
      await expect(page.locator('[data-testid="history-timeline"]')).toBeVisible();
    });

    test('should show employment history', async ({ page }) => {
      await employeePage.gotoDetail(testUsers.existingEmployee.id);
      await employeePage.goToHistoryTab();
      
      const historyItems = page.locator('[data-testid="history-item"]');
      await expect(historyItems).toHaveCount.greaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // UPDATE EMPLOYEE
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Update Employee', () => {
    test('should update employee information', async () => {
      const newFirstName = 'Updated First';
      const newLastName = 'Updated Last';
      
      await employeePage.updateEmployee(testUsers.existingEmployee.id, {
        firstName: newFirstName,
        lastName: newLastName,
      });
      
      await employeePage.expectUpdateSuccess();
      
      // Verify changes
      await employeePage.gotoDetail(testUsers.existingEmployee.id);
      await expect(employeePage.page.locator('[data-testid="employee-name"]')).toContainText(
        `${newFirstName} ${newLastName}`
      );
    });

    test('should update employee department', async ({ page }) => {
      await employeePage.gotoEdit(testUsers.existingEmployee.id);
      
      await employeePage.selectDropdownOption(
        employeePage.departmentSelect,
        testDepartments.engineering.name
      );
      await employeePage.saveButton.click();
      
      await employeePage.expectUpdateSuccess();
      
      // Verify department change
      await employeePage.gotoDetail(testUsers.existingEmployee.id);
      await expect(page.locator('[data-testid="employee-department"]')).toContainText(
        testDepartments.engineering.name
      );
    });

    test('should show confirmation when changing critical fields', async ({ page }) => {
      await employeePage.gotoEdit(testUsers.existingEmployee.id);
      
      // Change email (critical field)
      await employeePage.fillInput(employeePage.emailInput, 'newemail@company.com');
      await employeePage.saveButton.click();
      
      // Should show confirmation
      await employeePage.expectConfirmDialog('Bạn có chắc muốn thay đổi email?');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DELETE EMPLOYEE
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Delete Employee', () => {
    test('should deactivate employee (soft delete)', async () => {
      // Create a test employee first
      const employeeData = generateEmployeeData();
      await employeePage.createEmployee(employeeData);
      await employeePage.expectCreateSuccess();
      
      // Get the created employee ID from URL or list
      const employeeId = await employeePage.page.evaluate(() => {
        return window.location.pathname.split('/').pop();
      });
      
      // Delete the employee
      await employeePage.deleteEmployee(employeeId!);
      await employeePage.expectDeleteSuccess();
      
      // Employee should not appear in active list
      await employeePage.goto();
      await employeePage.expectEmployeeNotInList(`${employeeData.firstName} ${employeeData.lastName}`);
      
      // But should appear in inactive filter
      await employeePage.filterByStatus('INACTIVE');
      await employeePage.expectEmployeeInList(`${employeeData.firstName} ${employeeData.lastName}`);
    });

    test('should show confirmation before delete', async () => {
      await employeePage.gotoDetail(testUsers.existingEmployee.id);
      await employeePage.page.locator('[data-testid="delete-employee"]').click();
      
      await employeePage.expectConfirmDialog('Bạn có chắc muốn xóa nhân viên này?');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SEARCH & FILTER
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Search & Filter', () => {
    test('should search employee by name', async () => {
      await employeePage.goto();
      await employeePage.searchEmployee('Nguyen');
      
      // All results should contain "Nguyen"
      const rows = employeePage.employeeTable.locator('tbody tr');
      const count = await rows.count();
      
      for (let i = 0; i < count; i++) {
        const name = await rows.nth(i).locator('td:first-child').textContent();
        expect(name?.toLowerCase()).toContain('nguyen');
      }
    });

    test('should search employee by email', async () => {
      await employeePage.goto();
      await employeePage.searchEmployee(testUsers.existingEmployee.email);
      
      await employeePage.expectEmployeeInList(testUsers.existingEmployee.fullName);
    });

    test('should search employee by employee code', async () => {
      await employeePage.goto();
      await employeePage.searchEmployee(testUsers.existingEmployee.code);
      
      await employeePage.expectEmployeeInList(testUsers.existingEmployee.fullName);
    });

    test('should filter by department', async () => {
      await employeePage.goto();
      await employeePage.filterByDepartment(testDepartments.engineering.name);
      
      // All results should be from Engineering
      const rows = employeePage.employeeTable.locator('tbody tr');
      const count = await rows.count();
      
      for (let i = 0; i < count; i++) {
        const dept = await rows.nth(i).locator('[data-testid="employee-dept"]').textContent();
        expect(dept).toBe(testDepartments.engineering.name);
      }
    });

    test('should filter by status', async () => {
      await employeePage.goto();
      await employeePage.filterByStatus('INACTIVE');
      
      // All results should have INACTIVE status
      const rows = employeePage.employeeTable.locator('tbody tr');
      const count = await rows.count();
      
      for (let i = 0; i < count; i++) {
        const status = await rows.nth(i).locator('[data-testid="status-badge"]').textContent();
        expect(status).toBe('Nghỉ việc');
      }
    });

    test('should combine search and filters', async () => {
      await employeePage.goto();
      await employeePage.searchEmployee('Developer');
      await employeePage.filterByDepartment(testDepartments.engineering.name);
      await employeePage.filterByStatus('ACTIVE');
      
      // Results should match all criteria
      const count = await employeePage.getEmployeeCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should show empty state when no results', async () => {
      await employeePage.goto();
      await employeePage.searchEmployee('ZZZZNONEXISTENT12345');
      
      await expect(employeePage.page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(employeePage.page.locator('[data-testid="empty-state"]')).toContainText(
        'Không tìm thấy nhân viên'
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Pagination', () => {
    test('should paginate employee list', async () => {
      await employeePage.goto();
      
      const firstPageFirstEmployee = await employeePage.getTableCellText(
        employeePage.employeeTable, 0, 0
      );
      
      await employeePage.goToNextPage();
      
      const secondPageFirstEmployee = await employeePage.getTableCellText(
        employeePage.employeeTable, 0, 0
      );
      
      expect(firstPageFirstEmployee).not.toBe(secondPageFirstEmployee);
    });

    test('should change page size', async () => {
      await employeePage.goto();
      
      await employeePage.setPageSize(50);
      
      const count = await employeePage.getEmployeeCount();
      expect(count).toBeLessThanOrEqual(50);
    });

    test('should navigate to specific page', async () => {
      await employeePage.goto();
      
      await employeePage.goToPage(3);
      
      // Verify we're on page 3
      const activePage = employeePage.page.locator('[data-testid="pagination-page-3"].active');
      await expect(activePage).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BULK ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Bulk Actions', () => {
    test('should select multiple employees', async () => {
      await employeePage.goto();
      
      await employeePage.selectEmployees(['emp-1', 'emp-2', 'emp-3']);
      
      const selectedCount = await employeePage.page.locator(
        '[data-testid="selected-count"]'
      ).textContent();
      expect(selectedCount).toContain('3');
    });

    test('should select all employees', async () => {
      await employeePage.goto();
      
      await employeePage.selectAllEmployees();
      
      const totalCount = await employeePage.getEmployeeCount();
      const selectedCount = await employeePage.page.locator(
        '[data-testid="selected-count"]'
      ).textContent();
      
      expect(selectedCount).toContain(totalCount.toString());
    });

    test('should bulk update department', async () => {
      await employeePage.goto();
      
      await employeePage.selectEmployees(['emp-1', 'emp-2']);
      await employeePage.bulkUpdateDepartment(testDepartments.hr.name);
      
      await employeePage.expectToastMessage('Cập nhật thành công 2 nhân viên', 'success');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // IMPORT/EXPORT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Import/Export', () => {
    test('should export employees to Excel', async ({ page }) => {
      await employeePage.goto();
      
      const downloadPromise = page.waitForEvent('download');
      await employeePage.exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.xlsx');
    });

    test('should import employees from Excel', async () => {
      await employeePage.goto();
      
      await employeePage.importEmployees('./tests/fixtures/employees-import.xlsx');
      
      await employeePage.expectToastMessage('Import thành công', 'success');
    });

    test('should show import errors for invalid data', async ({ page }) => {
      await employeePage.goto();
      
      await employeePage.importEmployees('./tests/fixtures/employees-invalid.xlsx');
      
      // Should show error dialog with details
      await expect(page.locator('[data-testid="import-errors"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-error-row"]')).toHaveCount.greaterThan(0);
    });
  });
});
