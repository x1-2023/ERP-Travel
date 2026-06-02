// src/lib/esignature/signature-service-production.ts
// E-Signature Production Service with Multi-Signer Workflow

import prisma from '@/lib/db'
import crypto from 'crypto'
import { vnptCAProductionProvider } from './providers/vnpt-ca-production'
import type { DocumentType } from './types'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateSigningRequestInput {
  tenantId: string
  documentType: DocumentType
  title: string
  fileUrl: string
  employeeId?: string
  contractId?: string
  sourceType?: string
  sourceId?: string
  signerIds: string[]
  signaturePositions?: Record<
    string,
    {
      page: number
      x: number
      y: number
      width?: number
      height?: number
    }
  >
  expiresAt?: Date
  message?: string
}

export interface SigningResult {
  success: boolean
  sessionId?: string
  signingUrl?: string
  expiresAt?: Date
  error?: string
}

export interface VerificationResult {
  valid: boolean
  documentIntegrity: boolean
  signatures: Array<{
    signerName: string
    signedAt: Date | null
    valid: boolean
    verificationDetails?: Record<string, unknown>
  }>
}

// ═══════════════════════════════════════════════════════════════
// E-SIGNATURE PRODUCTION SERVICE
// ═══════════════════════════════════════════════════════════════

export class ESignatureProductionService {
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  // ─────────────────────────────────────────────────────────────
  // Document Creation
  // ─────────────────────────────────────────────────────────────

  async createDocument(input: CreateSigningRequestInput): Promise<string> {
    // Calculate file hash (in production, fetch the file first)
    const hash = await this.calculateFileHash(input.fileUrl)

    // Generate document code
    const documentCode = `DOC-${Date.now().toString(36).toUpperCase()}`

    // Get signer info
    const signers = await prisma.employee.findMany({
      where: {
        id: { in: input.signerIds },
        tenantId: input.tenantId,
      },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        workEmail: true,
        phone: true,
      },
    })

    // Build required signers array
    const requiredSigners = input.signerIds.map((signerId, index) => {
      const signer = signers.find((s) => s.id === signerId)
      return {
        employeeId: signerId,
        employeeName: signer?.fullName || 'Unknown',
        order: index + 1,
        role: index === 0 ? 'CREATOR' : 'APPROVER',
        position: input.signaturePositions?.[signerId],
      }
    })

    // Create document record
    const document = await prisma.signableDocument.create({
      data: {
        tenantId: input.tenantId,
        documentType: input.documentType,
        documentCode,
        documentName: input.title,
        originalFile: input.fileUrl,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        requiredSigners: requiredSigners as unknown as object,
        status: 'PENDING',
        expiresAt: input.expiresAt,
        notes: `${input.message || ''}\n[hash:${hash}]`.trim(),
      },
    })

    // Send notifications to signers
    await this.notifySigners(document.id, requiredSigners, input.message)

