// tests/e2e/recruitment/recruitment-ats.spec.ts

/**
 * LAC VIET HR - Recruitment ATS E2E Tests
 * Comprehensive testing of recruitment and applicant tracking
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers, generateCandidateData } from '../../fixtures/test-data';

test.describe('Recruitment & ATS', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.hrManager.email, testUsers.hrManager.password);
    await loginPage.expectLoginSuccess();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // JOB POSTINGS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Job Postings', () => {
    test('should display job postings list', async ({ page }) => {
      await page.goto('/recruitment/jobs');
      
      await expect(page.locator('[data-testid="jobs-table"]')).toBeVisible();
      const jobCount = await page.locator('[data-testid="jobs-table"] tbody tr').count();
      expect(jobCount).toBeGreaterThan(0);
    });

    test('should create new job posting', async ({ page }) => {
      await page.goto('/recruitment/jobs/new');
      
      await page.locator('[data-testid="field-title"]').fill('Senior Software Developer');
      await page.locator('[data-testid="field-department"]').selectOption('Engineering');
      await page.locator('[data-testid="field-location"]').fill('Ho Chi Minh City');
      await page.locator('[data-testid="field-employment-type"]').selectOption('FULL_TIME');
      await page.locator('[data-testid="field-experience"]').fill('5+ years');
      await page.locator('[data-testid="field-salary-min"]').fill('30000000');
      await page.locator('[data-testid="field-salary-max"]').fill('50000000');
      await page.locator('[data-testid="field-description"]').fill('We are looking for a senior developer...');
      await page.locator('[data-testid="field-requirements"]').fill('- 5+ years experience\n- Strong JavaScript skills');
      
      await page.locator('[data-testid="publish-job"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đăng tin tuyển dụng thành công');
    });

    test('should edit existing job posting', async ({ page }) => {
      await page.goto('/recruitment/jobs');
      
      await page.locator('[data-testid="jobs-table"] tbody tr').first().click();
      await page.locator('[data-testid="edit-job"]').click();
      
      await page.locator('[data-testid="field-title"]').fill('Senior Software Developer (Updated)');
      await page.locator('[data-testid="save-job"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Cập nhật thành công');
    });

    test('should close job posting', async ({ page }) => {
      await page.goto('/recruitment/jobs');
      
      await page.locator('[data-testid="jobs-table"] tbody tr').first().locator('[data-testid="action-menu"]').click();
      await page.locator('[data-testid="close-job"]').click();
      await page.locator('[data-testid="confirm-close"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã đóng tin tuyển dụng');
    });

    test('should duplicate job posting', async ({ page }) => {
      await page.goto('/recruitment/jobs');
      
      const initialCount = await page.locator('[data-testid="jobs-table"] tbody tr').count();
      
      await page.locator('[data-testid="jobs-table"] tbody tr').first().locator('[data-testid="action-menu"]').click();
      await page.locator('[data-testid="duplicate-job"]').click();
      
      await page.waitForLoadState('networkidle');
      
      const newCount = await page.locator('[data-testid="jobs-table"] tbody tr').count();
      expect(newCount).toBe(initialCount + 1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // CANDIDATES
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Candidates', () => {
    test('should display candidates list', async ({ page }) => {
      await page.goto('/recruitment/candidates');
      
      await expect(page.locator('[data-testid="candidates-table"]')).toBeVisible();
    });

    test('should add new candidate manually', async ({ page }) => {
      const candidateData = generateCandidateData();
      
      await page.goto('/recruitment/candidates/new');
      
      await page.locator('[data-testid="field-firstName"]').fill(candidateData.firstName);
      await page.locator('[data-testid="field-lastName"]').fill(candidateData.lastName);
      await page.locator('[data-testid="field-email"]').fill(candidateData.email);
      await page.locator('[data-testid="field-phone"]').fill(candidateData.phone);
      await page.locator('[data-testid="field-position"]').fill(candidateData.position);
      await page.locator('[data-testid="field-experience"]').fill(candidateData.experience.toString());
      await page.locator('[data-testid="field-expectedSalary"]').fill(candidateData.expectedSalary.toString());
      
      // Add skills
      for (const skill of candidateData.skills) {
        await page.locator('[data-testid="skills-input"]').fill(skill);
        await page.keyboard.press('Enter');
      }
      
      await page.locator('[data-testid="save-candidate"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Thêm ứng viên thành công');
    });

    test('should upload candidate resume', async ({ page }) => {
      await page.goto('/recruitment/candidates/new');
      
      const candidateData = generateCandidateData();
      await page.locator('[data-testid="field-firstName"]').fill(candidateData.firstName);
      await page.locator('[data-testid="field-lastName"]').fill(candidateData.lastName);
      await page.locator('[data-testid="field-email"]').fill(candidateData.email);
      
      // Upload resume
      await page.locator('[data-testid="resume-upload"]').setInputFiles('./tests/fixtures/sample-resume.pdf');
      
      await expect(page.locator('[data-testid="resume-preview"]')).toBeVisible();
    });

    test('should filter candidates by status', async ({ page }) => {
      await page.goto('/recruitment/candidates');
      
      await page.locator('[data-testid="filter-status"]').selectOption('INTERVIEW');
      await page.waitForLoadState('networkidle');
      
      const statusBadges = page.locator('[data-testid="status-badge"]');
      const count = await statusBadges.count();
      
      for (let i = 0; i < count; i++) {
        await expect(statusBadges.nth(i)).toContainText('Phỏng vấn');
      }
    });

    test('should search candidates', async ({ page }) => {
      await page.goto('/recruitment/candidates');
      
      await page.locator('[data-testid="search-input"]').fill('Developer');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      const results = page.locator('[data-testid="candidates-table"] tbody tr');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // KANBAN PIPELINE
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Kanban Pipeline', () => {
    test('should display kanban board', async ({ page }) => {
      await page.goto('/recruitment/pipeline');
      
      await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
      
      // Check pipeline stages
      const stages = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
      for (const stage of stages) {
        await expect(page.locator(`[data-testid="column-${stage}"]`)).toBeVisible();
      }
    });

    test('should drag candidate to next stage', async ({ page }) => {
      await page.goto('/recruitment/pipeline');
      
      // Find a candidate card in NEW column
      const candidateCard = page.locator('[data-testid="column-NEW"] [data-testid="candidate-card"]').first();
      
      if (await candidateCard.isVisible()) {
        const screeningColumn = page.locator('[data-testid="column-SCREENING"]');
        
        // Drag and drop
        await candidateCard.dragTo(screeningColumn);
        
        // Verify candidate moved
        await expect(page.locator('[data-testid="toast-message"]')).toContainText('Cập nhật trạng thái thành công');
      }
    });

    test('should quick actions on candidate card', async ({ page }) => {
      await page.goto('/recruitment/pipeline');
      
      const candidateCard = page.locator('[data-testid="candidate-card"]').first();
      
      if (await candidateCard.isVisible()) {
        await candidateCard.hover();
        
        // Quick action buttons should appear
        await expect(candidateCard.locator('[data-testid="quick-schedule"]')).toBeVisible();
        await expect(candidateCard.locator('[data-testid="quick-email"]')).toBeVisible();
        await expect(candidateCard.locator('[data-testid="quick-reject"]')).toBeVisible();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // INTERVIEWS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Interviews', () => {
    test('should schedule interview', async ({ page }) => {
      await page.goto('/recruitment/candidates');
      
      // Click on first candidate in Interview stage
      await page.locator('[data-testid="filter-status"]').selectOption('SCREENING');
      await page.waitForLoadState('networkidle');
      
      const firstCandidate = page.locator('[data-testid="candidates-table"] tbody tr').first();
      await firstCandidate.locator('[data-testid="action-schedule"]').click();
      
      // Fill interview details
      await page.locator('[data-testid="interview-date"]').fill('2025-02-15');
      await page.locator('[data-testid="interview-time"]').fill('10:00');
      await page.locator('[data-testid="interview-type"]').selectOption('IN_PERSON');
      await page.locator('[data-testid="interviewer"]').click();
      await page.locator('[role="option"]').first().click();
      await page.locator('[data-testid="interview-notes"]').fill('Technical interview round 1');
      
      await page.locator('[data-testid="confirm-schedule"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã lên lịch phỏng vấn');
    });

    test('should display interview calendar', async ({ page }) => {
      await page.goto('/recruitment/calendar');
      
      await expect(page.locator('[data-testid="interview-calendar"]')).toBeVisible();
      
      // Check for interview events
      const events = page.locator('[data-testid="calendar-event"]');
      // May or may not have events depending on test data
    });

    test('should submit interview feedback', async ({ page }) => {
      await page.goto('/recruitment/interviews');
      
      const pendingFeedback = page.locator('[data-testid="pending-feedback"]').first();
      
      if (await pendingFeedback.isVisible()) {
        await pendingFeedback.click();
        
        // Fill feedback form
        await page.locator('[data-testid="rating-technical"]').locator('button').nth(3).click(); // 4 stars
        await page.locator('[data-testid="rating-communication"]').locator('button').nth(4).click(); // 5 stars
        await page.locator('[data-testid="rating-cultural"]').locator('button').nth(3).click(); // 4 stars
        await page.locator('[data-testid="feedback-notes"]').fill('Strong technical skills, good communication');
        await page.locator('[data-testid="recommendation"]').selectOption('PROCEED');
        
        await page.locator('[data-testid="submit-feedback"]').click();
        
        await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã gửi đánh giá');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // OFFERS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Job Offers', () => {
    test('should create job offer', async ({ page }) => {
      await page.goto('/recruitment/candidates');
      
      await page.locator('[data-testid="filter-status"]').selectOption('INTERVIEW');
      await page.waitForLoadState('networkidle');
      
      const firstCandidate = page.locator('[data-testid="candidates-table"] tbody tr').first();
      await firstCandidate.locator('[data-testid="action-offer"]').click();
      
      // Fill offer details
      await page.locator('[data-testid="offer-position"]').fill('Senior Developer');
      await page.locator('[data-testid="offer-department"]').selectOption('Engineering');
      await page.locator('[data-testid="offer-salary"]').fill('45000000');
      await page.locator('[data-testid="offer-start-date"]').fill('2025-03-01');
      await page.locator('[data-testid="offer-benefits"]').fill('- Health insurance\n- 13th month salary\n- Remote work');
      
      await page.locator('[data-testid="send-offer"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã gửi thư mời');
    });

    test('should track offer status', async ({ page }) => {
      await page.goto('/recruitment/offers');
      
      await expect(page.locator('[data-testid="offers-table"]')).toBeVisible();
      
      // Check offer statuses
      const statusBadges = page.locator('[data-testid="offer-status"]');
      await expect(statusBadges.first()).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // REPORTS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Recruitment Reports', () => {
    test('should display recruitment dashboard', async ({ page }) => {
      await page.goto('/recruitment/dashboard');
      
      // Check key metrics
      await expect(page.locator('[data-testid="metric-open-positions"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-total-candidates"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-interviews-scheduled"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-offers-pending"]')).toBeVisible();
    });

    test('should display pipeline funnel', async ({ page }) => {
      await page.goto('/recruitment/dashboard');
      
      await expect(page.locator('[data-testid="pipeline-funnel"]')).toBeVisible();
    });

    test('should export recruitment report', async ({ page }) => {
      await page.goto('/recruitment/reports');
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-report"]').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('recruitment-report');
    });
  });
});
