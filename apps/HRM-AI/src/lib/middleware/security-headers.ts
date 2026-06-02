// lib/middleware/security-headers.ts

import { NextRequest, NextResponse } from 'next/server';
import { SecurityConfig } from '@/config/security.config';

/**
 * LAC VIET HR - Security Headers Middleware
 * Applies comprehensive security headers to all responses
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface SecurityHeadersOptions {
  csp?: boolean;
  hsts?: boolean;
  xFrameOptions?: boolean;
  xContentTypeOptions?: boolean;
  referrerPolicy?: boolean;
  permissionsPolicy?: boolean;
  cacheControl?: boolean;
  customHeaders?: Record<string, string>;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS BUILDER
// ════════════════════════════════════════════════════════════════════════════════

export class SecurityHeaders {
  private headers: Record<string, string> = {};
  private config = SecurityConfig.headers;

  /**
   * Build Content-Security-Policy header
   */
  buildCSP(): string {
    const csp = this.config.csp;
    const directives: string[] = [];

    if (csp.defaultSrc?.length) {
      directives.push(`default-src ${csp.defaultSrc.join(' ')}`);
    }
    if (csp.scriptSrc?.length) {
      directives.push(`script-src ${csp.scriptSrc.join(' ')}`);
    }
    if (csp.styleSrc?.length) {
      directives.push(`style-src ${csp.styleSrc.join(' ')}`);
    }
    if (csp.fontSrc?.length) {
      directives.push(`font-src ${csp.fontSrc.join(' ')}`);
    }
    if (csp.imgSrc?.length) {
      directives.push(`img-src ${csp.imgSrc.join(' ')}`);
    }
    if (csp.connectSrc?.length) {
      directives.push(`connect-src ${csp.connectSrc.join(' ')}`);
    }
    if (csp.frameSrc?.length) {
      directives.push(`frame-src ${csp.frameSrc.join(' ')}`);
    }
    if (csp.objectSrc?.length) {
      directives.push(`object-src ${csp.objectSrc.join(' ')}`);
    }
    if (csp.baseUri?.length) {
      directives.push(`base-uri ${csp.baseUri.join(' ')}`);
    }
    if (csp.formAction?.length) {
      directives.push(`form-action ${csp.formAction.join(' ')}`);
    }
    if (csp.frameAncestors?.length) {
      directives.push(`frame-ancestors ${csp.frameAncestors.join(' ')}`);
    }
    if (csp.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }

    return directives.join('; ');
  }

  /**
   * Build HSTS header
   */
  buildHSTS(): string {
    const hsts = this.config.hsts;
    let value = `max-age=${hsts.maxAge}`;

    if (hsts.includeSubDomains) {
      value += '; includeSubDomains';
    }

    if (hsts.preload) {
      value += '; preload';
    }

    return value;
  }

  /**
   * Build Permissions-Policy header
   */
  buildPermissionsPolicy(): string {
    const permissions = this.config.permissionsPolicy;
    const directives: string[] = [];

    for (const [feature, allowList] of Object.entries(permissions)) {
      if (allowList.length === 0) {
        directives.push(`${feature}=()`);
      } else {
        const values = allowList.map((v) => (v === 'self' ? 'self' : `"${v}"`)).join(' ');
        directives.push(`${feature}=(${values})`);
      }
    }

    return directives.join(', ');
  }

  /**
   * Add all security headers
   */
  addAllHeaders(options: SecurityHeadersOptions = {}): this {
    const {
      csp = true,
      hsts = true,
      xFrameOptions = true,
      xContentTypeOptions = true,
      referrerPolicy = true,
      permissionsPolicy = true,
      cacheControl = true,
      customHeaders = {},
    } = options;

    // Content-Security-Policy
    if (csp) {
      this.headers['Content-Security-Policy'] = this.buildCSP();
    }

    // Strict-Transport-Security
    if (hsts) {
      this.headers['Strict-Transport-Security'] = this.buildHSTS();
    }

    // X-Frame-Options
    if (xFrameOptions) {
      this.headers['X-Frame-Options'] = this.config.xFrameOptions;
    }

    // X-Content-Type-Options
    if (xContentTypeOptions) {
      this.headers['X-Content-Type-Options'] = this.config.xContentTypeOptions;
    }

    // Referrer-Policy
    if (referrerPolicy) {
      this.headers['Referrer-Policy'] = this.config.referrerPolicy;
    }

    // Permissions-Policy
    if (permissionsPolicy) {
      this.headers['Permissions-Policy'] = this.buildPermissionsPolicy();
    }

    // Additional security headers
    this.headers['X-XSS-Protection'] = '1; mode=block';
    this.headers['X-DNS-Prefetch-Control'] = 'off';
    this.headers['X-Download-Options'] = 'noopen';
    this.headers['X-Permitted-Cross-Domain-Policies'] = 'none';

    // Cache control for sensitive pages
    if (cacheControl) {
      this.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      this.headers['Pragma'] = 'no-cache';
      this.headers['Expires'] = '0';
    }

    // Custom headers
    for (const [key, value] of Object.entries(customHeaders)) {
      this.headers[key] = value;
    }

    return this;
  }

  /**
   * Get headers object
   */
  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }

  /**
   * Apply headers to response
   */
  apply(response: NextResponse): NextResponse {
    for (const [key, value] of Object.entries(this.headers)) {
      response.headers.set(key, value);
    }
    return response;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PRE-CONFIGURED HEADER SETS
// ════════════════════════════════════════════════════════════════════════════════

export const defaultSecurityHeaders = new SecurityHeaders().addAllHeaders();

export const apiSecurityHeaders = new SecurityHeaders().addAllHeaders({
  csp: false, // Not needed for API responses
  cacheControl: true,
  customHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store, private',
  },
});

