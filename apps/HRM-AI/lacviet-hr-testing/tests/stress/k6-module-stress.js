// tests/stress/k6-module-stress.js

/**
 * LAC VIET HR - Module-Specific Stress Tests
 * Targeted stress testing for each major module
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;
const MODULE = __ENV.MODULE || 'all';

export const options = {
  scenarios: {
    // Employee Module Stress
    employee_module: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '3m', target: 150 },
        { duration: '1m', target: 0 },
      ],
      exec: 'employeeModuleStress',
      tags: { module: 'employee' },
    },

    // Leave Module Stress
    leave_module: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '3m', target: 150 },
        { duration: '1m', target: 0 },
      ],
      exec: 'leaveModuleStress',
      startTime: '8m',
      tags: { module: 'leave' },
    },

    // Recruitment Module Stress
    recruitment_module: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 30 },
        { duration: '3m', target: 60 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'recruitmentModuleStress',
      startTime: '16m',
      tags: { module: 'recruitment' },
    },

    // Performance Module Stress
    performance_module: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 40 },
        { duration: '3m', target: 80 },
        { duration: '3m', target: 120 },
        { duration: '1m', target: 0 },
      ],
      exec: 'performanceModuleStress',
      startTime: '24m',
      tags: { module: 'performance' },
    },

    // Attendance Module Stress
    attendance_module: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '3m', target: 200 },
        { duration: '3m', target: 300 },
        { duration: '1m', target: 0 },
      ],
      exec: 'attendanceModuleStress',
      startTime: '32m',
      tags: { module: 'attendance' },
    },

    // Payroll Module Stress (Heavy Operations)
    payroll_module: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      exec: 'payrollModuleStress',
      startTime: '40m',
      tags: { module: 'payroll' },
    },
  },

  thresholds: {
    // General thresholds
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.02'],
    
    // Module-specific thresholds
    'http_req_duration{module:employee}': ['p(95)<500'],
    'http_req_duration{module:leave}': ['p(95)<600'],
    'http_req_duration{module:recruitment}': ['p(95)<800'],
    'http_req_duration{module:performance}': ['p(95)<700'],
    'http_req_duration{module:attendance}': ['p(95)<300'],
    'http_req_duration{module:payroll}': ['p(95)<2000'],
    
    // Custom metrics
    'employee_ops_duration': ['p(95)<500'],
    'leave_ops_duration': ['p(95)<600'],
    'recruitment_ops_duration': ['p(95)<800'],
    'search_duration': ['p(95)<400'],
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM METRICS
// ════════════════════════════════════════════════════════════════════════════════

const employeeOpsDuration = new Trend('employee_ops_duration');
const leaveOpsDuration = new Trend('leave_ops_duration');
const recruitmentOpsDuration = new Trend('recruitment_ops_duration');
const performanceOpsDuration = new Trend('performance_ops_duration');
const attendanceOpsDuration = new Trend('attendance_ops_duration');
const payrollOpsDuration = new Trend('payroll_ops_duration');
const searchDuration = new Trend('search_duration');
const moduleErrors = new Counter('module_errors');

// ════════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ════════════════════════════════════════════════════════════════════════════════

const testUsers = [
  { email: 'admin@company.com', password: 'AdminP@ss123!' },
  { email: 'manager@company.com', password: 'ManagerP@ss123!' },
  { email: 'hr@company.com', password: 'HrP@ss123!' },
];

const searchTerms = ['Nguyen', 'Tran', 'Le', 'developer', 'manager'];
const departments = ['Engineering', 'HR', 'Finance', 'Marketing'];

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
  });

  if (res.status !== 200) return null;
  return JSON.parse(res.body).accessToken;
}

// ════════════════════════════════════════════════════════════════════════════════
// EMPLOYEE MODULE STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function employeeModuleStress() {
  const token = login();
  if (!token) { moduleErrors.add(1); sleep(1); return; }

  const headers = { headers: getHeaders(token) };

  group('Employee CRUD Operations', () => {
    // List employees with pagination
    const listStart = Date.now();
    const listRes = http.get(
      `${API_BASE}/employees?page=${randomIntBetween(1, 20)}&limit=50`,
      headers
    );
    employeeOpsDuration.add(Date.now() - listStart);
    check(listRes, { 'list employees: 200': r => r.status === 200 }) || moduleErrors.add(1);

    // Search employees
    const searchStart = Date.now();
    const searchRes = http.get(
      `${API_BASE}/employees/search?q=${randomItem(searchTerms)}&limit=20`,
      headers
    );
    searchDuration.add(Date.now() - searchStart);
    check(searchRes, { 'search employees: 200': r => r.status === 200 });

    // Get employee detail
    if (listRes.status === 200) {
      const employees = JSON.parse(listRes.body).data;
      if (employees && employees.length > 0) {
        const emp = randomItem(employees);
        const detailRes = http.get(`${API_BASE}/employees/${emp.id}`, headers);
        check(detailRes, { 'employee detail: 200': r => r.status === 200 });
      }
    }

    // Filter by department
    const filterRes = http.get(
      `${API_BASE}/employees?department=${randomItem(departments)}&status=ACTIVE`,
      headers
    );
    check(filterRes, { 'filter employees: 200': r => r.status === 200 });
  });

  group('Employee Statistics', () => {
    const statsRes = http.get(`${API_BASE}/employees/statistics`, headers);
    check(statsRes, { 'employee stats: 200': r => r.status === 200 });

    const countByDeptRes = http.get(`${API_BASE}/employees/count-by-department`, headers);
    check(countByDeptRes, { 'count by dept: 200': r => r.status === 200 });
  });

  sleep(randomIntBetween(1, 3));
}

// ════════════════════════════════════════════════════════════════════════════════
// LEAVE MODULE STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function leaveModuleStress() {
  const token = login();
  if (!token) { moduleErrors.add(1); sleep(1); return; }

  const headers = { headers: getHeaders(token) };

  group('Leave Operations', () => {
    // Get leave balance
    const balanceStart = Date.now();
    const balanceRes = http.get(`${API_BASE}/leave/balance`, headers);
    leaveOpsDuration.add(Date.now() - balanceStart);
    check(balanceRes, { 'leave balance: 200': r => r.status === 200 });

    // List leave requests
    const listRes = http.get(
      `${API_BASE}/leave?page=${randomIntBetween(1, 10)}&limit=20`,
      headers
    );
    check(listRes, { 'list leaves: 200': r => r.status === 200 });

    // Filter by status
    const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
    const filterRes = http.get(
      `${API_BASE}/leave?status=${randomItem(statuses)}`,
      headers
    );
    check(filterRes, { 'filter leaves: 200': r => r.status === 200 });

    // Get pending approvals count
    const pendingRes = http.get(`${API_BASE}/leave/pending/count`, headers);
    check(pendingRes, { 'pending count: 200': r => r.status === 200 });
  });

  group('Leave Calendar', () => {
    const year = 2025;
    const month = randomIntBetween(1, 12);
    const calendarRes = http.get(
      `${API_BASE}/leave/calendar?year=${year}&month=${month}`,
      headers
    );
    check(calendarRes, { 'leave calendar: 200': r => r.status === 200 });

    const holidaysRes = http.get(`${API_BASE}/leave/holidays?year=${year}`, headers);
    check(holidaysRes, { 'holidays: 200': r => r.status === 200 });
  });

  sleep(randomIntBetween(1, 2));
}

// ════════════════════════════════════════════════════════════════════════════════
// RECRUITMENT MODULE STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function recruitmentModuleStress() {
  const token = login();
  if (!token) { moduleErrors.add(1); sleep(1); return; }

  const headers = { headers: getHeaders(token) };

  group('Job Postings', () => {
    const startTime = Date.now();
    const jobsRes = http.get(
      `${API_BASE}/recruitment/jobs?status=OPEN&page=${randomIntBetween(1, 5)}`,
      headers
    );
    recruitmentOpsDuration.add(Date.now() - startTime);
    check(jobsRes, { 'list jobs: 200': r => r.status === 200 });

    if (jobsRes.status === 200) {
      const jobs = JSON.parse(jobsRes.body).data;
      if (jobs && jobs.length > 0) {
        const job = randomItem(jobs);
        const detailRes = http.get(`${API_BASE}/recruitment/jobs/${job.id}`, headers);
        check(detailRes, { 'job detail: 200': r => r.status === 200 });
      }
    }
  });

  group('Candidates', () => {
    const candidatesRes = http.get(
      `${API_BASE}/recruitment/candidates?page=${randomIntBetween(1, 10)}`,
      headers
    );
    check(candidatesRes, { 'list candidates: 200': r => r.status === 200 });

    // Search candidates
    const searchRes = http.get(
      `${API_BASE}/recruitment/candidates/search?q=developer`,
      headers
    );
    check(searchRes, { 'search candidates: 200': r => r.status === 200 });

    // Pipeline view
    const pipelineRes = http.get(`${API_BASE}/recruitment/pipeline`, headers);
    check(pipelineRes, { 'pipeline: 200': r => r.status === 200 });
  });

  group('Interviews', () => {
    const interviewsRes = http.get(
      `${API_BASE}/recruitment/interviews?upcoming=true`,
      headers
    );
    check(interviewsRes, { 'interviews: 200': r => r.status === 200 });
  });

  sleep(randomIntBetween(1, 3));
}

// ════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE MODULE STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function performanceModuleStress() {
  const token = login();
  if (!token) { moduleErrors.add(1); sleep(1); return; }

  const headers = { headers: getHeaders(token) };

  group('Goals', () => {
    const startTime = Date.now();
    const goalsRes = http.get(`${API_BASE}/performance/goals`, headers);
    performanceOpsDuration.add(Date.now() - startTime);
    check(goalsRes, { 'list goals: 200': r => r.status === 200 });

    const teamGoalsRes = http.get(`${API_BASE}/performance/goals/team`, headers);
    check(teamGoalsRes, { 'team goals: 200': r => r.status === 200 });

    const companyGoalsRes = http.get(`${API_BASE}/performance/goals/company`, headers);
    check(companyGoalsRes, { 'company goals: 200': r => r.status === 200 });
  });

  group('Reviews', () => {
    const reviewsRes = http.get(`${API_BASE}/performance/reviews`, headers);
    check(reviewsRes, { 'list reviews: 200': r => r.status === 200 });

    const cyclesRes = http.get(`${API_BASE}/performance/reviews/cycles`, headers);
    check(cyclesRes, { 'review cycles: 200': r => r.status === 200 });

    const pendingRes = http.get(`${API_BASE}/performance/reviews/pending`, headers);
    check(pendingRes, { 'pending reviews: 200': r => r.status === 200 });
  });

  group('360 Feedback', () => {
    const feedbackRes = http.get(`${API_BASE}/performance/360/pending`, headers);
    check(feedbackRes, { '360 pending: 200': r => r.status === 200 });
  });

  sleep(randomIntBetween(1, 2));
}

// ════════════════════════════════════════════════════════════════════════════════
// ATTENDANCE MODULE STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function attendanceModuleStress() {
  const token = login();
  if (!token) { moduleErrors.add(1); sleep(1); return; }

  const headers = { headers: getHeaders(token) };

  group('Attendance Records', () => {
    const startTime = Date.now();
    
    // Today's attendance
    const todayRes = http.get(`${API_BASE}/attendance/today`, headers);
    attendanceOpsDuration.add(Date.now() - startTime);
    check(todayRes, { 'today attendance: 200': r => r.status === 200 });

    // Monthly records
    const month = randomIntBetween(1, 12);
    const monthlyRes = http.get(
      `${API_BASE}/attendance?year=2025&month=${month}&page=${randomIntBetween(1, 5)}`,
      headers
    );
    check(monthlyRes, { 'monthly attendance: 200': r => r.status === 200 });

    // Summary
    const summaryRes = http.get(`${API_BASE}/attendance/summary?year=2025&month=${month}`, headers);
    check(summaryRes, { 'attendance summary: 200': r => r.status === 200 });
  });

  group('Team Attendance', () => {
    const teamRes = http.get(`${API_BASE}/attendance/team/today`, headers);
    check(teamRes, { 'team attendance: 200': r => r.status === 200 });

    const lateRes = http.get(`${API_BASE}/attendance/team/late`, headers);
    check(lateRes, { 'late arrivals: 200': r => r.status === 200 });
  });

  group('Check-in Simulation', () => {
    // Simulate heavy check-in load (morning rush)
    const checkInRes = http.post(`${API_BASE}/attendance/check-in`, JSON.stringify({
      latitude: 10.7769 + (Math.random() * 0.01),
      longitude: 106.7009 + (Math.random() * 0.01),
      deviceId: `device-${randomIntBetween(1, 1000)}`,
    }), headers);
    // May fail if already checked in, that's OK
    check(checkInRes, { 'check-in: not server error': r => r.status < 500 });
  });

  sleep(randomIntBetween(0.5, 1.5));
}

// ════════════════════════════════════════════════════════════════════════════════
// PAYROLL MODULE STRESS TEST
// ════════════════════════════════════════════════════════════════════════════════

export function payrollModuleStress() {
  const token = login();
  if (!token) { moduleErrors.add(1); sleep(1); return; }

  const headers = { headers: getHeaders(token) };

  group('Payroll Records', () => {
    const startTime = Date.now();
    
    // Current payroll
    const currentRes = http.get(`${API_BASE}/payroll/current`, headers);
    payrollOpsDuration.add(Date.now() - startTime);
    check(currentRes, { 'current payroll: 200': r => r.status === 200 });

    // Historical payroll
    const month = randomIntBetween(1, 12);
    const historyRes = http.get(
      `${API_BASE}/payroll?year=2024&month=${month}&page=1&limit=50`,
      headers
    );
    check(historyRes, { 'payroll history: 200': r => r.status === 200 });

    // Payslip
    const payslipRes = http.get(`${API_BASE}/payroll/payslip?year=2024&month=${month}`, headers);
    check(payslipRes, { 'payslip: 200': r => r.status === 200 });
  });

  group('Payroll Reports', () => {
    const summaryRes = http.get(`${API_BASE}/payroll/summary?year=2024`, headers);
    check(summaryRes, { 'payroll summary: 200': r => r.status === 200 });

    const taxRes = http.get(`${API_BASE}/payroll/tax-report?year=2024`, headers);
    check(taxRes, { 'tax report: 200': r => r.status === 200 });
  });

  sleep(randomIntBetween(2, 4));
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT
// ════════════════════════════════════════════════════════════════════════════════

export default function() {
  employeeModuleStress();
}

// ════════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════════

export function handleSummary(data) {
  const modules = ['employee', 'leave', 'recruitment', 'performance', 'attendance', 'payroll'];
  
  const moduleStats = modules.map(mod => {
    const key = `http_req_duration{module:${mod}}`;
    const metric = data.metrics[key];
    return {
      module: mod,
      p95: metric?.values?.['p(95)'] || 'N/A',
      p99: metric?.values?.['p(99)'] || 'N/A',
      avg: metric?.values?.avg || 'N/A',
    };
  });

  return {
    'reports/module-stress-results.json': JSON.stringify({
      timestamp: new Date().toISOString(),
      modules: moduleStats,
      overall: {
        total_requests: data.metrics.http_reqs?.values?.count || 0,
        error_rate: (data.metrics.http_req_failed?.values?.rate || 0) * 100,
        p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
        p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
      },
      thresholds_passed: Object.values(data.thresholds || {}).every(t => t.ok),
    }, null, 2),
    
    stdout: `
╔══════════════════════════════════════════════════════════════════════════════╗
║                MODULE-SPECIFIC STRESS TEST RESULTS                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
${moduleStats.map(m => 
  `║  ${m.module.padEnd(15)} | P95: ${String(m.p95).padEnd(8)}ms | P99: ${String(m.p99).padEnd(8)}ms ║`
).join('\n')}
╠══════════════════════════════════════════════════════════════════════════════╣
║  Total Requests: ${String(data.metrics.http_reqs?.values?.count || 0).padEnd(10)}                                   ║
║  Error Rate:     ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `,
  };
}
