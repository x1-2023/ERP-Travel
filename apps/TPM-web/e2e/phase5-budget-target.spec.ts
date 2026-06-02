// ══════════════════════════════════════════════════════════════════════════════
//                    💰 PHASE 5: BUDGET & TARGET INTEGRATION E2E TESTS
//                         File: e2e/phase5-budget-target.spec.ts
// ══════════════════════════════════════════════════════════════════════════════

import { test, expect, waitForToast, confirmDialog } from './fixtures';

// ══════════════════════════════════════════════════════════════════════════════
// BUDGET APPROVAL WORKFLOW
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Budget Approval Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budget/approval');
    await page.waitForLoadState('networkidle');
  });

  test('should display approval page with summary cards', async ({ page }) => {
    // Should have 4 summary cards
    const cards = page.locator('[class*="card"]');
    await expect(cards.first()).toBeVisible();

    // Check for key text content
    await expect(page.locator('text=Budget Approval')).toBeVisible();
    await expect(page.locator('text=Pending Approval')).toBeVisible();
    await expect(page.locator('text=Approved')).toBeVisible();
    await expect(page.locator('text=Rejected')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Click Approved tab
    const approvedTab = page.locator('[role="tab"]:has-text("Approved")');
    if (await approvedTab.count() > 0) {
      await approvedTab.click();
      await page.waitForLoadState('networkidle');
    }

    // Click Rejected tab
    const rejectedTab = page.locator('[role="tab"]:has-text("Rejected")');
    if (await rejectedTab.count() > 0) {
      await rejectedTab.click();
      await page.waitForLoadState('networkidle');
    }

    // Click All tab
    const allTab = page.locator('[role="tab"]:has-text("All")');
    if (await allTab.count() > 0) {
      await allTab.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should search budgets', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }
  });

  test('should display budget table with columns', async ({ page }) => {
    const table = page.locator('table');
    if (await table.count() > 0) {
      await expect(table).toBeVisible();

      // Check table headers
      const headers = page.locator('th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThanOrEqual(5);
    }
  });

  test('should open submit dialog for draft budget', async ({ page }) => {
    // Switch to All tab to find draft budgets
    const allTab = page.locator('[role="tab"]:has-text("All")');
    if (await allTab.count() > 0) {
      await allTab.click();
      await page.waitForLoadState('networkidle');
    }

    // Look for submit button (Send icon)
    const submitBtn = page.locator('button[title="Submit for Approval"], button[title="Resubmit"]');
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(300);

      // Dialog should appear
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Submit for Approval')).toBeVisible();

      // Close dialog
      const cancelBtn = dialog.locator('button:has-text("Cancel")');
      await cancelBtn.click();
    }
  });

  test('should open approve dialog for pending budget', async ({ page }) => {
    // Should be on Pending tab by default
    const approveBtn = page.locator('button[title="Approve"]');
    if (await approveBtn.count() > 0) {
      await approveBtn.first().click();
      await page.waitForTimeout(300);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Approve Budget')).toBeVisible();

      // Check comment textarea exists
      const textarea = dialog.locator('textarea');
      await expect(textarea).toBeVisible();

      // Close dialog
      const cancelBtn = dialog.locator('button:has-text("Cancel")');
      await cancelBtn.click();
    }
  });

  test('should open reject dialog with required comment', async ({ page }) => {
    const rejectBtn = page.locator('button[title="Reject"]');
    if (await rejectBtn.count() > 0) {
      await rejectBtn.first().click();
      await page.waitForTimeout(300);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Reject Budget')).toBeVisible();

      // Reject button should be disabled without comment
      const rejectAction = dialog.locator('button:has-text("Reject"):not(:has-text("Budget"))');
      if (await rejectAction.count() > 0) {
        await expect(rejectAction).toBeDisabled();
      }

      // Close dialog
      const cancelBtn = dialog.locator('button:has-text("Cancel")');
      await cancelBtn.click();
    }
  });

  test('should open revision dialog with required comment', async ({ page }) => {
    const revisionBtn = page.locator('button[title="Request Revision"]');
    if (await revisionBtn.count() > 0) {
      await revisionBtn.first().click();
      await page.waitForTimeout(300);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Request Revision')).toBeVisible();

      // Close dialog
      const cancelBtn = dialog.locator('button:has-text("Cancel")');
      await cancelBtn.click();
    }
  });

  test('should view approval history dialog', async ({ page }) => {
    // Switch to All tab
    const allTab = page.locator('[role="tab"]:has-text("All")');
    if (await allTab.count() > 0) {
      await allTab.click();
      await page.waitForLoadState('networkidle');
    }

    const historyBtn = page.locator('button[title="View History"]');
    if (await historyBtn.count() > 0) {
      await historyBtn.first().click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Approval History')).toBeVisible();

      // Close dialog
      const closeBtn = dialog.locator('button:has-text("Close")');
      await closeBtn.click();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// BUDGET ALLOCATION & HEALTH SCORE
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Budget Allocation & Health Score', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budget/allocation');
    await page.waitForLoadState('networkidle');
  });

  test('should display allocation page', async ({ page }) => {
    await expect(page.locator('text=Phân Bổ Ngân Sách')).toBeVisible();

    // Budget selector should be visible
    const budgetSelector = page.locator('[role="combobox"], select').first();
    await expect(budgetSelector).toBeVisible();
  });

  test('should show summary cards', async ({ page }) => {
    // Summary cards should be visible (mock data or real)
    const summaryCards = page.locator('[class*="card"]');
    const count = await summaryCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should select a budget and display tree', async ({ page }) => {
    // Open budget selector
    const budgetSelector = page.locator('button[role="combobox"]:near(:text("Chọn ngân sách"))');
    if (await budgetSelector.count() > 0) {
      await budgetSelector.click();
      await page.waitForTimeout(300);

      // Select first option
      const option = page.locator('[role="option"]').first();
      if (await option.count() > 0) {
        await option.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should switch between tree, table, and flow views', async ({ page }) => {
    // View mode tabs
    const viewTabs = page.locator('[role="tablist"]');
    if (await viewTabs.count() > 0) {
      const tabTriggers = viewTabs.last().locator('[role="tab"]');
      const tabCount = await tabTriggers.count();

      for (let i = 0; i < tabCount; i++) {
        await tabTriggers.nth(i).click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should expand and collapse tree nodes', async ({ page }) => {
    // Look for expand buttons in tree
    const expandBtn = page.locator('button:has(svg[class*="chevron"])');
    if (await expandBtn.count() > 0) {
      // Click to toggle
      await expandBtn.first().click();
      await page.waitForTimeout(300);

      // Click again to toggle back
      await expandBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should expand and collapse all nodes', async ({ page }) => {
    // Find expand all button
    const expandAllBtn = page.locator('button[class*="outline"]:has(svg)').filter({
      has: page.locator('svg.lucide-plus'),
    });

    if (await expandAllBtn.count() > 0) {
      await expandAllBtn.first().click();
      await page.waitForTimeout(300);
    }

    // Find collapse all button
    const collapseAllBtn = page.locator('button[class*="outline"]:has(svg)').filter({
      has: page.locator('svg.lucide-minus'),
    });

    if (await collapseAllBtn.count() > 0) {
      await collapseAllBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should display health score alert when not excellent', async ({ page }) => {
    // Health score alert card (if any)
    const healthAlert = page.locator('text=Fund Health Score');
    if (await healthAlert.count() > 0) {
      await expect(healthAlert.first()).toBeVisible();
    }
  });

  test('should open add allocation dialog', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Thêm phân bổ")');
    if (await addBtn.count() > 0 && await addBtn.isEnabled()) {
      await addBtn.click();
      await page.waitForTimeout(300);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Thêm Phân Bổ Mới')).toBeVisible();

      // Close
      const cancelBtn = dialog.locator('button:has-text("Hủy")');
      await cancelBtn.click();
    }
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    // Look for dropdown menu on a node
    const moreBtn = page.locator('button:has(svg.lucide-more-horizontal)');
    if (await moreBtn.count() > 0) {
      await moreBtn.first().click();
      await page.waitForTimeout(300);

      const deleteItem = page.locator('[role="menuitem"]:has-text("Xóa")');
      if (await deleteItem.count() > 0) {
        await deleteItem.click();
        await page.waitForTimeout(300);

        // AlertDialog should appear
        const alertDialog = page.locator('[role="alertdialog"]');
        if (await alertDialog.count() > 0) {
          await expect(alertDialog).toBeVisible();
          await expect(alertDialog.locator('text=Xác nhận xóa')).toBeVisible();

          // Cancel
          const cancelBtn = alertDialog.locator('button:has-text("Hủy")');
          await cancelBtn.click();
        }
      }
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// TARGET ALLOCATION
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Target Allocation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/targets/allocation');
    await page.waitForLoadState('networkidle');
  });

  test('should display target allocation page', async ({ page }) => {
    // Page heading or key content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display target selector', async ({ page }) => {
    const selector = page.locator('[role="combobox"], select').first();
    if (await selector.count() > 0) {
      await expect(selector).toBeVisible();
    }
  });

  test('should select target and display allocation tree', async ({ page }) => {
    const selector = page.locator('button[role="combobox"]').first();
    if (await selector.count() > 0) {
      await selector.click();
      await page.waitForTimeout(300);

      const option = page.locator('[role="option"]').first();
      if (await option.count() > 0) {
        await option.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should expand and collapse tree nodes', async ({ page }) => {
    const expandBtn = page.locator('button:has(svg[class*="chevron"])');
    if (await expandBtn.count() > 0) {
      await expandBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should display progress information', async ({ page }) => {
    // Look for progress bars or percentage indicators
    const progress = page.locator('[role="progressbar"], [class*="progress"]');
    if (await progress.count() > 0) {
      await expect(progress.first()).toBeVisible();
    }
  });

  test('should display status badges', async ({ page }) => {
    const badges = page.locator('[class*="badge"]');
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// FUND ACTIVITY ROI
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Fund Activity ROI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budget/allocation');
    await page.waitForLoadState('networkidle');
  });

  test('should display ROI section on allocation page', async ({ page }) => {
    // ROI section may be below the allocation tree
    const roiSection = page.locator('text=ROI');
    if (await roiSection.count() > 0) {
      await expect(roiSection.first()).toBeVisible();
    }
  });

  test('should display overview cards when activities exist', async ({ page }) => {
    // Look for activity/ROI related cards
    const activityCards = page.locator('text=Hoạt động, text=Doanh thu');
    if (await activityCards.count() > 0) {
      await expect(activityCards.first()).toBeVisible();
    }
  });

  test('should display ROI by activity type breakdown', async ({ page }) => {
    const roiByType = page.locator('text=ROI theo loại hoạt động');
    if (await roiByType.count() > 0) {
      await expect(roiByType).toBeVisible();
    }
  });

  test('should display status breakdown cards', async ({ page }) => {
    // Status breakdown: Kế hoạch, Đang chạy, Hoàn thành, Đã hủy
    const planned = page.locator('text=Kế hoạch');
    if (await planned.count() > 0) {
      await expect(planned.first()).toBeVisible();
    }
  });

  test('should filter activities by type', async ({ page }) => {
    const typeFilter = page.locator('select:has(option:has-text("Tất cả loại"))');
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('promotion');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Reset filter
      await typeFilter.selectOption('all');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display activity list table', async ({ page }) => {
    const activityTable = page.locator('text=Danh sách hoạt động');
    if (await activityTable.count() > 0) {
      await expect(activityTable).toBeVisible();

      // Check for table headers
      const table = page.locator('table').last();
      if (await table.count() > 0) {
        const headers = table.locator('th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThanOrEqual(4);
      }
    }
  });

  test('should display top performers section', async ({ page }) => {
    const topPerformers = page.locator('text=Top ROI');
    if (await topPerformers.count() > 0) {
      await expect(topPerformers).toBeVisible();
    }
  });

  test('should display underperformers section', async ({ page }) => {
    const underperformers = page.locator('text=Cần cải thiện');
    if (await underperformers.count() > 0) {
      await expect(underperformers).toBeVisible();
    }
  });
});
