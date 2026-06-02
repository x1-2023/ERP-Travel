// tests/e2e/leave/leave-management.spec.ts

/**
 * LAC VIET HR - Leave Management E2E Tests
 * Leave requests, approvals, balance, calendar
 */

import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Leave Request - Employee', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('networkidle');
  });

  test('should display leave dashboard', async ({ page }) => {
    // Check leave balance card
    const balanceCard = page.locator('[data-testid="leave-balance"]');
    await expect(balanceCard).toBeVisible();
    
    // Check my requests section
    const myRequests = page.locator('[data-testid="my-requests"]');
    await expect(myRequests).toBeVisible();
  });

  test('should show leave balance breakdown', async ({ page }) => {
    const balanceCard = page.locator('[data-testid="leave-balance"]');
    
    // Check different leave types
    await expect(balanceCard.locator('text=/Phép năm|Annual/i')).toBeVisible();
    await expect(balanceCard.locator('text=/Ốm|Sick/i')).toBeVisible();
  });

  test('should create leave request', async ({ page }) => {
    // Click new request button
    await page.click('[data-testid="new-request-button"], button:has-text("Tạo đơn")');
    
    // Fill leave request form
    await page.selectOption('select[name="leaveType"]', 'ANNUAL');
    
    // Set dates (next week)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const startDate = tomorrow.toISOString().split('T')[0];
    const endDate = nextDay.toISOString().split('T')[0];
    
    await page.fill('input[name="startDate"]', startDate);
    await page.fill('input[name="endDate"]', endDate);
    await page.fill('textarea[name="reason"]', 'E2E Test - Nghỉ phép cá nhân');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success, [data-type="success"]');
    await expect(toast).toBeVisible();
  });

  test('should validate leave dates', async ({ page }) => {
    await page.click('[data-testid="new-request-button"]');
    
    // Try to set end date before start date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await page.fill('input[name="startDate"]', today.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', yesterday.toISOString().split('T')[0]);
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    const error = page.locator('text=/không hợp lệ|invalid/i');
    await expect(error).toBeVisible();
  });

  test('should not allow request exceeding balance', async ({ page }) => {
    await page.click('[data-testid="new-request-button"]');
    
    await page.selectOption('select[name="leaveType"]', 'ANNUAL');
    
    // Request 100 days (exceeds any balance)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 100);
    
    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
    await page.fill('textarea[name="reason"]', 'Testing balance validation');
    
    await page.click('button[type="submit"]');
    
    // Should show balance exceeded error
    const error = page.locator('text=/vượt quá|exceed/i');
    await expect(error).toBeVisible();
  });

  test('should cancel pending request', async ({ page }) => {
    // Find a pending request
    const pendingRequest = page.locator('[data-testid="leave-request"][data-status="PENDING"]').first();
    
    if (await pendingRequest.isVisible()) {
      await pendingRequest.click();
      
      // Click cancel button
      await page.click('[data-testid="cancel-request"], button:has-text("Hủy đơn")');
      
      // Confirm
      await page.click('[data-testid="confirm-cancel"]');
      
      // Should show success
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });

  test('should view leave history', async ({ page }) => {
    // Click on history tab
    await page.click('[data-testid="history-tab"], text=/Lịch sử|History/i');
    
    // History should be visible
    const historyList = page.locator('[data-testid="leave-history"]');
    await expect(historyList).toBeVisible();
  });

  test('should view leave calendar', async ({ page }) => {
    // Click on calendar tab
    await page.click('[data-testid="calendar-tab"], text=/Lịch|Calendar/i');
    
    // Calendar should be visible
    const calendar = page.locator('[data-testid="leave-calendar"], .calendar');
    await expect(calendar).toBeVisible();
  });
});

test.describe('Leave Approval - Manager', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/leave/approvals');
    await page.waitForLoadState('networkidle');
  });

  test('should display pending approvals', async ({ page }) => {
    const pendingList = page.locator('[data-testid="pending-approvals"]');
    await expect(pendingList).toBeVisible();
  });

  test('should approve leave request', async ({ page }) => {
    const pendingRequest = page.locator('[data-testid="pending-request"]').first();
    
    if (await pendingRequest.isVisible()) {
      await pendingRequest.click();
      
      // Click approve
      await page.click('[data-testid="approve-button"], button:has-text("Duyệt")');
      
      // Add comment (optional)
      const commentInput = page.locator('textarea[name="comment"]');
      if (await commentInput.isVisible()) {
        await commentInput.fill('Approved via E2E test');
      }
      
      // Confirm
      await page.click('[data-testid="confirm-approve"]');
      
      // Should show success
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });

  test('should reject leave request with reason', async ({ page }) => {
    const pendingRequest = page.locator('[data-testid="pending-request"]').first();
    
    if (await pendingRequest.isVisible()) {
      await pendingRequest.click();
      
      // Click reject
      await page.click('[data-testid="reject-button"], button:has-text("Từ chối")');
      
      // Must provide reason
      await page.fill('textarea[name="rejectReason"]', 'E2E Test - Lý do từ chối');
      
      // Confirm
      await page.click('[data-testid="confirm-reject"]');
      
      // Should show success
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });

  test('should bulk approve multiple requests', async ({ page }) => {
    // Select multiple requests
    const checkboxes = page.locator('[data-testid="select-request"]');
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      
      // Click bulk approve
      await page.click('[data-testid="bulk-approve"]');
      
      // Confirm
      await page.click('[data-testid="confirm-bulk"]');
      
      // Should show success
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });

  test('should filter approvals by status', async ({ page }) => {
    // Filter by approved
    await page.click('[data-testid="filter-approved"]');
    await page.waitForLoadState('networkidle');
    
    // All visible should be approved
    const requests = page.locator('[data-testid="leave-request"]');
    const count = await requests.count();
    
    for (let i = 0; i < count; i++) {
      const status = await requests.nth(i).getAttribute('data-status');
      expect(status).toBe('APPROVED');
    }
  });

  test('should filter approvals by date range', async ({ page }) => {
    // Open date filter
    await page.click('[data-testid="date-filter"]');
    
    // Set date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    await page.fill('input[name="filterStartDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="filterEndDate"]', new Date().toISOString().split('T')[0]);
    
    await page.click('[data-testid="apply-date-filter"]');
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Leave Policies - Admin', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should view leave policies', async ({ page }) => {
    await page.goto('/settings/leave-policies');
    await page.waitForLoadState('networkidle');
    
    // Policy list should be visible
    const policyList = page.locator('[data-testid="policy-list"]');
    await expect(policyList).toBeVisible();
  });

  test('should edit leave policy', async ({ page }) => {
    await page.goto('/settings/leave-policies');
    
    // Click first policy
    await page.click('[data-testid="policy-item"]');
    
    // Edit days
    await page.fill('input[name="annualDays"]', '15');
    
    // Save
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('Leave Reports', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test('should generate leave report', async ({ page }) => {
    await page.goto('/reports/leave');
    await page.waitForLoadState('networkidle');
    
    // Select report type
    await page.selectOption('select[name="reportType"]', 'summary');
    
    // Set date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', new Date().toISOString().split('T')[0]);
    
    // Generate
    await page.click('[data-testid="generate-report"]');
    
    // Report should appear
    const report = page.locator('[data-testid="report-content"]');
    await expect(report).toBeVisible();
  });

  test('should export leave report', async ({ page }) => {
    await page.goto('/reports/leave');
    
    // Generate a report first
    await page.click('[data-testid="generate-report"]');
    await page.waitForLoadState('networkidle');
    
    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-report"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/leave.*\.(xlsx|pdf)/);
  });
});
