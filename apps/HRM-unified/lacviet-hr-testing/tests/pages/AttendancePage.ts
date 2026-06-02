// tests/pages/AttendancePage.ts

/**
 * LAC VIET HR - Attendance Page Object
 * Page object for attendance management E2E tests
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AttendancePage extends BasePage {
  // Main elements
  readonly checkInButton: Locator;
  readonly checkOutButton: Locator;
  readonly checkInTime: Locator;
  readonly checkOutTime: Locator;
  readonly attendanceStatus: Locator;

  // Timesheet elements
  readonly timesheetGrid: Locator;
  readonly timesheetCalendar: Locator;
  readonly weekSelector: Locator;
  readonly totalHours: Locator;
  readonly regularHours: Locator;
  readonly overtimeHours: Locator;

  // Overtime elements
  readonly otForm: Locator;
  readonly otDateInput: Locator;
  readonly otStartTime: Locator;
  readonly otEndTime: Locator;
  readonly otReason: Locator;
  readonly submitOtButton: Locator;

  // Shift elements
  readonly shiftSchedule: Locator;
  readonly shiftSelect: Locator;
  readonly employeeSelect: Locator;

  // Report elements
  readonly reportTable: Locator;
  readonly dateFromInput: Locator;
  readonly dateToInput: Locator;
  readonly generateReportButton: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);

    // Main elements
    this.checkInButton = page.locator('[data-testid="check-in-button"]');
    this.checkOutButton = page.locator('[data-testid="check-out-button"]');
    this.checkInTime = page.locator('[data-testid="check-in-time"]');
    this.checkOutTime = page.locator('[data-testid="check-out-time"]');
    this.attendanceStatus = page.locator('[data-testid="attendance-status"]');

    // Timesheet elements
    this.timesheetGrid = page.locator('[data-testid="timesheet-grid"]');
    this.timesheetCalendar = page.locator('[data-testid="timesheet-calendar"]');
    this.weekSelector = page.locator('[data-testid="week-selector"]');
    this.totalHours = page.locator('[data-testid="total-hours"]');
    this.regularHours = page.locator('[data-testid="regular-hours"]');
    this.overtimeHours = page.locator('[data-testid="overtime-hours"]');

    // Overtime elements
    this.otForm = page.locator('[data-testid="ot-form"]');
    this.otDateInput = page.locator('[data-testid="ot-date"]');
    this.otStartTime = page.locator('[data-testid="ot-start-time"]');
    this.otEndTime = page.locator('[data-testid="ot-end-time"]');
    this.otReason = page.locator('[data-testid="ot-reason"]');
    this.submitOtButton = page.locator('[data-testid="submit-ot"]');

    // Shift elements
    this.shiftSchedule = page.locator('[data-testid="shift-schedule"]');
    this.shiftSelect = page.locator('[data-testid="shift-select"]');
    this.employeeSelect = page.locator('[data-testid="employee-select"]');

    // Report elements
    this.reportTable = page.locator('[data-testid="report-table"]');
    this.dateFromInput = page.locator('[data-testid="date-from"]');
    this.dateToInput = page.locator('[data-testid="date-to"]');
    this.generateReportButton = page.locator('[data-testid="generate-report"]');
    this.exportButton = page.locator('[data-testid="export-report"]');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/attendance');
    await this.waitForPageLoad();
  }

  async gotoTimesheet(): Promise<void> {
    await this.page.goto('/attendance/timesheet');
    await this.waitForPageLoad();
  }

  async gotoOvertime(): Promise<void> {
    await this.page.goto('/attendance/overtime');
    await this.waitForPageLoad();
  }

  async gotoOvertimeNew(): Promise<void> {
    await this.page.goto('/attendance/overtime/new');
    await this.waitForPageLoad();
  }

  async gotoShifts(): Promise<void> {
    await this.page.goto('/attendance/shifts');
    await this.waitForPageLoad();
  }

  async gotoReports(): Promise<void> {
    await this.page.goto('/attendance/reports/summary');
    await this.waitForPageLoad();
  }

  // Check-in/out actions
  async checkIn(): Promise<void> {
    await this.checkInButton.click();
    await this.waitForLoadingComplete();
  }

  async checkOut(): Promise<void> {
    await this.checkOutButton.click();
    await this.waitForLoadingComplete();
  }

  async checkInWithPhoto(): Promise<void> {
    await this.page.locator('[data-testid="check-in-photo"]').click();
    await expect(this.page.locator('[data-testid="camera-modal"]')).toBeVisible();
    await this.page.locator('[data-testid="capture-photo"]').click();
    await this.page.locator('[data-testid="confirm-check-in"]').click();
    await this.waitForLoadingComplete();
  }

  // Timesheet actions
  async navigateToPreviousWeek(): Promise<void> {
    await this.page.locator('[data-testid="prev-week"]').click();
    await this.waitForLoadingComplete();
  }

  async navigateToNextWeek(): Promise<void> {
    await this.page.locator('[data-testid="next-week"]').click();
    await this.waitForLoadingComplete();
  }

  async selectWeek(weekNumber: number): Promise<void> {
    await this.weekSelector.click();
    await this.page.locator(`[data-testid="week-option-${weekNumber}"]`).click();
    await this.waitForLoadingComplete();
  }

  async exportTimesheet(): Promise<void> {
    await this.page.locator('[data-testid="export-timesheet"]').click();
  }

  // Overtime actions
  async createOvertimeRequest(data: {
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
  }): Promise<void> {
    await this.gotoOvertimeNew();
    await this.fillInput(this.otDateInput, data.date);
    await this.fillInput(this.otStartTime, data.startTime);
    await this.fillInput(this.otEndTime, data.endTime);
    await this.fillInput(this.otReason, data.reason);
    await this.submitOtButton.click();
    await this.waitForLoadingComplete();
  }

  async approveOvertime(): Promise<void> {
    await this.page.locator('[data-testid="ot-approve"]').first().click();
    await this.page.locator('[data-testid="confirm-approve"]').click();
    await this.waitForLoadingComplete();
  }

  async rejectOvertime(reason: string): Promise<void> {
    await this.page.locator('[data-testid="ot-reject"]').first().click();
    await this.fillInput(this.page.locator('[data-testid="reject-reason"]'), reason);
    await this.page.locator('[data-testid="confirm-reject"]').click();
    await this.waitForLoadingComplete();
  }

  // Shift actions
  async createShift(data: {
    name: string;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }): Promise<void> {
    await this.page.goto('/attendance/shifts/new');
    await this.fillInput(this.page.locator('[data-testid="shift-name"]'), data.name);
    await this.fillInput(this.page.locator('[data-testid="shift-start"]'), data.startTime);
    await this.fillInput(this.page.locator('[data-testid="shift-end"]'), data.endTime);

    if (data.breakStart && data.breakEnd) {
      await this.fillInput(this.page.locator('[data-testid="shift-break-start"]'), data.breakStart);
      await this.fillInput(this.page.locator('[data-testid="shift-break-end"]'), data.breakEnd);
    }

    await this.page.locator('[data-testid="save-shift"]').click();
    await this.waitForLoadingComplete();
  }

  async assignShiftToEmployee(employeeId: string, shiftId: string, dateRange: {
    from: string;
    to: string;
  }): Promise<void> {
    await this.page.goto('/attendance/shifts/assign');
    await this.employeeSelect.click();
    await this.page.locator(`[data-testid="employee-${employeeId}"]`).click();
    await this.shiftSelect.click();
    await this.page.locator(`[data-testid="shift-${shiftId}"]`).click();
    await this.fillInput(this.page.locator('[data-testid="date-from"]'), dateRange.from);
    await this.fillInput(this.page.locator('[data-testid="date-to"]'), dateRange.to);
    await this.page.locator('[data-testid="assign-shift"]').click();
    await this.waitForLoadingComplete();
  }

  // Report actions
  async generateReport(dateFrom: string, dateTo: string): Promise<void> {
    await this.fillInput(this.dateFromInput, dateFrom);
    await this.fillInput(this.dateToInput, dateTo);
    await this.generateReportButton.click();
    await this.waitForLoadingComplete();
  }

  async filterByDepartment(department: string): Promise<void> {
    await this.page.locator('[data-testid="department-filter"]').click();
    await this.page.locator(`[data-testid="dept-${department}"]`).click();
    await this.waitForLoadingComplete();
  }

  // Assertions
  async expectCheckInSuccess(): Promise<void> {
    await expect(this.checkInTime).toBeVisible();
    await expect(this.attendanceStatus).toContainText('Đã vào ca');
  }

  async expectCheckOutSuccess(): Promise<void> {
    await expect(this.checkOutTime).toBeVisible();
    await expect(this.attendanceStatus).toContainText('Đã ra ca');
  }

  async expectLateWarning(): Promise<void> {
    await expect(this.page.locator('[data-testid="late-warning"]')).toBeVisible();
  }

  async expectOvertimeRequestSuccess(): Promise<void> {
    await this.expectToastMessage('Đã gửi yêu cầu OT', 'success');
  }

  async expectShiftCreated(): Promise<void> {
    await this.expectToastMessage('Tạo ca làm việc thành công', 'success');
  }

  async expectReportGenerated(): Promise<void> {
    await expect(this.reportTable).toBeVisible();
  }

  // Getters
  async getTotalHours(): Promise<number> {
    const text = await this.totalHours.textContent();
    return parseFloat(text || '0');
  }

  async getRegularHours(): Promise<number> {
    const text = await this.regularHours.textContent();
    return parseFloat(text || '0');
  }

  async getOvertimeHours(): Promise<number> {
    const text = await this.overtimeHours.textContent();
    return parseFloat(text || '0');
  }

  async getWeekStartDate(): Promise<string> {
    return await this.page.locator('[data-testid="week-start"]').textContent() || '';
  }

  async getAttendanceStatus(): Promise<string> {
    return await this.attendanceStatus.textContent() || '';
  }
}
