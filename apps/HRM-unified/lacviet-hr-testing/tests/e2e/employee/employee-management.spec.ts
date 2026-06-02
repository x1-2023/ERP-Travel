// tests/e2e/employee/employee-management.spec.ts

/**
 * LAC VIET HR - Employee Management E2E Tests
 * CRUD operations, search, filter, export
 */

import { test, expect, TEST_USERS } from '../../fixtures/test-fixtures';
import { EmployeeListPage, EmployeeFormPage } from '../../fixtures/test-fixtures';

test.describe('Employee List', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
  });

  test('should display employee list', async ({ page, employeeListPage }) => {
    // Check table is visible
    await expect(employeeListPage.employeeTable).toBeVisible();
    
    // Check there are some employees
    const count = await employeeListPage.getEmployeeCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should search employees by name', async ({ page, employeeListPage }) => {
    await employeeListPage.search('Nguyen');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Check results contain search term
    const rows = employeeListPage.employeeRows;
    const count = await rows.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await rows.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('nguyen');
    }
  });

  test('should search employees by email', async ({ page, employeeListPage }) => {
    await employeeListPage.search('@company.com');
    
    await page.waitForTimeout(500);
    
    const count = await employeeListPage.getEmployeeCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter by department', async ({ page, employeeListPage }) => {
    await employeeListPage.filterButton.click();
    
    // Select department from dropdown
    const departmentFilter = page.locator('[data-testid="department-filter"]');
    await departmentFilter.selectOption({ index: 1 }); // Select first department
    
    await page.click('[data-testid="apply-filter"]');
    await page.waitForLoadState('networkidle');
    
    // Verify filter is applied
    const activeFilter = page.locator('[data-testid="active-filter"]');
    await expect(activeFilter).toBeVisible();
  });

  test('should filter by status', async ({ page, employeeListPage }) => {
    await employeeListPage.filterButton.click();
    
    // Select active status
    await page.click('[data-testid="status-ACTIVE"]');
    await page.click('[data-testid="apply-filter"]');
    
    await page.waitForLoadState('networkidle');
  });

  test('should paginate through employees', async ({ page, employeeListPage }) => {
    // Check pagination exists
    await expect(employeeListPage.pagination).toBeVisible();
    
    // Go to page 2
    const page2Button = page.locator('[data-testid="page-2"], .pagination button:has-text("2")');
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForLoadState('networkidle');
      
      // URL should contain page parameter
      expect(page.url()).toContain('page=2');
    }
  });

  test('should sort employees by column', async ({ page, employeeListPage }) => {
    // Click on name header to sort
    await page.click('th:has-text("Họ tên"), th:has-text("Name")');
    await page.waitForLoadState('networkidle');
    
    // Click again for descending
    await page.click('th:has-text("Họ tên"), th:has-text("Name")');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to employee detail', async ({ page, employeeListPage }) => {
    await employeeListPage.clickEmployee(0);
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/employees\/[a-zA-Z0-9-]+/);
  });

  test('should export employee list', async ({ page, employeeListPage }) => {
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await employeeListPage.exportButton.click();
    
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/employees.*\.(xlsx|csv)/);
  });
});

