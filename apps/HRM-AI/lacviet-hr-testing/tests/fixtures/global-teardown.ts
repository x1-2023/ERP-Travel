// tests/fixtures/global-teardown.ts

/**
 * LAC VIET HR - Playwright Global Teardown
 * Runs once after all tests
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up test data (if needed)
    // await cleanupTestData();
    
    // Generate summary report
    await generateSummaryReport();
    
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('⚠️ Global teardown warning:', error);
  }
}

async function generateSummaryReport() {
  const resultsPath = path.join(process.cwd(), 'reports', 'playwright-results.json');
  
  if (!fs.existsSync(resultsPath)) {
    return;
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.suites?.reduce((acc: number, suite: any) => 
        acc + (suite.specs?.length || 0), 0) || 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: results.stats?.duration || 0,
    };
    
    // Count results
    const countResults = (suites: any[]) => {
      for (const suite of suites || []) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            for (const result of test.results || []) {
              if (result.status === 'passed') summary.passed++;
              else if (result.status === 'failed') summary.failed++;
              else if (result.status === 'skipped') summary.skipped++;
            }
          }
        }
        if (suite.suites) {
          countResults(suite.suites);
        }
      }
    };
    
    countResults(results.suites);
    
    // Write summary
    const summaryPath = path.join(process.cwd(), 'reports', 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Total Tests: ${summary.totalTests.toString().padEnd(6)} │ Passed: ${summary.passed.toString().padEnd(6)} │ Failed: ${summary.failed.toString().padEnd(6)} ║
║  Duration: ${(summary.duration / 1000).toFixed(2)}s                                         ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.warn('Could not generate summary report:', error);
  }
}

export default globalTeardown;
