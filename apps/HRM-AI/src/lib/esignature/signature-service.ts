// src/lib/esignature/signature-service.ts
// E-Signature Service

import prisma from '@/lib/db'
import { VNPTCAProvider } from './providers/vnpt-ca'
import type {
  ISignatureProvider,
  SignatureProviderCode,
  SignatureRequest,
  SignatureResult,
  SignatureStatus,
  DocumentType,
} from './types'

// ═══════════════════════════════════════════════════════════════
// SIGNATURE SERVICE
// ═══════════════════════════════════════════════════════════════

export class SignatureService {
  private tenantId: string
  private providers = new Map<SignatureProviderCode, ISignatureProvider>()

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  // ─────────────────────────────────────────────────────────────
  // Provider Management
  // ─────────────────────────────────────────────────────────────

  private getProvider(providerCode: SignatureProviderCode): ISignatureProvider {
    if (this.providers.has(providerCode)) {
      return this.providers.get(providerCode)!
    }

    let provider: ISignatureProvider

    switch (providerCode) {
      case 'VNPT_CA':
        provider = new VNPTCAProvider()
        break
      case 'VIETTEL_CA':
        // TODO: Implement Viettel-CA provider
        throw new Error('Viettel-CA provider not implemented')
      default:
        throw new Error(`Signature provider not available for: ${providerCode}`)
    }

    this.providers.set(providerCode, provider)
    return provider
  }

  private async configureProvider(
    provider: ISignatureProvider,
    providerId: string
  ): Promise<void> {
    const providerConfig = await prisma.signatureProvider.findUnique({
      where: { id: providerId },
    })

    if (!providerConfig) {
      throw new Error('Signature provider configuration not found')
    }

    provider.configure({
      apiEndpoint: providerConfig.apiEndpoint,
      clientId: providerConfig.clientId || '',
      clientSecret: providerConfig.encryptedSecret || '', // In production, decrypt this
    })
  }

  // ─────────────────────────────────────────────────────────────
  // Document Management
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a signable document
   */
  async createSignableDocument(options: {
    documentType: DocumentType
    documentName: string
    originalFile: string
    sourceType?: string
    sourceId?: string
    requiredSigners: Array<{
      employeeId: string
      order: number
      role: 'CREATOR' | 'APPROVER' | 'WITNESS'
    }>
    expiresAt?: Date
  }): Promise<string> {
    const documentCode = `DOC-${Date.now().toString(36).toUpperCase()}`

    const document = await prisma.signableDocument.create({
      data: {
        tenantId: this.tenantId,
        documentType: options.documentType,
        documentCode,
        documentName: options.documentName,
        originalFile: options.originalFile,
        sourceType: options.sourceType,
        sourceId: options.sourceId,
        requiredSigners: options.requiredSigners,
        status: 'PENDING',
        expiresAt: options.expiresAt,
      },
    })

    return document.id
  }

  /**
   * Sign a document
   */
  async signDocument(
    documentId: string,
    signerId: string,
    certificateId: string
  ): Promise<SignatureResult> {
    // Get document
    const document = await prisma.signableDocument.findUnique({
      where: { id: documentId, tenantId: this.tenantId },
    })

    if (!document) {
      throw new Error('Không tìm thấy tài liệu')
    }

    if (document.status === 'COMPLETED') {
      throw new Error('Tài liệu đã được ký hoàn tất')
    }

    if (document.status === 'CANCELLED') {
      throw new Error('Tài liệu đã bị hủy')
    }

    // Check expiry
    if (document.expiresAt && document.expiresAt < new Date()) {
      throw new Error('Tài liệu đã hết hạn ký')
    }

    // Get certificate
    const certificate = await prisma.employeeCertificate.findUnique({
      where: { id: certificateId },
      include: { provider: true },
    })

    if (!certificate) {
      throw new Error('Không tìm thấy chứng thư số')
    }

    if (certificate.status !== 'ACTIVE') {
      throw new Error('Chứng thư số không hợp lệ')
    }

    // Check if signer is in required signers and it's their turn
    const requiredSigners = document.requiredSigners as Array<{
      employeeId: string
      order: number
      role: string
    }>

    const signerInfo = requiredSigners.find((s) => s.employeeId === signerId)
    if (!signerInfo) {
      throw new Error('Bạn không có quyền ký tài liệu này')
    }

    // Check signing order
    const existingSignatures = await prisma.documentSignature.findMany({
      where: { documentId },
      orderBy: { signatureOrder: 'asc' },
    })

    const highestSignedOrder = Math.max(0, ...existingSignatures.map((s) => s.signatureOrder))
    if (signerInfo.order > highestSignedOrder + 1) {
      throw new Error('Chưa đến lượt ký của bạn')
    }

    // Check if already signed
    const alreadySigned = existingSignatures.find((s) => s.signerId === signerId)
    if (alreadySigned) {
      throw new Error('Bạn đã ký tài liệu này')
    }

    // Get and configure provider
    const provider = this.getProvider(certificate.provider.providerCode as SignatureProviderCode)
    await this.configureProvider(provider, certificate.providerId)

    // In production, read actual file content
    const documentData = Buffer.from('document-content')

    // Sign document
    const signRequest: SignatureRequest = {
      documentId: document.id,
      signerId,
      certificateSerial: certificate.certificateSerial,
      reason: `Ký bởi ${signerInfo.role}`,
      timestamp: new Date(),
    }

    const result = await provider.signDocument(signRequest, documentData)

    if (result.success) {
      // Save signature to database
      await prisma.documentSignature.create({
        data: {
          documentId,
          certificateId,
          signerId,
          signatureOrder: signerInfo.order,
          signerRole: signerInfo.role,
          signedAt: result.signedAt,
          signatureData: result.signatureData,
          signatureHash: result.signatureHash,
          status: 'SIGNED',
          providerTransactionId: result.transactionId,
          providerResponse: result as unknown as object,
        },
      })

      // Update document status
      const totalSigners = requiredSigners.length
      const signedCount = existingSignatures.length + 1

      if (signedCount >= totalSigners) {
        await prisma.signableDocument.update({
          where: { id: documentId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            signedFile: document.originalFile.replace('.pdf', '-signed.pdf'), // In production, actual signed file
          },
        })
      } else {
        await prisma.signableDocument.update({
          where: { id: documentId },
          data: { status: 'PARTIAL' },
        })
      }
    }

    return result
  }

