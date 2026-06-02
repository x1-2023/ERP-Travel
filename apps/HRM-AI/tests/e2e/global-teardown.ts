// tests/e2e/global-teardown.ts
import { FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * LAC VIET HR - E2E Global Teardown
 * Cleans up test data and artifacts after all tests complete
 */

const prisma = new PrismaClient();

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 ═══════════════════════════════════════════════════════════');
  console.log('   LAC VIET HR - E2E Test Teardown');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // ══════════════════════════════════════════════════════════════════════
    // STEP 1: Clean Test Data
    // ══════════════════════════════════════════════════════════════════════
    console.log('🗑️  Step 1: Cleaning test data from database...');
    await cleanTestData();
    console.log('   ✓ Test data cleaned\n');

    // ══════════════════════════════════════════════════════════════════════
    // STEP 2: Clean Auth States (Optional)
    // ══════════════════════════════════════════════════════════════════════
    console.log('📁 Step 2: Cleaning auth state files...');
    const authDir = path.join(__dirname, '.auth');
    if (fs.existsSync(authDir)) {
      const files = fs.readdirSync(authDir);
      for (const file of files) {
        fs.unlinkSync(path.join(authDir, file));
      }
      console.log(`   ✓ Removed ${files.length} auth state files\n`);
    } else {
      console.log('   ✓ No auth state files to clean\n');
    }

    // ══════════════════════════════════════════════════════════════════════
    // STEP 3: Generate Test Summary
    // ══════════════════════════════════════════════════════════════════════
    console.log('📊 Step 3: Generating test summary...');
    await generateTestSummary();
    console.log('   ✓ Test summary generated\n');

    // ══════════════════════════════════════════════════════════════════════
    // COMPLETE
    // ══════════════════════════════════════════════════════════════════════
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Teardown completed in ${duration}s`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Teardown failed:', error);
    // Don't throw - we don't want teardown failures to fail the test run
  } finally {
    await prisma.$disconnect();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DATABASE CLEANUP
// ════════════════════════════════════════════════════════════════════════════════

async function cleanTestData() {
  try {
    // Delete test data in correct order (respecting foreign keys)

    // Leave-related data
    const leaveDeleted = await prisma.leaveRequest.deleteMany({
      where: { employee: { employeeCode: { startsWith: 'TEST-' } } },
    });
    console.log(`   - Deleted ${leaveDeleted.count} leave requests`);

    const balanceDeleted = await prisma.leaveBalance.deleteMany({
      where: { employee: { employeeCode: { startsWith: 'TEST-' } } },
    });
    console.log(`   - Deleted ${balanceDeleted.count} leave balances`);

    // Attendance data
    const attendanceDeleted = await prisma.attendance.deleteMany({
      where: { employee: { employeeCode: { startsWith: 'TEST-' } } },
    });
    console.log(`   - Deleted ${attendanceDeleted.count} attendance records`);

    // Payroll data
    const payrollDeleted = await prisma.payroll.deleteMany({
      where: { employee: { employeeCode: { startsWith: 'TEST-' } } },
    });
    console.log(`   - Deleted ${payrollDeleted.count} payroll records`);

    // Employee data
    const employeeDeleted = await prisma.employee.deleteMany({
      where: { employeeCode: { startsWith: 'TEST-' } },
    });
    console.log(`   - Deleted ${employeeDeleted.count} employees`);

    // User accounts
    const userDeleted = await prisma.user.deleteMany({
      where: { email: { endsWith: '@test.your-domain.com' } },
    });
    console.log(`   - Deleted ${userDeleted.count} test users`);

    // Departments
    const deptDeleted = await prisma.department.deleteMany({
      where: { code: { endsWith: '-TEST' } },
    });
    console.log(`   - Deleted ${deptDeleted.count} test departments`);

  } catch (error) {
    console.error('   ⚠️ Error during cleanup:', error);
    // Continue even if some deletions fail
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEST SUMMARY
// ════════════════════════════════════════════════════════════════════════════════

async function generateTestSummary() {
  const resultsPath = path.join(process.cwd(), 'test-results', 'e2e-results.json');

  if (!fs.existsSync(resultsPath)) {
    console.log('   ⚠️ No test results file found');
    return;
  }

  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.stats?.tests || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0,
    };

    const summaryPath = path.join(process.cwd(), 'test-results', 'e2e-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`   - Total Tests: ${summary.totalTests}`);
    console.log(`   - Passed: ${summary.passed}`);
    console.log(`   - Failed: ${summary.failed}`);
    console.log(`   - Skipped: ${summary.skipped}`);
    console.log(`   - Duration: ${(summary.duration / 1000).toFixed(2)}s`);

  } catch {
    console.log('   ⚠️ Could not parse test results');
  }
}

export default globalTeardown;
