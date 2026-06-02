// src/lib/esignature/providers/vnpt-ca-production.ts
// VNPT-CA Production Provider with Remote Signing

import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import type {
  ISignatureProvider,
  SignatureProviderCode,
  CertificateInfo,
  CertificateValidation,
  SignatureRequest,
  SignatureResult,
  SignatureVerification,
} from '../types'

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface VNPTCAConfig {
  environment: 'sandbox' | 'production'
  baseUrl: string
  partnerId: string
  partnerSecret: string
  callbackUrl: string
}

// ═══════════════════════════════════════════════════════════════
// SIGNING SESSION TYPES
// ═══════════════════════════════════════════════════════════════

export interface SigningSessionRequest {
  documentId: string
  documentTitle: string
  documentHash: string
  signerId: string
  signerName: string
  signerEmail?: string
  signerPhone?: string
  signaturePosition?: {
    page: number
    x: number
    y: number
    width?: number
    height?: number
  }
}

export interface SigningSessionResponse {
  sessionId: string
  signingUrl: string
  expiresAt: Date
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED' | 'CANCELLED'
}

export interface SigningStatus {
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED' | 'CANCELLED'
  signature?: string
  signedAt?: Date
  errorMessage?: string
  certificateInfo?: CertificateInfo
}

// ═══════════════════════════════════════════════════════════════
// VNPT-CA PRODUCTION PROVIDER
// ═══════════════════════════════════════════════════════════════

export class VNPTCAProductionProvider implements ISignatureProvider {
  readonly providerCode: SignatureProviderCode = 'VNPT_CA'
  readonly providerName = 'VNPT-CA'

  private config: VNPTCAConfig
  private configured = false

  constructor() {
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'

    this.config = {
      environment: env,
      baseUrl:
        env === 'production'
          ? 'https://api.ca.vnpt.vn/v2'
          : 'https://sandbox.ca.vnpt.vn/v2',
      partnerId: process.env.VNPT_CA_PARTNER_ID || '',
      partnerSecret: process.env.VNPT_CA_PARTNER_SECRET || '',
      callbackUrl: process.env.VNPT_CA_CALLBACK_URL || '',
    }

    this.configured = !!this.config.partnerId
  }

  // ─────────────────────────────────────────────────────────────
  // Configuration
  // ─────────────────────────────────────────────────────────────

  configure(config: { apiEndpoint: string; clientId: string; clientSecret: string }): void {
    this.config = {
      ...this.config,
      baseUrl: config.apiEndpoint || this.config.baseUrl,
      partnerId: config.clientId || this.config.partnerId,
      partnerSecret: config.clientSecret || this.config.partnerSecret,
    }
    this.configured = !!this.config.partnerId
  }

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new Error('VNPT-CA provider not configured')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Request Signing
  // ─────────────────────────────────────────────────────────────

  private signRequest(data: unknown, timestamp: string): string {
    const payload = (data ? JSON.stringify(data) : '') + timestamp
    return crypto.createHmac('sha256', this.config.partnerSecret).update(payload).digest('hex')
  }

  private async apiRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    this.ensureConfigured()

    const timestamp = Date.now().toString()
    const signature = this.signRequest(data, timestamp)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Partner-ID': this.config.partnerId,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    }

