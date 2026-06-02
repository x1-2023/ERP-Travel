// tests/e2e/lms/learning.spec.ts

/**
 * LAC VIET HR - Learning Management System (LMS) E2E Tests
 * Courses, enrollments, progress tracking, certifications
 */

import { test, expect } from '../../fixtures/test-fixtures';

test.describe('LMS - Course Catalog', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/learning');
    await page.waitForLoadState('networkidle');
  });

  test('should display course catalog', async ({ page }) => {
    const catalog = page.locator('[data-testid="course-catalog"]');
    await expect(catalog).toBeVisible();
  });

  test('should search courses', async ({ page }) => {
    await page.fill('input[name="search"]', 'Leadership');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    const results = page.locator('[data-testid="course-card"]');
    const count = await results.count();
    
    if (count > 0) {
      const text = await results.first().textContent();
      expect(text?.toLowerCase()).toContain('leadership');
    }
  });

  test('should filter courses by category', async ({ page }) => {
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-technical"]');
    await page.waitForLoadState('networkidle');
    
    const courses = page.locator('[data-testid="course-card"]');
    await expect(courses.first()).toBeVisible();
  });

  test('should view course details', async ({ page }) => {
    await page.click('[data-testid="course-card"]:first-child');
    
    await expect(page).toHaveURL(/\/learning\/courses\/[a-zA-Z0-9-]+/);
    
    // Check course details
    await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-duration"]')).toBeVisible();
  });

  test('should enroll in course', async ({ page }) => {
    // Navigate to a course
    await page.click('[data-testid="course-card"]:first-child');
    
    // Click enroll
    const enrollButton = page.locator('[data-testid="enroll-button"]');
    if (await enrollButton.isVisible()) {
      await enrollButton.click();
      
      // Confirm enrollment
      await page.click('[data-testid="confirm-enroll"]');
      
      // Should show success
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });
});

test.describe('LMS - My Learning', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/learning/my-courses');
    await page.waitForLoadState('networkidle');
  });

  test('should display enrolled courses', async ({ page }) => {
    const enrolledCourses = page.locator('[data-testid="enrolled-courses"]');
    await expect(enrolledCourses).toBeVisible();
  });

  test('should show course progress', async ({ page }) => {
    const progressBar = page.locator('[data-testid="progress-bar"]').first();
    
    if (await progressBar.isVisible()) {
      const progress = await progressBar.getAttribute('data-progress');
      expect(parseInt(progress || '0')).toBeGreaterThanOrEqual(0);
      expect(parseInt(progress || '0')).toBeLessThanOrEqual(100);
    }
  });

  test('should continue learning', async ({ page }) => {
    const continueButton = page.locator('[data-testid="continue-learning"]').first();
    
    if (await continueButton.isVisible()) {
      await continueButton.click();
      
      // Should navigate to course player
      await expect(page).toHaveURL(/\/learning\/courses\/.*\/learn/);
    }
  });

  test('should filter by status', async ({ page }) => {
    // Filter in progress
    await page.click('[data-testid="filter-in-progress"]');
    await page.waitForLoadState('networkidle');
    
    const courses = page.locator('[data-testid="course-item"]');
    const count = await courses.count();
    
    for (let i = 0; i < count; i++) {
      const status = await courses.nth(i).getAttribute('data-status');
      expect(status).toBe('IN_PROGRESS');
    }
  });
});

test.describe('LMS - Course Player', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should display course content', async ({ page }) => {
    // Navigate to enrolled course
    await page.goto('/learning/my-courses');
    await page.click('[data-testid="continue-learning"]');
    
    // Course player should be visible
    const player = page.locator('[data-testid="course-player"]');
    await expect(player).toBeVisible();
  });

  test('should navigate between lessons', async ({ page }) => {
    await page.goto('/learning/my-courses');
    await page.click('[data-testid="continue-learning"]');
    
    // Click next lesson
    const nextButton = page.locator('[data-testid="next-lesson"]');
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should mark lesson as complete', async ({ page }) => {
    await page.goto('/learning/my-courses');
    await page.click('[data-testid="continue-learning"]');
    
    // Complete lesson
    const completeButton = page.locator('[data-testid="complete-lesson"]');
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // Should show completion feedback
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });

  test('should take quiz', async ({ page }) => {
    await page.goto('/learning/my-courses');
    await page.click('[data-testid="continue-learning"]');
    
    // Find quiz lesson
    const quizLesson = page.locator('[data-testid="lesson-item"][data-type="quiz"]');
    
    if (await quizLesson.isVisible()) {
      await quizLesson.click();
      
      // Quiz should be displayed
      const quiz = page.locator('[data-testid="quiz-container"]');
      await expect(quiz).toBeVisible();
      
      // Answer questions
      const questions = page.locator('[data-testid="quiz-question"]');
      const questionCount = await questions.count();
      
      for (let i = 0; i < questionCount; i++) {
        // Select first option
        await page.click(`[data-testid="question-${i}-option-0"]`);
      }
      
      // Submit quiz
      await page.click('[data-testid="submit-quiz"]');
      
      // Should show results
      const results = page.locator('[data-testid="quiz-results"]');
      await expect(results).toBeVisible();
    }
  });
});

