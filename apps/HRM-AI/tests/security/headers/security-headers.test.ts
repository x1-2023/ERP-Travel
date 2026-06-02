// tests/security/headers/security-headers.test.ts

/**
 * LAC VIET HR - Security Headers Tests
 * Comprehensive validation of HTTP security headers
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SecurityTestClient, createSecurityTestClient } from '../../utils/security-test-client';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ════════════════════════════════════════════════════════════════════════════════
// CONTENT SECURITY POLICY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Content Security Policy', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should have Content-Security-Policy header', async () => {
    const response = await client.get('/');
    const csp = response.headers.get('content-security-policy');

    expect(csp).toBeDefined();
    expect(csp).not.toBe('');
  });

  describe('CSP Directives', () => {
    let csp: string;

    beforeAll(async () => {
      const response = await client.get('/');
      csp = response.headers.get('content-security-policy') || '';
    });

    it('should have default-src directive', () => {
      expect(csp).toMatch(/default-src/);
    });

    it('should restrict script-src', () => {
      expect(csp).toMatch(/script-src/);
    });

    it('should have frame-ancestors directive', () => {
      expect(csp).toMatch(/frame-ancestors\s+('none'|'self')/);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// STRICT TRANSPORT SECURITY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Strict Transport Security', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should have Strict-Transport-Security header', async () => {
    const response = await client.get('/');
    const hsts = response.headers.get('strict-transport-security');

    expect(hsts).toBeDefined();
  });

  it('should have minimum max-age of 1 year', async () => {
    const response = await client.get('/');
    const hsts = response.headers.get('strict-transport-security') || '';

    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1]);
      expect(maxAge).toBeGreaterThanOrEqual(31536000); // 1 year in seconds
    }
  });

  it('should include subdomains', async () => {
    const response = await client.get('/');
    const hsts = response.headers.get('strict-transport-security') || '';

    expect(hsts.toLowerCase()).toMatch(/includesubdomains/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// X-CONTENT-TYPE-OPTIONS TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - X-Content-Type-Options', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should have X-Content-Type-Options header', async () => {
    const response = await client.get('/');
    const header = response.headers.get('x-content-type-options');

    expect(header).toBe('nosniff');
  });

  it('should be present on API responses', async () => {
    const authToken = await client.getAuthToken();
    const response = await client.get('/api/employees', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('should be present on error responses', async () => {
    const response = await client.get('/api/nonexistent');

    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// X-FRAME-OPTIONS TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - X-Frame-Options', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should have X-Frame-Options header', async () => {
    const response = await client.get('/');
    const header = response.headers.get('x-frame-options');

    expect(header).toBeDefined();
    expect(['DENY', 'SAMEORIGIN']).toContain(header);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// REFERRER-POLICY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Referrer-Policy', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should have Referrer-Policy header', async () => {
    const response = await client.get('/');
    const header = response.headers.get('referrer-policy');

    expect(header).toBeDefined();
  });

  it('should use secure referrer policy', async () => {
    const response = await client.get('/');
    const header = response.headers.get('referrer-policy');

    const securePolicies = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'same-origin',
    ];

    expect(securePolicies).toContain(header);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// PERMISSIONS-POLICY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Permissions-Policy', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should have Permissions-Policy header', async () => {
    const response = await client.get('/');
    const header = response.headers.get('permissions-policy');

    expect(header).toBeDefined();
  });

  describe('Feature Restrictions', () => {
    let policy: string;

    beforeAll(async () => {
      const response = await client.get('/');
      policy = response.headers.get('permissions-policy') || '';
    });

    it('should restrict camera access', () => {
      expect(policy).toMatch(/camera=\(\)/);
    });

    it('should restrict microphone access', () => {
      expect(policy).toMatch(/microphone=\(\)/);
    });

    it('should restrict geolocation', () => {
      expect(policy).toMatch(/geolocation=\(\)/);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// CACHE CONTROL TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Cache Control', () => {
  let client: SecurityTestClient;
  let authToken: string;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
    authToken = await client.getAuthToken();
  });

  describe('API Responses', () => {
    it('should not cache API responses with sensitive data', async () => {
      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const cacheControl = response.headers.get('cache-control');

      expect(cacheControl).toMatch(/no-store|no-cache|private/);
    });

    it('should prevent caching of authentication responses', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });

      const cacheControl = response.headers.get('cache-control');

      expect(cacheControl).toMatch(/no-store/);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// HEADER REMOVAL TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Information Disclosure', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should not expose X-Powered-By header', async () => {
    const response = await client.get('/');

    expect(response.headers.get('x-powered-by')).toBeNull();
  });

  it('should not expose Server header details', async () => {
    const response = await client.get('/');
    const server = response.headers.get('server');

    // Server header should either be absent or generic
    if (server) {
      expect(server).not.toMatch(/nginx\/\d|apache\/\d|express|node/i);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE HEADER CHECK
// ════════════════════════════════════════════════════════════════════════════════

describe('Security Headers - Comprehensive Check', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should pass security header audit', async () => {
    const response = await client.get('/');

    const requiredHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
    ];

    const missingHeaders: string[] = [];

    for (const header of requiredHeaders) {
      if (!response.headers.get(header)) {
        missingHeaders.push(header);
      }
    }

    expect(missingHeaders).toEqual([]);
  });

  it('should have consistent headers across all pages', async () => {
    const pages = ['/', '/login', '/api/health'];

    for (const page of pages) {
      const response = await client.get(page);

      // All pages should have these security headers
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      expect(response.headers.get('x-frame-options')).toBeDefined();
    }
  });
});
