// src/lib/esignature/types.ts
// E-Signature Integration Types

// ═══════════════════════════════════════════════════════════════
// PROVIDER CODES
// ═══════════════════════════════════════════════════════════════

export type SignatureProviderCode = 'VNPT_CA' | 'VIETTEL_CA' | 'FPT_CA' | 'BKAV_CA' | 'NACENCOMM' | 'CUSTOM'

export const SIGNATURE_PROVIDERS: Record<
  SignatureProviderCode,
  { name: string; fullName: string; website: string }
> = {
  VNPT_CA: {
    name: 'VNPT-CA',
    fullName: 'Trung tâm Chứng thực Điện tử Quốc gia VNPT',
    website: 'https://vnpt-ca.vn',
  },
  VIETTEL_CA: {
    name: 'Viettel-CA',
    fullName: 'Tổ chức Chứng thực Chữ ký số Viettel',
    website: 'https://viettel-ca.vn',
  },
  FPT_CA: {
    name: 'FPT-CA',
    fullName: 'Tổ chức Chứng thực Chữ ký số FPT',
    website: 'https://fpt-ca.vn',
  },
  BKAV_CA: {
    name: 'BKAV-CA',
    fullName: 'Tổ chức Chứng thực Chữ ký số BKAV',
    website: 'https://bkav-ca.vn',
  },
  NACENCOMM: {
    name: 'NACENCOMM',
    fullName: 'Cục Chứng thực số và Bảo mật thông tin',
    website: 'https://nacencomm.gov.vn',
  },
  CUSTOM: {
    name: 'Custom',
    fullName: 'Nhà cung cấp tùy chỉnh',
    website: '',
  },
}

// ═══════════════════════════════════════════════════════════════
// STATUS TYPES
// ═══════════════════════════════════════════════════════════════

export type SignatureStatus = 'PENDING' | 'SIGNED' | 'REJECTED' | 'EXPIRED' | 'REVOKED'

export type CertificateStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PENDING_RENEWAL'

export const SIGNATURE_STATUS_LABELS = {
  PENDING: { label: 'Chờ ký', color: 'yellow' },
  SIGNED: { label: 'Đã ký', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  EXPIRED: { label: 'Hết hạn', color: 'gray' },
  REVOKED: { label: 'Đã thu hồi', color: 'red' },
} as const

export const CERTIFICATE_STATUS_LABELS = {
  ACTIVE: { label: 'Hoạt động', color: 'green' },
  EXPIRED: { label: 'Hết hạn', color: 'red' },
  REVOKED: { label: 'Đã thu hồi', color: 'red' },
  PENDING_RENEWAL: { label: 'Chờ gia hạn', color: 'yellow' },
} as const

// ═══════════════════════════════════════════════════════════════
// CERTIFICATE TYPES
// ═══════════════════════════════════════════════════════════════

export interface CertificateInfo {
  serial: string
  subject: string
  issuer: string
  validFrom: Date
  validTo: Date
  publicKey: string
  algorithm: string
  thumbprint: string
}

export interface CertificateValidation {
  isValid: boolean
  isExpired: boolean
  isRevoked: boolean
  isTrusted: boolean
  errors: string[]
}

// ═══════════════════════════════════════════════════════════════
// SIGNATURE TYPES
// ═══════════════════════════════════════════════════════════════

export interface SignaturePosition {
  page: number
  x: number
  y: number
  width?: number
  height?: number
}

export interface SignatureRequest {
  documentId: string
  signerId: string
  certificateSerial: string
  signaturePosition?: SignaturePosition
  reason?: string
  location?: string
  timestamp?: Date
}

export interface SignatureResult {
  success: boolean
  signatureId?: string
  signedAt?: Date
  signatureData?: string
  signatureHash?: string
  transactionId?: string
  errorCode?: string
  errorMessage?: string
}

export interface SignatureVerification {
  isValid: boolean
  signedBy: string
  signedAt: Date
  certificateInfo: CertificateInfo
  isModified: boolean
  errors: string[]
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════

export type DocumentType = 'CONTRACT' | 'DECISION' | 'REPORT' | 'PAYSLIP' | 'OTHER'

export interface SignableDocument {
  documentId: string
  documentType: DocumentType
  documentName: string
  fileUrl: string
  fileHash: string
  requiredSigners: Array<{
    signerId: string
    signerName: string
    order: number
    role: 'CREATOR' | 'APPROVER' | 'WITNESS'
    status: SignatureStatus
    signedAt?: Date
  }>
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date
  expiresAt?: Date
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface ISignatureProvider {
  // Provider info
  readonly providerCode: SignatureProviderCode
  readonly providerName: string

  // Configuration
  configure(config: {
    apiEndpoint: string
    clientId: string
    clientSecret: string
  }): void

  // Authentication
  authenticate(): Promise<boolean>

  // Certificate operations
  getCertificateInfo(certificateSerial: string): Promise<CertificateInfo>
  validateCertificate(certificateSerial: string): Promise<CertificateValidation>
  listCertificates(employeeId: string): Promise<CertificateInfo[]>

  // Signing operations
  signDocument(request: SignatureRequest, documentData: Buffer): Promise<SignatureResult>
  verifySignature(signedDocument: Buffer): Promise<SignatureVerification[]>

  // Hash signing (for remote signing)
  signHash(hash: string, certificateSerial: string): Promise<SignatureResult>
}

// ═══════════════════════════════════════════════════════════════
// HASH ALGORITHMS
// ═══════════════════════════════════════════════════════════════

export const HASH_ALGORITHMS = {
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
} as const

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[keyof typeof HASH_ALGORITHMS]