  /**
   * Reject signing a document
   */
  async rejectDocument(documentId: string, signerId: string, reason: string): Promise<void> {
    const document = await prisma.signableDocument.findUnique({
      where: { id: documentId, tenantId: this.tenantId },
    })

    if (!document) {
      throw new Error('Không tìm thấy tài liệu')
    }

    // Find signer's certificate
    const certificate = await prisma.employeeCertificate.findFirst({
      where: {
        tenantId: this.tenantId,
        employeeId: signerId,
        isDefault: true,
      },
    })

    if (certificate) {
      await prisma.documentSignature.create({
        data: {
          documentId,
          certificateId: certificate.id,
          signerId,
          signatureOrder: 0,
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectedReason: reason,
        },
      })
    }

    await prisma.signableDocument.update({
      where: { id: documentId },
      data: { status: 'CANCELLED', notes: `Từ chối bởi ${signerId}: ${reason}` },
    })
  }

  /**
   * Get pending documents for an employee
   */
  async getPendingDocuments(employeeId: string): Promise<
    Array<{
      id: string
      documentType: string
      documentName: string
      status: string
      myOrder: number
      canSign: boolean
      createdAt: Date
      expiresAt: Date | null
    }>
  > {
    const documents = await prisma.signableDocument.findMany({
      where: {
        tenantId: this.tenantId,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      include: {
        signatures: {
          select: { signerId: true, signatureOrder: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = []

    for (const doc of documents) {
      const requiredSigners = doc.requiredSigners as Array<{
        employeeId: string
        order: number
        role: string
      }>

      const mySignerInfo = requiredSigners.find((s) => s.employeeId === employeeId)
      if (!mySignerInfo) continue

      // Check if already signed
      const alreadySigned = doc.signatures.find((s) => s.signerId === employeeId)
      if (alreadySigned) continue

      // Check if can sign (previous signers have signed)
      const highestSignedOrder = Math.max(0, ...doc.signatures.map((s) => s.signatureOrder))
      const canSign = mySignerInfo.order <= highestSignedOrder + 1

      result.push({
        id: doc.id,
        documentType: doc.documentType,
        documentName: doc.documentName,
        status: doc.status,
        myOrder: mySignerInfo.order,
        canSign,
        createdAt: doc.createdAt,
        expiresAt: doc.expiresAt,
      })
    }

    return result
  }

  /**
   * Get signed documents for an employee
   */
  async getSignedDocuments(employeeId: string): Promise<
    Array<{
      id: string
      documentType: string
      documentName: string
      signedAt: Date | null
      status: string
    }>
  > {
    const signatures = await prisma.documentSignature.findMany({
      where: { signerId: employeeId, status: 'SIGNED' },
      include: {
        document: {
          select: {
            id: true,
            documentType: true,
            documentName: true,
            status: true,
          },
        },
      },
      orderBy: { signedAt: 'desc' },
    })

    return signatures.map((sig) => ({
      id: sig.document.id,
      documentType: sig.document.documentType,
      documentName: sig.document.documentName,
      signedAt: sig.signedAt,
      status: sig.document.status,
    }))
  }

  /**
   * Get employee certificates
   */
  async getEmployeeCertificates(employeeId: string): Promise<
    Array<{
      id: string
      serial: string
      provider: string
      issuedAt: Date
      expiresAt: Date
      status: string
      isDefault: boolean
    }>
  > {
    const certificates = await prisma.employeeCertificate.findMany({
      where: {
        tenantId: this.tenantId,
        employeeId,
      },
      include: {
        provider: {
          select: { providerName: true },
        },
      },
      orderBy: { isDefault: 'desc' },
    })

    return certificates.map((cert) => ({
      id: cert.id,
      serial: cert.certificateSerial,
      provider: cert.provider.providerName,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      status: cert.status,
      isDefault: cert.isDefault,
    }))
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createSignatureService(tenantId: string): SignatureService {
  return new SignatureService(tenantId)
}
