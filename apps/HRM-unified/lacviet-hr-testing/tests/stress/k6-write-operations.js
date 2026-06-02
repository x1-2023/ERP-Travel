// tests/stress/k6-write-operations.js

/**
 * LAC VIET HR - Write Operations Stress Test
 * Test concurrent write operations, database contention, and data integrity
 */

import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomItem, randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

export const options = {
  scenarios: {
    // Concurrent creates
    concurrent_creates: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'testConcurrentCreates',
      tags: { test: 'concurrent_creates' },
    },

    // Concurrent updates
    concurrent_updates: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 30 },
        { duration: '3m', target: 80 },
        { duration: '1m', target: 0 },
      ],
      exec: 'testConcurrentUpdates',
      tags: { test: 'concurrent_updates' },
    },

    // Mixed workload
    mixed_workload: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      exec: 'testMixedWorkload',
      tags: { test: 'mixed' },
    },

    // Transaction heavy
    transaction_heavy: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 200,
      stages: [
        { duration: '1m', target: 30 },
        { duration: '2m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 10 },
      ],
      exec: 'testTransactionHeavy',
      tags: { test: 'transaction' },
    },
  },

  thresholds: {
    // Response times
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    'http_req_duration{test:concurrent_creates}': ['p(95)<800'],
    'http_req_duration{test:concurrent_updates}': ['p(95)<600'],
    'http_req_duration{test:transaction}': ['p(95)<1500'],

    // Error rates
    http_req_failed: ['rate<0.02'],
    'http_req_failed{test:transaction}': ['rate<0.05'],

    // Custom metrics
    'create_success_rate': ['rate>0.95'],
    'update_success_rate': ['rate>0.98'],
    'transaction_success_rate': ['rate>0.90'],
    'data_integrity_errors': ['count<10'],
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM METRICS
// ════════════════════════════════════════════════════════════════════════════════

const createSuccessRate = new Rate('create_success_rate');
const updateSuccessRate = new Rate('update_success_rate');
const transactionSuccessRate = new Rate('transaction_success_rate');
const dataIntegrityErrors = new Counter('data_integrity_errors');
const createDuration = new Trend('create_duration');
const updateDuration = new Trend('update_duration');
const deleteDuration = new Trend('delete_duration');
const transactionDuration = new Trend('transaction_duration');
const concurrentOperations = new Gauge('concurrent_operations');
const uniqueViolations = new Counter('unique_violations');
const deadlocks = new Counter('deadlocks');
const optimisticLockFailures = new Counter('optimistic_lock_failures');

// ════════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ════════════════════════════════════════════════════════════════════════════════

const testUsers = new SharedArray('users', function() {
  return [
    { email: 'stress-user1@company.com', password: 'StressP@ss123!' },
    { email: 'stress-user2@company.com', password: 'StressP@ss123!' },
    { email: 'stress-user3@company.com', password: 'StressP@ss123!' },
    { email: 'stress-user4@company.com', password: 'StressP@ss123!' },
    { email: 'stress-user5@company.com', password: 'StressP@ss123!' },
  ];
});

const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do'];
const lastNames = ['Anh', 'Binh', 'Cuong', 'Dung', 'Em', 'Giang', 'Hai', 'Khanh', 'Linh', 'Minh'];
const departments = ['ENG', 'HR', 'FIN', 'MKT', 'SALES', 'OPS', 'IT', 'LEGAL'];

function generateEmployeeData() {
  const timestamp = Date.now();
  const random = randomString(6);
  return {
    firstName: randomItem(firstNames),
    lastName: randomItem(lastNames),
    email: `test_${timestamp}_${random}@company.com`,
    phone: `09${randomIntBetween(10000000, 99999999)}`,
    departmentCode: randomItem(departments),
    positionId: `POS-${randomIntBetween(1, 20)}`,
    hireDate: '2025-01-15',
    salary: randomIntBetween(10000000, 50000000),
    employeeCode: `NV${timestamp}${random}`,
  };
}

function generateLeaveRequest() {
  return {
    leaveTypeId: `LT-${randomIntBetween(1, 5)}`,
    startDate: '2025-02-01',
    endDate: '2025-02-03',
    reason: `Stress test leave request ${randomString(10)}`,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

function login() {
  const user = randomItem(testUsers);
  const res = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });

  if (res.status !== 200) {
    return null;
  }

  return JSON.parse(res.body).accessToken;
}

function checkResponseError(res) {
  if (res.status >= 400) {
    const body = res.body ? JSON.parse(res.body) : {};

    // Check for specific error types
    if (body.code === 'UNIQUE_VIOLATION' || body.message?.includes('unique')) {
      uniqueViolations.add(1);
    }
    if (body.code === 'DEADLOCK' || body.message?.includes('deadlock')) {
      deadlocks.add(1);
    }
    if (body.code === 'OPTIMISTIC_LOCK_FAILURE' || body.message?.includes('version')) {
      optimisticLockFailures.add(1);
    }
    if (body.code === 'DATA_INTEGRITY_ERROR') {
      dataIntegrityErrors.add(1);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEST: CONCURRENT CREATES
// ════════════════════════════════════════════════════════════════════════════════

export function testConcurrentCreates() {
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }

  const headers = { headers: getHeaders(token) };
  concurrentOperations.add(1);

  group('Employee Creation', () => {
    const employeeData = generateEmployeeData();
    const startTime = Date.now();

    const res = http.post(`${API_BASE}/employees`, JSON.stringify(employeeData), {
      ...headers,
      tags: { name: 'create_employee' },
    });

    const duration = Date.now() - startTime;
    createDuration.add(duration);

    const success = res.status === 201 || res.status === 200;
    createSuccessRate.add(success);

    check(res, {
      'employee created': (r) => r.status === 201 || r.status === 200,
      'response < 1s': (r) => r.timings.duration < 1000,
      'has employee id': (r) => {
        if (r.status === 201 || r.status === 200) {
          const body = JSON.parse(r.body);
          return body.id || body.data?.id;
        }
        return false;
      },
    });

    checkResponseError(res);

    // Verify data integrity
    if (res.status === 201 || res.status === 200) {
      const created = JSON.parse(res.body);
      const empId = created.id || created.data?.id;

      // Read back and verify
      const verifyRes = http.get(`${API_BASE}/employees/${empId}`, headers);
      if (verifyRes.status === 200) {
        const verified = JSON.parse(verifyRes.body);
        const data = verified.data || verified;

        if (data.email !== employeeData.email) {
          dataIntegrityErrors.add(1);
          console.log(`Data integrity error: email mismatch`);
        }
      }
    }
  });

  sleep(0.5);

  group('Leave Request Creation', () => {
    const leaveData = generateLeaveRequest();
    const startTime = Date.now();

    const res = http.post(`${API_BASE}/leave/requests`, JSON.stringify(leaveData), {
      ...headers,
      tags: { name: 'create_leave' },
    });

    const duration = Date.now() - startTime;
    createDuration.add(duration);

    const success = res.status === 201 || res.status === 200;
    createSuccessRate.add(success);

    check(res, {
      'leave request created': (r) => r.status === 201 || r.status === 200,
    });

    checkResponseError(res);
  });

  concurrentOperations.add(-1);
  sleep(randomIntBetween(500, 1500) / 1000);
}

// ════════════════════════════════════════════════════════════════════════════════
// TEST: CONCURRENT UPDATES
// ════════════════════════════════════════════════════════════════════════════════

export function testConcurrentUpdates() {
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }

  const headers = { headers: getHeaders(token) };
  concurrentOperations.add(1);

  group('Get Employee for Update', () => {
    // Get a random employee
    const listRes = http.get(`${API_BASE}/employees?limit=100`, headers);
    if (listRes.status !== 200) {
      concurrentOperations.add(-1);
      return;
    }

    const employees = JSON.parse(listRes.body).data || [];
    if (employees.length === 0) {
      concurrentOperations.add(-1);
      return;
    }

    const employee = randomItem(employees);
    const startTime = Date.now();

    // Update employee
    const updateData = {
      phone: `09${randomIntBetween(10000000, 99999999)}`,
      salary: randomIntBetween(10000000, 50000000),
      updatedAt: employee.updatedAt, // For optimistic locking
    };

    const res = http.patch(`${API_BASE}/employees/${employee.id}`, JSON.stringify(updateData), {
      ...headers,
      tags: { name: 'update_employee' },
    });

    const duration = Date.now() - startTime;
    updateDuration.add(duration);

    const success = res.status === 200;
    updateSuccessRate.add(success);

    check(res, {
      'employee updated': (r) => r.status === 200,
      'response < 500ms': (r) => r.timings.duration < 500,
    });

    checkResponseError(res);

    // Verify update
    if (res.status === 200) {
      const verifyRes = http.get(`${API_BASE}/employees/${employee.id}`, headers);
      if (verifyRes.status === 200) {
        const verified = JSON.parse(verifyRes.body);
        const data = verified.data || verified;

        if (data.phone !== updateData.phone) {
          dataIntegrityErrors.add(1);
        }
      }
    }
  });

  concurrentOperations.add(-1);
  sleep(randomIntBetween(300, 800) / 1000);
}

// ════════════════════════════════════════════════════════════════════════════════
// TEST: MIXED WORKLOAD
// ════════════════════════════════════════════════════════════════════════════════

export function testMixedWorkload() {
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }

  const headers = { headers: getHeaders(token) };

  // 60% reads, 30% creates, 10% updates
  const random = Math.random();

  if (random < 0.6) {
    // Read operations
    group('Read Operations', () => {
      const endpoints = [
        `${API_BASE}/employees?page=${randomIntBetween(1, 10)}&limit=20`,
        `${API_BASE}/departments`,
        `${API_BASE}/dashboard/stats`,
        `${API_BASE}/leave/balance`,
      ];

      const endpoint = randomItem(endpoints);
      const res = http.get(endpoint, { ...headers, tags: { name: 'read' } });

      check(res, {
        'read success': (r) => r.status === 200,
      });
    });
  } else if (random < 0.9) {
    // Create operations
    group('Create Operations', () => {
      const createTypes = ['employee', 'leave', 'attendance'];
      const createType = randomItem(createTypes);

      let endpoint, data;
      switch (createType) {
        case 'employee':
          endpoint = `${API_BASE}/employees`;
          data = generateEmployeeData();
          break;
        case 'leave':
          endpoint = `${API_BASE}/leave/requests`;
          data = generateLeaveRequest();
          break;
        case 'attendance':
          endpoint = `${API_BASE}/attendance/check-in`;
          data = { location: { lat: 10.762622, lng: 106.660172 } };
          break;
      }

      const startTime = Date.now();
      const res = http.post(endpoint, JSON.stringify(data), {
        ...headers,
        tags: { name: `create_${createType}` },
      });

      createDuration.add(Date.now() - startTime);
      createSuccessRate.add(res.status === 201 || res.status === 200);

      checkResponseError(res);
    });
  } else {
    // Update operations
    group('Update Operations', () => {
      const listRes = http.get(`${API_BASE}/employees?limit=50`, headers);
      if (listRes.status === 200) {
        const employees = JSON.parse(listRes.body).data || [];
        if (employees.length > 0) {
          const employee = randomItem(employees);
          const startTime = Date.now();

          const res = http.patch(`${API_BASE}/employees/${employee.id}`, JSON.stringify({
            phone: `09${randomIntBetween(10000000, 99999999)}`,
          }), {
            ...headers,
            tags: { name: 'update' },
          });

          updateDuration.add(Date.now() - startTime);
          updateSuccessRate.add(res.status === 200);

          checkResponseError(res);
        }
      }
    });
  }

  sleep(randomIntBetween(200, 600) / 1000);
}

// ════════════════════════════════════════════════════════════════════════════════
// TEST: TRANSACTION HEAVY
// ════════════════════════════════════════════════════════════════════════════════

export function testTransactionHeavy() {
  const token = login();
  if (!token) {
    sleep(0.5);
    return;
  }

  const headers = { headers: getHeaders(token) };

  group('Payroll Transaction', () => {
    const startTime = Date.now();

    // Simulate payroll calculation (transaction-heavy)
    const res = http.post(`${API_BASE}/payroll/calculate`, JSON.stringify({
      periodId: `PERIOD-2025-01`,
      employeeIds: 'all',
      options: {
        includeOT: true,
        includeTax: true,
        includeInsurance: true,
      },
    }), {
      ...headers,
      timeout: '60s',
      tags: { name: 'payroll_calculation' },
    });

    const duration = Date.now() - startTime;
    transactionDuration.add(duration);
    transactionSuccessRate.add(res.status === 200 || res.status === 202);

    check(res, {
      'payroll calculation started': (r) => r.status === 200 || r.status === 202,
      'response < 5s': (r) => r.timings.duration < 5000,
    });

    checkResponseError(res);
  });

  group('Bulk Employee Update', () => {
    const startTime = Date.now();

    // Bulk update (transaction)
    const res = http.post(`${API_BASE}/employees/bulk-update`, JSON.stringify({
      filter: {
        departmentCode: randomItem(departments),
      },
      update: {
        status: 'ACTIVE',
      },
    }), {
      ...headers,
      timeout: '30s',
      tags: { name: 'bulk_update' },
    });

    const duration = Date.now() - startTime;
    transactionDuration.add(duration);
    transactionSuccessRate.add(res.status === 200);

    check(res, {
      'bulk update success': (r) => r.status === 200,
    });

    checkResponseError(res);
  });

  group('Leave Balance Recalculation', () => {
    const startTime = Date.now();

    const res = http.post(`${API_BASE}/leave/recalculate-balances`, JSON.stringify({
      year: 2025,
      employeeIds: 'all',
    }), {
      ...headers,
      timeout: '60s',
      tags: { name: 'leave_recalculation' },
    });

    const duration = Date.now() - startTime;
    transactionDuration.add(duration);
    transactionSuccessRate.add(res.status === 200 || res.status === 202);

    checkResponseError(res);
  });

  sleep(1);
}

// ════════════════════════════════════════════════════════════════════════════════
// SETUP & TEARDOWN
// ════════════════════════════════════════════════════════════════════════════════

export function setup() {
  console.log('Setting up write operations stress test...');
  console.log(`Base URL: ${BASE_URL}`);

  // Verify API is accessible
  const healthRes = http.get(`${API_BASE}/health`);
  if (healthRes.status !== 200) {
    fail('API health check failed');
  }

  // Login to verify auth works
  const user = testUsers[0];
  const loginRes = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status !== 200) {
    fail('Login failed during setup');
  }

  return {
    startTime: Date.now(),
    token: JSON.parse(loginRes.body).accessToken,
  };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Write operations stress test completed in ${duration.toFixed(2)} seconds`);
}

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM SUMMARY
// ════════════════════════════════════════════════════════════════════════════════

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    test: 'Write Operations Stress Test',
    duration_seconds: data.state.testRunDurationMs / 1000,

    operations: {
      creates: {
        success_rate: (data.metrics.create_success_rate?.values?.rate || 0) * 100,
        avg_duration: data.metrics.create_duration?.values?.avg || 0,
        p95_duration: data.metrics.create_duration?.values['p(95)'] || 0,
      },
      updates: {
        success_rate: (data.metrics.update_success_rate?.values?.rate || 0) * 100,
        avg_duration: data.metrics.update_duration?.values?.avg || 0,
        p95_duration: data.metrics.update_duration?.values['p(95)'] || 0,
      },
      transactions: {
        success_rate: (data.metrics.transaction_success_rate?.values?.rate || 0) * 100,
        avg_duration: data.metrics.transaction_duration?.values?.avg || 0,
        p95_duration: data.metrics.transaction_duration?.values['p(95)'] || 0,
      },
    },

    errors: {
      data_integrity: data.metrics.data_integrity_errors?.values?.count || 0,
      unique_violations: data.metrics.unique_violations?.values?.count || 0,
      deadlocks: data.metrics.deadlocks?.values?.count || 0,
      optimistic_lock_failures: data.metrics.optimistic_lock_failures?.values?.count || 0,
    },

    requests: {
      total: data.metrics.http_reqs?.values?.count || 0,
      rate: data.metrics.http_reqs?.values?.rate || 0,
      failed: data.metrics.http_req_failed?.values?.rate || 0,
    },

    thresholds: Object.entries(data.thresholds || {}).reduce((acc, [key, value]) => {
      acc[key] = value.ok;
      return acc;
    }, {}),

    passed: Object.values(data.thresholds || {}).every(t => t.ok),
  };

  return {
    'reports/write-operations-results.json': JSON.stringify(summary, null, 2),
    stdout: generateTextReport(summary),
  };
}

function generateTextReport(summary) {
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║              LAC VIET HR - WRITE OPERATIONS STRESS TEST RESULTS              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Duration: ${summary.duration_seconds.toFixed(0)}s                                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣

📝 CREATE OPERATIONS
  • Success Rate:     ${summary.operations.creates.success_rate.toFixed(1)}%
  • Avg Duration:     ${summary.operations.creates.avg_duration.toFixed(2)}ms
  • P95 Duration:     ${summary.operations.creates.p95_duration.toFixed(2)}ms

🔄 UPDATE OPERATIONS
  • Success Rate:     ${summary.operations.updates.success_rate.toFixed(1)}%
  • Avg Duration:     ${summary.operations.updates.avg_duration.toFixed(2)}ms
  • P95 Duration:     ${summary.operations.updates.p95_duration.toFixed(2)}ms

💼 TRANSACTION OPERATIONS
  • Success Rate:     ${summary.operations.transactions.success_rate.toFixed(1)}%
  • Avg Duration:     ${summary.operations.transactions.avg_duration.toFixed(2)}ms
  • P95 Duration:     ${summary.operations.transactions.p95_duration.toFixed(2)}ms

⚠️  ERROR ANALYSIS
  • Data Integrity Errors:    ${summary.errors.data_integrity}
  • Unique Violations:        ${summary.errors.unique_violations}
  • Deadlocks:                ${summary.errors.deadlocks}
  • Optimistic Lock Failures: ${summary.errors.optimistic_lock_failures}

📊 REQUEST STATISTICS
  • Total Requests:    ${summary.requests.total.toLocaleString()}
  • Request Rate:      ${summary.requests.rate.toFixed(2)}/s
  • Error Rate:        ${(summary.requests.failed * 100).toFixed(2)}%

${summary.passed ? '✅ ALL THRESHOLDS PASSED' : '❌ SOME THRESHOLDS FAILED'}

╚══════════════════════════════════════════════════════════════════════════════╝
`;
}