test.describe('LMS - Certifications', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/learning/certifications');
    await page.waitForLoadState('networkidle');
  });

  test('should display earned certifications', async ({ page }) => {
    const certifications = page.locator('[data-testid="certifications-list"]');
    await expect(certifications).toBeVisible();
  });

  test('should download certificate', async ({ page }) => {
    const downloadButton = page.locator('[data-testid="download-certificate"]').first();
    
    if (await downloadButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/certificate.*\.pdf/);
    }
  });

  test('should view certificate details', async ({ page }) => {
    const certItem = page.locator('[data-testid="certification-item"]').first();
    
    if (await certItem.isVisible()) {
      await certItem.click();
      
      // Details should be visible
      await expect(page.locator('[data-testid="cert-course-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="cert-completion-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="cert-credential-id"]')).toBeVisible();
    }
  });
});

test.describe('LMS - Admin Management', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/learning/admin');
    await page.waitForLoadState('networkidle');
  });

  test('should display admin dashboard', async ({ page }) => {
    const dashboard = page.locator('[data-testid="lms-admin-dashboard"]');
    await expect(dashboard).toBeVisible();
  });

  test('should create new course', async ({ page }) => {
    await page.click('[data-testid="create-course"]');
    
    // Fill course details
    await page.fill('input[name="title"]', 'E2E Test Course');
    await page.fill('textarea[name="description"]', 'This is an E2E test course');
    await page.selectOption('select[name="category"]', 'TECHNICAL');
    await page.fill('input[name="duration"]', '120');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should add lesson to course', async ({ page }) => {
    // Navigate to course editor
    await page.click('[data-testid="course-item"]:first-child');
    await page.click('[data-testid="manage-content"]');
    
    // Add lesson
    await page.click('[data-testid="add-lesson"]');
    
    // Fill lesson details
    await page.fill('input[name="lessonTitle"]', 'E2E Test Lesson');
    await page.selectOption('select[name="lessonType"]', 'VIDEO');
    
    // Submit
    await page.click('[data-testid="save-lesson"]');
    
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  test('should view enrollment reports', async ({ page }) => {
    await page.click('[data-testid="reports-tab"]');
    
    const enrollmentReport = page.locator('[data-testid="enrollment-report"]');
    await expect(enrollmentReport).toBeVisible();
  });

  test('should assign course to employees', async ({ page }) => {
    await page.click('[data-testid="course-item"]:first-child');
    await page.click('[data-testid="assign-course"]');
    
    // Select employees or department
    await page.click('[data-testid="select-department"]');
    await page.click('[data-testid="department-option"]:first-child');
    
    // Set deadline
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 1);
    await page.fill('input[name="deadline"]', deadline.toISOString().split('T')[0]);
    
    // Assign
    await page.click('[data-testid="confirm-assign"]');
    
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });
});

test.describe('LMS - Learning Paths', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should display learning paths', async ({ page }) => {
    await page.goto('/learning/paths');
    await page.waitForLoadState('networkidle');
    
    const paths = page.locator('[data-testid="learning-paths"]');
    await expect(paths).toBeVisible();
  });

  test('should view path details', async ({ page }) => {
    await page.goto('/learning/paths');
    await page.click('[data-testid="path-card"]:first-child');
    
    // Path details
    await expect(page.locator('[data-testid="path-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="path-courses"]')).toBeVisible();
  });

  test('should enroll in learning path', async ({ page }) => {
    await page.goto('/learning/paths');
    await page.click('[data-testid="path-card"]:first-child');
    
    const enrollButton = page.locator('[data-testid="enroll-path"]');
    if (await enrollButton.isVisible()) {
      await enrollButton.click();
      
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
    }
  });
});
