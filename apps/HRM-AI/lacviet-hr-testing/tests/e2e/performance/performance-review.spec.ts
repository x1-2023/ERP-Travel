// tests/e2e/performance/performance-review.spec.ts

/**
 * LAC VIET HR - Performance Management E2E Tests
 * Comprehensive testing of goals, reviews, and 360 feedback
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { testUsers } from '../../fixtures/test-data';

test.describe('Performance Management', () => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // GOALS (OKRs)
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Goals & OKRs', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);
      await loginPage.expectLoginSuccess();
    });

    test('should display my goals', async ({ page }) => {
      await page.goto('/performance/goals');
      
      await expect(page.locator('[data-testid="goals-list"]')).toBeVisible();
    });

    test('should create new goal', async ({ page }) => {
      await page.goto('/performance/goals/new');
      
      await page.locator('[data-testid="field-title"]').fill('Improve code review efficiency');
      await page.locator('[data-testid="field-description"]').fill('Reduce average code review time by 30%');
      await page.locator('[data-testid="field-category"]').selectOption('DEVELOPMENT');
      await page.locator('[data-testid="field-priority"]').selectOption('HIGH');
      await page.locator('[data-testid="field-due-date"]').fill('2025-06-30');
      await page.locator('[data-testid="field-weight"]').fill('20');
      
      // Add key results
      await page.locator('[data-testid="add-key-result"]').click();
      await page.locator('[data-testid="kr-title-0"]').fill('Average review time under 2 hours');
      await page.locator('[data-testid="kr-target-0"]').fill('2');
      await page.locator('[data-testid="kr-unit-0"]').fill('hours');
      
      await page.locator('[data-testid="add-key-result"]').click();
      await page.locator('[data-testid="kr-title-1"]').fill('Review 20 PRs per week');
      await page.locator('[data-testid="kr-target-1"]').fill('20');
      await page.locator('[data-testid="kr-unit-1"]').fill('PRs/week');
      
      await page.locator('[data-testid="save-goal"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Tạo mục tiêu thành công');
    });

    test('should update goal progress', async ({ page }) => {
      await page.goto('/performance/goals');
      
      const firstGoal = page.locator('[data-testid="goal-card"]').first();
      await firstGoal.click();
      
      // Update progress
      await page.locator('[data-testid="update-progress"]').click();
      await page.locator('[data-testid="progress-slider"]').fill('50');
      await page.locator('[data-testid="progress-notes"]').fill('Completed initial phase');
      await page.locator('[data-testid="save-progress"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Cập nhật tiến độ thành công');
      await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '50');
    });

    test('should align goal with company objectives', async ({ page }) => {
      await page.goto('/performance/goals/new');
      
      await page.locator('[data-testid="field-title"]').fill('Aligned Goal');
      await page.locator('[data-testid="align-objective"]').click();
      
      // Select company objective
      await page.locator('[data-testid="objective-list"]').locator('li').first().click();
      
      await expect(page.locator('[data-testid="aligned-badge"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PERFORMANCE REVIEWS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Performance Reviews', () => {
    test.describe('As Manager', () => {
      test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(testUsers.manager.email, testUsers.manager.password);
        await loginPage.expectLoginSuccess();
      });

      test('should display team reviews', async ({ page }) => {
        await page.goto('/performance/reviews/team');
        
        await expect(page.locator('[data-testid="team-reviews-table"]')).toBeVisible();
      });

      test('should create review cycle', async ({ page }) => {
        await page.goto('/performance/reviews/cycles/new');
        
        await page.locator('[data-testid="field-name"]').fill('Q1 2025 Review');
        await page.locator('[data-testid="field-type"]').selectOption('QUARTERLY');
        await page.locator('[data-testid="field-start-date"]').fill('2025-03-15');
        await page.locator('[data-testid="field-end-date"]').fill('2025-03-31');
        await page.locator('[data-testid="field-self-review"]').check();
        await page.locator('[data-testid="field-peer-review"]').check();
        await page.locator('[data-testid="field-manager-review"]').check();
        
        await page.locator('[data-testid="create-cycle"]').click();
        
        await expect(page.locator('[data-testid="toast-message"]')).toContainText('Tạo chu kỳ đánh giá thành công');
      });

      test('should submit manager review', async ({ page }) => {
        await page.goto('/performance/reviews/team');
        
        const pendingReview = page.locator('[data-testid="review-status"]:has-text("Chờ đánh giá")').first();
        
        if (await pendingReview.isVisible()) {
          await pendingReview.locator('..').locator('[data-testid="start-review"]').click();
          
          // Fill review form
          await page.locator('[data-testid="rating-performance"]').locator('button').nth(3).click();
          await page.locator('[data-testid="rating-skills"]').locator('button').nth(4).click();
          await page.locator('[data-testid="rating-teamwork"]').locator('button').nth(3).click();
          await page.locator('[data-testid="rating-leadership"]').locator('button').nth(3).click();
          
          await page.locator('[data-testid="achievements"]').fill('Successfully led project X, improved team velocity');
          await page.locator('[data-testid="improvements"]').fill('Could improve documentation practices');
          await page.locator('[data-testid="goals-next-period"]').fill('Lead 2 major projects, mentor junior developers');
          await page.locator('[data-testid="overall-rating"]').selectOption('EXCEEDS_EXPECTATIONS');
          
          await page.locator('[data-testid="submit-review"]').click();
          
          await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã gửi đánh giá');
        }
      });

      test('should calibrate team ratings', async ({ page }) => {
        await page.goto('/performance/reviews/calibration');
        
        await expect(page.locator('[data-testid="calibration-grid"]')).toBeVisible();
        
        // 9-box grid should be visible
        await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
      });
    });

    test.describe('As Employee', () => {
      test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(testUsers.employee.email, testUsers.employee.password);
        await loginPage.expectLoginSuccess();
      });

      test('should submit self-review', async ({ page }) => {
        await page.goto('/performance/reviews/my');
        
        const pendingReview = page.locator('[data-testid="self-review-pending"]').first();
        
        if (await pendingReview.isVisible()) {
          await pendingReview.click();
          
          await page.locator('[data-testid="self-achievements"]').fill('Completed 15 projects, learned new technologies');
          await page.locator('[data-testid="self-challenges"]').fill('Time management during multiple projects');
          await page.locator('[data-testid="self-improvements"]').fill('Better documentation, more testing');
          await page.locator('[data-testid="self-goals"]').fill('Get certified in AWS, lead a team');
          await page.locator('[data-testid="self-rating"]').selectOption('MEETS_EXPECTATIONS');
          
          await page.locator('[data-testid="submit-self-review"]').click();
          
          await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã gửi tự đánh giá');
        }
      });

      test('should view my review history', async ({ page }) => {
        await page.goto('/performance/reviews/history');
        
        await expect(page.locator('[data-testid="review-history-list"]')).toBeVisible();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 360 FEEDBACK
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('360 Feedback', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.employee.email, testUsers.employee.password);
      await loginPage.expectLoginSuccess();
    });

    test('should request 360 feedback', async ({ page }) => {
      await page.goto('/performance/360/request');
      
      // Select reviewers
      await page.locator('[data-testid="add-peer"]').click();
      await page.locator('[data-testid="peer-search"]').fill('Nguyen');
      await page.locator('[data-testid="peer-option"]').first().click();
      
      await page.locator('[data-testid="add-peer"]').click();
      await page.locator('[data-testid="peer-search"]').fill('Tran');
      await page.locator('[data-testid="peer-option"]').first().click();
      
      await page.locator('[data-testid="send-request"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Đã gửi yêu cầu feedback');
    });

    test('should submit peer feedback', async ({ page }) => {
      await page.goto('/performance/360/pending');
      
      const pendingFeedback = page.locator('[data-testid="feedback-request"]').first();
      
      if (await pendingFeedback.isVisible()) {
        await pendingFeedback.click();
        
        // Fill feedback form
        await page.locator('[data-testid="q-communication"]').selectOption('4');
        await page.locator('[data-testid="q-teamwork"]').selectOption('5');
        await page.locator('[data-testid="q-technical"]').selectOption('4');
        await page.locator('[data-testid="q-leadership"]').selectOption('3');
        
        await page.locator('[data-testid="strengths"]').fill('Excellent problem solving, great mentor');
        await page.locator('[data-testid="improvements"]').fill('Could communicate more proactively');
        await page.locator('[data-testid="additional-comments"]').fill('Great team player, always willing to help');
        
        await page.locator('[data-testid="submit-feedback"]').click();
        
        await expect(page.locator('[data-testid="toast-message"]')).toContainText('Cảm ơn bạn đã gửi feedback');
      }
    });

    test('should view 360 feedback report', async ({ page }) => {
      await page.goto('/performance/360/report');
      
      await expect(page.locator('[data-testid="feedback-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="feedback-comments"]')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // COMPETENCY ASSESSMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Competency Assessment', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.hrManager.email, testUsers.hrManager.password);
      await loginPage.expectLoginSuccess();
    });

    test('should manage competency framework', async ({ page }) => {
      await page.goto('/performance/competencies');
      
      await expect(page.locator('[data-testid="competency-tree"]')).toBeVisible();
    });

    test('should create competency', async ({ page }) => {
      await page.goto('/performance/competencies/new');
      
      await page.locator('[data-testid="field-name"]').fill('Technical Leadership');
      await page.locator('[data-testid="field-category"]').selectOption('TECHNICAL');
      await page.locator('[data-testid="field-description"]').fill('Ability to lead technical decisions');
      
      // Add proficiency levels
      await page.locator('[data-testid="level-1-desc"]').fill('Basic understanding');
      await page.locator('[data-testid="level-2-desc"]').fill('Can apply with guidance');
      await page.locator('[data-testid="level-3-desc"]').fill('Works independently');
      await page.locator('[data-testid="level-4-desc"]').fill('Can mentor others');
      await page.locator('[data-testid="level-5-desc"]').fill('Expert, sets standards');
      
      await page.locator('[data-testid="save-competency"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Tạo năng lực thành công');
    });

    test('should assess employee competencies', async ({ page }) => {
      await page.goto('/performance/competencies/assess');
      
      // Select employee
      await page.locator('[data-testid="employee-select"]').click();
      await page.locator('[role="option"]').first().click();
      
      await page.waitForLoadState('networkidle');
      
      // Rate competencies
      const competencyItems = page.locator('[data-testid="competency-item"]');
      const count = await competencyItems.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        await competencyItems.nth(i).locator('[data-testid="rating-input"]').selectOption('3');
      }
      
      await page.locator('[data-testid="save-assessment"]').click();
      
      await expect(page.locator('[data-testid="toast-message"]')).toContainText('Lưu đánh giá thành công');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // REPORTS & ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════════

  test.describe('Performance Reports', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(testUsers.hrManager.email, testUsers.hrManager.password);
      await loginPage.expectLoginSuccess();
    });

    test('should display performance dashboard', async ({ page }) => {
      await page.goto('/performance/dashboard');
      
      await expect(page.locator('[data-testid="review-completion-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-progress-chart"]')).toBeVisible();
    });

    test('should export performance report', async ({ page }) => {
      await page.goto('/performance/reports');
      
      await page.locator('[data-testid="report-type"]').selectOption('PERFORMANCE_SUMMARY');
      await page.locator('[data-testid="date-range-start"]').fill('2025-01-01');
      await page.locator('[data-testid="date-range-end"]').fill('2025-03-31');
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-report"]').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('performance');
    });
  });
});
