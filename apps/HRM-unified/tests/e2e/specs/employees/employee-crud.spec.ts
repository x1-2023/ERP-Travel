// tests/e2e/specs/employees/employee-crud.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';
import { EmployeesPage, EmployeeFormDialog } from '../../pages/employees.page';

/**
 * LAC VIET HR - Employee CRUD E2E Tests
 * Tests Create, Read, Update, Delete operations for employees
 */

test.describe('Employee CRUD Operations', () => {
  let employeesPage: EmployeesPage;
  let employeeForm: EmployeeFormDialog;

  // ════════════════════════════════════════════════════════════════════════════
  // LIST EMPLOYEES
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('List Employees', () => {
    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      await employeesPage.goto();
    });

    test('should display employee list page with table', async ({ adminPage }) => {
      await employeesPage.expectPageVisible();
      await expect(employeesPage.table).toBeVisible();
    });

    test('should show employees in table', async () => {
      const rowCount = await employeesPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should display correct columns', async ({ adminPage }) => {
      const headers = ['Mã NV', 'Họ tên', 'Email', 'Phòng ban', 'Trạng thái'];
      for (const header of headers) {
        await expect(adminPage.locator(`th:has-text("${header}")`)).toBeVisible();
      }
    });

    test('should paginate results', async () => {
      // Get first page data
      const firstRowData = await employeesPage.getRowData(0);

      // Go to next page if available
      if (await employeesPage.nextPageButton.isEnabled()) {
        await employeesPage.goToNextPage();

        // Data should be different
        const secondPageRowData = await employeesPage.getRowData(0);
        expect(firstRowData.code).not.toBe(secondPageRowData.code);
      }
    });

    test('should change page size', async () => {
      const initialCount = await employeesPage.getRowCount();

      await employeesPage.setPageSize(20);

      const newCount = await employeesPage.getRowCount();
      // Should show more or same rows (up to 20)
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // SEARCH & FILTER
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Search & Filter', () => {
    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      await employeesPage.goto();
    });

    test('should search employees by name', async () => {
      await employeesPage.search('Nguyễn');

      const rowCount = await employeesPage.getRowCount();
      if (rowCount > 0) {
        await employeesPage.expectRowToContain(0, 'Nguyễn');
      }
    });

    test('should search employees by employee code', async () => {
      await employeesPage.search('TEST-EMP');

      const rowCount = await employeesPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should show empty state when no results found', async () => {
      await employeesPage.search('NonExistentEmployeeXYZ123');
      await employeesPage.expectEmptyState();
    });

    test('should filter by status', async () => {
      await employeesPage.filterByStatus('ACTIVE');

      const rowCount = await employeesPage.getRowCount();
      if (rowCount > 0) {
        // All visible rows should be active
        for (let i = 0; i < Math.min(rowCount, 5); i++) {
          const rowData = await employeesPage.getRowData(i);
          expect(rowData.status.toLowerCase()).toContain('active');
        }
      }
    });

    test('should clear filters', async () => {
      // Apply filter first
      await employeesPage.filterByStatus('INACTIVE');
      const filteredCount = await employeesPage.getRowCount();

      // Clear filters
      await employeesPage.clearFilters();
      const totalCount = await employeesPage.getRowCount();

      // Total should be >= filtered
      expect(totalCount).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CREATE EMPLOYEE
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Create Employee', () => {
    const uniqueId = Date.now();

    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      employeeForm = new EmployeeFormDialog(adminPage);
      await employeesPage.goto();
    });

    test('should open create employee dialog', async () => {
      await employeesPage.clickAddEmployee();
      await employeeForm.expectVisible();
    });

    test('should create new employee with valid data', async ({ adminPage }) => {
      const newEmployee = {
        employeeCode: `E2E-${uniqueId}`,
        firstName: 'E2E Test',
        lastName: 'Employee',
        email: `e2e.test.${uniqueId}@test.your-domain.com`,
        phone: '0901234567',
        department: 'IT Department (Test)',
        hireDate: '2024-01-15',
      };

      await employeesPage.clickAddEmployee();
      await employeeForm.fillForm(newEmployee);
      await employeeForm.submit();

      // Should show success message
      await employeeForm.expectSuccessMessage();

      // Dialog should close
      await employeeForm.expectNotVisible();

      // New employee should appear in list
      await employeesPage.search(newEmployee.email);
      await employeesPage.expectEmployeeInList(newEmployee.employeeCode);
    });

    test('should validate required fields', async () => {
      await employeesPage.clickAddEmployee();
      await employeeForm.submit();

      await employeeForm.expectValidationError('firstName');
      await employeeForm.expectValidationError('lastName');
      await employeeForm.expectValidationError('email');
    });

    test('should prevent duplicate email', async () => {
      await employeesPage.clickAddEmployee();
      await employeeForm.fillForm({
        firstName: 'Duplicate',
        lastName: 'Test',
        email: 'nguyen.vantest@test.your-domain.com', // Existing email
      });
      await employeeForm.submit();

      await employeeForm.expectErrorMessage(/email đã tồn tại|already exists/i);
    });

    test('should close dialog on cancel', async () => {
      await employeesPage.clickAddEmployee();
      await employeeForm.fillForm({
        firstName: 'Cancel',
        lastName: 'Test',
        email: 'cancel@test.com',
      });
      await employeeForm.cancel();

      await employeeForm.expectNotVisible();

      // Data should not be saved
      await employeesPage.search('cancel@test.com');
      await employeesPage.expectEmptyState();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UPDATE EMPLOYEE
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Update Employee', () => {
    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      employeeForm = new EmployeeFormDialog(adminPage);
      await employeesPage.goto();
    });

    test('should open edit dialog for existing employee', async () => {
      await employeesPage.editEmployee('TEST-EMP-001');
      await employeeForm.expectVisible();
    });

    test('should pre-populate form with existing data', async () => {
      await employeesPage.editEmployee('TEST-EMP-001');

      // Form should have existing values
      const firstNameValue = await employeeForm.firstNameInput.inputValue();
      expect(firstNameValue).toBe('Nguyễn');
    });

    test('should update employee information', async ({ adminPage }) => {
      const newPhone = '0999888777';

      await employeesPage.editEmployee('TEST-EMP-001');

      // Update phone number
      await employeeForm.dialog.locator('[name="phone"]').fill(newPhone);
      await employeeForm.submit();

      // Should show success
      await employeeForm.expectSuccessMessage();

      // Verify update by viewing detail
      await employeesPage.viewEmployeeDetail('TEST-EMP-001');
      await expect(adminPage.locator(`text=${newPhone}`)).toBeVisible();
    });

    test('should validate updated data', async () => {
      await employeesPage.editEmployee('TEST-EMP-001');

      // Clear required field
      await employeeForm.firstNameInput.clear();
      await employeeForm.submit();

      await employeeForm.expectValidationError('firstName');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // DELETE EMPLOYEE
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Delete Employee', () => {
    const deleteTestId = Date.now();

    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      employeeForm = new EmployeeFormDialog(adminPage);
      await employeesPage.goto();

      // Create a test employee to delete
      await employeesPage.clickAddEmployee();
      await employeeForm.fillForm({
        employeeCode: `DEL-${deleteTestId}`,
        firstName: 'Delete',
        lastName: 'Test',
        email: `delete.${deleteTestId}@test.your-domain.com`,
      });
      await employeeForm.submit();
      await adminPage.waitForTimeout(1000);
      await employeesPage.goto();
    });

    test('should show delete confirmation dialog', async ({ adminPage }) => {
      await employeesPage.search(`DEL-${deleteTestId}`);

      const row = await employeesPage.getRowByEmployeeCode(`DEL-${deleteTestId}`);
      await row.locator('[data-testid="delete-button"], button:has-text("Xóa")').click();

      // Should show confirmation dialog
      await expect(adminPage.locator('[role="alertdialog"]')).toBeVisible();
      await expect(adminPage.locator('text=Xác nhận xóa')).toBeVisible();
    });

    test('should delete employee on confirmation', async ({ adminPage }) => {
      await employeesPage.search(`DEL-${deleteTestId}`);
      await employeesPage.deleteEmployee(`DEL-${deleteTestId}`);

      // Should show success message
      await expect(adminPage.locator('text=/xóa thành công|deleted/i')).toBeVisible();

      // Employee should be removed from list
      await employeesPage.search(`DEL-${deleteTestId}`);
      await employeesPage.expectEmptyState();
    });

    test('should cancel delete operation', async ({ adminPage }) => {
      await employeesPage.search(`DEL-${deleteTestId}`);

      const row = await employeesPage.getRowByEmployeeCode(`DEL-${deleteTestId}`);
      await row.locator('[data-testid="delete-button"], button:has-text("Xóa")').click();

      // Cancel
      await adminPage.locator('button:has-text("Hủy")').click();

      // Employee should still exist
      await employeesPage.expectEmployeeInList(`DEL-${deleteTestId}`);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW EMPLOYEE DETAIL
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('View Employee Detail', () => {
    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      await employeesPage.goto();
    });

    test('should navigate to employee detail page', async ({ adminPage }) => {
      await employeesPage.viewEmployeeDetail('TEST-EMP-001');
      await expect(adminPage).toHaveURL(/.*employees\/[a-z0-9-]+/);
    });

    test('should display employee information', async ({ adminPage }) => {
      await employeesPage.viewEmployeeDetail('TEST-EMP-001');

      // Should show employee details
      await expect(adminPage.locator('text=TEST-EMP-001')).toBeVisible();
      await expect(adminPage.locator('text=Nguyễn')).toBeVisible();
    });

    test('should show employee tabs (info, contracts, attendance, etc.)', async ({ adminPage }) => {
      await employeesPage.viewEmployeeDetail('TEST-EMP-001');

      // Should have tabs
      const tabs = ['Thông tin', 'Hợp đồng', 'Chấm công', 'Nghỉ phép', 'Lương'];
      for (const tab of tabs) {
        await expect(adminPage.locator(`[role="tab"]:has-text("${tab}")`)).toBeVisible();
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BULK OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Bulk Operations', () => {
    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      await employeesPage.goto();
    });

    test('should select all employees', async () => {
      await employeesPage.selectAll();

      const rowCount = await employeesPage.getRowCount();
      const selectedCount = await employeesPage.getSelectedCount();

      expect(selectedCount).toBe(rowCount);
    });

    test('should select individual employees', async () => {
      await employeesPage.selectRows([0, 1]);

      const selectedCount = await employeesPage.getSelectedCount();
      expect(selectedCount).toBe(2);
    });

    test('should deselect all', async () => {
      await employeesPage.selectAll();
      await employeesPage.deselectAll();

      const selectedCount = await employeesPage.getSelectedCount();
      expect(selectedCount).toBe(0);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Export', () => {
    test.beforeEach(async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      await employeesPage.goto();
    });

    test('should export employees to Excel', async () => {
      const filename = await employeesPage.exportToExcel();

      expect(filename).toMatch(/employees.*\.xlsx/i);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // PERMISSION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Permissions', () => {
    test('admin should see all action buttons', async ({ adminPage }) => {
      employeesPage = new EmployeesPage(adminPage);
      await employeesPage.goto();

      await expect(employeesPage.addEmployeeButton).toBeVisible();
      await expect(employeesPage.exportButton).toBeVisible();
    });
  });
});