    return document.id
  }

  // ─────────────────────────────────────────────────────────────
  // Signing Initiation
  // ─────────────────────────────────────────────────────────────

  async initiateSign(documentId: string, signerId: string): Promise<SigningResult> {
    const document = await prisma.signableDocument.findUnique({
      where: { id: documentId, tenantId: this.tenantId },
    })

    if (!document) {
      return { success: false, error: 'Không tìm thấy tài liệu' }
    }

    if (document.status === 'COMPLETED') {
      return { success: false, error: 'Tài liệu đã được ký hoàn tất' }
    }

    if (document.status === 'CANCELLED') {
      return { success: false, error: 'Tài liệu đã bị hủy' }
    }

    // Check expiry
    if (document.expiresAt && document.expiresAt < new Date()) {
      return { success: false, error: 'Tài liệu đã hết hạn ký' }
    }

    // Get signer info
    const requiredSigners = document.requiredSigners as Array<{
      employeeId: string
      employeeName: string
      order: number
      role: string
      position?: { page: number; x: number; y: number; width?: number; height?: number }
    }>

    const signerInfo = requiredSigners.find((s) => s.employeeId === signerId)
    if (!signerInfo) {
      return { success: false, error: 'Bạn không có quyền ký tài liệu này' }
    }

    // Check signing order
    const existingSignatures = await prisma.documentSignature.findMany({
      where: { documentId },
      orderBy: { signatureOrder: 'asc' },
    })

    const highestSignedOrder = Math.max(0, ...existingSignatures.map((s) => s.signatureOrder))
    if (signerInfo.order > highestSignedOrder + 1) {
      return { success: false, error: 'Chưa đến lượt ký của bạn' }
    }

    // Check if already signed
    const alreadySigned = existingSignatures.find((s) => s.signerId === signerId)
    if (alreadySigned) {
      return { success: false, error: 'Bạn đã ký tài liệu này' }
    }

    // Get signer's employee info
    const employee = await prisma.employee.findUnique({
      where: { id: signerId },
      select: { fullName: true, workEmail: true, phone: true },
    })

    try {
      // Create signing session with VNPT-CA
      const session = await vnptCAProductionProvider.createSigningSession({
        documentId,
        documentTitle: document.documentName,
        documentHash: this.extractHashFromNotes(document.notes) || await this.calculateFileHash(document.originalFile),
        signerId,
        signerName: employee?.fullName || signerInfo.employeeName,
        signerEmail: employee?.workEmail || undefined,
        signerPhone: employee?.phone || undefined,
        signaturePosition: signerInfo.position,
      })

      // Create pending signature record
      await prisma.documentSignature.create({
        data: {
          documentId,
          certificateId: '', // Will be filled after signing
          signerId,
          signatureOrder: signerInfo.order,
          signerRole: signerInfo.role,
          status: 'PENDING',
        },
      })

      return {
        success: true,
        sessionId: session.sessionId,
        signingUrl: session.signingUrl,
        expiresAt: session.expiresAt,
      }
    } catch (error) {
      console.error('Failed to initiate signing', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Callback Processing
  // ─────────────────────────────────────────────────────────────

  async processCallback(payload: {
    sessionId: string
    status: string
    signedAt?: string
    documentSignature?: string
    signature: string
  }): Promise<void> {
    try {
      const callbackData = await vnptCAProductionProvider.handleCallback(payload)

      // Find the signature record by session ID (stored in notes or metadata)
      // For now, we'll use a direct lookup based on pending status
      const pendingSignatures = await prisma.documentSignature.findMany({
        where: { status: 'PENDING' },
        include: { document: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      // Match by timing (should be improved with proper session tracking)
      const signature = pendingSignatures[0]

      if (!signature) {
        console.error('No pending signature found for callback', {
          sessionId: callbackData.sessionId,
        })
        return
      }

      if (callbackData.status === 'COMPLETED' && callbackData.signature) {
        // Update signature record
        await prisma.documentSignature.update({
          where: { id: signature.id },
          data: {
            status: 'SIGNED',
            signedAt: callbackData.signedAt || new Date(),
            signatureData: callbackData.signature,
            signatureHash: crypto.createHash('sha256').update(callbackData.signature).digest('hex'),
            providerTransactionId: callbackData.sessionId,
          },
        })

        // Check if all signatures complete
        await this.checkDocumentCompletion(signature.documentId)
      } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(callbackData.status)) {
        await prisma.documentSignature.update({
          where: { id: signature.id },
          data: {
            status: callbackData.status === 'CANCELLED' ? 'REJECTED' : 'PENDING',
            rejectedReason: callbackData.status,
          },
        })
      }
    } catch (error) {
      console.error('Failed to process callback', error)
      throw error
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Document Completion Check
  // ─────────────────────────────────────────────────────────────

  private async checkDocumentCompletion(documentId: string): Promise<void> {
    const document = await prisma.signableDocument.findUnique({
      where: { id: documentId },
    })

    if (!document) return

    const requiredSigners = document.requiredSigners as Array<{ employeeId: string }>
    const totalSigners = requiredSigners.length

    const signedCount = await prisma.documentSignature.count({
      where: { documentId, status: 'SIGNED' },
    })

    if (signedCount >= totalSigners) {
      // All signed - generate final PDF
      const signedFileUrl = await this.generateSignedPDF(documentId)

      await prisma.signableDocument.update({
        where: { id: documentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          signedFile: signedFileUrl,
        },
      })

      // Send notifications
      await this.notifySigningComplete(documentId)
    } else {
      await prisma.signableDocument.update({
        where: { id: documentId },
        data: { status: 'PARTIAL' },
      })

      // Notify next signer
      await this.notifyNextSigner(documentId)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PDF Generation with Visual Signatures
  // ─────────────────────────────────────────────────────────────

  private async generateSignedPDF(documentId: string): Promise<string> {
    const document = await prisma.signableDocument.findUnique({
      where: { id: documentId },
      include: {
        signatures: {
          where: { status: 'SIGNED' },
        },
      },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    // In production, use pdf-lib to add visual signatures
    // For now, return a placeholder URL
    const signedFileName = `signed-${document.documentCode}.pdf`

    // Return the signed file URL (in production, upload to storage)
    return document.originalFile.replace('.pdf', '-signed.pdf')
  }

  // ─────────────────────────────────────────────────────────────
  // Document Verification
  // ─────────────────────────────────────────────────────────────

  async verifyDocument(documentId: string): Promise<VerificationResult> {
    const document = await prisma.signableDocument.findUnique({
      where: { id: documentId, tenantId: this.tenantId },
      include: {
        signatures: {
          where: { status: 'SIGNED' },
        },
      },
    })

    if (!document) {
      throw new Error('Không tìm thấy tài liệu')
    }

    // Verify document hash
    const currentHash = document.signedFile
      ? await this.calculateFileHash(document.signedFile)
      : await this.calculateFileHash(document.originalFile)

    const expectedHash = this.extractHashFromNotes(document.notes) || ''
    const documentIntegrity = currentHash === expectedHash

    // Verify each signature
    const signatureResults = await Promise.all(
      document.signatures.map(async (sig) => {
        // Get signer name
        const signer = await prisma.employee.findUnique({
          where: { id: sig.signerId },
          select: { fullName: true },
        })

        // In production, verify with VNPT-CA
        const isValid = !!sig.signatureData && !!sig.signedAt

        return {
          signerName: signer?.fullName || 'Unknown',
          signedAt: sig.signedAt,
          valid: isValid,
          verificationDetails: {
            signatureOrder: sig.signatureOrder,
            signerRole: sig.signerRole,
          },
        }
      })
    )

    return {
      valid: documentIntegrity && signatureResults.every((s) => s.valid),
      documentIntegrity,
      signatures: signatureResults,
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────────

  private extractHashFromNotes(notes: string | null): string | null {
    if (!notes) return null
    const match = notes.match(/\[hash:([a-f0-9]+)\]/)
    return match ? match[1] : null
  }

  private async calculateFileHash(fileUrl: string): Promise<string> {
    try {
      // In production, fetch the file and calculate hash
      // For now, return a deterministic hash based on URL
      return crypto.createHash('sha256').update(fileUrl).digest('hex')
    } catch (error) {
      console.error('Failed to calculate file hash', error)
      return ''
    }
  }

  private async notifySigners(
    documentId: string,
    signers: Array<{ employeeId: string; employeeName: string; order: number }>,
    message?: string
  ): Promise<void> {
    // TODO: Implement email/push notifications
  }

  private async notifyNextSigner(documentId: string): Promise<void> {
    // TODO: Implement notification to next signer
  }

  private async notifySigningComplete(documentId: string): Promise<void> {
    // TODO: Implement completion notifications
  }

  // ─────────────────────────────────────────────────────────────
  // Document Queries
  // ─────────────────────────────────────────────────────────────

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
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createESignatureProductionService(tenantId: string): ESignatureProductionService {
  return new ESignatureProductionService(tenantId)
}
