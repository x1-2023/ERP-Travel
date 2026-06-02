// lib/security/csrf.ts

/**
 * LAC VIET HR - CSRF Protection
 * Cross-Site Request Forgery prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SecurityConfig } from '@/config/security.config';

// ════════════════════════════════════════════════════════════════════════════════
// CSRF CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const CSRF_CONFIG = SecurityConfig.csrf;

// ════════════════════════════════════════════════════════════════════════════════
// TOKEN GENERATION & VALIDATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Generate a signed CSRF token with timestamp
 */
export function generateSignedCSRFToken(): string {
  const token = generateCSRFToken();
  const timestamp = Date.now().toString(36);
  const data = `${token}.${timestamp}`;

  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('CSRF_SECRET or JWT_SECRET must be set');
  }

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .substring(0, 16);

  return `${data}.${signature}`;
}

/**
 * Verify a signed CSRF token
 */
export function verifySignedCSRFToken(signedToken: string): {
  valid: boolean;
  expired?: boolean;
  error?: string;
} {
  const parts = signedToken.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'INVALID_FORMAT' };
  }

  const [token, timestamp, signature] = parts;
  const data = `${token}.${timestamp}`;

  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    return { valid: false, error: 'SERVER_ERROR' };
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .substring(0, 16);

  // Constant-time comparison
  if (!crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )) {
    return { valid: false, error: 'INVALID_SIGNATURE' };
  }

  // Check expiry
  const tokenTime = parseInt(timestamp, 36);
  const age = Date.now() - tokenTime;

  if (age > CSRF_CONFIG.tokenExpiry * 1000) {
    return { valid: false, expired: true, error: 'TOKEN_EXPIRED' };
  }

  return { valid: true };
}

// ════════════════════════════════════════════════════════════════════════════════
// REQUEST HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_CONFIG.cookieName)?.value || null;
}

/**
 * Get CSRF token from header
 */
export function getCSRFTokenFromHeader(request: NextRequest): string | null {
  return request.headers.get(CSRF_CONFIG.headerName);
}

/**
 * Get CSRF token from request body (for form submissions)
 */
export async function getCSRFTokenFromBody(request: NextRequest): Promise<string | null> {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const body = await request.clone().json();
      return body['_csrf'] || null;
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.clone().formData();
      return formData.get('_csrf')?.toString() || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if path should be excluded from CSRF protection
 */
export function isExcludedPath(path: string): boolean {
  return CSRF_CONFIG.excludePaths.some(excluded => path.startsWith(excluded));
}

/**
 * Check if method requires CSRF protection
 */
export function isProtectedMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

// ════════════════════════════════════════════════════════════════════════════════
// CSRF VALIDATION
// ════════════════════════════════════════════════════════════════════════════════

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
  code?: 'MISSING_COOKIE' | 'MISSING_TOKEN' | 'TOKEN_MISMATCH' | 'INVALID_ORIGIN' | 'TOKEN_EXPIRED';
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(request: NextRequest): Promise<CSRFValidationResult> {
  // Skip for safe methods
  if (!isProtectedMethod(request.method)) {
    return { valid: true };
  }

  // Skip for excluded paths
  const path = new URL(request.url).pathname;
  if (isExcludedPath(path)) {
    return { valid: true };
  }

  // Get cookie token
  const cookieToken = getCSRFTokenFromCookie(request);
  if (!cookieToken) {
    return {
      valid: false,
      error: 'CSRF cookie missing',
      code: 'MISSING_COOKIE',
    };
  }

  // Get request token (header or body)
  let requestToken = getCSRFTokenFromHeader(request);
  if (!requestToken) {
    requestToken = await getCSRFTokenFromBody(request);
  }

  if (!requestToken) {
    return {
      valid: false,
      error: 'CSRF token missing from request',
      code: 'MISSING_TOKEN',
    };
  }

  // Verify signed tokens
  const cookieVerification = verifySignedCSRFToken(cookieToken);
  if (!cookieVerification.valid) {
    if (cookieVerification.expired) {
      return { valid: false, error: 'CSRF token expired', code: 'TOKEN_EXPIRED' };
    }
    return { valid: false, error: 'Invalid CSRF cookie', code: 'TOKEN_MISMATCH' };
  }

  // Compare tokens (constant-time)
  try {
    if (!crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(requestToken)
    )) {
      return {
        valid: false,
        error: 'CSRF token mismatch',
        code: 'TOKEN_MISMATCH',
      };
    }
  } catch {
    return {
      valid: false,
      error: 'CSRF token mismatch',
      code: 'TOKEN_MISMATCH',
    };
  }

  return { valid: true };
}

// ════════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * CSRF protection middleware
 */
export async function csrfMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const result = await validateCSRFToken(request);

  if (!result.valid) {
    return NextResponse.json(
      {
        error: 'CSRF_VALIDATION_FAILED',
        code: result.code,
        message: 'Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.',
      },
      { status: 403 }
    );
  }

  return null; // Continue to next middleware
}

// ════════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Set CSRF cookie on response
 */
export function setCSRFCookie(response: NextResponse): string {
  const token = generateSignedCSRFToken();

  response.cookies.set(CSRF_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_CONFIG.tokenExpiry,
  });

  return token;
}

/**
 * Create response with CSRF cookie
 */
export function createResponseWithCSRF<T>(
  data: T,
  options?: { status?: number; headers?: Record<string, string> }
): NextResponse {
  const response = NextResponse.json(data, {
    status: options?.status || 200,
    headers: options?.headers,
  });

  setCSRFCookie(response);

  return response;
}

/**
 * Get CSRF token endpoint handler
 */
export function getCSRFTokenEndpoint(request: NextRequest): NextResponse {
  const existingToken = getCSRFTokenFromCookie(request);

  // Verify existing token is still valid
  if (existingToken) {
    const verification = verifySignedCSRFToken(existingToken);
    if (verification.valid) {
      return NextResponse.json({ csrfToken: existingToken });
    }
  }

  // Generate new token
  const response = NextResponse.json({ csrfToken: '' });
  const newToken = setCSRFCookie(response);

  return NextResponse.json({ csrfToken: newToken }, {
    headers: response.headers,
  });
}
