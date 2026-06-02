/**
 * Banking Types and Interfaces
 * Vietnamese banking standards and VietQR support
 */

import type { BankAccount, BankInfo, BankCode } from "../types/index.js";

/**
 * Bank transfer details
 */
export interface BankTransfer {
  fromAccount: BankAccount;
  toAccount: BankAccount;
  amount: number;
  description: string;
  transferDate: Date;
  referenceNumber?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
}

/**
 * Bank reconciliation record
 */
export interface BankReconciliation {
  bankStatementDate: Date;
  bankStatementAmount: number;
  recordedAmount: number;
  difference: number;
  reconciled: boolean;
  reconciliationDate?: Date;
  notes?: string;
}

/**
 * VietQR Code information
 * Per NAPAS standard for Vietnamese QR payments
 */
export interface VietQRCode {
  bankCode: BankCode;
  accountNumber: string;
  amount?: number;
  description?: string;
  qrString: string;
  expiryDate?: Date;
}

/**
 * VietQR Parsed Data
 */
export interface VietQRParsed {
  bankCode: BankCode;
  accountNumber: string;
  amount?: number;
  description?: string;
  valid: boolean;
}

export type {
  BankAccount,
  BankInfo,
};
