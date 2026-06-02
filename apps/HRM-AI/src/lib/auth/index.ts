// lib/auth/index.ts

/**
 * LAC VIET HR - Authentication Module
 * Centralized exports for auth-related functionality
 */

// JWT Configuration
export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  decodeToken,
  isTokenExpiringSoon,
  AuthError,
  type TokenPayload,
  type TokenPair,
} from './jwt-config';

// Password Policy
export {
  validatePassword,
  checkPasswordStrength,
  hashPassword,
  comparePassword,
  isPasswordInHistory,
  generateSecurePassword,
  isPasswordExpired,
  getDaysUntilExpiry,
  type PasswordValidationResult,
  type PasswordStrengthResult,
} from './password-policy';

// Session Manager
export {
  SessionManager,
  getSessionManager,
  extractFingerprint,
  type Session,
  type SessionFingerprint,
  type SessionStore,
} from './session-manager';

// Account Lockout
export {
  AccountLockoutManager,
  getAccountLockoutManager,
  formatLockoutMessage,
  type LockoutStatus,
  type AttemptResult,
  type LockoutStore,
} from './account-lockout';
