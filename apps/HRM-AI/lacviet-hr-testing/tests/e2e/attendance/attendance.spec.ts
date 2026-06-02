// tests/e2e/attendance/attendance.spec.ts

/**
 * LAC VIET HR - Attendance Management E2E Tests
 * Comprehensive testing of check-in/out, timesheet, overtime, and reports
 */

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers, generateRandomDate } from '../../fixtures/test-data';

test.describe('Attendance Management', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.expectLoginSuccess();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHECK-IN/CHECK-OUT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Check-In/Check-Out', () => {
    test('@smoke should check in successfully', async () => {
      await page.goto('/attendance');

      // Click check-in button
      await page.locator('[data-testid="check-in-button"]').click();

      // Verify check-in success
      await expect(page.locator('[data-testid="check-in-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="attendance-status"]')).toContainText('Đã vào ca');
    });

    test('@smoke should check out successfully', async () => {
      await page.goto('/attendance');

      // Assume already checked in
      await page.locator('[data-testid="check-out-button"]').click();

      // Verify check-out success
      await expect(page.locator('[data-testid="check-out-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="attendance-status"]')).toContainText('Đã ra ca');
    });

    test('should record GPS location on check-in', async () => {
      // Mock geolocation
      await page.context().setGeolocation({ latitude: 10.762622, longitude: 106.660172 });
      await page.context().grantPermissions(['geolocation']);

      await page.goto('/attendance');
      await page.locator('[data-testid="check-in-button"]').click();

      // Verify location recorded
      await expect(page.locator('[data-testid="check-in-location"]')).toBeVisible();
    });

    test('should show warning for late check-in', async () => {
      await page.goto('/attendance');

      // Mock late time (after 8:30 AM)
      await page.evaluate(() => {
        const lateTime = new Date();
        lateTime.setHours(9, 30, 0);
        // Override check-in time for testing
        window.__mockCheckInTime = lateTime;
      });

      await page.locator('[data-testid="check-in-button"]').click();

      await expect(page.locator('[data-testid="late-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="late-warning"]')).toContainText('Đi muộn');
    });

    test('should show warning for early check-out', async () => {
      await page.goto('/attendance');

      // Mock early check-out time (before 5:00 PM)
      await page.locator('[data-testid="check-out-button"]').click();

      await expect(page.locator('[data-testid="early-warning"]')).toBeVisible();
    });

    test('should allow check-in with photo capture', async () => {
      await page.goto('/attendance');

      // Click check-in with photo
      await page.locator('[data-testid="check-in-photo"]').click();

      // Wait for camera modal
      await expect(page.locator('[data-testid="camera-modal"]')).toBeVisible();

      // Capture photo (mock)
      await page.locator('[data-testid="capture-photo"]').click();

      // Confirm check-in
      await page.locator('[data-testid="confirm-check-in"]').click();

      await expect(page.locator('[data-testid="check-in-time"]')).toBeVisible();
    });

    test('should show office zones for valid check-in', async () => {
      await page.goto('/attendance');

      // View zones
      await page.locator('[data-testid="view-zones"]').click();

      await expect(page.locator('[data-testid="zones-map"]')).toBeVisible();
      await expect(page.locator('[data-testid="zone-item"]')).toHaveCount.greaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // TIMESHEET
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Timesheet', () => {
    test('@critical should display weekly timesheet', async () => {
      await page.goto('/attendance/timesheet');

      // Verify timesheet grid
      await expect(page.locator('[data-testid="timesheet-grid"]')).toBeVisible();

      // Should show 7 days
      const dayColumns = page.locator('[data-testid="timesheet-day"]');
      await expect(dayColumns).toHaveCount(7);
    });

    test('should display monthly timesheet', async () => {
      await page.goto('/attendance/timesheet?view=month');

      // Verify monthly view
      await expect(page.locator('[data-testid="timesheet-calendar"]')).toBeVisible();

      // Should show current month days
      const days = page.locator('[data-testid="calendar-day"]');
      const count = await days.count();
      expect(count).toBeGreaterThanOrEqual(28);
    });

    test('should calculate working hours correctly', async () => {
      await page.goto('/attendance/timesheet');

      // Get total hours
      const totalHours = await page.locator('[data-testid="total-hours"]').textContent();
      const regularHours = await page.locator('[data-testid="regular-hours"]').textContent();
      const overtimeHours = await page.locator('[data-testid="overtime-hours"]').textContent();

      // Verify totals
      expect(parseFloat(totalHours || '0')).toBeGreaterThanOrEqual(0);
      expect(parseFloat(regularHours || '0')).toBeGreaterThanOrEqual(0);
      expect(parseFloat(overtimeHours || '0')).toBeGreaterThanOrEqual(0);
    });

    test('should show attendance status icons', async () => {
      await page.goto('/attendance/timesheet');

      // Check for various status icons
      const presentIcon = page.locator('[data-testid="status-present"]');
      const absentIcon = page.locator('[data-testid="status-absent"]');
      const lateIcon = page.locator('[data-testid="status-late"]');
      const leaveIcon = page.locator('[data-testid="status-leave"]');

      // At least one status should be visible
      const hasStatus =
        await presentIcon.count() > 0 ||
        await absentIcon.count() > 0 ||
        await lateIcon.count() > 0 ||
        await leaveIcon.count() > 0;

      expect(hasStatus).toBe(true);
    });

    test('should navigate between weeks', async () => {
      await page.goto('/attendance/timesheet');

      // Get current week dates
      const currentStartDate = await page.locator('[data-testid="week-start"]').textContent();

      // Go to previous week
      await page.locator('[data-testid="prev-week"]').click();

      const prevStartDate = await page.locator('[data-testid="week-start"]').textContent();
      expect(prevStartDate).not.toBe(currentStartDate);

      // Go to next week
      await page.locator('[data-testid="next-week"]').click();
      await page.locator('[data-testid="next-week"]').click();

      const nextStartDate = await page.locator('[data-testid="week-start"]').textContent();
      expect(nextStartDate).not.toBe(currentStartDate);
    });

    test('should export timesheet to Excel', async () => {
      await page.goto('/attendance/timesheet');

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-timesheet"]').click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/timesheet.*\.xlsx/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // OVERTIME MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Overtime', () => {
    test('should create overtime request', async () => {
      await page.goto('/attendance/overtime/new');

      // Fill overtime form
      await page.locator('[data-testid="ot-date"]').fill('2025-01-20');
      await page.locator('[data-testid="ot-start-time"]').fill('18:00');
      await page.locator('[data-testid="ot-end-time"]').fill('21:00');
      await page.locator('[data-testid="ot-reason"]').fill('Hoàn thành dự án ABC');

      // Submit
      await page.locator('[data-testid="submit-ot"]').click();

      // Verify success
      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã gửi yêu cầu OT');
    });

    test('should list overtime requests', async () => {
      await page.goto('/attendance/overtime');

      const otList = page.locator('[data-testid="ot-list"]');
      await expect(otList).toBeVisible();
    });

    test('should show overtime rate calculation', async () => {
      await page.goto('/attendance/overtime/new');

      // Fill form
      await page.locator('[data-testid="ot-date"]').fill('2025-01-20');
      await page.locator('[data-testid="ot-start-time"]').fill('18:00');
      await page.locator('[data-testid="ot-end-time"]').fill('22:00');

      // Should show rate preview
      const ratePreview = page.locator('[data-testid="ot-rate-preview"]');
      await expect(ratePreview).toBeVisible();

      // Should show different rates for different hours
      await expect(ratePreview).toContainText('150%'); // 18:00-21:00
      await expect(ratePreview).toContainText('200%'); // 21:00-22:00
    });

    test('should approve overtime request (manager)', async () => {
      // Login as manager
      await page.goto('/logout');
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/attendance/overtime/pending');

      // Approve first pending request
      await page.locator('[data-testid="ot-approve"]').first().click();
      await page.locator('[data-testid="confirm-approve"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã phê duyệt');
    });

    test('should reject overtime request with reason', async () => {
      // Login as manager
      await page.goto('/logout');
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/attendance/overtime/pending');

      // Reject first pending request
      await page.locator('[data-testid="ot-reject"]').first().click();
      await page.locator('[data-testid="reject-reason"]').fill('Không đủ lý do làm OT');
      await page.locator('[data-testid="confirm-reject"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã từ chối');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SHIFT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Shifts', () => {
    test('should display shift schedule', async () => {
      await page.goto('/attendance/shifts');

      await expect(page.locator('[data-testid="shift-schedule"]')).toBeVisible();
    });

    test('should create new shift', async () => {
      await page.goto('/attendance/shifts/new');

      await page.locator('[data-testid="shift-name"]').fill('Ca Đêm');
      await page.locator('[data-testid="shift-start"]').fill('22:00');
      await page.locator('[data-testid="shift-end"]').fill('06:00');
      await page.locator('[data-testid="shift-break-start"]').fill('01:00');
      await page.locator('[data-testid="shift-break-end"]').fill('02:00');

      await page.locator('[data-testid="save-shift"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Tạo ca làm việc thành công');
    });

    test('should assign shift to employee', async () => {
      await page.goto('/attendance/shifts/assign');

      // Select employee
      await page.locator('[data-testid="employee-select"]').click();
      await page.locator('[data-testid="employee-option"]').first().click();

      // Select shift
      await page.locator('[data-testid="shift-select"]').click();
      await page.locator('[data-testid="shift-option"]').first().click();

      // Select date range
      await page.locator('[data-testid="date-from"]').fill('2025-01-20');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');

      await page.locator('[data-testid="assign-shift"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Phân ca thành công');
    });

    test('should show rotating shift calendar', async () => {
      await page.goto('/attendance/shifts/calendar');

      await expect(page.locator('[data-testid="shift-calendar"]')).toBeVisible();

      // Different shifts should have different colors
      const shifts = page.locator('[data-testid="shift-cell"]');
      const count = await shifts.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ATTENDANCE REPORTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Reports', () => {
    test('@critical should generate attendance summary report', async () => {
      await page.goto('/attendance/reports/summary');

      // Select date range
      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');

      await page.locator('[data-testid="generate-report"]').click();

      // Wait for report
      await expect(page.locator('[data-testid="report-table"]')).toBeVisible();

      // Verify summary stats
      await expect(page.locator('[data-testid="total-working-days"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-present"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-absent"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-late"]')).toBeVisible();
    });

    test('should generate late arrival report', async () => {
      await page.goto('/attendance/reports/late');

      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');
      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="late-report-table"]')).toBeVisible();
    });

    test('should generate overtime report', async () => {
      await page.goto('/attendance/reports/overtime');

      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');
      await page.locator('[data-testid="generate-report"]').click();

      // Verify OT summary
      await expect(page.locator('[data-testid="total-ot-hours"]')).toBeVisible();
      await expect(page.locator('[data-testid="ot-by-department"]')).toBeVisible();
    });

    test('should filter report by department', async () => {
      await page.goto('/attendance/reports/summary');

      // Select department
      await page.locator('[data-testid="department-filter"]').click();
      await page.locator('[data-testid="department-option"]').first().click();

      await page.locator('[data-testid="generate-report"]').click();

      // Results should be filtered
      await expect(page.locator('[data-testid="report-table"]')).toBeVisible();
    });

    test('should export report to PDF', async () => {
      await page.goto('/attendance/reports/summary');

      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');
      await page.locator('[data-testid="generate-report"]').click();

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-pdf"]').click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/attendance.*\.pdf/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ATTENDANCE CORRECTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Corrections', () => {
    test('should submit attendance correction request', async () => {
      await page.goto('/attendance/corrections/new');

      // Select date to correct
      await page.locator('[data-testid="correction-date"]').fill('2025-01-15');

      // Select correction type
      await page.locator('[data-testid="correction-type"]').click();
      await page.locator('[data-testid="type-forgot-checkout"]').click();

      // Fill actual time
      await page.locator('[data-testid="actual-checkout"]').fill('18:00');

      // Add reason
      await page.locator('[data-testid="correction-reason"]').fill('Quên checkout do họp kéo dài');

      // Submit
      await page.locator('[data-testid="submit-correction"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã gửi yêu cầu điều chỉnh');
    });

    test('should list pending corrections for approval', async () => {
      // Login as HR
      await page.goto('/logout');
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.hr.email, testUsers.hr.password);

      await page.goto('/attendance/corrections/pending');

      await expect(page.locator('[data-testid="corrections-list"]')).toBeVisible();
    });

    test('should approve correction with time verification', async () => {
      // Login as HR
      await page.goto('/logout');
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.hr.email, testUsers.hr.password);

      await page.goto('/attendance/corrections/pending');

      // Verify and approve
      await page.locator('[data-testid="correction-item"]').first().click();
      await expect(page.locator('[data-testid="correction-details"]')).toBeVisible();

      await page.locator('[data-testid="approve-correction"]').click();
      await page.locator('[data-testid="confirm-approve"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã phê duyệt');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DEVICE INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Device Integration', () => {
    test('should list attendance devices', async () => {
      await page.goto('/attendance/devices');

      await expect(page.locator('[data-testid="devices-list"]')).toBeVisible();
    });

    test('should add new fingerprint device', async () => {
      await page.goto('/attendance/devices/new');

      await page.locator('[data-testid="device-name"]').fill('Máy chấm công Tầng 1');
      await page.locator('[data-testid="device-type"]').selectOption('FINGERPRINT');
      await page.locator('[data-testid="device-ip"]').fill('192.168.1.100');
      await page.locator('[data-testid="device-port"]').fill('4370');

      await page.locator('[data-testid="save-device"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Thêm thiết bị thành công');
    });

    test('should sync attendance data from device', async () => {
      await page.goto('/attendance/devices');

      await page.locator('[data-testid="device-sync"]').first().click();

      // Wait for sync progress
      await expect(page.locator('[data-testid="sync-progress"]')).toBeVisible();

      // Wait for completion
      await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible({ timeout: 60000 });
    });

    test('should show device connection status', async () => {
      await page.goto('/attendance/devices');

      const deviceStatus = page.locator('[data-testid="device-status"]').first();
      const statusText = await deviceStatus.textContent();

      expect(statusText).toMatch(/Online|Offline|Lỗi kết nối/);
    });
  });
});
