import { test, expect } from './fixtures/auth.fixture'

test.describe('RBAC Enforcement', () => {
  test('ADMIN sees settings in sidebar navigation', async ({ adminPage }) => {
    await adminPage.goto('/dashboard')
    await expect(adminPage.locator('main')).toBeVisible({ timeout: 10_000 })

    // Admin should see "Cài đặt" nav item in sidebar
    const sidebar = adminPage.locator('aside')
    await expect(sidebar.getByText('Cài đặt')).toBeVisible()
  })

  test('MEMBER does not see settings in sidebar navigation', async ({ memberPage }) => {
    await memberPage.goto('/dashboard')
    await expect(memberPage.locator('main')).toBeVisible({ timeout: 10_000 })

    // Member should NOT see "Cài đặt" nav item — it's removed from DOM, not just hidden
    const sidebar = memberPage.locator('aside')
    await expect(sidebar.getByText('Cài đặt')).toBeHidden()
  })

  test('VIEWER cannot see create buttons on contacts page', async ({ viewerPage }) => {
    await viewerPage.goto('/contacts')
    // Wait for page to load — viewer may see empty list or some contacts
    await expect(viewerPage.getByRole('heading', { name: 'Liên hệ' })).toBeVisible({ timeout: 10_000 })

    // Viewer should NOT see "Thêm liên hệ" button
    await expect(viewerPage.getByRole('link', { name: 'Thêm liên hệ' })).toBeHidden()
  })

  test('VIEWER cannot see create button on pipeline page', async ({ viewerPage }) => {
    await viewerPage.goto('/pipeline')
    await expect(viewerPage.getByRole('heading', { name: 'Pipeline' })).toBeVisible({ timeout: 10_000 })

    // Viewer should NOT see "Thêm deal" link/button
    await expect(viewerPage.getByRole('link', { name: 'Thêm deal' })).toBeHidden()
  })

  test('ADMIN can see save button on settings page', async ({ adminPage }) => {
    await adminPage.goto('/settings')
    await expect(adminPage.getByText('Thông tin công ty')).toBeVisible({ timeout: 10_000 })
    await expect(adminPage.getByRole('button', { name: 'Lưu thông tin' })).toBeVisible()
  })

  test('MEMBER cannot see save button on settings page', async ({ memberPage }) => {
    await memberPage.goto('/settings')
    await expect(memberPage.getByText('Thông tin công ty')).toBeVisible({ timeout: 10_000 })
    await expect(memberPage.getByRole('button', { name: 'Lưu thông tin' })).toBeHidden()
  })
})
