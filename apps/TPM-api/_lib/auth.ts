import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// --- JWT_SECRET enforcement (Sprint 0 Fix 1) ---
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'CRITICAL: JWT_SECRET environment variable is required.\n' +
      'Set it in .env or environment variables.\n' +
      'Generate with: openssl rand -base64 32'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      `CRITICAL: JWT_SECRET must be at least 32 characters. Current length: ${secret.length}`
    );
  }
  const weakSecrets = ['dev-secret', 'test-secret', 'secret', 'password', '12345', 'change-in-production'];
  if (weakSecrets.some(w => secret.toLowerCase().includes(w))) {
    console.warn('WARNING: JWT_SECRET appears to be a weak/test value. Use a strong random secret in production.');
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends VercelRequest {
  auth: JwtPayload;
  token?: string;
}

// --- User Roles (Sprint 0 Fix 2) ---
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  KAM = 'KAM',
  FINANCE = 'FINANCE',
  VIEWER = 'VIEWER',
}

const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.VIEWER]: 0,
  [UserRole.KAM]: 1,
  [UserRole.FINANCE]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
};

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  return decoded;
}

export function signToken(payload: JwtPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function signRefreshToken(payload: JwtPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any);
}

export function getUserFromRequest(req: VercelRequest): JwtPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void | VercelResponse>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }
      });
      return;
    }

    // Sprint 0 Fix 8: Check token blacklist
    const token = req.headers.authorization?.slice(7);
    if (token) {
      try {
        const { isTokenRevoked } = await import('./tokenBlacklist');
        const revoked = await isTokenRevoked(token);
        if (revoked) {
          return res.status(401).json({
            success: false,
            error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked. Please login again.' }
          });
        }
      } catch {
        // If blacklist check fails (e.g., DB not migrated yet), continue
      }
    }

    const authReq = req as AuthenticatedRequest;
    authReq.auth = user;
    authReq.token = token;
    await handler(authReq, res);
  };
}

// --- RBAC Middleware (Sprint 0 Fix 2) ---
interface RBACOptions {
  minRole?: UserRole;
  allowedRoles?: UserRole[];
  customCheck?: (user: JwtPayload, req: VercelRequest) => boolean;
}

export function withRole(options: RBACOptions) {
  return function (handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void | VercelResponse>) {
    return async (req: VercelRequest, res: VercelResponse) => {
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }
        });
      }

      // Sprint 0 Fix 8: Check token blacklist
      const token = req.headers.authorization?.slice(7);
      if (token) {
        try {
          const { isTokenRevoked } = await import('./tokenBlacklist');
          const revoked = await isTokenRevoked(token);
          if (revoked) {
            return res.status(401).json({
              success: false,
              error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked. Please login again.' }
            });
          }
        } catch {
          // If blacklist check fails, continue
        }
      }

      const userRole = user.role as UserRole;

      if (options.minRole) {
        const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
        const requiredLevel = ROLE_HIERARCHY[options.minRole] ?? 0;
        if (userLevel < requiredLevel) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: `Insufficient permissions. Required: ${options.minRole} or higher.`
            }
          });
        }
      }

      if (options.allowedRoles && options.allowedRoles.length > 0) {
        if (!options.allowedRoles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: `Access denied. Allowed roles: ${options.allowedRoles.join(', ')}.`
            }
          });
        }
      }

      if (options.customCheck && !options.customCheck(user, req)) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied by policy' }
        });
      }

      const authReq = req as AuthenticatedRequest;
      authReq.auth = user;
      authReq.token = req.headers.authorization?.slice(7);
      return handler(authReq, res);
    };
  };
}

// Convenience RBAC wrappers
export const adminOnly = withRole({ allowedRoles: [UserRole.ADMIN] });
export const managerPlus = withRole({ minRole: UserRole.MANAGER });
export const financePlus = withRole({ minRole: UserRole.FINANCE });
export const kamPlus = withRole({ minRole: UserRole.KAM });
export const authenticated = withAuth;

// --- Pagination Helper (Sprint 0 Fix 5) ---
const MAX_LIMIT = 100;

export function parsePagination(query: Record<string, unknown>) {
  let page = parseInt(query.page as string) || 1;
  if (page < 1) page = 1;
  let limit = parseInt(query.limit as string) || 20;
  if (limit < 1) limit = 20;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse<T>(data: T[], total: number, params: { page: number; limit: number }) {
  const totalPages = Math.ceil(total / params.limit);
  return {
    success: true,
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasMore: params.page < totalPages,
    },
  };
}