    const url = `${this.config.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()

    if (!response.ok) {
      const error = new Error(responseData.message || 'VNPT-CA API error') as Error & { code: string }
      error.code = responseData.errorCode
      throw error
    }

    return responseData as T
  }

  // ─────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────

  async authenticate(): Promise<boolean> {
    this.ensureConfigured()

    try {
      interface AuthResponse {
        status: string
      }

      const response = await this.apiRequest<AuthResponse>('POST', '/auth/verify', {
        partnerId: this.config.partnerId,
      })

      return response.status === 'OK'
    } catch (error) {
      console.error('VNPT-CA: Authentication failed', error)
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Certificate Operations
  // ─────────────────────────────────────────────────────────────

  async getCertificateInfo(certificateSerial: string): Promise<CertificateInfo> {
    interface CertResponse {
      serial: string
      subjectDN: string
      issuerDN: string
      validFrom: string
      validTo: string
      publicKey: string
      algorithm: string
      thumbprint: string
    }

    const response = await this.apiRequest<CertResponse>('GET', `/certificates/${certificateSerial}`)

    return {
      serial: response.serial,
      subject: response.subjectDN,
      issuer: response.issuerDN,
      validFrom: new Date(response.validFrom),
      validTo: new Date(response.validTo),
      publicKey: response.publicKey,
      algorithm: response.algorithm,
      thumbprint: response.thumbprint,
    }
  }

  async validateCertificate(certificateSerial: string): Promise<CertificateValidation> {
    try {
      interface ValidationResponse {
        valid: boolean
        expired: boolean
        revoked: boolean
        trusted: boolean
        errors?: string[]
      }

      const response = await this.apiRequest<ValidationResponse>('POST', '/certificates/validate', {
        serial: certificateSerial,
        checkRevocation: true,
        checkChain: true,
      })

      return {
        isValid: response.valid,
        isExpired: response.expired,
        isRevoked: response.revoked,
        isTrusted: response.trusted,
        errors: response.errors || [],
      }
    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: false,
        isTrusted: false,
        errors: [(error as Error).message],
      }
    }
  }

  async listCertificates(employeeId: string): Promise<CertificateInfo[]> {
    interface ListResponse {
      certificates: Array<{
        serial: string
        subjectDN: string
        issuerDN: string
        validFrom: string
        validTo: string
        publicKey: string
        algorithm: string
        thumbprint: string
      }>
    }

    const response = await this.apiRequest<ListResponse>('GET', `/certificates?userId=${employeeId}`)

    return response.certificates.map((cert) => ({
      serial: cert.serial,
      subject: cert.subjectDN,
      issuer: cert.issuerDN,
      validFrom: new Date(cert.validFrom),
      validTo: new Date(cert.validTo),
      publicKey: cert.publicKey,
      algorithm: cert.algorithm,
      thumbprint: cert.thumbprint,
    }))
  }

  // ─────────────────────────────────────────────────────────────
  // Signing Session Management
  // ─────────────────────────────────────────────────────────────

  async createSigningSession(request: SigningSessionRequest): Promise<SigningSessionResponse> {
    interface SessionResponse {
      sessionId: string
      signingUrl: string
      expiresAt: string
      status: string
    }

    const response = await this.apiRequest<SessionResponse>('POST', '/signing/session', {
      requestId: uuidv4(),

      // Document info
      documentId: request.documentId,
      documentTitle: request.documentTitle,
      documentHash: request.documentHash,
      hashAlgorithm: 'SHA256',

      // Signer info
      signerUserId: request.signerId,
      signerName: request.signerName,
      signerEmail: request.signerEmail,
      signerPhone: request.signerPhone,

      // Signing position
      signatureConfig: request.signaturePosition
        ? {
            page: request.signaturePosition.page,
            x: request.signaturePosition.x,
            y: request.signaturePosition.y,
            width: request.signaturePosition.width || 150,
            height: request.signaturePosition.height || 50,
            showReason: true,
            showDate: true,
            showName: true,
          }
        : undefined,

      // Callback
      callbackUrl: this.config.callbackUrl,

      // Options
      requireOTP: true,
      otpMethod: 'SMS', // SMS or EMAIL
      expiresInMinutes: 30,
    })

    return {
      sessionId: response.sessionId,
      signingUrl: response.signingUrl,
      expiresAt: new Date(response.expiresAt),
      status: response.status as SigningSessionResponse['status'],
    }
  }

  async getSessionStatus(sessionId: string): Promise<SigningStatus> {
    interface StatusResponse {
      status: string
      signature?: string
      signedAt?: string
      errorMessage?: string
      certificateInfo?: {
        serial: string
        subjectDN: string
        issuerDN: string
        validFrom: string
        validTo: string
        publicKey: string
        algorithm: string
        thumbprint: string
      }
    }

    const response = await this.apiRequest<StatusResponse>('GET', `/signing/session/${sessionId}/status`)

    return {
      status: response.status as SigningStatus['status'],
      signature: response.signature,
      signedAt: response.signedAt ? new Date(response.signedAt) : undefined,
      errorMessage: response.errorMessage,
      certificateInfo: response.certificateInfo
        ? {
            serial: response.certificateInfo.serial,
            subject: response.certificateInfo.subjectDN,
            issuer: response.certificateInfo.issuerDN,
            validFrom: new Date(response.certificateInfo.validFrom),
            validTo: new Date(response.certificateInfo.validTo),
            publicKey: response.certificateInfo.publicKey,
            algorithm: response.certificateInfo.algorithm,
            thumbprint: response.certificateInfo.thumbprint,
          }
        : undefined,
    }
  }

  async cancelSession(sessionId: string): Promise<boolean> {
    try {
      await this.apiRequest('POST', `/signing/session/${sessionId}/cancel`)
      return true
    } catch {
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Document Signing
  // ─────────────────────────────────────────────────────────────

  async signDocument(request: SignatureRequest, documentData: Buffer): Promise<SignatureResult> {
    this.ensureConfigured()

    try {
      // Calculate document hash
      const documentHash = crypto.createHash('sha256').update(documentData).digest('hex')

      // Create signing session
      const session = await this.createSigningSession({
        documentId: request.documentId,
        documentTitle: `Document ${request.documentId}`,
        documentHash,
        signerId: request.signerId,
        signerName: request.signerId, // Should be fetched from employee
        signaturePosition: request.signaturePosition,
      })

      // For remote signing, return session info
      // User needs to complete signing on their device
      return {
        success: true,
        signatureId: session.sessionId,
        signedAt: undefined, // Will be set when signing completes
        signatureData: undefined, // Will be set when signing completes
        signatureHash: documentHash,
        transactionId: session.sessionId,
      }
    } catch (error) {
      const err = error as Error & { code?: string }
      return {
        success: false,
        errorCode: err.code || 'SIGNING_ERROR',
        errorMessage: err.message,
      }
    }
  }

  async signHash(hash: string, certificateSerial: string): Promise<SignatureResult> {
    this.ensureConfigured()

    try {
      // Validate certificate first
      const validation = await this.validateCertificate(certificateSerial)
      if (!validation.isValid) {
        return {
          success: false,
          errorCode: 'INVALID_CERTIFICATE',
          errorMessage: validation.errors.join(', '),
        }
      }

      interface SignHashResponse {
        signature: string
        signedAt: string
        transactionId: string
      }

      const response = await this.apiRequest<SignHashResponse>('POST', '/signing/hash', {
        documentHash: hash,
        hashAlgorithm: 'SHA256',
        certificateSerial,
      })

      return {
        success: true,
        signatureId: `HASH-SIG-${Date.now()}`,
        signedAt: new Date(response.signedAt),
        signatureData: response.signature,
        signatureHash: hash,
        transactionId: response.transactionId,
      }
    } catch (error) {
      const err = error as Error & { code?: string }
      return {
        success: false,
        errorCode: err.code || 'HASH_SIGNING_ERROR',
        errorMessage: err.message,
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Signature Verification
  // ─────────────────────────────────────────────────────────────

  async verifySignature(signedDocument: Buffer): Promise<SignatureVerification[]> {
    this.ensureConfigured()

    try {
      interface VerifyResponse {
        signatures: Array<{
          valid: boolean
          signerName: string
          signerOrganization?: string
          signedAt: string
          certificateSerial: string
          certificateStatus: string
          chainValid: boolean
          notRevoked: boolean
          timestampValid: boolean
          modified: boolean
          errors?: string[]
        }>
      }

      const documentBase64 = signedDocument.toString('base64')

      const response = await this.apiRequest<VerifyResponse>('POST', '/verify', {
        document: documentBase64,
        verifyChain: true,
        verifyRevocation: true,
        verifyTimestamp: true,
      })

      return response.signatures.map((sig) => ({
        isValid: sig.valid,
        signedBy: sig.signerName,
        signedAt: new Date(sig.signedAt),
        certificateInfo: {
          serial: sig.certificateSerial,
          subject: sig.signerName,
          issuer: 'VNPT-CA',
          validFrom: new Date(),
          validTo: new Date(),
          publicKey: '',
          algorithm: 'SHA256withRSA',
          thumbprint: '',
        },
        isModified: sig.modified,
        errors: sig.errors || [],
      }))
    } catch (error) {
      console.error('VNPT-CA: Verification failed', error)
      return []
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Callback Handler
  // ─────────────────────────────────────────────────────────────

  async handleCallback(payload: {
    sessionId: string
    status: string
    signedAt?: string
    documentSignature?: string
    signature: string
  }): Promise<{
    sessionId: string
    status: string
    signature?: string
    signedAt?: Date
  }> {
    // Verify callback signature
    const dataToVerify = JSON.stringify({
      sessionId: payload.sessionId,
      status: payload.status,
      signedAt: payload.signedAt,
    })

    const expectedSignature = crypto
      .createHmac('sha256', this.config.partnerSecret)
      .update(dataToVerify)
      .digest('hex')

    if (payload.signature !== expectedSignature) {
      throw new Error('Invalid callback signature')
    }

    return {
      sessionId: payload.sessionId,
      status: payload.status,
      signature: payload.documentSignature,
      signedAt: payload.signedAt ? new Date(payload.signedAt) : undefined,
    }
  }

  // ─────────────────────────────────────────────────────────────
  // OTP Verification
  // ─────────────────────────────────────────────────────────────

  async requestOTP(sessionId: string, method: 'SMS' | 'EMAIL'): Promise<boolean> {
    try {
      interface OTPResponse {
        sent: boolean
        expiresIn: number
      }

      const response = await this.apiRequest<OTPResponse>('POST', `/signing/session/${sessionId}/otp`, {
        method,
      })

      return response.sent
    } catch {
      return false
    }
  }

  async verifyOTP(sessionId: string, otp: string): Promise<boolean> {
    try {
      interface VerifyOTPResponse {
        valid: boolean
      }

      const response = await this.apiRequest<VerifyOTPResponse>(
        'POST',
        `/signing/session/${sessionId}/otp/verify`,
        {
          otp,
        }
      )

      return response.valid
    } catch {
      return false
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const vnptCAProductionProvider = new VNPTCAProductionProvider()

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createVNPTCAProductionProvider(): VNPTCAProductionProvider {
  return new VNPTCAProductionProvider()
}
