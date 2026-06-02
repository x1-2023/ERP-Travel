// src/lib/security/field-encryption.ts
// Field-level encryption for sensitive PII data (salary, CCCD, bank account)
// Uses AES-256-GCM for authenticated encryption

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits
const ENCODING = 'base64' as const
const PREFIX = 'enc:' // Prefix to identify encrypted values

/**
 * Get the encryption key from environment.
 * Must be a 32-byte (256-bit) key, hex-encoded (64 characters).
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.FIELD_ENCRYPTION_KEY
  if (!keyHex) {
    throw new Error(
      'FIELD_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  if (keyHex.length !== 64) {
    throw new Error('FIELD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(keyHex, 'hex')
}

/**
 * Encrypt a plaintext string value.
 * Returns a prefixed base64 string: "enc:<iv>:<authTag>:<ciphertext>"
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', ENCODING)
  encrypted += cipher.final(ENCODING)

  const authTag = cipher.getAuthTag()

  return `${PREFIX}${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`
}

/**
 * Decrypt an encrypted field value.
 * Returns the original plaintext string.
 * If the value is not encrypted (no prefix), returns it as-is.
 */
export function decryptField(encrypted: string): string {
  if (!encrypted || !encrypted.startsWith(PREFIX)) {
    return encrypted // Not encrypted, return as-is
  }

  const key = getEncryptionKey()
  const parts = encrypted.slice(PREFIX.length).split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted field format')
  }

  const [ivBase64, authTagBase64, ciphertext] = parts
  const iv = Buffer.from(ivBase64, ENCODING)
  const authTag = Buffer.from(authTagBase64, ENCODING)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, ENCODING, 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Check if a value is encrypted.
 */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

/**
 * Mask a sensitive value for display (e.g. "123456789" → "***456789")
 */
export function maskField(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) return '***'
  return '***' + value.slice(-visibleChars)
}

/**
 * Encrypt multiple fields in an object.
 * Only encrypts fields that are strings and not already encrypted.
 */
export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fieldNames: (keyof T)[]
): T {
  const result = { ...data }
  for (const field of fieldNames) {
    const value = result[field]
    if (typeof value === 'string' && value && !isEncrypted(value)) {
      (result as Record<string, unknown>)[field as string] = encryptField(value)
    }
  }
  return result
}

/**
 * Decrypt multiple fields in an object.
 * Only decrypts fields that are encrypted strings.
 */
export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fieldNames: (keyof T)[]
): T {
  const result = { ...data }
  for (const field of fieldNames) {
    const value = result[field]
    if (typeof value === 'string' && isEncrypted(value)) {
      (result as Record<string, unknown>)[field as string] = decryptField(value)
    }
  }
  return result
}
