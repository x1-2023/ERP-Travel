// tests/e2e/pages/leave.page.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * LAC VIET HR - Leave Management Page Object Model
 * Handles leave requests, approvals, and balance management
 */

export class LeavePage {
  readonly page: Page;

  // ════════════════════════════════════════════════════════════════════════════
  // LOCATORS - Main Page
  // ════════════════════════════════════════════════════════════════════════════

  // Header
  readonly pageTitle: Locator;
  readonly requestLeaveButton: Locator;

  // Balance Cards
  readonly balanceCards: Locator;
  readonly annualLeaveBalance: Locator;
  readonly sickLeaveBalance: Locator;
  readonly unpaidLeaveBalance: Locator;

  // Tabs
  readonly pendingTab: Locator;
  readonly approvedTab: Locator;
  readonly rejectedTab: Locator;
  readonly allTab: Locator;

  // Leave List
  readonly leaveList: Locator;
  readonly leaveItems: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;

  // Filters
  readonly yearFilter: Locator;
  readonly typeFilter: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.pageTitle = page.locator('h1, [data-testid="page-title"]');
    this.requestLeaveButton = page.locator('[data-testid="request-leave-button"], button:has-text("Yêu cầu nghỉ phép")');

    // Balance Cards
    this.balanceCards = page.locator('[data-testid="leave-balance-cards"]');
    this.annualLeaveBalance = page.locator('[data-testid="annual-leave-balance"], [data-type="ANNUAL"]');
    this.sickLeaveBalance = page.locator('[data-testid="sick-leave-balance"], [data-type="SICK"]');
    this.unpaidLeaveBalance = page.locator('[data-testid="unpaid-leave-balance"], [data-type="UNPAID"]');

    // Tabs
    this.pendingTab = page.locator('[data-testid="pending-tab"], [role="tab"]:has-text("Chờ duyệt")');
    this.approvedTab = page.locator('[data-testid="approved-tab"], [role="tab"]:has-text("Đã duyệt")');
    this.rejectedTab = page.locator('[data-testid="rejected-tab"], [role="tab"]:has-text("Từ chối")');
    this.allTab = page.locator('[data-testid="all-tab"], [role="tab"]:has-text("Tất cả")');

    // Leave List
    this.leaveList = page.locator('[data-testid="leave-list"]');
    this.leaveItems = page.locator('[data-testid="leave-item"], .leave-item');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.loadingState = page.locator('[data-testid="loading"]');