export const strictSecurityHeaders = new SecurityHeaders().addAllHeaders({
  csp: true,
  hsts: true,
  cacheControl: true,
});

// ════════════════════════════════════════════════════════════════════════════════
// CORS HEADERS
// ════════════════════════════════════════════════════════════════════════════════

export function corsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin');
  const corsConfig = SecurityConfig.cors;

  // Check if origin is allowed
  const isAllowed = corsConfig.origins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed === origin) return true;
    // Check for wildcard subdomain
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin?.endsWith(domain) || false;
    }
    return false;
  });

  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', String(corsConfig.maxAge));

    if (corsConfig.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

// ════════════════════════════════════════════════════════════════════════════════
// HANDLE PREFLIGHT REQUESTS
// ════════════════════════════════════════════════════════════════════════════════

export function handlePreflightRequest(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const origin = request.headers.get('origin');
  const corsConfig = SecurityConfig.cors;

  const isAllowed = corsConfig.origins.some((allowed) => {
    if (allowed === '*') return true;
    return allowed === origin;
  });

  if (!isAllowed) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, { status: 204 });

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', String(corsConfig.maxAge));

    if (corsConfig.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

// ════════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE HELPER
// ════════════════════════════════════════════════════════════════════════════════

export function securityHeadersMiddleware(
  request: NextRequest,
  response: NextResponse,
  options?: SecurityHeadersOptions
): NextResponse {
  const headers = new SecurityHeaders().addAllHeaders(options);

  // Add request ID header
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  return headers.apply(response);
}

// ════════════════════════════════════════════════════════════════════════════════
// NEXT.JS CONFIG FOR SECURITY HEADERS
// ════════════════════════════════════════════════════════════════════════════════

export const nextSecurityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=()',
  },
];

export default {
  SecurityHeaders,
  defaultSecurityHeaders,
  apiSecurityHeaders,
  strictSecurityHeaders,
  securityHeadersMiddleware,
  corsHeaders,
  handlePreflightRequest,
  nextSecurityHeaders,
};
