// tests/security/api/api-security.test.ts

/**
 * LAC VIET HR - API Security Tests
 * Tests for rate limiting, authorization, data exposure, and API abuse
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SecurityTestClient, createSecurityTestClient } from '../../utils/security-test-client';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ════════════════════════════════════════════════════════════════════════════════
// RATE LIMITING TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('API Security - Rate Limiting', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('API Rate Limits', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const results: number[] = [];

      // Make 110 requests rapidly (limit is 100/minute)
      for (let i = 0; i < 110; i++) {
        const response = await client.get('/api/employees', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        results.push(response.status);
      }

      // Some requests should be rate limited
      expect(results.filter(s => s === 429).length).toBeGreaterThan(0);
    });

    it('should return rate limit headers', async () => {
      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.headers.get('x-ratelimit-limit')).toBeDefined();
      expect(response.headers.get('x-ratelimit-remaining')).toBeDefined();
    });

    it('should return Retry-After header when rate limited', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 110; i++) {
        await client.get('/api/employees', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }

      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.status === 429) {
        expect(response.headers.get('retry-after')).toBeDefined();
      }
    });
  });

  describe('Rate Limit Bypass Prevention', () => {
    it('should not be bypassed by changing User-Agent', async () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      ];

      let totalRequests = 0;
      let rateLimited = false;

      for (const ua of userAgents) {
        for (let i = 0; i < 50; i++) {
          const response = await client.get('/api/employees', {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'User-Agent': ua,
            },
          });
          totalRequests++;
          if (response.status === 429) {
            rateLimited = true;
            break;
          }
        }
        if (rateLimited) break;
      }

      // Should be rate limited before 150 requests
      expect(rateLimited).toBe(true);
      expect(totalRequests).toBeLessThan(150);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// AUTHORIZATION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('API Security - Authorization', () => {
  let client: SecurityTestClient;
  let adminToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    try {
      adminToken = await client.loginAndGetToken('admin@company.com', 'AdminP@ssw0rd123!');
      employeeToken = await client.loginAndGetToken('employee@company.com', 'EmployeeP@ssw0rd123!');
    } catch {
      // Use default token if specific users don't exist
      adminToken = await client.getAuthToken();
      employeeToken = adminToken;
    }
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin to access all endpoints', async () => {
      const endpoints = [
        '/api/employees',
        '/api/users',
        '/api/settings',
      ];

      for (const endpoint of endpoints) {
        const response = await client.get(endpoint, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect([200, 204, 404]).toContain(response.status);
      }
    });

    it('should restrict employee from admin endpoints', async () => {
      const adminOnlyEndpoints = [
        '/api/users',
        '/api/settings',
        '/api/audit-logs',
      ];

      for (const endpoint of adminOnlyEndpoints) {
        const response = await client.get(endpoint, {
          headers: { Authorization: `Bearer ${employeeToken}` },
        });
        expect([403, 404]).toContain(response.status);
      }
    });
  });

  describe('Horizontal Privilege Escalation', () => {
    it('should prevent employee from modifying others data', async () => {
      const response = await client.put('/api/employees/other-employee-id', {
        firstName: 'Hacked',
      }, {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });

      expect([403, 404]).toContain(response.status);
    });

    it('should prevent access via parameter tampering', async () => {
      const response = await client.get('/api/employees/me?userId=admin-user-id', {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });

      if (response.ok) {
        const body = await response.json();
        expect(body.id).not.toBe('admin-user-id');
      }
    });
  });

  describe('Vertical Privilege Escalation', () => {
    it('should prevent role elevation via API', async () => {
      const response = await client.put('/api/users/me', {
        role: 'ADMIN',
      }, {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });

      expect([400, 403]).toContain(response.status);
    });

    it('should prevent permission elevation', async () => {
      const response = await client.put('/api/users/me', {
        permissions: ['admin:all', 'users:manage'],
      }, {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });

      expect([400, 403]).toContain(response.status);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// DATA EXPOSURE TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('API Security - Data Exposure', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('Sensitive Data in Responses', () => {
    it('should not expose password hashes', async () => {
      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.json();
      const bodyString = JSON.stringify(body);

      expect(bodyString).not.toMatch(/password/i);
      expect(bodyString).not.toMatch(/\$2[ayb]\$/); // bcrypt hash
      expect(bodyString).not.toMatch(/\$argon2/); // argon2 hash
    });

    it('should not expose tokens in responses', async () => {
      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.json();
      const bodyString = JSON.stringify(body);

      expect(bodyString.toLowerCase()).not.toMatch(/secret/);
      expect(bodyString.toLowerCase()).not.toMatch(/apikey/);
    });
  });

  describe('Error Message Exposure', () => {
    it('should not expose stack traces', async () => {
      const response = await client.get('/api/employees/invalid-id-format!!!', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.text();

      expect(body).not.toContain('at ');
      expect(body).not.toContain('.ts:');
      expect(body).not.toContain('.js:');
      expect(body).not.toContain('node_modules');
    });

    it('should not expose database errors', async () => {
      const response = await client.post('/api/employees', {
        email: 'duplicate@company.com',
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.text();

      expect(body).not.toMatch(/SQL|syntax|query|SELECT|INSERT|UPDATE|DELETE/i);
      expect(body).not.toMatch(/UNIQUE constraint|duplicate key/i);
      expect(body).not.toMatch(/PrismaClient|Sequelize|mongoose/i);
    });

    it('should not expose file paths', async () => {
      const response = await client.get('/api/nonexistent', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.text();

      expect(body).not.toMatch(/\/home\//);
      expect(body).not.toMatch(/\/var\//);
      expect(body).not.toMatch(/C:\\/);
      expect(body).not.toMatch(/\/app\//);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// MASS ASSIGNMENT TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('API Security - Mass Assignment', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  it('should not allow setting admin flag via mass assignment', async () => {
    const response = await client.post('/api/employees', {
      firstName: 'Test',
      lastName: 'User',
      email: `mass-assign-${Date.now()}@example.com`,
      hireDate: '2024-01-01',
      isAdmin: true,
      role: 'ADMIN',
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.status === 201) {
      const body = await response.json();
      expect(body.isAdmin).not.toBe(true);
      expect(body.role).not.toBe('ADMIN');
    }
  });

  it('should not allow setting internal fields', async () => {
    const response = await client.put('/api/employees/me', {
      createdAt: '2020-01-01',
      updatedAt: '2020-01-01',
      id: 'different-id',
      version: 999,
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.status === 200) {
      const body = await response.json();
      expect(body.createdAt).not.toBe('2020-01-01');
      expect(body.id).not.toBe('different-id');
    }
  });

  it('should whitelist allowed fields only', async () => {
    const response = await client.put('/api/employees/me', {
      firstName: 'Updated',
      lastName: 'Name',
      maliciousField: 'hacked',
      __proto__: { admin: true },
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.status === 200) {
      const body = await response.json();
      expect(body.maliciousField).toBeUndefined();
      expect(body.__proto__).toBeUndefined();
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// API ABUSE TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('API Security - Abuse Prevention', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('Request Size Limits', () => {
    it('should reject oversized request bodies', async () => {
      const largePayload = {
        firstName: 'Test',
        lastName: 'User',
        notes: 'x'.repeat(10 * 1024 * 1024), // 10MB of data
      };

      const response = await client.post('/api/employees', largePayload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect([400, 413]).toContain(response.status);
    });

    it('should reject deeply nested JSON', async () => {
      let nested: Record<string, unknown> = { value: 'end' };
      for (let i = 0; i < 100; i++) {
        nested = { nested };
      }

      const response = await client.post('/api/employees', nested, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect([400, 413]).toContain(response.status);
    });
  });

  describe('Query Parameter Abuse', () => {
    it('should limit pagination size', async () => {
      const response = await client.get('/api/employees?limit=10000', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.status === 200) {
        const body = await response.json();
        expect(body.data?.length || 0).toBeLessThanOrEqual(100);
      }
    });
  });
});
