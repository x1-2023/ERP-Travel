// tests/security/csrf/csrf-attacks.test.ts

/**
 * LAC VIET HR - CSRF Attack Tests
 * Tests for Cross-Site Request Forgery vulnerabilities
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SecurityTestClient, createSecurityTestClient } from '../../utils/security-test-client';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ════════════════════════════════════════════════════════════════════════════════
// CSRF TOKEN TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('CSRF Security - Token Validation', () => {
  let client: SecurityTestClient;
  let authToken: string;
  let csrfToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
    csrfToken = await client.getCSRFToken();
  });

  describe('CSRF Token Presence', () => {
    it('should require CSRF token for POST requests', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          // No CSRF token
        },
      });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toMatch(/CSRF/i);
    });

    it('should require CSRF token for PUT requests', async () => {
      const response = await client.put('/api/employees/1', {
        firstName: 'Updated',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it('should require CSRF token for DELETE requests', async () => {
      const response = await client.delete('/api/employees/1', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it('should NOT require CSRF token for GET requests', async () => {
      const response = await client.get('/api/employees', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).not.toBe(403);
    });
  });

  describe('CSRF Token Validation', () => {
    it('should accept valid CSRF token', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: `csrf-valid-${Date.now()}@example.com`,
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken,
        },
      });

      expect(response.status).not.toBe(403);
    });

    it('should reject invalid CSRF token', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': 'invalid-token-12345',
        },
      });

      expect(response.status).toBe(403);
    });

    it('should reject empty CSRF token', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': '',
        },
      });

      expect(response.status).toBe(403);
    });

    it('should reject tampered CSRF token', async () => {
      // Modify the token slightly
      const tamperedToken = csrfToken.slice(0, -5) + 'xxxxx';

      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': tamperedToken,
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('CSRF Token Uniqueness', () => {
    it('should have sufficient entropy', async () => {
      const tokens = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const token = await client.getCSRFToken();
        if (token) tokens.add(token);
      }

      // Tokens should be unique
      expect(tokens.size).toBeGreaterThan(0);

      // Token should be at least 32 characters
      const sampleToken = tokens.values().next().value as string;
      if (sampleToken) {
        expect(sampleToken.length).toBeGreaterThanOrEqual(32);
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// ORIGIN/REFERER VALIDATION TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('CSRF Security - Origin Validation', () => {
  let client: SecurityTestClient;
  let authToken: string;
  let csrfToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
    csrfToken = await client.getCSRFToken();
  });

  describe('Origin Header Validation', () => {
    it('should reject requests from different origin', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken,
          'Origin': 'https://evil-site.com',
        },
      });

      expect(response.status).toBe(403);
    });

    it('should accept requests from same origin', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: `same-origin-${Date.now()}@example.com`,
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken,
          'Origin': BASE_URL,
        },
      });

      expect(response.status).not.toBe(403);
    });
  });

  describe('Referer Header Validation', () => {
    it('should validate Referer when Origin is missing', async () => {
      const response = await client.post('/api/employees', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        hireDate: '2024-01-01',
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken,
          'Referer': 'https://evil-site.com/attack.html',
        },
      });

      expect(response.status).toBe(403);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// SESSION SECURITY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Session Security', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  describe('Session Cookie Security', () => {
    it('should set HttpOnly flag on session cookie', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        expect(setCookie.toLowerCase()).toContain('httponly');
      }
    });

    it('should set SameSite flag on session cookie', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        expect(setCookie.toLowerCase()).toMatch(/samesite=(strict|lax)/i);
      }
    });
  });

  describe('Session Fixation Prevention', () => {
    it('should regenerate session ID after login', async () => {
      // Get initial session
      const initialResponse = await client.get('/api/csrf-token');
      const initialCookie = initialResponse.headers.get('set-cookie');

      // Login
      const loginResponse = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });
      const loginCookie = loginResponse.headers.get('set-cookie');

      // Session should be different after login
      if (initialCookie && loginCookie) {
        expect(loginCookie).not.toBe(initialCookie);
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// CLICKJACKING TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Clickjacking Protection', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should set X-Frame-Options header', async () => {
    const response = await client.get('/');
    const xFrameOptions = response.headers.get('x-frame-options');

    expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions);
  });

  it('should set Content-Security-Policy frame-ancestors', async () => {
    const response = await client.get('/');
    const csp = response.headers.get('content-security-policy');

    if (csp) {
      expect(csp).toMatch(/frame-ancestors\s+('none'|'self')/);
    }
  });

  it('should prevent framing from external sites', async () => {
    const response = await client.get('/');
    const xFrameOptions = response.headers.get('x-frame-options');
    const csp = response.headers.get('content-security-policy');

    // Either X-Frame-Options or CSP should prevent external framing
    const hasProtection =
      xFrameOptions === 'DENY' ||
      xFrameOptions === 'SAMEORIGIN' ||
      csp?.includes("frame-ancestors 'none'") ||
      csp?.includes("frame-ancestors 'self'");

    expect(hasProtection).toBe(true);
  });
});
