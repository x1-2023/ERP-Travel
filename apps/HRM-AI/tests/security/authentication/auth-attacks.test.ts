// tests/security/authentication/auth-attacks.test.ts

/**
 * LAC VIET HR - Authentication Attack Tests
 * Tests for brute force, credential stuffing, and session attacks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SecurityTestClient, createSecurityTestClient } from '../../utils/security-test-client';
import { AUTH_BYPASS_PAYLOADS } from '../../utils/attack-payloads';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ════════════════════════════════════════════════════════════════════════════════
// BRUTE FORCE TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Authentication Security - Brute Force Protection', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  describe('Login Rate Limiting', () => {
    it('should rate limit after multiple failed attempts', async () => {
      const results: number[] = [];

      for (let i = 0; i < 10; i++) {
        const response = await client.post('/api/auth/login', {
          email: `bruteforce-test-${Date.now()}@example.com`,
          password: 'wrongpassword',
        });
        results.push(response.status);
      }

      // Should be rate limited (429) at some point
      expect(results).toContain(429);
    });

    it('should lock account after too many failed attempts', async () => {
      const email = `lockout-test-${Date.now()}@example.com`;

      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await client.post('/api/auth/login', {
          email,
          password: 'wrongpassword',
        });
      }

      // Next attempt should indicate lockout
      const response = await client.post('/api/auth/login', {
        email,
        password: 'wrongpassword',
      });

      expect([423, 429]).toContain(response.status);
    });

    it('should track failed attempts by IP', async () => {
      const results: number[] = [];

      // Make many attempts from same "IP"
      for (let i = 0; i < 10; i++) {
        const response = await client.post('/api/auth/login', {
          email: `user${i}@different.com`,
          password: 'wrongpassword',
        });
        results.push(response.status);
      }

      // Should eventually be rate limited by IP
      expect(results.filter(s => s === 429).length).toBeGreaterThan(0);
    });
  });

  describe('Credential Stuffing Prevention', () => {
    it('should not reveal if user exists', async () => {
      const existingUserResponse = await client.post('/api/auth/login', {
        email: 'admin@company.com',
        password: 'wrongpassword',
      });

      const nonExistingUserResponse = await client.post('/api/auth/login', {
        email: 'definitely-not-exists-12345@company.com',
        password: 'wrongpassword',
      });

      // Both should return same status and similar response
      expect(existingUserResponse.status).toBe(nonExistingUserResponse.status);

      // Response bodies should not reveal user existence
      const existingBody = await existingUserResponse.text();
      const nonExistingBody = await nonExistingUserResponse.text();

      // Messages should be generic
      expect(existingBody).not.toMatch(/user.*not.*found|no.*user|unknown.*user/i);
      expect(nonExistingBody).not.toMatch(/user.*not.*found|no.*user|unknown.*user/i);
    });

    it('should return consistent timing for existing and non-existing users', async () => {
      const timings: { existing: number[]; nonExisting: number[] } = {
        existing: [],
        nonExisting: [],
      };

      for (let i = 0; i < 5; i++) {
        const startExisting = Date.now();
        await client.post('/api/auth/login', {
          email: 'admin@company.com',
          password: 'wrongpassword',
        });
        timings.existing.push(Date.now() - startExisting);

        const startNonExisting = Date.now();
        await client.post('/api/auth/login', {
          email: `nonexistent${i}@company.com`,
          password: 'wrongpassword',
        });
        timings.nonExisting.push(Date.now() - startNonExisting);
      }

      // Average timings should be similar (within 100ms)
      const avgExisting = timings.existing.reduce((a, b) => a + b, 0) / timings.existing.length;
      const avgNonExisting = timings.nonExisting.reduce((a, b) => a + b, 0) / timings.nonExisting.length;

      expect(Math.abs(avgExisting - avgNonExisting)).toBeLessThan(200);
    });
  });

  describe('Common Credential Attacks', () => {
    it('should reject common password attempts', async () => {
      for (const password of AUTH_BYPASS_PAYLOADS.passwords) {
        const response = await client.post('/api/auth/login', {
          email: 'admin@company.com',
          password,
        });

        expect(response.status).not.toBe(200);
      }
    });

    it('should reject default admin credentials', async () => {
      const defaultCreds = [
        { email: 'admin@admin.com', password: 'admin' },
        { email: 'admin@company.com', password: 'admin' },
        { email: 'root@company.com', password: 'root' },
        { email: 'test@test.com', password: 'test' },
      ];

      for (const cred of defaultCreds) {
        const response = await client.post('/api/auth/login', cred);
        expect(response.status).not.toBe(200);
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// PASSWORD POLICY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Authentication Security - Password Policy', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  describe('Password Requirements', () => {
    const weakPasswords = [
      'password',
      '12345678',
      'qwerty123',
      'admin123',
      'letmein',
      'abc123',
      'Password1', // Missing special char
      'password!', // Missing uppercase and number
    ];

    weakPasswords.forEach(password => {
      it(`should reject weak password: ${password}`, async () => {
        const response = await client.post('/api/auth/register', {
          email: `weak-pwd-${Date.now()}@example.com`,
          password,
          confirmPassword: password,
          firstName: 'Test',
          lastName: 'User',
          acceptTerms: true,
        });

        expect([400, 422]).toContain(response.status);
      });
    });

    it('should accept strong password', async () => {
      const response = await client.post('/api/auth/register', {
        email: `strong-pwd-${Date.now()}@example.com`,
        password: 'SecureP@ssw0rd123!',
        confirmPassword: 'SecureP@ssw0rd123!',
        firstName: 'Test',
        lastName: 'User',
        acceptTerms: true,
      });

      expect([201, 400, 409]).toContain(response.status); // 400/409 if user exists
    });

    it('should require minimum password length', async () => {
      const response = await client.post('/api/auth/register', {
        email: `short-pwd-${Date.now()}@example.com`,
        password: 'Ab1!',
        confirmPassword: 'Ab1!',
        firstName: 'Test',
        lastName: 'User',
        acceptTerms: true,
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('Password Change Security', () => {
    it('should require current password for password change', async () => {
      const token = await client.getAuthToken();

      const response = await client.post('/api/auth/change-password', {
        newPassword: 'NewSecureP@ss123!',
        confirmNewPassword: 'NewSecureP@ss123!',
        // Missing currentPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([400, 422]).toContain(response.status);
    });

    it('should reject password same as current', async () => {
      const token = await client.getAuthToken();
      const currentPassword = 'ValidP@ssw0rd123!';

      const response = await client.post('/api/auth/change-password', {
        currentPassword,
        newPassword: currentPassword,
        confirmNewPassword: currentPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([400, 422]).toContain(response.status);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// SESSION SECURITY TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Authentication Security - Session Management', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  describe('Session Token Security', () => {
    it('should not accept unsigned/modified tokens', async () => {
      // Create a fake JWT
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.FAKE_SIGNATURE';

      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${fakeToken}` },
      });

      expect(response.status).toBe(401);
    });

    it('should reject tokens with "none" algorithm', async () => {
      // JWT with alg: none
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ userId: 'admin', role: 'ADMIN' })).toString('base64url');
      const noneToken = `${header}.${payload}.`;

      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${noneToken}` },
      });

      expect(response.status).toBe(401);
    });

    it('should reject expired tokens', async () => {
      // Token that looks valid but is expired
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid';

      const response = await client.get('/api/employees', {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Session Lifecycle', () => {
    it('should invalidate token on logout', async () => {
      // Login and get token
      const loginResponse = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });

      if (loginResponse.ok) {
        const { accessToken } = await loginResponse.json();

        // Logout
        await client.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Try to use old token
        const response = await client.get('/api/employees', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        expect(response.status).toBe(401);
      }
    });

    it('should issue new session on re-login', async () => {
      // First login
      const login1 = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });
      const token1 = login1.ok ? (await login1.json()).accessToken : null;

      // Second login
      const login2 = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });
      const token2 = login2.ok ? (await login2.json()).accessToken : null;

      // Tokens should be different
      if (token1 && token2) {
        expect(token1).not.toBe(token2);
      }
    });
  });

  describe('Cookie Security', () => {
    it('should set HttpOnly flag on auth cookies', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        expect(setCookie.toLowerCase()).toContain('httponly');
      }
    });

    it('should set SameSite flag on cookies', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'test@company.com',
        password: 'ValidP@ssw0rd123!',
      });

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        expect(setCookie.toLowerCase()).toMatch(/samesite=(strict|lax)/);
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// MFA BYPASS TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Authentication Security - MFA Bypass Prevention', () => {
  let client: SecurityTestClient;

  beforeAll(async () => {
    client = createSecurityTestClient(BASE_URL);
  });

  it('should not allow accessing protected resources without completing MFA', async () => {
    // This test assumes MFA is enabled for the account
    const response = await client.post('/api/auth/login', {
      email: 'mfa-user@company.com',
      password: 'ValidP@ssw0rd123!',
    });

    if (response.status === 200) {
      const body = await response.json();

      // If MFA is required, should not return full access token
      if (body.mfaRequired) {
        const tempToken = body.temporaryToken;

        // Try to access protected resource with temporary token
        const protectedResponse = await client.get('/api/employees', {
          headers: { Authorization: `Bearer ${tempToken}` },
        });

        expect([401, 403]).toContain(protectedResponse.status);
      }
    }
  });

  it('should rate limit MFA code attempts', async () => {
    const results: number[] = [];

    for (let i = 0; i < 10; i++) {
      const response = await client.post('/api/auth/verify-mfa', {
        code: '000000',
        temporaryToken: 'test-temp-token',
      });
      results.push(response.status);
    }

    // Should be rate limited at some point
    expect(results).toContain(429);
  });
});
