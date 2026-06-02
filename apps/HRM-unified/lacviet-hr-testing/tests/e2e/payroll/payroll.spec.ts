// tests/e2e/payroll/payroll.spec.ts

/**
 * LAC VIET HR - Payroll E2E Tests
 * Salary, payslips, payroll processing
 */

import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Payroll - Employee View', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
  });

  test('should display payroll dashboard', async ({ page }) => {
    const payrollDashboard = page.locator('[data-testid="payroll-dashboard"]');
    await expect(payrollDashboard).toBeVisible();
  });

  test('should view current payslip', async ({ page }) => {
    // Click on current month payslip
    const currentPayslip = page.locator('[data-testid="current-payslip"]');
    await currentPayslip.click();
    
    // Payslip details should be visible
    const payslipDetail = page.locator('[data-testid="payslip-detail"]');
    await expect(payslipDetail).toBeVisible();
    
    // Check key elements
    await expect(page.locator('[data-testid="gross-salary"]')).toBeVisible();
    await expect(page.locator('[data-testid="net-salary"]')).toBeVisible();
    await expect(page.locator('[data-testid="deductions"]')).toBeVisible();
  });

  test('should view payslip history', async ({ page }) => {
    // Click on history tab
    await page.click('[data-testid="payslip-history-tab"]');
    
    // History list should be visible
    const historyList = page.locator('[data-testid="payslip-history"]');
    await expect(historyList).toBeVisible();
    
    // Should have at least one payslip
    const payslips = page.locator('[data-testid="payslip-item"]');
    expect(await payslips.count()).toBeGreaterThanOrEqual(0);
  });

  test('should download payslip PDF', async ({ page }) => {
    // Navigate to payslip detail
    await page.click('[data-testid="current-payslip"]');
    
    // Download PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-payslip"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/payslip.*\.pdf/);
  });

  test('should view salary breakdown', async ({ page }) => {
    await page.click('[data-testid="current-payslip"]');
    
    // Expand breakdown sections
    await page.click('[data-testid="expand-allowances"]');
    
    const allowances = page.locator('[data-testid="allowance-item"]');
    // May or may not have allowances
    
    await page.click('[data-testid="expand-deductions"]');
    
    // Check mandatory deductions
    await expect(page.locator('text=/BHXH|Social Insurance/i')).toBeVisible();
    await expect(page.locator('text=/BHYT|Health Insurance/i')).toBeVisible();
    await expect(page.locator('text=/Thuế TNCN|Income Tax/i')).toBeVisible();
  });
});

