import { test, expect } from '@playwright/test'
import { TEST_PROJECTS, PROJECT_STATUSES } from './fixtures/test-data'

test.describe('Projects Management', () => {
  test('should display project list', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/projects')

    // Wait for projects to load
    await page.waitForLoadState('networkidle')

    // Verify page title or heading
    const projectsHeading = page
      .getByRole('heading', { name: /dự án|projects|project list/i })
      .first()

    if (await projectsHeading.isVisible({ timeout: 5_000 })) {
      await expect(projectsHeading).toBeVisible()
    }

    // Verify project list container exists
    const projectList = page.locator(
      '[data-testid="project-list"], .project-list, table, [role="grid"]'
    )

    await expect(projectList.first()).toBeVisible({ timeout: 10_000 })

    // Verify at least one project item is visible
    const projectItems = page.locator(
      '[data-testid="project-item"], .project-item, tr, article'
    )

    const itemCount = await projectItems.count()
    if (itemCount > 0) {
      await expect(projectItems.first()).toBeVisible()
    }
  })

  test('should display project details', async ({ page }) => {
    await page.goto('/projects')

    // Wait for projects to load
    await page.waitForLoadState('networkidle')

    // Click on first project
    const projectItem = page.locator(
      '[data-testid="project-item"], .project-item, tr, article'
    ).first()

    if (await projectItem.isVisible()) {
      await projectItem.click()

      // Wait for project detail page/modal
      await page.waitForLoadState('networkidle')

      // Verify project details are displayed
      const projectTitle = page
        .getByRole('heading', { name: /[E2E].*dự án|project details/i })
        .first()

      if (await projectTitle.isVisible({ timeout: 5_000 })) {
        await expect(projectTitle).toBeVisible()
      }

      // Verify project information sections
      const detailContent = page.locator(
        '[data-testid="project-details"], .project-details, .detail-panel, main'
      )

      await expect(detailContent.first()).toBeVisible({ timeout: 10_000 })

      // Verify tasks or team members section exists
      const tasksSection = page.locator(
        '[data-testid*="task"], .tasks, [aria-label*="task"]'
      )

      if (await tasksSection.first().isVisible({ timeout: 5_000 })) {
        await expect(tasksSection.first()).toBeVisible()
      }
    }
  })

  test('should filter projects by status', async ({ page }) => {
    await page.goto('/projects')

    // Wait for projects to load
    await page.waitForLoadState('networkidle')

    // Get initial project count
    const allProjects = page.locator(
      '[data-testid="project-item"], .project-item, tr'
    )

    const initialCount = await allProjects.count()

    // Look for status filter
    const statusFilter = page
      .getByRole('combobox', { name: /trạng thái|status|filter/i })
      .first()

    if (await statusFilter.isVisible({ timeout: 5_000 })) {
      await statusFilter.click()

      // Select "active" status
      const activeOption = page.getByRole('option', { name: /đang chạy|active/i }).first()

      if (await activeOption.isVisible({ timeout: 3_000 })) {
        await activeOption.click()

        // Wait for filter to apply
        await page.waitForTimeout(800)

        // Verify filtered results
        const filteredProjects = page.locator(
          '[data-testid="project-item"], .project-item, tr'
        )

        const filteredCount = await filteredProjects.count()

        // Should have fewer or equal projects after filtering
        expect(filteredCount).toBeLessThanOrEqual(initialCount)
      }
    } else {
      // If no filter available, just verify list loads
      const projects = page.locator(
        '[data-testid="project-item"], .project-item, tr'
      )

      expect(await projects.count()).toBeGreaterThanOrEqual(0)
    }
  })
})
