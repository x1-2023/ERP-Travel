// tests/security/injection/injection-attacks.test.ts

/**
 * LAC VIET HR - Injection Attack Tests
 * Tests for SQL, XSS, NoSQL, Command, and other injection vulnerabilities
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SecurityTestClient, createSecurityTestClient } from '../../utils/security-test-client';
import {
  SQL_INJECTION_PAYLOADS,
  XSS_PAYLOADS,
  NOSQL_INJECTION_PAYLOADS,
  COMMAND_INJECTION_PAYLOADS,
  PATH_TRAVERSAL_PAYLOADS,
  SSTI_PAYLOADS,
} from '../../utils/attack-payloads';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ════════════════════════════════════════════════════════════════════════════════
// SQL INJECTION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - SQL Injection', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('Search Parameter Injection', () => {
    SQL_INJECTION_PAYLOADS.slice(0, 10).forEach((payload) => {
      it(`should prevent SQL injection in search: ${payload.substring(0, 30)}...`, async () => {
        const response = await client.get(
          `/api/employees?search=${encodeURIComponent(payload)}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        const body = await response.text();

        // Should not return 500 (database error)
        expect(response.status).not.toBe(500);

        // Should not expose SQL errors
        expect(body.toLowerCase()).not.toMatch(/sql|syntax|query|mysql|postgresql|sqlite|prisma/i);

        // Should not return unexpected data
        if (response.ok) {
          const json = JSON.parse(body);
          expect(json).not.toHaveProperty('password');
        }
      });
    });
  });

  describe('ID Parameter Injection', () => {
    const idPayloads = ["1' OR '1'='1", "1; DROP TABLE employees--", "1 UNION SELECT * FROM users"];

    idPayloads.forEach((payload) => {
      it(`should prevent SQL injection in ID: ${payload}`, async () => {
        const response = await client.get(
          `/api/employees/${encodeURIComponent(payload)}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        // Should return 400 (bad request) or 404 (not found), not 500
        expect([400, 404]).toContain(response.status);

        const body = await response.text();
        expect(body.toLowerCase()).not.toMatch(/sql|syntax|query/i);
      });
    });
  });

  describe('Login Form Injection', () => {
    it('should prevent SQL injection in login email', async () => {
      const response = await client.post('/api/auth/login', {
        email: "admin'--",
        password: 'anypassword',
      });

      expect(response.status).not.toBe(200);
    });

    it('should prevent SQL injection in login password', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'admin@company.com',
        password: "' OR '1'='1",
      });

      expect(response.status).not.toBe(200);
    });
  });

  describe('Body Parameter Injection', () => {
    it('should sanitize SQL in POST body', async () => {
      const response = await client.post('/api/employees', {
        firstName: "Robert'); DROP TABLE employees;--",
        lastName: 'Tables',
        email: `sqli-${Date.now()}@test.com`,
        hireDate: '2024-01-01',
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Should either reject or sanitize
      if (response.ok) {
        const body = await response.json();
        expect(body.firstName).not.toContain('DROP TABLE');
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// XSS TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - XSS Prevention', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('Reflected XSS', () => {
    XSS_PAYLOADS.slice(0, 10).forEach((payload) => {
      it(`should prevent reflected XSS: ${payload.substring(0, 30)}...`, async () => {
        const response = await client.get(
          `/api/employees?search=${encodeURIComponent(payload)}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        const body = await response.text();

        // Payload should not be reflected unescaped
        expect(body).not.toContain(payload);

        // Check for proper encoding
        if (body.includes('script')) {
          expect(body).not.toMatch(/<script[^>]*>.*<\/script>/i);
        }
      });
    });
  });

  describe('Stored XSS Prevention', () => {
    it('should sanitize XSS in employee names', async () => {
      const xssPayload = '<script>alert("XSS")</script>';

      const createResponse = await client.post('/api/employees', {
        firstName: xssPayload,
        lastName: 'User',
        email: `xss-stored-${Date.now()}@test.com`,
        hireDate: '2024-01-01',
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (createResponse.ok) {
        const employee = await createResponse.json();

        // Check stored data is sanitized
        expect(employee.firstName).not.toContain('<script>');

        // Verify on retrieval
        const getResponse = await client.get(`/api/employees/${employee.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (getResponse.ok) {
          const retrieved = await getResponse.json();
          expect(retrieved.firstName).not.toContain('<script>');
        }
      }
    });

    it('should sanitize XSS in notes/comments', async () => {
      const xssPayload = '<img src=x onerror=alert(1)>';

      const response = await client.post('/api/leave', {
        startDate: '2025-02-01',
        endDate: '2025-02-05',
        type: 'ANNUAL',
        reason: xssPayload,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const leave = await response.json();
        expect(leave.reason).not.toMatch(/<img[^>]*onerror/i);
      }
    });
  });

  describe('DOM XSS Prevention', () => {
    it('should set appropriate Content-Type headers', async () => {
      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });

    it('should have X-Content-Type-Options header', async () => {
      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// NOSQL INJECTION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - NoSQL Injection', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  describe('MongoDB Operator Injection', () => {
    it('should prevent $ne operator injection in login', async () => {
      const response = await client.post('/api/auth/login', {
        email: { $ne: null },
        password: { $ne: null },
      });

      expect(response.status).not.toBe(200);
    });

    it('should prevent $gt operator injection', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'admin@company.com',
        password: { $gt: '' },
      });

      expect(response.status).not.toBe(200);
    });

    it('should prevent $regex injection', async () => {
      const response = await client.post('/api/auth/login', {
        email: { $regex: '.*' },
        password: 'anypassword',
      });

      expect(response.status).not.toBe(200);
    });
  });

  describe('JSON Injection', () => {
    it('should validate JSON types', async () => {
      const response = await client.post('/api/employees', {
        firstName: ['Array', 'Injection'],
        lastName: { nested: 'object' },
        email: 'valid@test.com',
      });

      expect([400, 422]).toContain(response.status);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// COMMAND INJECTION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - Command Injection', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('File Name Injection', () => {
    COMMAND_INJECTION_PAYLOADS.slice(0, 5).forEach((payload) => {
      it(`should prevent command injection in filenames: ${payload.substring(0, 20)}...`, async () => {
        const formData = new FormData();
        formData.append('file', new Blob(['test content']), `test${payload}.txt`);

        const response = await client.post('/api/upload', formData, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Should reject malicious filenames
        expect([400, 415, 422]).toContain(response.status);
      });
    });
  });

  describe('Export Parameter Injection', () => {
    it('should prevent command injection in export format', async () => {
      const payload = 'csv; cat /etc/passwd';

      const response = await client.get(
        `/api/reports/export?format=${encodeURIComponent(payload)}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const body = await response.text();
      expect(body).not.toContain('root:');
      expect([400, 404]).toContain(response.status);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// PATH TRAVERSAL TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - Path Traversal', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('File Access Traversal', () => {
    PATH_TRAVERSAL_PAYLOADS.slice(0, 5).forEach((payload) => {
      it(`should prevent path traversal: ${payload.substring(0, 30)}...`, async () => {
        const response = await client.get(
          `/api/documents/${encodeURIComponent(payload)}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        const body = await response.text();

        // Should not expose system files
        expect(body).not.toContain('root:');
        expect(body).not.toMatch(/\[boot loader\]/i);

        // Should return 400 or 404
        expect([400, 403, 404]).toContain(response.status);
      });
    });
  });

  describe('Upload Path Traversal', () => {
    it('should prevent path traversal in upload filename', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['malicious']), '../../../etc/cron.d/malicious');

      const response = await client.post('/api/upload', formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const body = await response.json();
        expect(body.path).not.toContain('..');
        expect(body.path).not.toContain('/etc/');
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// TEMPLATE INJECTION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - Template Injection', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('SSTI Prevention', () => {
    SSTI_PAYLOADS.slice(0, 5).forEach((payload) => {
      it(`should prevent SSTI: ${payload.substring(0, 20)}...`, async () => {
        const response = await client.post('/api/employees', {
          firstName: payload,
          lastName: 'Test',
          email: `ssti-${Date.now()}@test.com`,
          hireDate: '2024-01-01',
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.ok) {
          const body = await response.json();
          // Should not evaluate template expressions
          expect(body.firstName).not.toBe('49'); // 7*7
          expect(body.firstName).not.toContain('__class__');
        }
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// HEADER INJECTION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Injection Security - Header Injection', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  describe('CRLF Injection', () => {
    it('should prevent CRLF injection in redirect', async () => {
      const payload = 'http://example.com%0d%0aX-Injected:%20header';

      const response = await client.get(`/api/redirect?url=${payload}`);

      // Check response headers don't contain injected header
      expect(response.headers.get('x-injected')).toBeNull();
    });

    it('should prevent header injection in filename', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['content']), 'test\r\nX-Injected: header.txt');

      const response = await client.post('/api/upload', formData);

      expect(response.headers.get('x-injected')).toBeNull();
    });
  });
});
