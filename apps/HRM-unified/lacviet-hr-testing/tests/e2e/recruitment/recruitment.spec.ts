// tests/e2e/recruitment/recruitment.spec.ts

/**
 * LAC VIET HR - Recruitment (ATS) E2E Tests
 * Job requisitions, candidates, interviews, offers
 */

import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Job Requisitions', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/recruitment/requisitions');
    await page.waitForLoadState('networkidle');
  });

  test('should display requisition list', async ({ page }) => {
    const requisitionList = page.locator('[data-testid="requisition-list"]');
    await expect(requisitionList).toBeVisible();
  });

  test('should create new job requisition', async ({ page }) => {
    // Click new requisition
    await page.click('[data-testid="new-requisition"], button:has-text("Tạo tin tuyển dụng")');
    
    // Fill form
    await page.fill('input[name="title"]', 'E2E Test - Senior Developer');
    await page.selectOption('select[name="departmentId"]', { index: 1 });
    await page.selectOption('select[name="employmentType"]', 'FULL_TIME');
    await page.fill('input[name="positions"]', '2');
    
    // Fill salary range
    await page.fill('input[name="salaryMin"]', '25000000');
    await page.fill('input[name="salaryMax"]', '40000000');
    
    // Fill description (rich text editor)
    const descriptionEditor = page.locator('[data-testid="description-editor"] .ProseMirror, textarea[name="description"]');
    await descriptionEditor.fill('E2E Test Job Description - Yêu cầu công việc...');
    
    // Fill requirements
    const requirementsEditor = page.locator('[data-testid="requirements-editor"] .ProseMirror, textarea[name="requirements"]');
    await requirementsEditor.fill('- 5+ năm kinh nghiệm\n- Thành thạo TypeScript');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success and redirect
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
    await expect(page).toHaveURL(/\/recruitment\/requisitions/);
  });

  test('should filter requisitions by status', async ({ page }) => {
    // Filter by open
    await page.click('[data-testid="filter-OPEN"]');
    await page.waitForLoadState('networkidle');
    
    // All visible should be OPEN
    const requisitions = page.locator('[data-testid="requisition-item"]');
    const count = await requisitions.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const status = await requisitions.nth(i).getAttribute('data-status');
      expect(status).toBe('OPEN');
    }
  });

  test('should search requisitions', async ({ page }) => {
    await page.fill('input[name="search"]', 'Developer');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Results should contain search term
    const requisitions = page.locator('[data-testid="requisition-item"]');
    const count = await requisitions.count();
    
    if (count > 0) {
      const text = await requisitions.first().textContent();
      expect(text?.toLowerCase()).toContain('developer');
    }
  });

  test('should close requisition', async ({ page }) => {
    // Click on a requisition
    await page.click('[data-testid="requisition-item"]:first-child');
    
    // Click close button
    await page.click('[data-testid="close-requisition"]');
    
    // Confirm
    await page.click('[data-testid="confirm-close"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('Candidates', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/recruitment/candidates');
    await page.waitForLoadState('networkidle');
  });

  test('should display candidate list', async ({ page }) => {
    const candidateList = page.locator('[data-testid="candidate-list"]');
    await expect(candidateList).toBeVisible();
  });

  test('should add new candidate', async ({ page }) => {
    await page.click('[data-testid="add-candidate"], button:has-text("Thêm ứng viên")');
    
    // Fill candidate info
    await page.fill('input[name="firstName"]', 'E2E');
    await page.fill('input[name="lastName"]', 'Candidate');
    await page.fill('input[name="email"]', `e2e.candidate.${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', '0901234567');
    
    // Select requisition
    await page.selectOption('select[name="requisitionId"]', { index: 1 });
    
    // Upload CV (mock)
    // await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-cv.pdf');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should view candidate profile', async ({ page }) => {
    // Click on first candidate
    await page.click('[data-testid="candidate-item"]:first-child');
    
    // Should show candidate detail
    await expect(page).toHaveURL(/\/recruitment\/candidates\/[a-zA-Z0-9-]+/);
    
    // Profile should be visible
    const profile = page.locator('[data-testid="candidate-profile"]');
    await expect(profile).toBeVisible();
  });

  test('should move candidate through pipeline', async ({ page }) => {
    // Click on a candidate
    await page.click('[data-testid="candidate-item"]:first-child');
    
    // Move to next stage
    await page.click('[data-testid="move-to-next-stage"]');
    
    // Select stage
    await page.click('[data-testid="stage-SCREENING"]');
    
    // Confirm
    await page.click('[data-testid="confirm-move"]');
    
    // Should update
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should filter candidates by stage', async ({ page }) => {
    // Click on pipeline stage
    await page.click('[data-testid="stage-filter-APPLIED"]');
    await page.waitForLoadState('networkidle');
    
    // Check filtered results
    const candidates = page.locator('[data-testid="candidate-item"]');
    const count = await candidates.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const stage = await candidates.nth(i).getAttribute('data-stage');
      expect(stage).toBe('APPLIED');
    }
  });

  test('should reject candidate with reason', async ({ page }) => {
    // Click on a candidate
    await page.click('[data-testid="candidate-item"]:first-child');
    
    // Click reject
    await page.click('[data-testid="reject-candidate"]');
    
    // Fill rejection reason
    await page.fill('textarea[name="rejectionReason"]', 'E2E Test - Không đủ điều kiện');
    
    // Confirm
    await page.click('[data-testid="confirm-reject"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('Interviews', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/recruitment/interviews');
    await page.waitForLoadState('networkidle');
  });

  test('should display interview calendar', async ({ page }) => {
    const calendar = page.locator('[data-testid="interview-calendar"]');
    await expect(calendar).toBeVisible();
  });

  test('should schedule interview', async ({ page }) => {
    // Click schedule interview
    await page.click('[data-testid="schedule-interview"]');
    
    // Select candidate
    await page.selectOption('select[name="candidateId"]', { index: 1 });
    
    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    await page.fill('input[name="scheduledAt"]', tomorrow.toISOString().slice(0, 16));
    
    // Select interviewers
    await page.click('[data-testid="select-interviewers"]');
    await page.click('[data-testid="interviewer-option"]:first-child');
    
    // Set interview type
    await page.selectOption('select[name="interviewType"]', 'TECHNICAL');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should view interview details', async ({ page }) => {
    // Click on an interview
    const interviewItem = page.locator('[data-testid="interview-item"]').first();
    
    if (await interviewItem.isVisible()) {
      await interviewItem.click();
      
      // Details should be visible
      const details = page.locator('[data-testid="interview-details"]');
      await expect(details).toBeVisible();
    }
  });

  test('should submit interview feedback', async ({ page }) => {
    // Click on a completed interview
    await page.click('[data-testid="interview-item"][data-status="COMPLETED"]');
    
    // Click add feedback
    await page.click('[data-testid="add-feedback"]');
    
    // Fill feedback form
    await page.fill('textarea[name="feedback"]', 'E2E Test - Ứng viên có kỹ năng tốt');
    
    // Rate
    await page.click('[data-testid="rating-4"]');
    
    // Recommend
    await page.click('[data-testid="recommend-yes"]');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('Job Offers', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/recruitment/offers');
    await page.waitForLoadState('networkidle');
  });

  test('should display offer list', async ({ page }) => {
    const offerList = page.locator('[data-testid="offer-list"]');
    await expect(offerList).toBeVisible();
  });

  test('should create job offer', async ({ page }) => {
    await page.click('[data-testid="create-offer"]');
    
    // Select candidate
    await page.selectOption('select[name="candidateId"]', { index: 1 });
    
    // Fill offer details
    await page.selectOption('select[name="positionId"]', { index: 1 });
    await page.fill('input[name="salary"]', '30000000');
    
    // Set start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    
    // Set expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await page.fill('input[name="expiryDate"]', expiryDate.toISOString().split('T')[0]);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should send offer to candidate', async ({ page }) => {
    // Click on a draft offer
    await page.click('[data-testid="offer-item"][data-status="DRAFT"]');
    
    // Click send
    await page.click('[data-testid="send-offer"]');
    
    // Confirm
    await page.click('[data-testid="confirm-send"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('Recruitment Pipeline', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test('should display kanban board', async ({ page }) => {
    await page.goto('/recruitment/pipeline');
    await page.waitForLoadState('networkidle');
    
    const kanban = page.locator('[data-testid="pipeline-kanban"]');
    await expect(kanban).toBeVisible();
    
    // Check stages
    const stages = page.locator('[data-testid="pipeline-stage"]');
    expect(await stages.count()).toBeGreaterThanOrEqual(4);
  });

  test('should drag and drop candidate between stages', async ({ page }) => {
    await page.goto('/recruitment/pipeline');
    await page.waitForLoadState('networkidle');
    
    // Get a candidate card
    const candidateCard = page.locator('[data-testid="candidate-card"]').first();
    
    if (await candidateCard.isVisible()) {
      // Get target stage
      const targetStage = page.locator('[data-testid="pipeline-stage"]:nth-child(2)');
      
      // Drag and drop
      await candidateCard.dragTo(targetStage);
      
      // Should trigger update (toast or visual feedback)
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Recruitment Reports', () => {
  test.use({ storageState: 'playwright/.auth/hr-manager.json' });

  test('should display recruitment metrics', async ({ page }) => {
    await page.goto('/recruitment/reports');
    await page.waitForLoadState('networkidle');
    
    // Metrics should be visible
    const metrics = page.locator('[data-testid="recruitment-metrics"]');
    await expect(metrics).toBeVisible();
    
    // Key metrics
    await expect(page.locator('[data-testid="metric-time-to-fill"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-cost-per-hire"]')).toBeVisible();
  });

  test('should export recruitment report', async ({ page }) => {
    await page.goto('/recruitment/reports');
    
    // Set date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', new Date().toISOString().split('T')[0]);
    
    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-report"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/recruitment.*\.(xlsx|pdf)/);
  });
});
