# E2E Tests — Prismy CRM

## Prerequisites

- App running on `localhost:3018` (or auto-started by Playwright)
- Database seeded with test data (handled by `global-setup.ts`)
- Test users created in Supabase (requires `SUPABASE_SERVICE_ROLE_KEY`)

## Quick Start

```bash
pnpm test:e2e           # Run all tests (headless)
pnpm test:e2e:ui        # Playwright UI mode (interactive)
pnpm test:e2e:headed    # Run with visible browser
pnpm test:e2e:debug     # Debug mode (step through)
pnpm test:e2e:report    # Open last HTML report
```

## Test Users

| Role    | Email                    | Password        |
|---------|--------------------------|-----------------|
| Admin   | admin@test.rtr.com     | TestAdmin123!   |
| Manager | manager@test.rtr.com   | TestManager123! |
| Member  | member@test.rtr.com    | TestMember123!  |
| Viewer  | viewer@test.rtr.com    | TestViewer123!  |

Override via environment variables: `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, etc.

## Structure

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts       — Authenticated page fixtures (adminPage, etc.)
│   └── test-data.fixture.ts  — Test data context fixture
├── helpers/
│   ├── auth.helper.ts        — Login/logout functions + test user config
│   ├── seed.helper.ts        — Database seed/cleanup (Prisma + Supabase)
│   └── selectors.ts          — Common UI selectors
├── pages/
│   ├── login.page.ts         — Login page object
│   ├── dashboard.page.ts     — Dashboard page object
│   └── contacts.page.ts      — Contacts page object
├── _legacy/                  — Old spec files (pre-infrastructure)
├── smoke.spec.ts             — Setup verification tests
├── global-setup.ts           — Runs before all tests (seed)
├── global-teardown.ts        — Runs after all tests (cleanup)
└── README.md                 — This file
```

## Writing Tests

### Using auth fixture (recommended)

```typescript
import { test, expect } from '../fixtures/auth.fixture'

test('admin can access settings', async ({ adminPage }) => {
  await adminPage.goto('/settings')
  await expect(adminPage.locator('h1')).toBeVisible()
})
```

### Using page objects

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { TEST_USERS } from './helpers/auth.helper'

test('manual login flow', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(TEST_USERS.member.email, TEST_USERS.member.password)
  await loginPage.expectLoggedIn()
})
```

## Test Data Convention

All test data uses the `[TEST]` prefix:
- Companies: `[TEST] Công ty ABC`
- Contacts: `[TEST] Nguyễn Test A`
- Deals: `[TEST] Deal phần mềm`

This allows cleanup to target only test data without affecting real data.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | For auto-seed | Creates test users in Supabase Auth |
| `PLAYWRIGHT_BASE_URL` | No | Override app URL (default: `http://localhost:3018`) |
| `E2E_ADMIN_EMAIL` | No | Override admin test email |
| `E2E_ADMIN_PASSWORD` | No | Override admin test password |
