// lib/auth/password-policy.ts

/**
 * LAC VIET HR - Password Policy
 * Strong password validation and management
 */

import bcrypt from 'bcryptjs';
import { SecurityConfig } from '@/config/security.config';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

export interface PasswordStrengthResult {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
}

// ════════════════════════════════════════════════════════════════════════════════
// COMMON PASSWORDS LIST (Top 100)
// ════════════════════════════════════════════════════════════════════════════════

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'password123', 'batman',
  'login', 'admin', 'princess', 'welcome', 'solo', 'hello', 'freedom',
  '121212', 'flower', 'hottie', 'loveme', 'whatever', 'nicole', 'jordan',
  'mustang', 'pepper', 'matthew', '987654321', 'andrew', 'joshua', 'guitar',
]);

// ════════════════════════════════════════════════════════════════════════════════
// PASSWORD VALIDATION
// ════════════════════════════════════════════════════════════════════════════════

const config = SecurityConfig.password;

/**
 * Validate password against policy
 */
export function validatePassword(password: string, email?: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Length check
  if (password.length < config.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${config.minLength} ký tự`);
    score -= 30;
  }

  if (password.length > config.maxLength) {
    errors.push(`Mật khẩu không được quá ${config.maxLength} ký tự`);
  }

  // Uppercase check
  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ in hoa (A-Z)');
    score -= 15;
  }

  // Lowercase check
  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường (a-z)');
    score -= 15;
  }

  // Number check
  if (config.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số (0-9)');
    score -= 15;
  }

  // Special character check
  if (config.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)');
    score -= 15;
  }

  // Common password check
  if (config.commonPasswordsCheck && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác');
    score -= 40;
  }

  // Check if password contains email
  if (email) {
    const emailPrefix = email.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailPrefix)) {
      errors.push('Mật khẩu không được chứa địa chỉ email');
      score -= 20;
    }
  }

  // Check for sequential characters
  if (hasSequentialCharacters(password, 4)) {
    suggestions.push('Tránh sử dụng các ký tự liên tiếp (123, abc...)');
    score -= 10;
  }

  // Check for repeated characters
  if (hasRepeatedCharacters(password, 3)) {
    suggestions.push('Tránh lặp lại ký tự quá nhiều (aaa, 111...)');
    score -= 10;
  }

  // Add suggestions based on what's missing
  if (password.length >= config.minLength && password.length < 16) {
    suggestions.push('Mật khẩu dài hơn sẽ bảo mật hơn');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    valid: errors.length === 0,
    score,
    errors,
    suggestions,
  };
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  // Mixed case bonus
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 5;
  }

  // Numbers and special chars together
  if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 5;
  }

  // Deductions
  if (hasSequentialCharacters(password, 3)) {
    score -= 10;
    feedback.push('Tránh các ký tự liên tiếp');
  }

  if (hasRepeatedCharacters(password, 3)) {
    score -= 10;
    feedback.push('Tránh lặp lại ký tự');
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    score -= 30;
    feedback.push('Đây là mật khẩu phổ biến');
  }

  score = Math.max(0, Math.min(100, score));

  let level: PasswordStrengthResult['level'];
  if (score < 20) level = 'weak';
  else if (score < 40) level = 'fair';
  else if (score < 60) level = 'good';
  else if (score < 80) level = 'strong';
  else level = 'very-strong';

  return { score, level, feedback };
}

// ════════════════════════════════════════════════════════════════════════════════
// PASSWORD HASHING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.bcryptRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if password is in history
 */
export async function isPasswordInHistory(
  password: string,
  passwordHistory: string[]
): Promise<boolean> {
  for (const historicHash of passwordHistory) {
    if (await comparePassword(password, historicHash)) {
      return true;
    }
  }
  return false;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Check for sequential characters (abc, 123, etc.)
 */
function hasSequentialCharacters(str: string, minLength: number): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];

  const lowerStr = str.toLowerCase();

  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - minLength; i++) {
      const substr = seq.substring(i, i + minLength);
      if (lowerStr.includes(substr) || lowerStr.includes(substr.split('').reverse().join(''))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check for repeated characters (aaa, 111, etc.)
 */
function hasRepeatedCharacters(str: string, minLength: number): boolean {
  const regex = new RegExp(`(.)\\1{${minLength - 1},}`);
  return regex.test(str);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + special;

  // Ensure at least one of each required type
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if password needs to be changed (expired)
 */
export function isPasswordExpired(lastChanged: Date): boolean {
  if (config.expiryDays === 0) return false;

  const expiryDate = new Date(lastChanged);
  expiryDate.setDate(expiryDate.getDate() + config.expiryDays);

  return new Date() > expiryDate;
}

/**
 * Get days until password expiry
 */
export function getDaysUntilExpiry(lastChanged: Date): number {
  if (config.expiryDays === 0) return Infinity;

  const expiryDate = new Date(lastChanged);
  expiryDate.setDate(expiryDate.getDate() + config.expiryDays);

  const diff = expiryDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
