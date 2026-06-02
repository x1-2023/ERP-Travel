// tests/e2e/workflow/workflow-approval.spec.ts

/**
 * LAC VIET HR - Workflow & Approval E2E Tests
 * Comprehensive testing of approval workflows, delegation, and escalation
 */

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers, testDepartments } from '../../fixtures/test-data';

test.describe('Workflow & Approval System', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // WORKFLOW CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Workflow Configuration', () => {
    test.beforeEach(async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
      await loginPage.expectLoginSuccess();
    });

    test('@critical should create leave approval workflow', async () => {
      await page.goto('/settings/workflows/new');

      // Workflow details
      await page.locator('[data-testid="workflow-name"]').fill('Phê duyệt nghỉ phép');
      await page.locator('[data-testid="workflow-type"]').selectOption('LEAVE_REQUEST');
      await page.locator('[data-testid="workflow-description"]').fill('Quy trình phê duyệt đơn nghỉ phép');

      // Add approval steps
      // Step 1: Direct manager
      await page.locator('[data-testid="add-step"]').click();
      await page.locator('[data-testid="step-name-0"]').fill('Quản lý trực tiếp');
      await page.locator('[data-testid="approver-type-0"]').selectOption('DIRECT_MANAGER');

      // Step 2: Department head
      await page.locator('[data-testid="add-step"]').click();
      await page.locator('[data-testid="step-name-1"]').fill('Trưởng phòng');
      await page.locator('[data-testid="approver-type-1"]').selectOption('DEPARTMENT_HEAD');

      // Save workflow
      await page.locator('[data-testid="save-workflow"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Tạo quy trình thành công');
    });

    test('should create conditional workflow', async () => {
      await page.goto('/settings/workflows/new');

      await page.locator('[data-testid="workflow-name"]').fill('Phê duyệt nghỉ phép có điều kiện');
      await page.locator('[data-testid="workflow-type"]').selectOption('LEAVE_REQUEST');

      // Add conditional step
      await page.locator('[data-testid="add-conditional-step"]').click();
      await page.locator('[data-testid="condition-field"]').selectOption('LEAVE_DAYS');
      await page.locator('[data-testid="condition-operator"]').selectOption('GREATER_THAN');
      await page.locator('[data-testid="condition-value"]').fill('3');

      // If days > 3, require additional approval
      await page.locator('[data-testid="then-approver-type"]').selectOption('HR_MANAGER');
      await page.locator('[data-testid="else-approver-type"]').selectOption('DIRECT_MANAGER');

      await page.locator('[data-testid="save-workflow"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });

    test('should set workflow priority and SLA', async () => {
      await page.goto('/settings/workflows');
      await page.locator('[data-testid="workflow-row"]').first().click();

      // Set SLA
      await page.locator('[data-testid="sla-hours"]').fill('24');

      // Set escalation
      await page.locator('[data-testid="enable-escalation"]').check();
      await page.locator('[data-testid="escalation-hours"]').fill('48');
      await page.locator('[data-testid="escalation-to"]').selectOption('HR_DIRECTOR');

      await page.locator('[data-testid="save-workflow"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });

    test('should clone existing workflow', async () => {
      await page.goto('/settings/workflows');
      await page.locator('[data-testid="workflow-actions"]').first().click();
      await page.locator('[data-testid="clone-workflow"]').click();

      // Modify name
      await page.locator('[data-testid="workflow-name"]').fill('Phê duyệt nghỉ phép - Chi nhánh HCM');

      await page.locator('[data-testid="save-workflow"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Sao chép thành công');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // APPROVAL PROCESS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Approval Process', () => {
    test('@critical should submit request and track through approval', async () => {
      // Login as employee
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);

      // Submit leave request
      await page.goto('/leave/new');
      await page.locator('[data-testid="leave-type"]').selectOption('ANNUAL');
      await page.locator('[data-testid="date-from"]').fill('2025-02-01');
      await page.locator('[data-testid="date-to"]').fill('2025-02-03');
      await page.locator('[data-testid="reason"]').fill('Nghỉ phép năm');
      await page.locator('[data-testid="submit-request"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã gửi yêu cầu');

      // Verify pending status
      await page.goto('/leave/my-requests');
      await expect(page.locator('[data-testid="request-status"]').first()).toContainText('Chờ duyệt');
    });

    test('@critical should approve request as manager', async () => {
      // Login as manager
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/approvals/pending');

      // Find and approve request
      await page.locator('[data-testid="approval-item"]').first().click();

      // Review details
      await expect(page.locator('[data-testid="request-details"]')).toBeVisible();

      // Approve
      await page.locator('[data-testid="approve-button"]').click();
      await page.locator('[data-testid="approval-comment"]').fill('Đồng ý');
      await page.locator('[data-testid="confirm-approve"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã phê duyệt');
    });

    test('should reject request with reason', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/approvals/pending');
      await page.locator('[data-testid="approval-item"]').first().click();

      // Reject
      await page.locator('[data-testid="reject-button"]').click();
      await page.locator('[data-testid="rejection-reason"]').fill('Không đủ nhân sự trong thời gian này');
      await page.locator('[data-testid="confirm-reject"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã từ chối');
    });

    test('should request more information', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/approvals/pending');
      await page.locator('[data-testid="approval-item"]').first().click();

      // Request info
      await page.locator('[data-testid="request-info-button"]').click();
      await page.locator('[data-testid="info-request-message"]').fill('Vui lòng cung cấp thêm lý do chi tiết');
      await page.locator('[data-testid="send-info-request"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã gửi yêu cầu');
    });

    test('should show approval history', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);

      await page.goto('/leave/my-requests');
      await page.locator('[data-testid="request-row"]').first().click();

      // View approval history
      await page.locator('[data-testid="approval-history-tab"]').click();

      await expect(page.locator('[data-testid="approval-timeline"]')).toBeVisible();
      const historyItems = page.locator('[data-testid="approval-history-item"]');
      await expect(historyItems).toHaveCount.greaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DELEGATION
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Approval Delegation', () => {
    test.beforeEach(async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);
      await page.goto('/settings/delegation');
    });

    test('should delegate approval authority', async () => {
      await page.locator('[data-testid="add-delegation"]').click();

      // Select delegate
      await page.locator('[data-testid="delegate-select"]').click();
      await page.locator('[data-testid="delegate-option"]').first().click();

      // Set date range
      await page.locator('[data-testid="delegation-from"]').fill('2025-02-01');
      await page.locator('[data-testid="delegation-to"]').fill('2025-02-15');

      // Select workflow types
      await page.locator('[data-testid="workflow-leave"]').check();
      await page.locator('[data-testid="workflow-ot"]').check();

      await page.locator('[data-testid="save-delegation"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Ủy quyền thành công');
    });

    test('should show delegation history', async () => {
      await expect(page.locator('[data-testid="delegation-history"]')).toBeVisible();
    });

    test('should revoke delegation', async () => {
      await page.locator('[data-testid="active-delegation"]').first().click();
      await page.locator('[data-testid="revoke-delegation"]').click();
      await page.locator('[data-testid="confirm-revoke"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã thu hồi ủy quyền');
    });

    test('delegated user should see approval tasks', async () => {
      // Setup delegation first
      await page.locator('[data-testid="add-delegation"]').click();
      await page.locator('[data-testid="delegate-select"]').click();
      await page.locator('text=Tran Van B').click(); // Select specific user
      await page.locator('[data-testid="delegation-from"]').fill('2025-01-01');
      await page.locator('[data-testid="delegation-to"]').fill('2025-12-31');
      await page.locator('[data-testid="workflow-leave"]').check();
      await page.locator('[data-testid="save-delegation"]').click();

      // Login as delegated user
      await page.goto('/logout');
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('tranvanb@company.com', 'Password123!');

      // Check for delegated approvals
      await page.goto('/approvals/pending');
      await expect(page.locator('[data-testid="delegated-badge"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ESCALATION
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Escalation', () => {
    test('should show escalation warning', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/approvals/pending');

      // Check for overdue items
      const overdueItem = page.locator('[data-testid="approval-overdue"]');
      if (await overdueItem.count() > 0) {
        await expect(overdueItem.first().locator('[data-testid="escalation-warning"]')).toBeVisible();
      }
    });

    test('should manually escalate request', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);

      await page.goto('/approvals/pending');
      await page.locator('[data-testid="approval-item"]').first().click();

      await page.locator('[data-testid="escalate-button"]').click();
      await page.locator('[data-testid="escalation-reason"]').fill('Cần quyết định từ cấp cao hơn');
      await page.locator('[data-testid="confirm-escalate"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã chuyển tiếp');
    });

    test('admin should view escalation dashboard', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);

      await page.goto('/admin/escalations');

      await expect(page.locator('[data-testid="escalation-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="escalation-stats"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BULK APPROVAL
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Bulk Approval', () => {
    test.beforeEach(async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.manager.email, testUsers.manager.password);
    });

    test('should bulk approve multiple requests', async () => {
      await page.goto('/approvals/pending');

      // Select multiple
      await page.locator('[data-testid="select-approval"]').nth(0).check();
      await page.locator('[data-testid="select-approval"]').nth(1).check();
      await page.locator('[data-testid="select-approval"]').nth(2).check();

      // Bulk approve
      await page.locator('[data-testid="bulk-approve"]').click();
      await page.locator('[data-testid="bulk-comment"]').fill('Đồng ý');
      await page.locator('[data-testid="confirm-bulk-approve"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Đã phê duyệt 3 yêu cầu');
    });

    test('should bulk reject multiple requests', async () => {
      await page.goto('/approvals/pending');

      // Select all
      await page.locator('[data-testid="select-all-approvals"]').check();

      // Bulk reject
      await page.locator('[data-testid="bulk-reject"]').click();
      await page.locator('[data-testid="bulk-reject-reason"]').fill('Không đủ điều kiện');
      await page.locator('[data-testid="confirm-bulk-reject"]').click();

      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // APPROVAL REPORTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Reports', () => {
    test.beforeEach(async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    });

    test('should view approval turnaround report', async () => {
      await page.goto('/reports/approvals/turnaround');

      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');
      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="turnaround-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="avg-turnaround-time"]')).toBeVisible();
    });

    test('should view approval by manager report', async () => {
      await page.goto('/reports/approvals/by-manager');

      await page.locator('[data-testid="generate-report"]').click();

      await expect(page.locator('[data-testid="manager-approval-table"]')).toBeVisible();
    });

    test('should export approval audit log', async () => {
      await page.goto('/reports/approvals/audit');

      await page.locator('[data-testid="date-from"]').fill('2025-01-01');
      await page.locator('[data-testid="date-to"]').fill('2025-01-31');
      await page.locator('[data-testid="generate-report"]').click();

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-audit"]').click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/audit.*\.xlsx/);
    });
  });
});
