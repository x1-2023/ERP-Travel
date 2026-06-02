# LAC VIET HR - Testing Suite

## Overview

This testing suite provides comprehensive test coverage for the LAC VIET HR application, including:

- **Unit Tests**: Component and utility function tests with Vitest
- **API Tests**: Integration tests for API endpoints
- **E2E Tests**: End-to-end tests with Playwright
- **Performance Tests**: Lighthouse and k6 load testing (optional)

## Directory Structure

```
tests/
├── setup.ts                    # Global test setup (MSW, mocks)
├── utils/
│   └── test-utils.tsx          # Custom render with providers
├── mocks/
│   ├── server.ts               # MSW server configuration
│   ├── handlers.ts             # API mock handlers
│   └── data/
│       ├── employees.mock.ts   # Mock employee data
│       └── leave.mock.ts       # Mock leave data
├── api/
│   └── specs/
│       └── employees.api.test.ts  # API integration tests
└── e2e/
    ├── global-setup.ts         # Database seeding
    ├── global-teardown.ts      # Cleanup
    ├── fixtures/
    │   └── auth.fixture.ts     # Pre-authenticated contexts
    ├── pages/                  # Page Object Models
    │   ├── login.page.ts
    │   ├── employees.page.ts
    │   └── leave.page.ts
    └── specs/
        ├── auth/
        │   └── login.spec.ts
        ├── employees/
        │   └── employee-crud.spec.ts
        └── leave/
            └── leave-workflow.spec.ts
```

## Quick Start

### Install Dependencies

```bash
npm install
npm run test:e2e:install  # Install Playwright browsers
```

### Run Tests

```bash
# Unit & API tests
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage report
npm run test:ui           # Vitest UI

# E2E tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:headed   # Run with browser visible
npm run test:e2e:debug    # Debug mode

# API tests only
npm run test:api

# All tests
npm run test:all
```

## Test Configuration

### Vitest Configuration (vitest.config.ts)

- Environment: jsdom
- Coverage: v8 provider with 70% threshold
- Path aliases matching Next.js tsconfig
- Vietnamese locale (vi-VN, Asia/Ho_Chi_Minh)

### Playwright Configuration (playwright.config.ts)

- Multi-browser: Chromium, Firefox, WebKit
- Mobile testing: Pixel 5, iPhone 12
- Vietnamese locale
- Auto web server startup
- Screenshot/video on failure

## Test Patterns

### Page Object Model (E2E)

```typescript
import { LoginPage } from '../pages/login.page';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@test.your-domain.com', 'Admin@123456');
  await loginPage.expectRedirectToDashboard();
});
```

### Auth Fixtures (E2E)

```typescript
import { test } from '../fixtures/auth.fixture';

test('admin can manage employees', async ({ adminPage }) => {
  // adminPage is pre-authenticated as admin
  await adminPage.goto('/employees');
});

test('employee can view dashboard', async ({ employeePage }) => {
  // employeePage is pre-authenticated as employee
  await employeePage.goto('/dashboard');
});
```

### Custom Render (Unit Tests)

```typescript
import { render, screen } from '@/tests/utils/test-utils';

test('renders component with providers', () => {
  const { user } = render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### MSW Mock Handlers

```typescript
// handlers.ts provides mocks for:
// - /api/auth/* - Authentication
// - /api/employees/* - Employee CRUD
// - /api/leave/* - Leave management
// - /api/dashboard/* - Dashboard data
// - /api/notifications/* - Notifications
```

## Test Data

### Test Users (E2E)

| Role     | Email                      | Password        |
|----------|----------------------------|-----------------|
| Admin    | admin@test.your-domain.com     | Admin@123456    |
| Manager  | manager@test.your-domain.com   | Manager@123456  |
| Employee | employee@test.your-domain.com  | Employee@123456 |

### Mock Data Generators

```typescript
import { generateEmployee, generateEmployees } from '@/tests/mocks/data/employees.mock';

const employee = generateEmployee({ firstName: 'Nguyễn' });
const employees = generateEmployees(10);
```

## Coverage Requirements

| Category      | Target |
|---------------|--------|
| Global        | 70%    |
| lib/          | 80%    |
| services/     | 75%    |
| components/   | 60%    |

## CI/CD Integration

### GitHub Actions Example

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run test:coverage
    - run: npx playwright install --with-deps
    - run: npm run test:e2e
```

## Debugging

### Vitest

```bash
npm run test:ui  # Opens Vitest UI for debugging
```

### Playwright

```bash
npm run test:e2e:debug  # Opens Playwright Inspector
npm run test:e2e:headed # Watch browser execution
```

### View Reports

```bash
npm run test:e2e:report  # Open HTML report
```

## Writing New Tests

### Unit Test Example

```typescript
// tests/components/MyComponent.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/specs/feature/my-feature.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('My Feature', () => {
  test('should work for admin', async ({ adminPage }) => {
    await adminPage.goto('/my-feature');
    await expect(adminPage.locator('h1')).toHaveText('My Feature');
  });
});
```

## Troubleshooting

### MSW Not Intercepting Requests

Ensure server is started in setup.ts and handlers are properly defined.

### E2E Auth Failures

Check that auth state files exist in `tests/e2e/.auth/` after running global-setup.

### Flaky Tests

- Add proper waits: `await page.waitForLoadState('networkidle')`
- Use locators that wait automatically: `await expect(element).toBeVisible()`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
