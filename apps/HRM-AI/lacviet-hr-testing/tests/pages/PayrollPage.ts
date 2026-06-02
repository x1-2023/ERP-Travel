// tests/pages/PayrollPage.ts

/**
 * LAC VIET HR - Payroll Page Object
 * Page object for payroll management E2E tests
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PayrollAdjustment {
  employeeId?: string;
  type: 'BONUS' | 'DEDUCTION' | 'ALLOWANCE';
  allowanceType?: string;
  amount: number;
  note: string;
  recurring?: boolean;
}

export class PayrollPage extends BasePage {
  // Period elements
  readonly periodsList: Locator;
  readonly periodItem: Locator;
  readonly periodMonth: Locator;
  readonly periodYear: Locator;
  readonly periodStart: Locator;
  readonly periodEnd: Locator;
  readonly payDate: Locator;
  readonly createPeriodButton: Locator;
  readonly periodStatus: Locator;

  // Calculation elements
  readonly calculateButton: Locator;
  readonly calculationProgress: Locator;
  readonly payrollSummary: Locator;
  readonly employeeSalaryRow: Locator;

  // Salary breakdown elements
  readonly baseSalary: Locator;
  readonly allowances: Locator;
  readonly overtimePay: Locator;
  readonly deductions: Locator;
  readonly pitTax: Locator;
  readonly insurance: Locator;
  readonly netSalary: Locator;

  // Payslip elements
  readonly payslipRow: Locator;
  readonly generatePayslipsButton: Locator;
  readonly downloadPayslipButton: Locator;
  readonly emailPayslipButton: Locator;

  // Adjustment elements
  readonly adjustmentType: Locator;
  readonly adjustmentAmount: Locator;
  readonly adjustmentNote: Locator;
  readonly saveAdjustmentButton: Locator;

  // Bank transfer elements
  readonly bankSelect: Locator;
  readonly generateBankFileButton: Locator;
  readonly downloadBankFileButton: Locator;
  readonly markPaidButton: Locator;

  // Report elements
  readonly reportTable: Locator;
  readonly totalGross: Locator;
  readonly totalNet: Locator;
  readonly totalTax: Locator;

  constructor(page: Page) {
    super(page);

    // Period elements
    this.periodsList = page.locator('[data-testid="periods-list"]');
    this.periodItem = page.locator('[data-testid="period-item"]');
    this.periodMonth = page.locator('[data-testid="period-month"]');
    this.periodYear = page.locator('[data-testid="period-year"]');
    this.periodStart = page.locator('[data-testid="period-start"]');
    this.periodEnd = page.locator('[data-testid="period-end"]');
    this.payDate = page.locator('[data-testid="pay-date"]');
    this.createPeriodButton = page.locator('[data-testid="create-period"]');
    this.periodStatus = page.locator('[data-testid="period-status"]');

    // Calculation elements
    this.calculateButton = page.locator('[data-testid="calculate-payroll"]');
    this.calculationProgress = page.locator('[data-testid="calculation-progress"]');
    this.payrollSummary = page.locator('[data-testid="payroll-summary"]');
    this.employeeSalaryRow = page.locator('[data-testid="employee-salary-row"]');

    // Salary breakdown elements
    this.baseSalary = page.locator('[data-testid="base-salary"]');
    this.allowances = page.locator('[data-testid="allowances"]');
    this.overtimePay = page.locator('[data-testid="overtime-pay"]');
    this.deductions = page.locator('[data-testid="deductions"]');
    this.pitTax = page.locator('[data-testid="pit-tax"]');
    this.insurance = page.locator('[data-testid="insurance"]');
    this.netSalary = page.locator('[data-testid="net-salary"]');

    // Payslip elements
    this.payslipRow = page.locator('[data-testid="payslip-row"]');
    this.generatePayslipsButton = page.locator('[data-testid="generate-payslips"]');
    this.downloadPayslipButton = page.locator('[data-testid="download-payslip"]');
    this.emailPayslipButton = page.locator('[data-testid="email-payslip"]');

    // Adjustment elements
    this.adjustmentType = page.locator('[data-testid="adjustment-type"]');
    this.adjustmentAmount = page.locator('[data-testid="adjustment-amount"]');
    this.adjustmentNote = page.locator('[data-testid="adjustment-note"]');
    this.saveAdjustmentButton = page.locator('[data-testid="save-adjustment"]');

    // Bank transfer elements
    this.bankSelect = page.locator('[data-testid="bank-select"]');
    this.generateBankFileButton = page.locator('[data-testid="generate-bank-file"]');
    this.downloadBankFileButton = page.locator('[data-testid="download-bank-file"]');
    this.markPaidButton = page.locator('[data-testid="mark-paid"]');

    // Report elements
    this.reportTable = page.locator('[data-testid="report-table"]');
    this.totalGross = page.locator('[data-testid="total-gross"]');
    this.totalNet = page.locator('[data-testid="total-net"]');
    this.totalTax = page.locator('[data-testid="total-tax"]');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/payroll');
    await this.waitForPageLoad();
  }

  async gotoPeriods(): Promise<void> {
    await this.page.goto('/payroll/periods');
    await this.waitForPageLoad();
  }

  async gotoNewPeriod(): Promise<void> {
    await this.page.goto('/payroll/periods/new');
    await this.waitForPageLoad();
  }

  async gotoPayslips(): Promise<void> {
    await this.page.goto('/payroll/payslips');
    await this.waitForPageLoad();
  }

  async gotoMyPayslips(): Promise<void> {
    await this.page.goto('/payroll/my-payslips');
    await this.waitForPageLoad();
  }

  async gotoAdjustments(): Promise<void> {
    await this.page.goto('/payroll/adjustments');
    await this.waitForPageLoad();
  }

  async gotoNewAdjustment(): Promise<void> {
    await this.page.goto('/payroll/adjustments/new');
    await this.waitForPageLoad();
  }

  async gotoReports(): Promise<void> {
    await this.page.goto('/payroll/reports/summary');
    await this.waitForPageLoad();
  }

  async gotoSettings(): Promise<void> {
    await this.page.goto('/payroll/settings');
    await this.waitForPageLoad();
  }

  // Period actions
  async createPeriod(data: {
    month: string;
    year: string;
    startDate: string;
    endDate: string;
    payDate: string;
  }): Promise<void> {
    await this.gotoNewPeriod();
    await this.periodMonth.selectOption(data.month);
    await this.periodYear.selectOption(data.year);
    await this.fillInput(this.periodStart, data.startDate);
    await this.fillInput(this.periodEnd, data.endDate);
    await this.fillInput(this.payDate, data.payDate);
    await this.createPeriodButton.click();
    await this.waitForLoadingComplete();
  }

  async selectPeriod(index: number = 0): Promise<void> {
    await this.periodItem.nth(index).click();
    await this.waitForLoadingComplete();
  }

  async selectPeriodByStatus(status: 'draft' | 'calculated' | 'approved' | 'paid'): Promise<void> {
    await this.page.locator(`[data-testid="period-${status}"]`).first().click();
    await this.waitForLoadingComplete();
  }

  // Calculation actions
  async calculatePayroll(): Promise<void> {
    await this.calculateButton.click();
    await this.page.locator('[data-testid="confirm-calculate"]').click();
    await expect(this.calculationProgress).toBeVisible();
    await expect(this.page.locator('[data-testid="calculation-complete"]')).toBeVisible({
      timeout: 120000,
    });
  }

  async viewEmployeeSalaryDetail(index: number = 0): Promise<void> {
    await this.employeeSalaryRow.nth(index).click();
    await this.waitForLoadingComplete();
  }

  // Payslip actions
  async generatePayslips(): Promise<void> {
    await this.generatePayslipsButton.click();
    await this.page.locator('[data-testid="confirm-generate"]').click();
    await expect(this.page.locator('[data-testid="generating-payslips"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="payslips-ready"]')).toBeVisible({
      timeout: 60000,
    });
  }

  async viewPayslip(index: number = 0): Promise<void> {
    await this.payslipRow.nth(index).click();
    await this.waitForLoadingComplete();
  }

  async downloadPayslip(): Promise<void> {
    await this.downloadPayslipButton.click();
  }

  async emailPayslip(): Promise<void> {
    await this.emailPayslipButton.click();
    await this.page.locator('[data-testid="confirm-send"]').click();
    await this.waitForLoadingComplete();
  }

  async bulkSendPayslips(): Promise<void> {
    await this.page.locator('[data-testid="select-all-employees"]').click();
    await this.page.locator('[data-testid="bulk-send-payslips"]').click();
    await this.page.locator('[data-testid="confirm-bulk-send"]').click();
    await expect(this.page.locator('[data-testid="sending-progress"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="send-complete"]')).toBeVisible({
      timeout: 120000,
    });
  }

  // Adjustment actions
  async addAdjustment(data: PayrollAdjustment): Promise<void> {
    await this.gotoNewAdjustment();

    if (data.employeeId) {
      await this.page.locator('[data-testid="employee-select"]').click();
      await this.page.locator(`[data-testid="employee-${data.employeeId}"]`).click();
    } else {
      await this.page.locator('[data-testid="employee-select"]').click();
      await this.page.locator('[data-testid="employee-option"]').first().click();
    }

    await this.adjustmentType.selectOption(data.type);

    if (data.type === 'ALLOWANCE' && data.allowanceType) {
      await this.page.locator('[data-testid="allowance-type"]').selectOption(data.allowanceType);
    }

    await this.fillInput(this.adjustmentAmount, data.amount.toString());
    await this.fillInput(this.adjustmentNote, data.note);

    if (data.recurring) {
      await this.page.locator('[data-testid="recurring"]').check();
    }

    await this.saveAdjustmentButton.click();
    await this.waitForLoadingComplete();
  }

  // Bank transfer actions
  async generateBankFile(bank: string): Promise<void> {
    await this.generateBankFileButton.click();
    await this.bankSelect.selectOption(bank);
    await this.page.locator('[data-testid="confirm-generate"]').click();
    await expect(this.page.locator('[data-testid="file-ready"]')).toBeVisible({
      timeout: 30000,
    });
  }

  async downloadBankFile(): Promise<void> {
    await this.downloadBankFileButton.click();
  }

  async markPeriodAsPaid(paymentDate: string, reference: string): Promise<void> {
    await this.markPaidButton.click();
    await this.fillInput(this.page.locator('[data-testid="payment-date"]'), paymentDate);
    await this.fillInput(this.page.locator('[data-testid="payment-reference"]'), reference);
    await this.page.locator('[data-testid="confirm-paid"]').click();
    await this.waitForLoadingComplete();
  }

  // Report actions
  async generateReport(periodId: string): Promise<void> {
    await this.page.locator('[data-testid="period-select"]').click();
    await this.page.locator(`[data-testid="period-${periodId}"]`).click();
    await this.page.locator('[data-testid="generate-report"]').click();
    await this.waitForLoadingComplete();
  }

  async exportReport(format: 'excel' | 'pdf'): Promise<void> {
    await this.page.locator(`[data-testid="export-${format}"]`).click();
  }

  // Assertions
  async expectPeriodCreated(): Promise<void> {
    await this.expectToastMessage('Tạo kỳ lương thành công', 'success');
  }

  async expectCalculationComplete(): Promise<void> {
    await expect(this.page.locator('[data-testid="calculation-complete"]')).toBeVisible();
    await expect(this.payrollSummary).toBeVisible();
  }

  async expectPayslipVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="payslip-header"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="earnings-section"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="deductions-section"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="net-pay"]')).toBeVisible();
  }

  async expectAdjustmentSaved(): Promise<void> {
    await this.expectToastMessage('Thêm điều chỉnh thành công', 'success');
  }

  async expectPeriodPaid(): Promise<void> {
    await expect(this.periodStatus).toContainText('Đã thanh toán');
  }

  // Getters
  async getBaseSalary(): Promise<number> {
    const text = await this.baseSalary.textContent();
    return this.parseMoneyValue(text || '0');
  }

  async getNetSalary(): Promise<number> {
    const text = await this.netSalary.textContent();
    return this.parseMoneyValue(text || '0');
  }

  async getTotalGross(): Promise<number> {
    const text = await this.totalGross.textContent();
    return this.parseMoneyValue(text || '0');
  }

  async getTotalNet(): Promise<number> {
    const text = await this.totalNet.textContent();
    return this.parseMoneyValue(text || '0');
  }

  async getPeriodStatus(): Promise<string> {
    return await this.periodStatus.textContent() || '';
  }

  async getEmployeeCount(): Promise<number> {
    return await this.employeeSalaryRow.count();
  }

  private parseMoneyValue(text: string): number {
    // Remove currency symbols and formatting
    const numericString = text.replace(/[^0-9.-]/g, '');
    return parseFloat(numericString) || 0;
  }
}
