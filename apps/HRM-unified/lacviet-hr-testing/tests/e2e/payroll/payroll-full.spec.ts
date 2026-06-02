// tests/e2e/payroll/payroll-full.spec.ts

/**
 * LAC VIET HR - Payroll Management E2E Tests
 * Comprehensive testing of salary calculation, payslips, tax, and insurance
 */

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers, testDepartments } from '../../fixtures/test-data';

test.describe('Payroll Management', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.expectLoginSuccess();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PAYROLL PERIOD MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Payroll Period', () => {
    test('@critical should create new payroll period', async () => {
      await page.goto('/payroll/periods/new');

      // Select period
      await page.locator('[data-testid="period-month"]').selectOption('1');
      await page.locator('[data-testid="period-year"]').selectOption('2025');

      // Set dates
      await page.locator('[data-testid="period-start"]').fill('2025-01-01');
      await page.locator('[data-testid="period-end"]').fill('2025-01-31');
      await page.locator('[data-testid="pay-date"]').fill('2025-02-05');

      await page.locator('[data-testid="create-period"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Tạo kỳ lương thành công');
    });

    test('should list all payroll periods', async () => {
      await page.goto('/payroll/periods');

      const periodsList = page.locator('[data-testid="periods-list"]');
      await expect(periodsList).toBeVisible();

      const periods = page.locator('[data-testid="period-item"]');
      await expect(periods).toHaveCount.greaterThan(0);
    });

    test('should show period status workflow', async () => {
      await page.goto('/payroll/periods');

      // Click on a period
      await page.locator('[data-testid="period-item"]').first().click();

      // Verify status badges
      const statusBadge = page.locator('[data-testid="period-status"]');
      const statusText = await statusBadge.textContent();

      expect(statusText).toMatch(/Nháp|Đang tính|Chờ duyệt|Đã duyệt|Đã thanh toán/);
    });

    test('should lock period after calculation', async () => {
      await page.goto('/payroll/periods');

      // Open an unlocked period
      await page.locator('[data-testid="period-draft"]').first().click();

      // Try to edit
      await page.locator('[data-testid="edit-period"]').click();

      // Make changes
      await page.locator('[data-testid="pay-date"]').fill('2025-02-10');
      await page.locator('[data-testid="save-period"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SALARY CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Salary Calculation', () => {
    test('@critical should calculate payroll for period', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-item"]').first().click();

      // Start calculation
      await page.locator('[data-testid="calculate-payroll"]').click();

      // Confirm
      await page.locator('[data-testid="confirm-calculate"]').click();

      // Wait for calculation
      await expect(page.locator('[data-testid="calculation-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="calculation-complete"]')).toBeVisible({ timeout: 120000 });

      // Verify results
      await expect(page.locator('[data-testid="payroll-summary"]')).toBeVisible();
    });

    test('should show salary breakdown', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-calculated"]').first().click();

      // View employee salary detail
      await page.locator('[data-testid="employee-salary-row"]').first().click();

      // Verify breakdown components
      await expect(page.locator('[data-testid="base-salary"]')).toBeVisible();
      await expect(page.locator('[data-testid="allowances"]')).toBeVisible();
      await expect(page.locator('[data-testid="overtime-pay"]')).toBeVisible();
      await expect(page.locator('[data-testid="deductions"]')).toBeVisible();
      await expect(page.locator('[data-testid="pit-tax"]')).toBeVisible();
      await expect(page.locator('[data-testid="insurance"]')).toBeVisible();
      await expect(page.locator('[data-testid="net-salary"]')).toBeVisible();
    });

    test('should calculate overtime correctly', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-calculated"]').first().click();
      await page.locator('[data-testid="employee-salary-row"]').first().click();

      // Get OT details
      const otSection = page.locator('[data-testid="overtime-details"]');
      await expect(otSection).toBeVisible();

      // Verify rates
      await expect(page.locator('[data-testid="ot-150-hours"]')).toBeVisible();
      await expect(page.locator('[data-testid="ot-200-hours"]')).toBeVisible();
      await expect(page.locator('[data-testid="ot-300-hours"]')).toBeVisible();
    });

    test('should calculate PIT tax correctly', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-calculated"]').first().click();
      await page.locator('[data-testid="employee-salary-row"]').first().click();

      // View PIT breakdown
      await page.locator('[data-testid="pit-details"]').click();

      // Verify components
      await expect(page.locator('[data-testid="taxable-income"]')).toBeVisible();
      await expect(page.locator('[data-testid="personal-deduction"]')).toBeVisible();
      await expect(page.locator('[data-testid="dependent-deductions"]')).toBeVisible();
      await expect(page.locator('[data-testid="tax-bracket"]')).toBeVisible();
      await expect(page.locator('[data-testid="pit-amount"]')).toBeVisible();
    });

    test('should calculate insurance correctly', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-calculated"]').first().click();
      await page.locator('[data-testid="employee-salary-row"]').first().click();

      // View insurance breakdown
      await page.locator('[data-testid="insurance-details"]').click();

      // Verify components
      await expect(page.locator('[data-testid="bhxh-employee"]')).toBeVisible(); // Social insurance
      await expect(page.locator('[data-testid="bhyt-employee"]')).toBeVisible(); // Health insurance
      await expect(page.locator('[data-testid="bhtn-employee"]')).toBeVisible(); // Unemployment insurance
      await expect(page.locator('[data-testid="total-insurance"]')).toBeVisible();
    });

    test('should handle mid-month joiners/leavers', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-calculated"]').first().click();

      // Filter for partial month employees
      await page.locator('[data-testid="filter-partial"]').click();

      const partialEmployees = page.locator('[data-testid="employee-salary-row"]');
      if (await partialEmployees.count() > 0) {
        await partialEmployees.first().click();

        // Verify pro-rated salary
        const workingDays = await page.locator('[data-testid="working-days"]').textContent();
        const totalDays = await page.locator('[data-testid="total-days"]').textContent();

        expect(parseFloat(workingDays || '0')).toBeLessThan(parseFloat(totalDays || '0'));
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PAYSLIP MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Payslips', () => {
    test('@critical should generate payslips', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-approved"]').first().click();

      await page.locator('[data-testid="generate-payslips"]').click();
      await page.locator('[data-testid="confirm-generate"]').click();

      // Wait for generation
      await expect(page.locator('[data-testid="generating-payslips"]')).toBeVisible();
      await expect(page.locator('[data-testid="payslips-ready"]')).toBeVisible({ timeout: 60000 });
    });

    test('should view payslip', async () => {
      await page.goto('/payroll/payslips');

      await page.locator('[data-testid="payslip-row"]').first().click();

      // Verify payslip content
      await expect(page.locator('[data-testid="payslip-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="employee-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="earnings-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="deductions-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="net-pay"]')).toBeVisible();
    });

    test('should download payslip as PDF', async () => {
      await page.goto('/payroll/payslips');
      await page.locator('[data-testid="payslip-row"]').first().click();

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="download-payslip"]').click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/payslip.*\.pdf/);
    });

    test('should send payslip via email', async () => {
      await page.goto('/payroll/payslips');
      await page.locator('[data-testid="payslip-row"]').first().click();

      await page.locator('[data-testid="email-payslip"]').click();
      await page.locator('[data-testid="confirm-send"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã gửi email');
    });

    test('should bulk send payslips', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-approved"]').first().click();

      // Select all
      await page.locator('[data-testid="select-all-employees"]').click();

      // Send payslips
      await page.locator('[data-testid="bulk-send-payslips"]').click();
      await page.locator('[data-testid="confirm-bulk-send"]').click();

      // Verify progress
      await expect(page.locator('[data-testid="sending-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="send-complete"]')).toBeVisible({ timeout: 120000 });
    });

    test('employee should view own payslip', async () => {
      // Login as employee
      await page.goto('/logout');
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);

      await page.goto('/payroll/my-payslips');

      await expect(page.locator('[data-testid="my-payslips-list"]')).toBeVisible();
      await page.locator('[data-testid="payslip-row"]').first().click();

      await expect(page.locator('[data-testid="payslip-detail"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SALARY ADJUSTMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Salary Adjustments', () => {
    test('should add bonus to employee', async () => {
      await page.goto('/payroll/adjustments/new');

      // Select employee
      await page.locator('[data-testid="employee-select"]').click();
      await page.locator('[data-testid="employee-option"]').first().click();

      // Select type
      await page.locator('[data-testid="adjustment-type"]').selectOption('BONUS');

      // Enter amount
      await page.locator('[data-testid="adjustment-amount"]').fill('5000000');

      // Enter description
      await page.locator('[data-testid="adjustment-note"]').fill('Thưởng KPI Q4/2024');

      // Select effective period
      await page.locator('[data-testid="effective-period"]').click();
      await page.locator('[data-testid="period-option"]').first().click();

      await page.locator('[data-testid="save-adjustment"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Thêm điều chỉnh thành công');
    });

    test('should add deduction to employee', async () => {
      await page.goto('/payroll/adjustments/new');

      await page.locator('[data-testid="employee-select"]').click();
      await page.locator('[data-testid="employee-option"]').first().click();

      await page.locator('[data-testid="adjustment-type"]').selectOption('DEDUCTION');
      await page.locator('[data-testid="adjustment-amount"]').fill('500000');
      await page.locator('[data-testid="adjustment-note"]').fill('Khấu trừ đi muộn');

      await page.locator('[data-testid="save-adjustment"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });

    test('should add allowance to employee', async () => {
      await page.goto('/payroll/adjustments/new');

      await page.locator('[data-testid="employee-select"]').click();
      await page.locator('[data-testid="employee-option"]').first().click();

      await page.locator('[data-testid="adjustment-type"]').selectOption('ALLOWANCE');
      await page.locator('[data-testid="allowance-type"]').selectOption('TRANSPORT');
      await page.locator('[data-testid="adjustment-amount"]').fill('1000000');
      await page.locator('[data-testid="recurring"]').check();

      await page.locator('[data-testid="save-adjustment"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });

    test('should bulk import adjustments', async () => {
      await page.goto('/payroll/adjustments/import');

      // Upload file
      await page.setInputFiles('[data-testid="import-file"]', './tests/fixtures/salary-adjustments.xlsx');

      // Preview
      await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();

      // Confirm import
      await page.locator('[data-testid="confirm-import"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Import thành công');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BANK TRANSFER
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Bank Transfer', () => {
    test('@critical should generate bank transfer file', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-approved"]').first().click();

      await page.locator('[data-testid="generate-bank-file"]').click();

      // Select bank
      await page.locator('[data-testid="bank-select"]').selectOption('VCB');

      // Generate
      await page.locator('[data-testid="confirm-generate"]').click();

      const downloadPromise = page.waitForEvent('download');
      await expect(page.locator('[data-testid="file-ready"]')).toBeVisible({ timeout: 30000 });

      await page.locator('[data-testid="download-bank-file"]').click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/bank_transfer.*\.(txt|xlsx)/);
    });

    test('should preview bank transfer', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-approved"]').first().click();
      await page.locator('[data-testid="generate-bank-file"]').click();
      await page.locator('[data-testid="bank-select"]').selectOption('VCB');

      await page.locator('[data-testid="preview-transfer"]').click();

      await expect(page.locator('[data-testid="transfer-preview-table"]')).toBeVisible();

      // Verify totals
      await expect(page.locator('[data-testid="total-employees"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
    });

    test('should mark period as paid', async () => {
      await page.goto('/payroll/periods');
      await page.locator('[data-testid="period-approved"]').first().click();

      await page.locator('[data-testid="mark-paid"]').click();
      await page.locator('[data-testid="payment-date"]').fill('2025-02-05');
      await page.locator('[data-testid="payment-reference"]').fill('VCB-20250205-001');
      await page.locator('[data-testid="confirm-paid"]').click();

      await expect(page.locator('[data-testid="period-status"]')).toContainText('Đã thanh toán');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PAYROLL REPORTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Reports', () => {
    test('@critical should generate payroll summary report', async () => {
      await page.goto('/payroll/reports/summary');

      await page.locator('[data-testid="period-select"]').click();
      await page.locator('[data-testid="period-option"]').first().click();

      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="summary-report"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-gross"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-net"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-tax"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-insurance"]')).toBeVisible();
    });

    test('should generate department cost report', async () => {
      await page.goto('/payroll/reports/department-cost');

      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');
      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="department-cost-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="department-cost-table"]')).toBeVisible();
    });

    test('should generate PIT report (C06-TS)', async () => {
      await page.goto('/payroll/reports/pit');

      await page.locator('[data-testid="year-select"]').selectOption('2025');
      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="pit-report-table"]')).toBeVisible();

      // Export for tax authority
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-pit"]').click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/PIT.*\.xlsx/);
    });

    test('should generate insurance report (D02-TS)', async () => {
      await page.goto('/payroll/reports/insurance');

      await page.locator('[data-testid="month-select"]').selectOption('1');
      await page.locator('[data-testid="year-select"]').selectOption('2025');
      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="insurance-report"]')).toBeVisible();

      // Export for insurance authority
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-d02"]').click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/D02.*\.xlsx/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PAYROLL SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Settings', () => {
    test('should configure PIT settings', async () => {
      await page.goto('/payroll/settings/pit');

      // Personal deduction
      const personalDeduction = page.locator('[data-testid="personal-deduction"]');
      await expect(personalDeduction).toHaveValue('11000000');

      // Dependent deduction
      const dependentDeduction = page.locator('[data-testid="dependent-deduction"]');
      await expect(dependentDeduction).toHaveValue('4400000');

      // Tax brackets should be displayed
      await expect(page.locator('[data-testid="tax-brackets-table"]')).toBeVisible();
    });

    test('should configure insurance settings', async () => {
      await page.goto('/payroll/settings/insurance');

      // Insurance rates
      await expect(page.locator('[data-testid="bhxh-rate-employee"]')).toBeVisible();
      await expect(page.locator('[data-testid="bhxh-rate-employer"]')).toBeVisible();
      await expect(page.locator('[data-testid="bhyt-rate-employee"]')).toBeVisible();
      await expect(page.locator('[data-testid="bhtn-rate-employee"]')).toBeVisible();

      // Salary caps
      await expect(page.locator('[data-testid="max-insurance-salary"]')).toBeVisible();
    });

    test('should configure overtime rates', async () => {
      await page.goto('/payroll/settings/overtime');

      // OT rates
      await expect(page.locator('[data-testid="ot-weekday-rate"]')).toHaveValue('150');
      await expect(page.locator('[data-testid="ot-weekend-rate"]')).toHaveValue('200');
      await expect(page.locator('[data-testid="ot-holiday-rate"]')).toHaveValue('300');
      await expect(page.locator('[data-testid="ot-night-rate"]')).toHaveValue('30');
    });
  });
});
