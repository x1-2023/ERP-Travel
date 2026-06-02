// tests/pages/LeavePage.ts

/**
 * LAC VIET HR - Leave Management Page Object
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface LeaveRequestFormData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  isHalfDay?: boolean;
  halfDayType?: 'MORNING' | 'AFTERNOON';
  attachments?: string[];
}

export class LeavePage extends BasePage {
  // List page
  readonly createRequestButton: Locator;
  readonly leaveTable: Locator;
  readonly statusFilter: Locator;
  readonly typeFilter: Locator;
  readonly dateRangeFilter: Locator;
  readonly leaveCalendar: Locator;
  readonly balanceCard: Locator;

  // Form
  readonly leaveTypeSelect: Locator;
  readonly startDatePicker: Locator;
  readonly endDatePicker: Locator;
  readonly reasonTextarea: Locator;
  readonly halfDayCheckbox: Locator;
  readonly halfDayTypeSelect: Locator;
  readonly attachmentUpload: Locator;
  readonly submitButton: Locator;
  readonly saveAsDraftButton: Locator;

  // Approval
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly approverCommentInput: Locator;

  constructor(page: Page) {
    super(page);

    // List page
    this.createRequestButton = page.locator('[data-testid="create-leave-request"]');
    this.leaveTable = page.locator('[data-testid="leave-table"]');
    this.statusFilter = page.locator('[data-testid="filter-leave-status"]');
    this.typeFilter = page.locator('[data-testid="filter-leave-type"]');
    this.dateRangeFilter = page.locator('[data-testid="filter-date-range"]');
    this.leaveCalendar = page.locator('[data-testid="leave-calendar"]');
    this.balanceCard = page.locator('[data-testid="leave-balance-card"]');

    // Form
    this.leaveTypeSelect = page.locator('[data-testid="field-leaveType"]');
    this.startDatePicker = page.locator('[data-testid="field-startDate"]');
    this.endDatePicker = page.locator('[data-testid="field-endDate"]');
    this.reasonTextarea = page.locator('[data-testid="field-reason"]');
    this.halfDayCheckbox = page.locator('[data-testid="field-isHalfDay"]');
    this.halfDayTypeSelect = page.locator('[data-testid="field-halfDayType"]');
    this.attachmentUpload = page.locator('[data-testid="field-attachments"]');
    this.submitButton = page.locator('[data-testid="submit-leave"]');
    this.saveAsDraftButton = page.locator('[data-testid="save-draft-leave"]');

    // Approval
    this.approveButton = page.locator('[data-testid="approve-leave"]');
    this.rejectButton = page.locator('[data-testid="reject-leave"]');
    this.approverCommentInput = page.locator('[data-testid="approver-comment"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/leave');
    await this.waitForPageLoad();
  }

  async gotoMyRequests(): Promise<void> {
    await this.page.goto('/leave/my-requests');
    await this.waitForPageLoad();
  }

  async gotoPendingApprovals(): Promise<void> {
    await this.page.goto('/leave/approvals');
    await this.waitForPageLoad();
  }

  async gotoCalendar(): Promise<void> {
    await this.page.goto('/leave/calendar');
    await this.waitForPageLoad();
  }

  async gotoCreateRequest(): Promise<void> {
    await this.page.goto('/leave/new');
    await this.waitForPageLoad();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE REQUEST ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async fillLeaveForm(data: LeaveRequestFormData): Promise<void> {
    await this.selectDropdownOption(this.leaveTypeSelect, data.leaveType);
    await this.startDatePicker.fill(data.startDate);
    await this.endDatePicker.fill(data.endDate);
    await this.fillInput(this.reasonTextarea, data.reason);

    if (data.isHalfDay) {
      await this.halfDayCheckbox.check();
      if (data.halfDayType) {
        await this.selectDropdownOption(this.halfDayTypeSelect, data.halfDayType);
      }
    }

    if (data.attachments && data.attachments.length > 0) {
      for (const file of data.attachments) {
        await this.uploadFile(this.attachmentUpload, file);
      }
    }
  }

  async createLeaveRequest(data: LeaveRequestFormData): Promise<void> {
    await this.gotoCreateRequest();
    await this.fillLeaveForm(data);
    await this.submitButton.click();
    await this.waitForLoadingComplete();
  }

  async saveLeaveAsDraft(data: LeaveRequestFormData): Promise<void> {
    await this.gotoCreateRequest();
    await this.fillLeaveForm(data);
    await this.saveAsDraftButton.click();
    await this.waitForLoadingComplete();
  }

  async cancelLeaveRequest(requestId: string): Promise<void> {
    await this.page.goto(`/leave/${requestId}`);
    await this.page.locator('[data-testid="cancel-leave"]').click();
    await this.confirmAction();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // APPROVAL ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async approveLeave(requestId: string, comment?: string): Promise<void> {
    await this.page.goto(`/leave/${requestId}`);
    
    if (comment) {
      await this.fillInput(this.approverCommentInput, comment);
    }
    
    await this.approveButton.click();
    await this.waitForLoadingComplete();
  }

  async rejectLeave(requestId: string, comment: string): Promise<void> {
    await this.page.goto(`/leave/${requestId}`);
    await this.fillInput(this.approverCommentInput, comment);
    await this.rejectButton.click();
    await this.waitForLoadingComplete();
  }

  async bulkApprove(requestIds: string[]): Promise<void> {
    await this.gotoPendingApprovals();
    
    for (const id of requestIds) {
      await this.leaveTable
        .locator(`tr[data-request-id="${id}"] input[type="checkbox"]`)
        .check();
    }
    
    await this.page.locator('[data-testid="bulk-approve"]').click();
    await this.confirmAction();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILTERS
  // ═══════════════════════════════════════════════════════════════════════════════

  async filterByStatus(status: string): Promise<void> {
    await this.selectDropdownOption(this.statusFilter, status);
    await this.waitForLoadingComplete();
  }

  async filterByType(leaveType: string): Promise<void> {
    await this.selectDropdownOption(this.typeFilter, leaveType);
    await this.waitForLoadingComplete();
  }

  async filterByDateRange(startDate: string, endDate: string): Promise<void> {
    await this.dateRangeFilter.click();
    await this.page.locator('[data-testid="range-start"]').fill(startDate);
    await this.page.locator('[data-testid="range-end"]').fill(endDate);
    await this.page.locator('[data-testid="apply-range"]').click();
    await this.waitForLoadingComplete();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // BALANCE
  // ═══════════════════════════════════════════════════════════════════════════════

  async getLeaveBalance(leaveType?: string): Promise<{ used: number; remaining: number; total: number }> {
    const selector = leaveType
      ? `[data-testid="balance-${leaveType}"]`
      : '[data-testid="balance-annual"]';
    
    const balanceCard = this.page.locator(selector);
    
    const used = await balanceCard.locator('[data-testid="balance-used"]').textContent();
    const remaining = await balanceCard.locator('[data-testid="balance-remaining"]').textContent();
    const total = await balanceCard.locator('[data-testid="balance-total"]').textContent();
    
    return {
      used: parseFloat(used || '0'),
      remaining: parseFloat(remaining || '0'),
      total: parseFloat(total || '0'),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CALENDAR
  // ═══════════════════════════════════════════════════════════════════════════════

  async clickCalendarDate(date: string): Promise<void> {
    await this.leaveCalendar.locator(`[data-date="${date}"]`).click();
  }

  async expectLeaveOnCalendar(date: string, employeeName: string): Promise<void> {
    const dayCell = this.leaveCalendar.locator(`[data-date="${date}"]`);
    await expect(dayCell).toContainText(employeeName);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async expectRequestInList(reason: string): Promise<void> {
    await expect(this.leaveTable).toContainText(reason);
  }

  async expectRequestStatus(requestId: string, status: string): Promise<void> {
    const row = this.leaveTable.locator(`tr[data-request-id="${requestId}"]`);
    await expect(row.locator('[data-testid="status-badge"]')).toContainText(status);
  }

  async expectCreateSuccess(): Promise<void> {
    await this.expectToastMessage('Tạo đơn nghỉ phép thành công', 'success');
  }

  async expectApproveSuccess(): Promise<void> {
    await this.expectToastMessage('Phê duyệt thành công', 'success');
  }

  async expectRejectSuccess(): Promise<void> {
    await this.expectToastMessage('Từ chối thành công', 'success');
  }

  async expectInsufficientBalance(): Promise<void> {
    await this.expectErrorAlert('Số ngày phép còn lại không đủ');
  }

  async expectOverlappingLeave(): Promise<void> {
    await this.expectErrorAlert('Đã có đơn nghỉ phép trong khoảng thời gian này');
  }
}