    // Filters
    this.yearFilter = page.locator('[data-testid="year-filter"]');
    this.typeFilter = page.locator('[data-testid="type-filter"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════════════════════

  async goto() {
    await this.page.goto('/leave');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoMyRequests() {
    await this.page.goto('/leave/my-requests');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoApprovals() {
    await this.page.goto('/leave/approvals');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCalendar() {
    await this.page.goto('/leave/calendar');
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BALANCE OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async getLeaveBalance(type: 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'WEDDING'): Promise<{
    entitled: number;
    used: number;
    balance: number;
  }> {
    const card = this.page.locator(`[data-type="${type}"]`);

    const entitled = await card.locator('[data-testid="entitled"]').textContent();
    const used = await card.locator('[data-testid="used"]').textContent();
    const balance = await card.locator('[data-testid="balance"]').textContent();

    return {
      entitled: parseFloat(entitled || '0'),
      used: parseFloat(used || '0'),
      balance: parseFloat(balance || '0'),
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // TAB OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async switchToPending() {
    await this.pendingTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToApproved() {
    await this.approvedTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToRejected() {
    await this.rejectedTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToAll() {
    await this.allTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REQUEST OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async openRequestForm() {
    await this.requestLeaveButton.click();
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
  }

  async getLeaveItemCount(): Promise<number> {
    return await this.leaveItems.count();
  }

  async getLeaveItem(index: number): Promise<Locator> {
    return this.leaveItems.nth(index);
  }

  async cancelLeaveRequest(index: number) {
    const item = this.leaveItems.nth(index);
    await item.locator('button:has-text("Hủy")').click();
    await this.page.locator('button:has-text("Xác nhận")').click();
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FILTER OPERATIONS
  // ════════════════════════════════════════════════════════════════════════════

  async filterByYear(year: number) {
    await this.yearFilter.click();
    await this.page.locator(`[data-value="${year}"]`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByType(type: string) {
    await this.typeFilter.click();
    await this.page.locator(`[data-value="${type}"]`).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ════════════════════════════════════════════════════════════════════════════

  async expectPageVisible() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.requestLeaveButton).toBeVisible();
  }

  async expectBalanceCardsVisible() {
    await expect(this.balanceCards).toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectLeaveItemCount(count: number) {
    await expect(this.leaveItems).toHaveCount(count);
  }

  async expectLeaveInList(dates: { startDate: string; endDate: string }) {
    await expect(this.page.locator(`text=${dates.startDate}`)).toBeVisible();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// LEAVE REQUEST DIALOG
// ════════════════════════════════════════════════════════════════════════════════

export class LeaveRequestDialog {
  readonly page: Page;

  readonly dialog: Locator;
  readonly title: Locator;

  // Form fields
  readonly leaveTypeSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly halfDayCheckbox: Locator;
  readonly reasonInput: Locator;
  readonly attachmentInput: Locator;

  // Summary
  readonly totalDays: Locator;
  readonly remainingBalance: Locator;

  // Actions
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly warningMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.locator('[role="dialog"]');
    this.title = this.dialog.locator('h2, [data-testid="dialog-title"]');

    // Form fields
    this.leaveTypeSelect = this.dialog.locator('[data-testid="leave-type-select"], [name="leaveType"]');
    this.startDateInput = this.dialog.locator('[data-testid="start-date-input"], [name="startDate"]');
    this.endDateInput = this.dialog.locator('[data-testid="end-date-input"], [name="endDate"]');
    this.halfDayCheckbox = this.dialog.locator('[data-testid="half-day-checkbox"], [name="isHalfDay"]');
    this.reasonInput = this.dialog.locator('[data-testid="reason-input"], [name="reason"], textarea');
    this.attachmentInput = this.dialog.locator('[data-testid="attachment-input"], input[type="file"]');

    // Summary
    this.totalDays = this.dialog.locator('[data-testid="total-days"]');
    this.remainingBalance = this.dialog.locator('[data-testid="remaining-balance"]');

    // Actions
    this.submitButton = this.dialog.locator('button:has-text("Gửi yêu cầu"), [data-testid="submit-button"]');
    this.cancelButton = this.dialog.locator('button:has-text("Hủy"), [data-testid="cancel-button"]');

    // Messages
    this.errorMessage = this.dialog.locator('[data-testid="error-message"], .error-message');
    this.warningMessage = this.dialog.locator('[data-testid="warning-message"], .warning-message');
  }

  async fillForm(data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
  }) {
    // Select leave type
    await this.leaveTypeSelect.click();
    await this.page.locator(`[role="option"]:has-text("${data.leaveType}")`).click();

    // Fill dates
    await this.startDateInput.fill(data.startDate);
    await this.endDateInput.fill(data.endDate);

    // Half day option
    if (data.isHalfDay) {
      await this.halfDayCheckbox.check();
    }

    // Fill reason
    await this.reasonInput.fill(data.reason);
  }

  async selectLeaveType(type: string) {
    await this.leaveTypeSelect.click();
    await this.page.locator(`[role="option"]:has-text("${type}")`).click();
  }

  async setDateRange(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
  }

  async attachFile(filePath: string) {
    await this.attachmentInput.setInputFiles(filePath);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  async getTotalDays(): Promise<number> {
    const text = await this.totalDays.textContent();
    return parseFloat(text || '0');
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async expectNotVisible() {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectErrorMessage(message: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }

  async expectWarningMessage(message: string | RegExp) {
    await expect(this.warningMessage).toBeVisible();
    await expect(this.warningMessage).toHaveText(message);
  }

  async expectTotalDays(days: number) {
    await expect(this.totalDays).toContainText(days.toString());
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// LEAVE APPROVAL PAGE (Manager)
// ════════════════════════════════════════════════════════════════════════════════

export class LeaveApprovalPage {
  readonly page: Page;

  readonly pageTitle: Locator;
  readonly pendingRequests: Locator;
  readonly requestItems: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageTitle = page.locator('h1, [data-testid="page-title"]');
    this.pendingRequests = page.locator('[data-testid="pending-requests"]');
    this.requestItems = page.locator('[data-testid="request-item"]');
    this.emptyState = page.locator('[data-testid="empty-state"]');
  }

  async goto() {
    await this.page.goto('/approvals');
    await this.page.waitForLoadState('networkidle');
  }

  async getPendingCount(): Promise<number> {
    return await this.requestItems.count();
  }

  async approveRequest(index: number, comment?: string) {
    const item = this.requestItems.nth(index);
    await item.click();

    await this.page.locator('button:has-text("Phê duyệt")').click();

    if (comment) {
      await this.page.locator('[data-testid="comment-input"], textarea').fill(comment);
    }

    await this.page.locator('button:has-text("Xác nhận")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async rejectRequest(index: number, reason: string) {
    const item = this.requestItems.nth(index);
    await item.click();

    await this.page.locator('button:has-text("Từ chối")').click();
    await this.page.locator('[data-testid="rejection-reason"], textarea').fill(reason);
    await this.page.locator('button:has-text("Xác nhận")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectPendingCount(count: number) {
    await expect(this.requestItems).toHaveCount(count);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }
}
