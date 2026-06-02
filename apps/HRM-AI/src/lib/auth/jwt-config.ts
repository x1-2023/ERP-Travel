// lib/auth/jwt-config.ts

/**
 * LAC VIET HR - JWT Configuration
 * Secure JWT token generation and verification
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { SecurityConfig } from '@/config/security.config';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM ERROR
// ════════════════════════════════════════════════════════════════════════════════

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SECRET KEY MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════════

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new AuthError(
      'JWT_SECRET_INVALID',
      'JWT_SECRET must be set and at least 32 characters',
      500
    );
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new AuthError(
      'JWT_SECRET_INVALID',
      'JWT secret must be set and at least 32 characters',
      500
    );
  }
  return new TextEncoder().encode(secret);
}

// ════════════════════════════════════════════════════════════════════════════════
// TOKEN GENERATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate an access token
 */
export async function generateAccessToken(payload: Omit<TokenPayload, 'type'>): Promise<string> {
  const secret = getJWTSecret();
  const config = SecurityConfig.jwt;

  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.accessTokenExpiry)
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setSubject(String(payload.userId))
    .setJti(crypto.randomUUID())
    .sign(secret);
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(payload: Omit<TokenPayload, 'type'>): Promise<string> {
  const secret = getRefreshSecret();
  const config = SecurityConfig.jwt;

  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.refreshTokenExpiry)
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setSubject(String(payload.userId))
    .setJti(crypto.randomUUID())
    .sign(secret);
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  userData: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
    sessionId: string;
  }
): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(userData),
    generateRefreshToken(userData),
  ]);

  // Parse expiry times
  const accessExpiry = parseExpiry(SecurityConfig.jwt.accessTokenExpiry);
  const refreshExpiry = parseExpiry(SecurityConfig.jwt.refreshTokenExpiry);

  return {
    accessToken,
    refreshToken,
    expiresIn: accessExpiry,
    refreshExpiresIn: refreshExpiry,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// TOKEN VERIFICATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const secret = getJWTSecret();
  const config = SecurityConfig.jwt;

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.issuer,
      audience: config.audience,
    });

    const typedPayload = payload as TokenPayload;

    if (typedPayload.type !== 'access') {
      throw new AuthError('INVALID_TOKEN_TYPE', 'Invalid token type', 401);
    }

    return typedPayload;
  } catch (error) {
    if (error instanceof AuthError) throw error;

    const err = error as Error;
    if (err.name === 'JWTExpired') {
      throw new AuthError('TOKEN_EXPIRED', 'Token đã hết hạn', 401);
    }
    if (err.name === 'JWTClaimValidationFailed') {
      throw new AuthError('TOKEN_INVALID', 'Token không hợp lệ', 401);
    }

    throw new AuthError('TOKEN_VERIFICATION_FAILED', 'Xác thực token thất bại', 401);
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const secret = getRefreshSecret();
  const config = SecurityConfig.jwt;

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.issuer,
      audience: config.audience,
    });

    const typedPayload = payload as TokenPayload;

    if (typedPayload.type !== 'refresh') {
      throw new AuthError('INVALID_TOKEN_TYPE', 'Invalid token type', 401);
    }

    return typedPayload;
  } catch (error) {
    if (error instanceof AuthError) throw error;

    const err = error as Error;
    if (err.name === 'JWTExpired') {
      throw new AuthError('REFRESH_TOKEN_EXPIRED', 'Refresh token đã hết hạn', 401);
    }

    throw new AuthError('REFRESH_TOKEN_INVALID', 'Refresh token không hợp lệ', 401);
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(header: string | null): string | null {
  if (!header) return null;

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Parse expiry string to seconds
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is about to expire
 */
export function isTokenExpiringSoon(payload: TokenPayload, thresholdSeconds: number = 300): boolean {
  if (!payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < thresholdSeconds;
}
