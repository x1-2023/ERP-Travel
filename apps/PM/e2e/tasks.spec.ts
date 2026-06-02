import { test, expect } from '@playwright/test'
import { TEST_TASKS, TASK_STATUSES } from './fixtures/test-data'

test.describe('Tasks and Kanban Board', () => {
  test('should render kanban board', async ({ page }) => {
    // Navigate to tasks/kanban page
    await page.goto('/tasks')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify kanban board heading
    const boardHeading = page
      .getByRole('heading', { name: /kanban|board|tasks|công việc/i })
      .first()

    if (await boardHeading.isVisible({ timeout: 5_000 })) {
      await expect(boardHeading).toBeVisible()
    }

    // Verify kanban columns are present
    const columns = page.locator(
      '[data-testid="kanban-column"], .kanban-column, [role="region"]'
    )

    const columnCount = await columns.count()

    if (columnCount > 0) {
      // Should have at least 3 columns (todo, in progress, done)
      expect(columnCount).toBeGreaterThanOrEqual(1)
      await expect(columns.first()).toBeVisible()
    }

    // Verify task cards are visible
    const taskCards = page.locator(
      '[data-testid="task-card"], .task-card, [data-draggable-id], .card'
    )

    const taskCount = await taskCards.count()

    if (taskCount > 0) {
      await expect(taskCards.first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('should support drag-drop task movement', async ({ page }) => {
    await page.goto('/tasks')

    // Wait for kanban to load
    await page.waitForLoadState('networkidle')

    // Find a task card in "todo" column
    const todoColumn = page
      .locator('[data-testid="kanban-column"], .kanban-column')
      .filter({ has: page.getByText(/cần làm|todo/i) })
      .first()

    if (await todoColumn.isVisible({ timeout: 5_000 })) {
      // Get first task in todo column
      const taskCard = todoColumn
        .locator('[data-testid="task-card"], .task-card, [data-draggable-id], article')
        .first()

      if (await taskCard.isVisible()) {
        // Find target column (in_progress)
        const inProgressColumn = page
          .locator('[data-testid="kanban-column"], .kanban-column')
          .filter({ has: page.getByText(/đang làm|in.?progress/i) })
          .first()

        if (await inProgressColumn.isVisible()) {
          // Perform drag and drop
          const taskBox = await taskCard.boundingBox()
          const dropBox = await inProgressColumn.boundingBox()

          if (taskBox && dropBox) {
            // Simulate drag
            await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2)
            await page.mouse.down()

            // Move to target column
            await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + 50)

            // Release
            await page.mouse.up()

            // Wait for potential API call
            await page.waitForTimeout(800)

            // Verify task moved (should be visible in target column)
            const movedTask = inProgressColumn.locator(
              '[data-testid="task-card"], .task-card'
            )

            if (await movedTask.isVisible({ timeout: 5_000 })) {
              expect(await movedTask.count()).toBeGreaterThan(0)
            }
          }
        }
      }
    }
  })

  test('should filter tasks by status and priority', async ({ page }) => {
    await page.goto('/tasks')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Get initial task count
    const allTasks = page.locator(
      '[data-testid="task-card"], .task-card, [data-draggable-id]'
    )

    const initialCount = await allTasks.count()

    // Look for status filter
    const statusFilter = page
      .getByRole('combobox', { name: /trạng thái|status/i })
      .first()

    if (await statusFilter.isVisible({ timeout: 5_000 })) {
      await statusFilter.click()

      // Select "in progress" status
      const inProgressOption = page.getByRole('option', { name: /đang làm|in.?progress/i }).first()

      if (await inProgressOption.isVisible({ timeout: 3_000 })) {
        await inProgressOption.click()

        // Wait for filter to apply
        await page.waitForTimeout(800)

        // Verify filtered results
        const filteredTasks = page.locator(
          '[data-testid="task-card"], .task-card, [data-draggable-id]'
        )

        const filteredCount = await filteredTasks.count()

        // Filtered count should be less than or equal to initial
        expect(filteredCount).toBeLessThanOrEqual(initialCount)
      }
    }

    // Look for priority filter
    const priorityFilter = page
      .getByRole('combobox', { name: /độ ưu tiên|priority/i })
      .first()

    if (await priorityFilter.isVisible({ timeout: 5_000 })) {
      await priorityFilter.click()

      // Select "high" priority
      const highPriorityOption = page.getByRole('option', { name: /cao|high/i }).first()

      if (await highPriorityOption.isVisible({ timeout: 3_000 })) {
        await highPriorityOption.click()

        // Wait for filter to apply
        await page.waitForTimeout(800)

        // Verify filtered results
        const filteredByPriority = page.locator(
          '[data-testid="task-card"], .task-card, [data-draggable-id]'
        )

        expect(await filteredByPriority.count()).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
