// tests/security/setup.ts

/**
 * LAC VIET HR - Security Test Setup
 * Global setup and utilities for security tests
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';

// Global test configuration
export const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@company.com',
    password: process.env.TEST_USER_PASSWORD || 'ValidP@ssw0rd123!',
  },
  adminUser: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@company.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminP@ssw0rd123!',
  },
};

// Track test metrics
export const testMetrics = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  vulnerabilitiesFound: 0,
  startTime: Date.now(),
};

// Setup hooks for security tests
export function setupSecurityTests() {
  beforeAll(async () => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          LAC VIET HR - Security Test Suite                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`\nTarget: ${TEST_CONFIG.baseUrl}`);
    console.log(`Timeout: ${TEST_CONFIG.timeout}ms\n`);

    testMetrics.startTime = Date.now();

    // Verify target is reachable
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/health`);
      if (!response.ok) {
        console.warn('Warning: Target health check failed');
      }
    } catch (error) {
      console.warn('Warning: Could not reach target, some tests may fail');
    }
  });

  afterAll(() => {
    const duration = Date.now() - testMetrics.startTime;
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                    TEST SUMMARY                               ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Duration: ${Math.round(duration / 1000)}s`);
    console.log(`Total: ${testMetrics.totalTests}`);
    console.log(`Passed: ${testMetrics.passedTests}`);
    console.log(`Failed: ${testMetrics.failedTests}`);
    console.log(`Vulnerabilities Found: ${testMetrics.vulnerabilitiesFound}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  });

  beforeEach(() => {
    testMetrics.totalTests++;
  });
}

// Helper to report vulnerability
export function reportVulnerability(
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  title: string,
  details: string
): void {
  testMetrics.vulnerabilitiesFound++;
  console.log(`\n⚠️  [${severity}] ${title}`);
  console.log(`   ${details}\n`);
}

// Helper to safely test payloads
export async function safeTestPayload(
  testFn: () => Promise<void>,
  payloadDescription: string
): Promise<boolean> {
  try {
    await testFn();
    return true;
  } catch (error) {
    console.log(`  ⚠️  Payload test failed (${payloadDescription}): ${error}`);
    return false;
  }
}

export default {
  TEST_CONFIG,
  testMetrics,
  setupSecurityTests,
  reportVulnerability,
  safeTestPayload,
};
