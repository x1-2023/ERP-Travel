// tests/e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

/**
 * LAC VIET HR - E2E Global Setup
 * Prepares test environment, seeds database, creates auth states
 */

const prisma = new PrismaClient();

// Test user credentials
const TEST_USERS = {
  admin: {
    email: 'admin@test.your-domain.com',
    password: 'Admin@123456',
    name: 'Test Admin',
    role: 'ADMIN' as const,
  },
  manager: {
    email: 'manager@test.your-domain.com',
    password: 'Manager@123456',
    name: 'Test Manager',
    role: 'MANAGER' as const,
  },
  employee: {
    email: 'employee@test.your-domain.com',
    password: 'Employee@123456',
    name: 'Test Employee',
    role: 'EMPLOYEE' as const,
  },
};

async function globalSetup(config: FullConfig) {
  console.log('\n🚀 ═══════════════════════════════════════════════════════════');
  console.log('   LAC VIET HR - E2E Test Setup');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // ══════════════════════════════════════════════════════════════════════
    // STEP 1: Database Setup
    // ══════════════════════════════════════════════════════════════════════
    console.log('📦 Step 1: Preparing test database...');
    await seedTestDatabase();
    console.log('   ✓ Test database ready\n');

    // ══════════════════════════════════════════════════════════════════════
    // STEP 2: Create Auth State Directory
    // ══════════════════════════════════════════════════════════════════════
    console.log('📁 Step 2: Creating auth state directory...');
    const authDir = path.join(__dirname, '.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    console.log('   ✓ Auth directory ready\n');

    // ══════════════════════════════════════════════════════════════════════
    // STEP 3: Create Auth States
    // ══════════════════════════════════════════════════════════════════════
    console.log('🔐 Step 3: Creating authentication states...');
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';

    await createAuthState(baseURL, TEST_USERS.admin, path.join(authDir, 'admin.json'));
    console.log('   ✓ Admin auth state saved');

    await createAuthState(baseURL, TEST_USERS.manager, path.join(authDir, 'manager.json'));
    console.log('   ✓ Manager auth state saved');

    await createAuthState(baseURL, TEST_USERS.employee, path.join(authDir, 'employee.json'));
    console.log('   ✓ Employee auth state saved\n');

    // ══════════════════════════════════════════════════════════════════════
    // COMPLETE
    // ══════════════════════════════════════════════════════════════════════
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Setup completed in ${duration}s`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DATABASE SEEDING
// ════════════════════════════════════════════════════════════════════════════════

async function seedTestDatabase() {
  // Clean existing test data
  await cleanTestData();

  // Create test users
  for (const [, user] of Object.entries(TEST_USERS)) {
    const userHashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: userHashedPassword,
        name: user.name,
        role: user.role,
      },
      create: {
        email: user.email,
        password: userHashedPassword,
        name: user.name,
        role: user.role,
      },
    });
  }

  // Create test departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'IT-TEST' },
      update: {},
      create: { code: 'IT-TEST', name: 'IT Department (Test)', description: 'Test IT Department' },
    }),
    prisma.department.upsert({
      where: { code: 'HR-TEST' },
      update: {},
      create: { code: 'HR-TEST', name: 'HR Department (Test)', description: 'Test HR Department' },
    }),
    prisma.department.upsert({
      where: { code: 'SALES-TEST' },
      update: {},
      create: { code: 'SALES-TEST', name: 'Sales Department (Test)', description: 'Test Sales Department' },
    }),
  ]);

  // Create test employees
  const testEmployees = [
    {
      employeeCode: 'TEST-EMP-001',
      firstName: 'Nguyễn',
      lastName: 'Văn Test',
      email: 'nguyen.vantest@test.your-domain.com',
      phone: '0901234567',
      status: 'ACTIVE' as const,
      departmentId: departments[0].id,
    },
    {
      employeeCode: 'TEST-EMP-002',
      firstName: 'Trần',
      lastName: 'Thị Test',
      email: 'tran.thitest@test.your-domain.com',
      phone: '0902345678',
      status: 'ACTIVE' as const,
      departmentId: departments[1].id,
    },
    {
      employeeCode: 'TEST-EMP-003',
      firstName: 'Lê',
      lastName: 'Văn Test',
      email: 'le.vantest@test.your-domain.com',
      phone: '0903456789',
      status: 'ACTIVE' as const,
      departmentId: departments[2].id,
    },
    {
      employeeCode: 'TEST-EMP-004',
      firstName: 'Phạm',
      lastName: 'Thị Test',
      email: 'pham.thitest@test.your-domain.com',
      phone: '0904567890',
      status: 'PROBATION' as const,
      departmentId: departments[0].id,
    },
    {
      employeeCode: 'TEST-EMP-005',
      firstName: 'Hoàng',
      lastName: 'Văn Test',
      email: 'hoang.vantest@test.your-domain.com',
      phone: '0905678901',
      status: 'INACTIVE' as const,
      departmentId: departments[1].id,
    },
  ];

  for (const emp of testEmployees) {
    await prisma.employee.upsert({
      where: { employeeCode: emp.employeeCode },
      update: emp,
      create: emp,
    });
  }

  // Create leave balances for test employees
  const employees = await prisma.employee.findMany({
    where: { employeeCode: { startsWith: 'TEST-EMP' } },
  });

  for (const emp of employees) {
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveType_year: {
          employeeId: emp.id,
          leaveType: 'ANNUAL',
          year: 2024,
        },
      },
      update: {},
      create: {
        employeeId: emp.id,
        leaveType: 'ANNUAL',
        year: 2024,
        entitled: 12,
        used: 2,
        balance: 10,
      },
    });
  }
}

async function cleanTestData() {
  // Delete test data in correct order (respecting foreign keys)
  await prisma.leaveRequest.deleteMany({
    where: { employee: { employeeCode: { startsWith: 'TEST-' } } },
  });

  await prisma.leaveBalance.deleteMany({
    where: { employee: { employeeCode: { startsWith: 'TEST-' } } },
  });

  await prisma.employee.deleteMany({
    where: { employeeCode: { startsWith: 'TEST-' } },
  });

  await prisma.user.deleteMany({
    where: { email: { endsWith: '@test.your-domain.com' } },
  });

  await prisma.department.deleteMany({
    where: { code: { endsWith: '-TEST' } },
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// AUTH STATE CREATION
// ════════════════════════════════════════════════════════════════════════════════

async function createAuthState(
  baseURL: string,
  user: { email: string; password: string },
  outputPath: string
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });

    // Fill login form
    await page.fill('[data-testid="email-input"], input[name="email"], input[type="email"]', user.email);
    await page.fill('[data-testid="password-input"], input[name="password"], input[type="password"]', user.password);

    // Submit form
    await page.click('[data-testid="login-button"], button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Verify login success
    await page.waitForSelector('[data-testid="user-menu"], [data-testid="user-avatar"]', { timeout: 10000 });

    // Save storage state
    await context.storageState({ path: outputPath });

  } catch (error) {
    console.error(`Failed to create auth state for ${user.email}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
