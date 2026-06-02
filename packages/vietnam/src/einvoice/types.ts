/**
 * E-Invoice Types and Interfaces
 * Nghị định 123/2020/NĐ-CP - Vietnamese e-invoice regulations
 */

import { EInvoice, EInvoiceProvider, EInvoiceStatus } from "../types/index.js";

/**
 * E-Invoice validation result
 */
export interface EInvoiceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * E-Invoice signature data
 */
export interface EInvoiceSignature {
  signatureValue: string;
  signerName: string;
  signingDate: Date;
  certificateNumber?: string;
}

/**
 * E-Invoice transmission record
 */
export interface EInvoiceTransmission {
  invoiceId: string;
  provider: EInvoiceProvider;
  transmissionTime: Date;
  status: EInvoiceStatus;
  referenceNumber?: string;
  errorMessage?: string;
}

/**
 * E-Invoice cancellation request
 */
export interface EInvoiceCancellation {
  invoiceId: string;
  invoiceNumber: string;
  series: string;
  reason: string;
  requestDate: Date;
  requestedBy: string;
}

/**
 * E-Invoice replacement
 */
export interface EInvoiceReplacement {
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  replacementInvoice: EInvoice;
  reason: string;
  requestDate: Date;
}

/**
 * E-Invoice lookup parameters
 */
export interface EInvoiceLookupParams {
  invoiceNumber?: string;
  series?: string;
  date?: Date;
  sellerTaxCode?: string;
  buyerTaxCode?: string;
  amount?: number;
}

/**
 * E-Invoice status response
 */
export interface EInvoiceStatusResponse {
  invoiceId: string;
  invoiceNumber: string;
  status: EInvoiceStatus;
  lastUpdated: Date;
  provider: EInvoiceProvider;
  details?: {
    issuedDate?: Date;
    cancelledDate?: Date;
    replacedDate?: Date;
    rejectionReason?: string;
  };
}