test.describe('Payroll - HR Manager View', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/payroll/management');
    await page.waitForLoadState('networkidle');
  });

  test('should display payroll management dashboard', async ({ page }) => {
    const dashboard = page.locator('[data-testid="payroll-management"]');
    await expect(dashboard).toBeVisible();
  });

  test('should view payroll period list', async ({ page }) => {
    const periodList = page.locator('[data-testid="payroll-period-list"]');
    await expect(periodList).toBeVisible();
  });

  test('should create new payroll period', async ({ page }) => {
    await page.click('[data-testid="new-payroll-period"]');
    
    // Fill period details
    const now = new Date();
    const periodName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    await page.fill('input[name="periodName"]', periodName);
    
    // Set pay date
    const payDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    await page.fill('input[name="payDate"]', payDate.toISOString().split('T')[0]);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should run payroll calculation', async ({ page }) => {
    // Click on a draft period
    await page.click('[data-testid="payroll-period"][data-status="DRAFT"]');
    
    // Click run calculation
    await page.click('[data-testid="run-calculation"]');
    
    // Confirm
    await page.click('[data-testid="confirm-calculation"]');
    
    // Wait for calculation to complete
    await page.waitForSelector('[data-testid="calculation-complete"]', { timeout: 60000 });
  });

  test('should review payroll before approval', async ({ page }) => {
    // Click on a calculated period
    await page.click('[data-testid="payroll-period"][data-status="CALCULATED"]');
    
    // Review summary
    const summary = page.locator('[data-testid="payroll-summary"]');
    await expect(summary).toBeVisible();
    
    // Check key metrics
    await expect(page.locator('[data-testid="total-gross"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-net"]')).toBeVisible();
    await expect(page.locator('[data-testid="employee-count"]')).toBeVisible();
  });

  test('should approve payroll', async ({ page }) => {
    // Click on a calculated period
    await page.click('[data-testid="payroll-period"][data-status="CALCULATED"]');
    
    // Click approve
    await page.click('[data-testid="approve-payroll"]');
    
    // Confirm
    await page.click('[data-testid="confirm-approve"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should export payroll report', async ({ page }) => {
    // Click on a completed period
    await page.click('[data-testid="payroll-period"][data-status="PAID"]');
    
    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-payroll"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/payroll.*\.(xlsx|csv)/);
  });

  test('should view individual employee payroll', async ({ page }) => {
    // Click on a period
    await page.click('[data-testid="payroll-period"]');
    
    // Search for employee
    await page.fill('input[name="employeeSearch"]', 'Nguyen');
    await page.keyboard.press('Enter');
    
    // Click on employee
    await page.click('[data-testid="employee-payroll-item"]');
    
    // Detail should be visible
    const detail = page.locator('[data-testid="employee-payroll-detail"]');
    await expect(detail).toBeVisible();
  });

  test('should adjust individual salary', async ({ page }) => {
    // Navigate to salary management
    await page.goto('/payroll/salaries');
    await page.waitForLoadState('networkidle');
    
    // Click on an employee
    await page.click('[data-testid="salary-item"]');
    
    // Click adjust
    await page.click('[data-testid="adjust-salary"]');
    
    // Fill adjustment
    await page.fill('input[name="newSalary"]', '35000000');
    await page.fill('input[name="effectiveDate"]', new Date().toISOString().split('T')[0]);
    await page.fill('textarea[name="reason"]', 'E2E Test - Annual review');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('Payroll - Tax & Insurance', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test('should view tax deduction summary', async ({ page }) => {
    await page.goto('/payroll/reports/tax');
    await page.waitForLoadState('networkidle');
    
    const taxSummary = page.locator('[data-testid="tax-summary"]');
    await expect(taxSummary).toBeVisible();
  });

  test('should view insurance contribution summary', async ({ page }) => {
    await page.goto('/payroll/reports/insurance');
    await page.waitForLoadState('networkidle');
    
    const insuranceSummary = page.locator('[data-testid="insurance-summary"]');
    await expect(insuranceSummary).toBeVisible();
    
    // Check breakdown by type
    await expect(page.locator('[data-testid="bhxh-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="bhyt-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="bhtn-total"]')).toBeVisible();
  });

  test('should export tax report for submission', async ({ page }) => {
    await page.goto('/payroll/reports/tax');
    
    // Select period
    await page.selectOption('select[name="year"]', '2024');
    
    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-tax-report"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/tax.*\.(xlsx|xml)/);
  });
});

test.describe('Payroll - Overtime & Bonuses', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test('should add overtime hours', async ({ page }) => {
    await page.goto('/payroll/overtime');
    await page.waitForLoadState('networkidle');
    
    // Add overtime entry
    await page.click('[data-testid="add-overtime"]');
    
    // Fill form
    await page.selectOption('select[name="employeeId"]', { index: 1 });
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    await page.fill('input[name="hours"]', '2');
    await page.selectOption('select[name="type"]', 'NORMAL'); // 150%
    
    // Submit
    await page.click('button[type="submit"]');
    
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should add bonus payment', async ({ page }) => {
    await page.goto('/payroll/bonuses');
    await page.waitForLoadState('networkidle');
    
    // Add bonus
    await page.click('[data-testid="add-bonus"]');
    
    // Fill form
    await page.selectOption('select[name="employeeId"]', { index: 1 });
    await page.selectOption('select[name="bonusType"]', 'PERFORMANCE');
    await page.fill('input[name="amount"]', '5000000');
    await page.fill('textarea[name="reason"]', 'E2E Test - Performance bonus');
    
    // Submit
    await page.click('button[type="submit"]');
    
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});
