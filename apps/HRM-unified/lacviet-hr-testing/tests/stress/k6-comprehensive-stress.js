// tests/stress/k6-comprehensive-stress.js

/**
 * LAC VIET HR - Comprehensive Stress Test Suite
 * Multiple scenarios for API load testing, spike testing, and endurance testing
 */

import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test configuration based on scenario
const SCENARIO = __ENV.SCENARIO || 'load';

export const options = {
  scenarios: {
    // Smoke Test - Basic functionality check
    smoke: {
      executor: 'constant-vus',
      vus: 3,
      duration: '1m',
      exec: 'smokeTest',
      tags: { scenario: 'smoke' },
    },

    // Load Test - Normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Stay at 50
        { duration: '2m', target: 100 },  // Ramp to 100
        { duration: '5m', target: 100 },  // Stay at 100
        { duration: '2m', target: 0 },    // Ramp down
      ],
      exec: 'loadTest',
      tags: { scenario: 'load' },
    },

    // Stress Test - Beyond normal capacity
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '5m', target: 400 },
        { duration: '5m', target: 0 },
      ],
      exec: 'stressTest',
      tags: { scenario: 'stress' },
    },

    // Spike Test - Sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },    // Baseline
        { duration: '1m', target: 10 },     // Normal
        { duration: '10s', target: 500 },   // Spike!
        { duration: '3m', target: 500 },    // Stay at spike
        { duration: '10s', target: 10 },    // Quick drop
        { duration: '3m', target: 10 },     // Recovery
        { duration: '10s', target: 0 },     // End
      ],
      exec: 'spikeTest',
      tags: { scenario: 'spike' },
    },

    // Soak Test - Long duration stability
    soak: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30m',
      exec: 'soakTest',
      tags: { scenario: 'soak' },
    },

    // Breakpoint Test - Find system limits
    breakpoint: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      maxVUs: 1000,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 600 },
      ],
      exec: 'breakpointTest',
      tags: { scenario: 'breakpoint' },
    },
  },

  // Thresholds
  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{scenario:smoke}': ['p(95)<200'],
    'http_req_duration{scenario:load}': ['p(95)<300'],
    'http_req_duration{scenario:stress}': ['p(95)<1000'],
    
    // Error rate thresholds
    http_req_failed: ['rate<0.01'],
    'http_req_failed{scenario:stress}': ['rate<0.05'],
    'http_req_failed{scenario:spike}': ['rate<0.1'],
    
    // Custom metrics
    'api_errors': ['count<100'],
    'login_duration': ['p(95)<500'],
    'employee_list_duration': ['p(95)<300'],
    'dashboard_duration': ['p(95)<400'],
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM METRICS
// ════════════════════════════════════════════════════════════════════════════════

const apiErrors = new Counter('api_errors');
const loginDuration = new Trend('login_duration');
const employeeListDuration = new Trend('employee_list_duration');
const dashboardDuration = new Trend('dashboard_duration');
const searchDuration = new Trend('search_duration');
const leaveRequestDuration = new Trend('leave_request_duration');
const cacheHitRate = new Rate('cache_hit_rate');
const activeUsers = new Gauge('active_users');

// ════════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ════════════════════════════════════════════════════════════════════════════════

const testUsers = [
  { email: 'admin@company.com', password: 'AdminP@ss123!' },
  { email: 'manager@company.com', password: 'ManagerP@ss123!' },
  { email: 'user1@company.com', password: 'UserP@ss123!' },
  { email: 'user2@company.com', password: 'UserP@ss123!' },
  { email: 'user3@company.com', password: 'UserP@ss123!' },
];

const searchTerms = ['Nguyen', 'Tran', 'Le', 'Pham', 'developer', 'manager', 'engineer'];
const departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales'];

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
  const startTime = Date.now();
  
  const res = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });

  const duration = Date.now() - startTime;
  loginDuration.add(duration);

  if (res.status !== 200) {
    apiErrors.add(1);
    return null;
  }

  const body = JSON.parse(res.body);
  return body.accessToken;
}

function checkCacheHit(response) {
  const cacheHeader = response.headers['X-Cache'];
  cacheHitRate.add(cacheHeader === 'HIT' || cacheHeader === 'STALE');
}