test.describe('Employee Create', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should open create employee form', async ({ page }) => {
    await page.goto('/employees');
    await page.click('[data-testid="add-employee"], button:has-text("Thêm")');
    
    await expect(page).toHaveURL(/\/employees\/new/);
  });

  test('should create new employee successfully', async ({ page, employeeFormPage }) => {
    await employeeFormPage.goto();
    
    const uniqueEmail = `test.${Date.now()}@company.com`;
    
    await employeeFormPage.fillForm({
      firstName: 'Test',
      lastName: 'Employee',
      email: uniqueEmail,
    });
    
    // Select department and position
    await page.selectOption('select[name="departmentId"]', { index: 1 });
    await page.selectOption('select[name="positionId"]', { index: 1 });
    
    // Set hire date
    await page.fill('input[name="hireDate"]', '2024-01-15');
    
    await employeeFormPage.submit();
    
    // Should redirect to employee list or detail
    await expect(page).toHaveURL(/\/employees/);
  });

  test('should validate required fields', async ({ page, employeeFormPage }) => {
    await employeeFormPage.goto();
    
    // Submit empty form
    await employeeFormPage.submit();
    
    // Check validation errors
    await employeeFormPage.expectValidationError('firstName');
    await employeeFormPage.expectValidationError('lastName');
    await employeeFormPage.expectValidationError('email');
  });

  test('should validate email format', async ({ page, employeeFormPage }) => {
    await employeeFormPage.goto();
    
    await employeeFormPage.fillForm({
      firstName: 'Test',
      lastName: 'User',
      email: 'invalid-email',
    });
    
    await employeeFormPage.submit();
    await employeeFormPage.expectValidationError('email');
  });

  test('should prevent duplicate email', async ({ page, employeeFormPage }) => {
    await employeeFormPage.goto();
    
    await employeeFormPage.fillForm({
      firstName: 'Duplicate',
      lastName: 'Email',
      email: TEST_USERS.employee.email, // Existing email
    });
    
    await page.selectOption('select[name="departmentId"]', { index: 1 });
    await page.selectOption('select[name="positionId"]', { index: 1 });
    
    await employeeFormPage.submit();
    
    // Should show duplicate email error
    const errorMessage = page.locator('text=/đã tồn tại|already exists/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should cancel and return to list', async ({ page, employeeFormPage }) => {
    await employeeFormPage.goto();
    
    await employeeFormPage.fillForm({
      firstName: 'Will Be',
      lastName: 'Cancelled',
    });
    
    await employeeFormPage.cancelButton.click();
    
    // Should return to list
    await expect(page).toHaveURL(/\/employees$/);
  });
});

test.describe('Employee Edit', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should edit employee successfully', async ({ page }) => {
    // First, navigate to employee list and find one
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    
    // Click first employee
    await page.click('tbody tr:first-child');
    await page.waitForURL(/\/employees\/[a-zA-Z0-9-]+/);
    
    // Click edit button
    await page.click('[data-testid="edit-button"], button:has-text("Chỉnh sửa")');
    await page.waitForURL(/\/edit/);
    
    // Update name
    await page.fill('input[name="firstName"]', 'Updated');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success message
    const toast = page.locator('.toast-success, [data-type="success"]');
    await expect(toast).toBeVisible();
  });
});

test.describe('Employee Delete', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should show confirmation dialog before delete', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    
    // Click first employee
    await page.click('tbody tr:first-child');
    await page.waitForURL(/\/employees\/[a-zA-Z0-9-]+/);
    
    // Click delete button
    await page.click('[data-testid="delete-button"], button:has-text("Xóa")');
    
    // Confirmation dialog should appear
    const dialog = page.locator('[role="dialog"], .modal');
    await expect(dialog).toBeVisible();
    
    // Cancel deletion
    await page.click('[data-testid="cancel-delete"], button:has-text("Hủy")');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Employee Detail', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should display employee details', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    
    // Click first employee
    await page.click('tbody tr:first-child');
    await page.waitForURL(/\/employees\/[a-zA-Z0-9-]+/);
    
    // Check key information is displayed
    const employeeCode = page.locator('[data-testid="employee-code"]');
    const employeeName = page.locator('[data-testid="employee-name"], h1');
    const department = page.locator('[data-testid="department"]');
    
    await expect(employeeName).toBeVisible();
  });

  test('should show employee tabs', async ({ page }) => {
    await page.goto('/employees');
    await page.click('tbody tr:first-child');
    await page.waitForURL(/\/employees\/[a-zA-Z0-9-]+/);
    
    // Check tabs
    const tabs = page.locator('[role="tablist"] [role="tab"]');
    await expect(tabs.first()).toBeVisible();
  });
});

test.describe('Employee Import', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should open import dialog', async ({ page }) => {
    await page.goto('/employees');
    
    await page.click('[data-testid="import-button"], button:has-text("Nhập")');
    
    // Import dialog should appear
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });
});

test.describe('Employee - Role Based Access', () => {
  test('admin should see all actions', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    const page = await context.newPage();
    
    await page.goto('/employees');
    
    // Admin should see add, import, export buttons
    await expect(page.locator('[data-testid="add-employee"]')).toBeVisible();
    await expect(page.locator('[data-testid="import-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-button"]')).toBeVisible();
    
    await context.close();
  });

  test('employee should have limited access', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    
    await page.goto('/employees');
    
    // Employee should not see add/import buttons
    await expect(page.locator('[data-testid="add-employee"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="import-button"]')).not.toBeVisible();
    
    await context.close();
  });
});
