// tests/e2e/specs/leave/leave-workflow.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';
import { LeavePage, LeaveRequestDialog, LeaveApprovalPage } from '../../pages/leave.page';

/**
 * LAC VIET HR - Leave Request Workflow E2E Tests
 * Tests the complete leave request lifecycle: request → approval → notification
 */

test.describe('Leave Request Workflow', () => {
  // ════════════════════════════════════════════════════════════════════════════
  // EMPLOYEE: SUBMIT LEAVE REQUEST
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Employee: Submit Leave Request', () => {
    let leavePage: LeavePage;
    let leaveDialog: LeaveRequestDialog;

    test.beforeEach(async ({ employeePage }) => {
      leavePage = new LeavePage(employeePage);
      leaveDialog = new LeaveRequestDialog(employeePage);
      await leavePage.goto();
    });

    test('should display leave page with balance cards', async () => {
      await leavePage.expectPageVisible();
      await leavePage.expectBalanceCardsVisible();
    });

    test('should show current leave balances', async () => {
      const annualBalance = await leavePage.getLeaveBalance('ANNUAL');

      expect(annualBalance.entitled).toBeGreaterThan(0);
      expect(annualBalance.balance).toBeGreaterThanOrEqual(0);
      expect(annualBalance.used).toBeLessThanOrEqual(annualBalance.entitled);
    });

    test('should open leave request dialog', async () => {
      await leavePage.openRequestForm();
      await leaveDialog.expectVisible();
    });

    test('should submit annual leave request successfully', async ({ employeePage }) => {
      const uniqueId = Date.now();
      const leaveData = {
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-03-01',
        endDate: '2024-03-03',
        reason: `E2E Test Leave Request ${uniqueId}`,
      };

      await leavePage.openRequestForm();
      await leaveDialog.fillForm(leaveData);

      // Verify total days calculation
      await leaveDialog.expectTotalDays(3); // 3 days including weekends calculation

      await leaveDialog.submit();

      // Should show success message
      await expect(employeePage.locator('text=/yêu cầu đã được gửi|submitted/i')).toBeVisible();

      // Dialog should close
      await leaveDialog.expectNotVisible();

      // Should appear in pending list
      await leavePage.switchToPending();
      await expect(employeePage.locator(`text=${leaveData.startDate}`)).toBeVisible();
    });

    test('should submit sick leave request', async ({ employeePage }) => {
      const leaveData = {
        leaveType: 'Nghỉ ốm',
        startDate: '2024-03-05',
        endDate: '2024-03-05',
        reason: 'Sick leave - flu',
      };

      await leavePage.openRequestForm();
      await leaveDialog.fillForm(leaveData);
      await leaveDialog.submit();

      await expect(employeePage.locator('text=/yêu cầu đã được gửi|submitted/i')).toBeVisible();
    });

    test('should submit half-day leave request', async ({ employeePage }) => {
      const leaveData = {
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-03-10',
        endDate: '2024-03-10',
        reason: 'Half day leave',
        isHalfDay: true,
      };

      await leavePage.openRequestForm();
      await leaveDialog.fillForm(leaveData);

      // Should show 0.5 days
      await leaveDialog.expectTotalDays(0.5);

      await leaveDialog.submit();
      await expect(employeePage.locator('text=/yêu cầu đã được gửi|submitted/i')).toBeVisible();
    });

    test('should validate leave balance', async () => {
      // Try to request more days than available balance
      const balance = await leavePage.getLeaveBalance('ANNUAL');
      const excessDays = balance.balance + 5;

      const startDate = new Date('2024-06-01');
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + excessDays);

      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: 'Testing balance validation',
      });
      await leaveDialog.submit();

      // Should show balance exceeded error
      await leaveDialog.expectErrorMessage(/vượt quá số ngày phép|exceeds balance/i);
    });

    test('should validate date range', async () => {
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-03-05',
        endDate: '2024-03-01', // End before start
        reason: 'Invalid date range',
      });
      await leaveDialog.submit();

      await leaveDialog.expectErrorMessage(/ngày kết thúc.*trước.*bắt đầu|end date.*before.*start/i);
    });

    test('should prevent overlapping leave requests', async ({ employeePage }) => {
      // First request
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        reason: 'First request',
      });
      await leaveDialog.submit();
      await employeePage.waitForTimeout(1000);

      // Second overlapping request
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-04-03', // Overlaps with first request
        endDate: '2024-04-07',
        reason: 'Overlapping request',
      });
      await leaveDialog.submit();

      await leaveDialog.expectErrorMessage(/trùng với yêu cầu khác|overlapping|conflict/i);
    });

    test('should cancel leave request', async () => {
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-03-15',
        endDate: '2024-03-16',
        reason: 'To be cancelled',
      });
      await leaveDialog.cancel();

      await leaveDialog.expectNotVisible();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // EMPLOYEE: VIEW & MANAGE REQUESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Employee: View & Manage Requests', () => {
    let leavePage: LeavePage;

    test.beforeEach(async ({ employeePage }) => {
      leavePage = new LeavePage(employeePage);
      await leavePage.goto();
    });

    test('should view pending requests', async () => {
      await leavePage.switchToPending();
      // Should show pending tab content
      await expect(leavePage.leaveList).toBeVisible();
    });

    test('should view approved requests', async () => {
      await leavePage.switchToApproved();
      await expect(leavePage.leaveList).toBeVisible();
    });

    test('should view rejected requests', async () => {
      await leavePage.switchToRejected();
      await expect(leavePage.leaveList).toBeVisible();
    });

    test('should filter requests by year', async () => {
      await leavePage.filterByYear(2024);
      // Results should be filtered
    });

    test('should cancel pending request', async ({ employeePage }) => {
      // Create a request to cancel
      const leaveDialog = new LeaveRequestDialog(employeePage);
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-05-01',
        endDate: '2024-05-02',
        reason: 'To be cancelled by employee',
      });
      await leaveDialog.submit();
      await employeePage.waitForTimeout(1000);

      // Cancel the request
      await leavePage.switchToPending();
      const itemCount = await leavePage.getLeaveItemCount();
      if (itemCount > 0) {
        await leavePage.cancelLeaveRequest(0);
        await expect(employeePage.locator('text=/đã hủy|cancelled/i')).toBeVisible();
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // MANAGER: APPROVE/REJECT REQUESTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Manager: Approve/Reject Requests', () => {
    let approvalPage: LeaveApprovalPage;

    test.beforeEach(async ({ managerPage }) => {
      approvalPage = new LeaveApprovalPage(managerPage);
      await approvalPage.goto();
    });

    test('should display pending requests for approval', async ({ managerPage }) => {
      await expect(managerPage.locator('h1, [data-testid="page-title"]')).toBeVisible();
      await expect(approvalPage.pendingRequests).toBeVisible();
    });

    test('should approve leave request', async ({ managerPage }) => {
      const pendingCount = await approvalPage.getPendingCount();

      if (pendingCount > 0) {
        await approvalPage.approveRequest(0, 'Approved by E2E test');

        // Should show success message
        await expect(managerPage.locator('text=/đã phê duyệt|approved/i')).toBeVisible();
      }
    });

    test('should reject leave request with reason', async ({ managerPage }) => {
      const pendingCount = await approvalPage.getPendingCount();

      if (pendingCount > 0) {
        await approvalPage.rejectRequest(0, 'Insufficient staffing during requested period');

        // Should show success message
        await expect(managerPage.locator('text=/đã từ chối|rejected/i')).toBeVisible();
      }
    });

    test('should require rejection reason', async ({ managerPage }) => {
      const pendingCount = await approvalPage.getPendingCount();

      if (pendingCount > 0) {
        const item = approvalPage.requestItems.first();
        await item.click();

        await managerPage.locator('button:has-text("Từ chối")').click();
        // Don't fill reason
        await managerPage.locator('button:has-text("Xác nhận")').click();

        // Should show validation error
        await expect(managerPage.locator('text=/lý do.*bắt buộc|reason.*required/i')).toBeVisible();
      }
    });

    test('should view request details before approval', async ({ managerPage }) => {
      const pendingCount = await approvalPage.getPendingCount();

      if (pendingCount > 0) {
        await approvalPage.requestItems.first().click();

        // Should show request details
        await expect(managerPage.locator('text=/thông tin yêu cầu|request details/i')).toBeVisible();
        await expect(managerPage.locator('text=/loại nghỉ phép|leave type/i')).toBeVisible();
        await expect(managerPage.locator('text=/từ ngày|from/i')).toBeVisible();
        await expect(managerPage.locator('text=/đến ngày|to/i')).toBeVisible();
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FULL WORKFLOW: REQUEST → APPROVE → NOTIFY
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Full Workflow', () => {
    test('complete leave request approval workflow', async ({ browser }) => {
      const uniqueId = Date.now();

      // ─────────────────────────────────────────────────────────────────────
      // Step 1: Employee submits leave request
      // ─────────────────────────────────────────────────────────────────────
      const employeeContext = await browser.newContext({
        storageState: './tests/e2e/.auth/employee.json',
      });
      const employeePage = await employeeContext.newPage();

      const leavePage = new LeavePage(employeePage);
      const leaveDialog = new LeaveRequestDialog(employeePage);

      await leavePage.goto();
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-07-01',
        endDate: '2024-07-03',
        reason: `Full workflow test ${uniqueId}`,
      });
      await leaveDialog.submit();

      await expect(employeePage.locator('text=/yêu cầu đã được gửi|submitted/i')).toBeVisible();

      // ─────────────────────────────────────────────────────────────────────
      // Step 2: Manager approves the request
      // ─────────────────────────────────────────────────────────────────────
      const managerContext = await browser.newContext({
        storageState: './tests/e2e/.auth/manager.json',
      });
      const managerPage = await managerContext.newPage();

      const approvalPage = new LeaveApprovalPage(managerPage);
      await approvalPage.goto();

      // Find and approve the request
      const pendingCount = await approvalPage.getPendingCount();
      expect(pendingCount).toBeGreaterThan(0);

      await approvalPage.approveRequest(0, 'Approved in workflow test');
      await expect(managerPage.locator('text=/đã phê duyệt|approved/i')).toBeVisible();

      // ─────────────────────────────────────────────────────────────────────
      // Step 3: Employee sees approved request
      // ─────────────────────────────────────────────────────────────────────
      await leavePage.goto();
      await leavePage.switchToApproved();

      // Should see the approved request
      await expect(employeePage.locator('text=2024-07-01')).toBeVisible();

      // ─────────────────────────────────────────────────────────────────────
      // Step 4: Employee checks notification
      // ─────────────────────────────────────────────────────────────────────
      await employeePage.goto('/notifications');

      // Should have notification about approval
      await expect(employeePage.locator('text=/đã được phê duyệt|approved/i')).toBeVisible();

      // Cleanup
      await employeeContext.close();
      await managerContext.close();
    });

    test('complete leave request rejection workflow', async ({ browser }) => {
      const uniqueId = Date.now();

      // Step 1: Employee submits request
      const employeeContext = await browser.newContext({
        storageState: './tests/e2e/.auth/employee.json',
      });
      const employeePage = await employeeContext.newPage();

      const leavePage = new LeavePage(employeePage);
      const leaveDialog = new LeaveRequestDialog(employeePage);

      await leavePage.goto();
      await leavePage.openRequestForm();
      await leaveDialog.fillForm({
        leaveType: 'Nghỉ phép năm',
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        reason: `Rejection workflow test ${uniqueId}`,
      });
      await leaveDialog.submit();

      // Step 2: Manager rejects the request
      const managerContext = await browser.newContext({
        storageState: './tests/e2e/.auth/manager.json',
      });
      const managerPage = await managerContext.newPage();

      const approvalPage = new LeaveApprovalPage(managerPage);
      await approvalPage.goto();

      await approvalPage.rejectRequest(0, 'Critical project deadline during this period');

      // Step 3: Employee sees rejected request
      await leavePage.goto();
      await leavePage.switchToRejected();

      await expect(employeePage.locator('text=2024-08-01')).toBeVisible();

      // Step 4: Employee sees notification
      await employeePage.goto('/notifications');
      await expect(employeePage.locator('text=/đã bị từ chối|rejected/i')).toBeVisible();

      await employeeContext.close();
      await managerContext.close();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // LEAVE CALENDAR
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Calendar', () => {
    test('should display team leave calendar', async ({ managerPage }) => {
      await managerPage.goto('/leave/calendar');

      // Should show calendar view
      await expect(managerPage.locator('[data-testid="leave-calendar"], .calendar')).toBeVisible();
    });

    test('should show leave events on calendar', async ({ managerPage }) => {
      await managerPage.goto('/leave/calendar');

      // Should display events
      await expect(managerPage.locator('[data-testid="calendar-event"], .calendar-event')).toBeVisible();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // LEAVE REPORTS
  // ════════════════════════════════════════════════════════════════════════════

  test.describe('Leave Reports (Admin)', () => {
    test('should view leave summary report', async ({ adminPage }) => {
      await adminPage.goto('/leave/reports');

      // Should show report page
      await expect(adminPage.locator('h1:has-text("Báo cáo nghỉ phép")')).toBeVisible();
    });

    test('should export leave report', async ({ adminPage }) => {
      await adminPage.goto('/leave/reports');

      const downloadPromise = adminPage.waitForEvent('download');
      await adminPage.locator('button:has-text("Xuất")').click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/leave.*report.*\.xlsx/i);
    });
  });
});