// ════════════════════════════════════════════════════════════════════════════════
// SMOKE TEST
// ════════════════════════════════════════════════════════════════════════════════

export function smokeTest() {
  const token = login();
  if (!token) return;

  const headers = { headers: getHeaders(token) };

  group('Health Check', () => {
    const res = http.get(`${API_BASE}/health`, { tags: { name: 'health' } });
    check(res, {
      'health: status 200': (r) => r.status === 200,
      'health: response < 100ms': (r) => r.timings.duration < 100,
    });
  });

  group('Basic CRUD', () => {
    // Get employees
    const empRes = http.get(`${API_BASE}/employees?limit=10`, {
      ...headers,
      tags: { name: 'employees_list' },
    });
    check(empRes, {
      'employees: status 200': (r) => r.status === 200,
      'employees: has data': (r) => JSON.parse(r.body).data?.length > 0,
    });

    // Get departments
    const deptRes = http.get(`${API_BASE}/departments`, {
      ...headers,
      tags: { name: 'departments' },
    });
    check(deptRes, {
      'departments: status 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

// ════════════════════════════════════════════════════════════════════════════════
// LOAD TEST
// ════════════════════════════════════════════════════════════════════════════════

export function loadTest() {
  const token = login();
  if (!token) return;

  const headers = { headers: getHeaders(token) };
  activeUsers.add(1);

  group('Dashboard Load', () => {
    const startTime = Date.now();
    
    // Parallel dashboard requests
    const responses = http.batch([
      ['GET', `${API_BASE}/dashboard/stats`, null, { ...headers, tags: { name: 'dashboard_stats' } }],
      ['GET', `${API_BASE}/employees/count`, null, { ...headers, tags: { name: 'emp_count' } }],
      ['GET', `${API_BASE}/leave/pending/count`, null, { ...headers, tags: { name: 'leave_pending' } }],
      ['GET', `${API_BASE}/notifications/unread`, null, { ...headers, tags: { name: 'notifications' } }],
    ]);

    const duration = Date.now() - startTime;
    dashboardDuration.add(duration);

    responses.forEach((res, idx) => {
      check(res, {
        [`dashboard batch ${idx}: status 200`]: (r) => r.status === 200,
      }) || apiErrors.add(1);
      checkCacheHit(res);
    });
  });

  sleep(0.5);

  group('Employee Operations', () => {
    // List with pagination
    const page = randomIntBetween(1, 10);
    const startTime = Date.now();
    
    const listRes = http.get(`${API_BASE}/employees?page=${page}&limit=20`, {
      ...headers,
      tags: { name: 'employee_list' },
    });
    
    employeeListDuration.add(Date.now() - startTime);
    checkCacheHit(listRes);

    check(listRes, {
      'employee list: status 200': (r) => r.status === 200,
      'employee list: < 300ms': (r) => r.timings.duration < 300,
    }) || apiErrors.add(1);

    // Get employee detail
    if (listRes.status === 200) {
      const employees = JSON.parse(listRes.body).data;
      if (employees && employees.length > 0) {
        const emp = randomItem(employees);
        const detailRes = http.get(`${API_BASE}/employees/${emp.id}`, {
          ...headers,
          tags: { name: 'employee_detail' },
        });
        check(detailRes, {
          'employee detail: status 200': (r) => r.status === 200,
        });
      }
    }
  });

  sleep(0.5);

  group('Search', () => {
    const term = randomItem(searchTerms);
    const startTime = Date.now();
    
    const res = http.get(`${API_BASE}/employees/search?q=${encodeURIComponent(term)}&limit=10`, {
      ...headers,
      tags: { name: 'search' },
    });

    searchDuration.add(Date.now() - startTime);

    check(res, {
      'search: status 200': (r) => r.status === 200,
      'search: < 400ms': (r) => r.timings.duration < 400,
    }) || apiErrors.add(1);
  });

  sleep(0.5);

  group('Leave Management', () => {
    const startTime = Date.now();
    
    const res = http.get(`${API_BASE}/leave?status=PENDING&page=1&limit=10`, {
      ...headers,
      tags: { name: 'leave_list' },
    });

    leaveRequestDuration.add(Date.now() - startTime);

    check(res, {
      'leave list: status 200': (r) => r.status === 200,
    });
  });

  activeUsers.add(-1);
  sleep(randomIntBetween(1, 3));
}

// ════════════════════════════════════════════════════════════════════════════════
// STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function stressTest() {
  const token = login();
  if (!token) {
    apiErrors.add(1);
    sleep(1);
    return;
  }

  const headers = { headers: getHeaders(token) };

  // Heavy operations mix
  const operations = [
    () => http.get(`${API_BASE}/employees?page=${randomIntBetween(1, 50)}&limit=50`, headers),
    () => http.get(`${API_BASE}/dashboard/stats`, headers),
    () => http.get(`${API_BASE}/employees/search?q=${randomItem(searchTerms)}`, headers),
    () => http.get(`${API_BASE}/departments/tree`, headers),
    () => http.get(`${API_BASE}/leave?status=PENDING`, headers),
    () => http.get(`${API_BASE}/attendance/today/summary`, headers),
    () => http.get(`${API_BASE}/reports/employee-summary`, headers),
  ];

  // Execute random operations
  for (let i = 0; i < 5; i++) {
    const operation = randomItem(operations);
    const res = operation();
    
    check(res, {
      'stress: status < 500': (r) => r.status < 500,
      'stress: response < 2s': (r) => r.timings.duration < 2000,
    }) || apiErrors.add(1);

    sleep(randomIntBetween(100, 500) / 1000);
  }

  sleep(1);
}

// ════════════════════════════════════════════════════════════════════════════════
// SPIKE TEST
// ════════════════════════════════════════════════════════════════════════════════

export function spikeTest() {
  const token = login();
  if (!token) {
    sleep(0.5);
    return;
  }

  const headers = { headers: getHeaders(token) };

  // Rapid-fire requests during spike
  const endpoints = [
    `${API_BASE}/employees?limit=20`,
    `${API_BASE}/dashboard/stats`,
    `${API_BASE}/departments`,
    `${API_BASE}/leave/balance`,
  ];

  const endpoint = randomItem(endpoints);
  const res = http.get(endpoint, {
    ...headers,
    timeout: '30s',
  });

  check(res, {
    'spike: not timeout': (r) => r.error !== 'timeout',
    'spike: status < 503': (r) => r.status < 503,
  }) || apiErrors.add(1);

  sleep(0.1); // Minimal sleep during spike
}

// ════════════════════════════════════════════════════════════════════════════════
// SOAK TEST
// ════════════════════════════════════════════════════════════════════════════════

export function soakTest() {
  const token = login();
  if (!token) {
    sleep(5);
    return;
  }

  const headers = { headers: getHeaders(token) };

  // Simulate realistic user session
  group('User Session', () => {
    // Dashboard
    http.get(`${API_BASE}/dashboard/stats`, headers);
    sleep(randomIntBetween(2, 5));

    // Browse employees
    http.get(`${API_BASE}/employees?page=1&limit=20`, headers);
    sleep(randomIntBetween(3, 8));

    // Search
    http.get(`${API_BASE}/employees/search?q=${randomItem(searchTerms)}`, headers);
    sleep(randomIntBetween(2, 5));

    // Check leave
    http.get(`${API_BASE}/leave/balance`, headers);
    sleep(randomIntBetween(5, 10));

    // View notifications
    http.get(`${API_BASE}/notifications`, headers);
    sleep(randomIntBetween(10, 30));
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// BREAKPOINT TEST
// ════════════════════════════════════════════════════════════════════════════════

export function breakpointTest() {
  const token = login();
  if (!token) return;

  const headers = { headers: getHeaders(token) };

  // Most expensive operation
  const res = http.get(`${API_BASE}/reports/comprehensive`, {
    ...headers,
    timeout: '60s',
  });

  check(res, {
    'breakpoint: status 200': (r) => r.status === 200,
    'breakpoint: not timeout': (r) => r.error !== 'timeout',
  }) || apiErrors.add(1);
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT FUNCTION
// ════════════════════════════════════════════════════════════════════════════════

export default function() {
  loadTest();
}

// ════════════════════════════════════════════════════════════════════════════════
// SETUP & TEARDOWN
// ════════════════════════════════════════════════════════════════════════════════

export function setup() {
  console.log(`Starting stress test suite - Scenario: ${SCENARIO}`);
  console.log(`Base URL: ${BASE_URL}`);
  
  // Warm up
  const warmupRes = http.get(`${API_BASE}/health`);
  if (warmupRes.status !== 200) {
    fail('Health check failed during setup');
  }
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Test completed in ${duration.toFixed(2)} seconds`);
}

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM SUMMARY
// ════════════════════════════════════════════════════════════════════════════════

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenario: SCENARIO,
    duration_seconds: data.state.testRunDurationMs / 1000,
    
    requests: {
      total: data.metrics.http_reqs?.values?.count || 0,
      rate: data.metrics.http_reqs?.values?.rate || 0,
      failed: data.metrics.http_req_failed?.values?.rate || 0,
    },
    
    response_times: {
      avg: data.metrics.http_req_duration?.values?.avg || 0,
      min: data.metrics.http_req_duration?.values?.min || 0,
      max: data.metrics.http_req_duration?.values?.max || 0,
      p50: data.metrics.http_req_duration?.values['p(50)'] || 0,
      p90: data.metrics.http_req_duration?.values['p(90)'] || 0,
      p95: data.metrics.http_req_duration?.values['p(95)'] || 0,
      p99: data.metrics.http_req_duration?.values['p(99)'] || 0,
    },
    
    custom_metrics: {
      api_errors: data.metrics.api_errors?.values?.count || 0,
      cache_hit_rate: (data.metrics.cache_hit_rate?.values?.rate || 0) * 100,
      login_p95: data.metrics.login_duration?.values['p(95)'] || 0,
      employee_list_p95: data.metrics.employee_list_duration?.values['p(95)'] || 0,
      dashboard_p95: data.metrics.dashboard_duration?.values['p(95)'] || 0,
    },
    
    vus: {
      max: data.metrics.vus_max?.values?.value || 0,
    },
    
    thresholds: Object.entries(data.thresholds || {}).reduce((acc, [key, value]) => {
      acc[key] = value.ok;
      return acc;
    }, {}),
    
    passed: Object.values(data.thresholds || {}).every(t => t.ok),
  };

  return {
    'reports/stress-test-results.json': JSON.stringify(summary, null, 2),
    stdout: generateTextReport(summary),
  };
}

function generateTextReport(summary) {
  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    LAC VIET HR - STRESS TEST RESULTS                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Scenario: ${summary.scenario.padEnd(20)}  Duration: ${summary.duration_seconds.toFixed(0)}s               ║
╠══════════════════════════════════════════════════════════════════════════════╣

📊 REQUEST STATISTICS
  • Total Requests:    ${summary.requests.total.toLocaleString()}
  • Request Rate:      ${summary.requests.rate.toFixed(2)}/s
  • Error Rate:        ${(summary.requests.failed * 100).toFixed(2)}%
  • Max VUs:           ${summary.vus.max}

⏱️  RESPONSE TIMES (ms)
  • Average:           ${summary.response_times.avg.toFixed(2)}
  • Min:               ${summary.response_times.min.toFixed(2)}
  • Max:               ${summary.response_times.max.toFixed(2)}
  • P50 (Median):      ${summary.response_times.p50.toFixed(2)}
  • P90:               ${summary.response_times.p90.toFixed(2)}
  • P95:               ${summary.response_times.p95.toFixed(2)}
  • P99:               ${summary.response_times.p99.toFixed(2)}

📈 CUSTOM METRICS
  • API Errors:        ${summary.custom_metrics.api_errors}
  • Cache Hit Rate:    ${summary.custom_metrics.cache_hit_rate.toFixed(1)}%
  • Login P95:         ${summary.custom_metrics.login_p95.toFixed(2)}ms
  • Employee List P95: ${summary.custom_metrics.employee_list_p95.toFixed(2)}ms
  • Dashboard P95:     ${summary.custom_metrics.dashboard_p95.toFixed(2)}ms

${summary.passed ? '✅ ALL THRESHOLDS PASSED' : '❌ SOME THRESHOLDS FAILED'}

╚══════════════════════════════════════════════════════════════════════════════╝
`;
}
