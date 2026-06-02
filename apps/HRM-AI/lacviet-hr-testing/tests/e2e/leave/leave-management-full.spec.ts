// tests/e2e/leave/leave-management.spec.ts

/**
 * LAC VIET HR - Leave Management E2E Tests
 * Comprehensive testing of leave requests, approvals, and balances
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { LeavePage } from '../../pages/LeavePage';
import { testUsers, generateLeaveRequestData, leaveTypes } from '../../fixtures/test-data';

test.describe('Leave Management', () => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE REQUESTS (Employee)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Requests', () => {
    let leavePage: LeavePage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);
      await loginPage.expectLoginSuccess();
      
      leavePage = new LeavePage(page);
    });

    test('should display leave balance', async ({ page }) => {
      await leavePage.goto();
      
      const balance = await leavePage.getLeaveBalance();
      expect(balance.total).toBeGreaterThan(0);
      expect(balance.remaining).toBeGreaterThanOrEqual(0);
      expect(balance.used).toBeGreaterThanOrEqual(0);
    });

    test('should create annual leave request', async () => {
      const leaveData = {
        leaveType: leaveTypes.annual.name,
        startDate: '2025-02-15',
        endDate: '2025-02-17',
        reason: 'Nghỉ phép gia đình',
        isHalfDay: false,
      };
      
      await leavePage.createLeaveRequest(leaveData);
      await leavePage.expectCreateSuccess();
      
      // Verify in my requests
      await leavePage.gotoMyRequests();
      await leavePage.expectRequestInList(leaveData.reason);
    });

    test('should create half-day leave request', async () => {
      const leaveData = {
        leaveType: leaveTypes.annual.name,
        startDate: '2025-02-20',
        endDate: '2025-02-20',
        reason: 'Nghỉ nửa ngày buổi sáng',
        isHalfDay: true,
        halfDayType: 'MORNING' as const,
      };
      
      await leavePage.createLeaveRequest(leaveData);
      await leavePage.expectCreateSuccess();
    });

    test('should save leave as draft', async () => {
      const leaveData = generateLeaveRequestData();
      
      await leavePage.saveLeaveAsDraft(leaveData);
      await leavePage.expectToastMessage('Lưu bản nháp thành công', 'success');
      
      // Verify in drafts
      await leavePage.gotoMyRequests();
      await leavePage.filterByStatus('DRAFT');
      await leavePage.expectRequestInList(leaveData.reason);
    });

    test('should show error for insufficient balance', async ({ page }) => {
      await leavePage.gotoCreateRequest();
      
      // Try to request more days than available
      await leavePage.fillLeaveForm({
        leaveType: leaveTypes.annual.name,
        startDate: '2025-03-01',
        endDate: '2025-03-31', // 31 days - likely more than balance
        reason: 'Long vacation',
      });
      
      await leavePage.submitButton.click();
      await leavePage.expectInsufficientBalance();
    });

    test('should show error for overlapping leave', async () => {
      // First create a leave request
      const leaveData = {
        leaveType: leaveTypes.annual.name,
        startDate: '2025-04-01',
        endDate: '2025-04-03',
        reason: 'First request',
      };
      await leavePage.createLeaveRequest(leaveData);
      
      // Try to create overlapping request
      const overlappingData = {
        leaveType: leaveTypes.annual.name,
        startDate: '2025-04-02',
        endDate: '2025-04-04',
        reason: 'Overlapping request',
      };
      
      await leavePage.gotoCreateRequest();
      await leavePage.fillLeaveForm(overlappingData);
      await leavePage.submitButton.click();
      
      await leavePage.expectOverlappingLeave();
    });

    test('should cancel pending leave request', async () => {
      // Create a request first
      const leaveData = generateLeaveRequestData();
      await leavePage.createLeaveRequest(leaveData);
      await leavePage.expectCreateSuccess();
      
      // Find and cancel it
      await leavePage.gotoMyRequests();
      await leavePage.filterByStatus('PENDING');
      
      const requestRow = leavePage.page.locator('[data-testid="leave-table"] tbody tr').first();
      const requestId = await requestRow.getAttribute('data-request-id');
      
      if (requestId) {
        await leavePage.cancelLeaveRequest(requestId);
        await leavePage.expectToastMessage('Hủy đơn thành công', 'success');
      }
    });

    test('should upload supporting document', async ({ page }) => {
      await leavePage.gotoCreateRequest();
      
      await leavePage.leaveTypeSelect.click();
      await page.locator('[role="option"]:has-text("Nghỉ ốm")').click();
      
      await leavePage.startDatePicker.fill('2025-02-25');
      await leavePage.endDatePicker.fill('2025-02-26');
      await leavePage.fillInput(leavePage.reasonTextarea, 'Sick leave');
      
      // Upload medical certificate
      await leavePage.attachmentUpload.setInputFiles('./tests/fixtures/medical-cert.pdf');
      
      await expect(page.locator('[data-testid="attachment-preview"]')).toBeVisible();
    });

    test('should view leave history', async ({ page }) => {
      await leavePage.gotoMyRequests();
      
      // Filter by approved
      await leavePage.filterByStatus('APPROVED');
      
      const approvedRequests = page.locator('[data-testid="leave-table"] tbody tr');
      const count = await approvedRequests.count();
      
      if (count > 0) {
        await approvedRequests.first().click();
        await expect(page.locator('[data-testid="leave-detail"]')).toBeVisible();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE APPROVALS (Manager)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Approvals', () => {
    let leavePage: LeavePage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);
      await loginPage.expectLoginSuccess();
      
      leavePage = new LeavePage(page);
    });

    test('should display pending approvals', async ({ page }) => {
      await leavePage.gotoPendingApprovals();
      
      await expect(page.locator('[data-testid="pending-approvals-table"]')).toBeVisible();
    });

    test('should approve leave request', async ({ page }) => {
      await leavePage.gotoPendingApprovals();
      
      const pendingRequest = page.locator('[data-testid="pending-row"]').first();
      
      if (await pendingRequest.isVisible()) {
        const requestId = await pendingRequest.getAttribute('data-request-id');
        
        if (requestId) {
          await leavePage.approveLeave(requestId, 'Approved. Enjoy your time off!');
          await leavePage.expectApproveSuccess();
        }
      }
    });

    test('should reject leave request with reason', async ({ page }) => {
      await leavePage.gotoPendingApprovals();
      
      const pendingRequest = page.locator('[data-testid="pending-row"]').first();
      
      if (await pendingRequest.isVisible()) {
        const requestId = await pendingRequest.getAttribute('data-request-id');
        
        if (requestId) {
          await leavePage.rejectLeave(requestId, 'Dự án đang trong giai đoạn quan trọng, vui lòng chọn thời điểm khác.');
          await leavePage.expectRejectSuccess();
        }
      }
    });

    test('should bulk approve multiple requests', async ({ page }) => {
      await leavePage.gotoPendingApprovals();
      
      const pendingRows = page.locator('[data-testid="pending-row"]');
      const count = await pendingRows.count();
      
      if (count >= 2) {
        const requestIds: string[] = [];
        
        for (let i = 0; i < 2; i++) {
          const id = await pendingRows.nth(i).getAttribute('data-request-id');
          if (id) requestIds.push(id);
        }
        
        await leavePage.bulkApprove(requestIds);
        await leavePage.expectToastMessage('Phê duyệt thành công 2 đơn', 'success');
      }
    });

    test('should view team leave calendar', async ({ page }) => {
      await leavePage.gotoCalendar();
      
      await expect(page.locator('[data-testid="leave-calendar"]')).toBeVisible();
      
      // Check for team filter
      await expect(page.locator('[data-testid="team-filter"]')).toBeVisible();
    });

    test('should filter approvals by date range', async ({ page }) => {
      await leavePage.gotoPendingApprovals();
      
      await leavePage.filterByDateRange('2025-02-01', '2025-02-28');
      
      // Verify results are within date range (visual check)
      await page.waitForLoadState('networkidle');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE POLICIES (HR Admin)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Policies', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.hrManager.email, testUsers.hrManager.password);
      await loginPage.expectLoginSuccess();
    });

    test('should display leave types', async ({ page }) => {
      await page.goto('/leave/settings/types');
      
      await expect(page.locator('[data-testid="leave-types-table"]')).toBeVisible();
    });

    test('should create custom leave type', async ({ page }) => {
      await page.goto('/leave/settings/types/new');
      
      await page.locator('[data-testid="field-name"]').fill('Work From Home');
      await page.locator('[data-testid="field-code"]').fill('WFH');
      await page.locator('[data-testid="field-max-days"]').fill('30');
      await page.locator('[data-testid="field-paid"]').check();
      await page.locator('[data-testid="field-carry-over"]').check();
      await page.locator('[data-testid="field-requires-approval"]').check();
      
      await page.locator('[data-testid="save-leave-type"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Tạo loại nghỉ phép thành công');
    });

    test('should configure leave accrual', async ({ page }) => {
      await page.goto('/leave/settings/accrual');
      
      await page.locator('[data-testid="accrual-type"]').selectOption('MONTHLY');
      await page.locator('[data-testid="accrual-rate"]').fill('1');
      await page.locator('[data-testid="max-carryover"]').fill('5');
      
      await page.locator('[data-testid="save-accrual"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Cập nhật cấu hình thành công');
    });

    test('should set leave blackout dates', async ({ page }) => {
      await page.goto('/leave/settings/blackout');
      
      await page.locator('[data-testid="add-blackout"]').click();
      await page.locator('[data-testid="blackout-start"]').fill('2025-12-29');
      await page.locator('[data-testid="blackout-end"]').fill('2025-12-31');
      await page.locator('[data-testid="blackout-reason"]').fill('Year-end closing');
      
      await page.locator('[data-testid="save-blackout"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Thêm ngày nghỉ bị chặn');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE CALENDAR
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Calendar', () => {
    let leavePage: LeavePage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);
      await loginPage.expectLoginSuccess();
      
      leavePage = new LeavePage(page);
    });

    test('should display calendar view', async ({ page }) => {
      await leavePage.gotoCalendar();
      
      await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
    });

    test('should switch calendar views', async ({ page }) => {
      await leavePage.gotoCalendar();
      
      // Month view
      await page.locator('[data-testid="view-month"]').click();
      await expect(page.locator('[data-testid="calendar-month"]')).toBeVisible();
      
      // Week view
      await page.locator('[data-testid="view-week"]').click();
      await expect(page.locator('[data-testid="calendar-week"]')).toBeVisible();
      
      // List view
      await page.locator('[data-testid="view-list"]').click();
      await expect(page.locator('[data-testid="calendar-list"]')).toBeVisible();
    });

    test('should navigate calendar months', async ({ page }) => {
      await leavePage.gotoCalendar();
      
      const monthLabel = page.locator('[data-testid="calendar-month-label"]');
      const initialMonth = await monthLabel.textContent();
      
      await page.locator('[data-testid="calendar-next"]').click();
      const nextMonth = await monthLabel.textContent();
      
      expect(nextMonth).not.toBe(initialMonth);
      
      await page.locator('[data-testid="calendar-prev"]').click();
      const prevMonth = await monthLabel.textContent();
      
      expect(prevMonth).toBe(initialMonth);
    });

    test('should show holidays on calendar', async ({ page }) => {
      await leavePage.gotoCalendar();
      
      // Vietnamese holidays should be marked
      await expect(page.locator('[data-testid="holiday-marker"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE REPORTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Reports', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.hrManager.email, testUsers.hrManager.password);
      await loginPage.expectLoginSuccess();
    });

    test('should display leave dashboard', async ({ page }) => {
      await page.goto('/leave/dashboard');
      
      await expect(page.locator('[data-testid="total-leaves-taken"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-requests"]')).toBeVisible();
      await expect(page.locator('[data-testid="leave-by-type-chart"]')).toBeVisible();
    });

    test('should generate leave balance report', async ({ page }) => {
      await page.goto('/leave/reports');
      
      await page.locator('[data-testid="report-type"]').selectOption('BALANCE');
      await page.locator('[data-testid="department-filter"]').selectOption('all');
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-report"]').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('leave-balance');
    });

    test('should generate leave utilization report', async ({ page }) => {
      await page.goto('/leave/reports');
      
      await page.locator('[data-testid="report-type"]').selectOption('UTILIZATION');
      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-12-31');
      
      await page.locator('[data-testid="generate-report"]').click();
      
      await expect(page.locator('[data-testid="utilization-chart"]')).toBeVisible();
    });
  });
});
