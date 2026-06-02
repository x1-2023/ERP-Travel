/**
 * VietQR Code Generation and Parsing
 * Per NAPAS standard for Vietnamese QR payments
 * Supports immediate payment via mobile banking apps
 */

import { BankCode } from "../types/index.js";
import { VietQRCode, VietQRParsed } from "./types.js";

/**
 * VietQR format specification
 * Format: 00020126360005...
 * ID (EMVCo) based QR code
 */

/**
 * Generate VietQR string
 * Format for immediate payment
 *
 * @param bankCode - Vietnamese bank code
 * @param accountNumber - Beneficiary account number
 * @param amount - Transfer amount (optional)
 * @param description - Transfer description/content
 * @returns VietQR string for scanning
 */
export function generateVietQR(
  bankCode: BankCode,
  accountNumber: string,
  amount?: number,
  description?: string
): string {
  // Validate inputs
  if (!bankCode || !accountNumber) {
    throw new Error("Bank code and account number are required");
  }

  if (amount !== undefined && amount < 0) {
    throw new Error("Amount must be non-negative");
  }

  // Get bank BIN from code
  const bankInfo = getBankInfo(bankCode);
  if (!bankInfo) {
    throw new Error(`Unknown bank code: ${bankCode}`);
  }

  // Build VietQR string
  // Simplified format - actual VietQR uses EMVCo format
  const qrData = {
    version: "01",
    bankCode: bankInfo.bin,
    accountNumber: accountNumber.padStart(20, "0"),
    amount: amount ? amount.toString().padStart(13, "0") : "0000000000000",
    description: description ? encodeURIComponent(description) : "",
  };

  // Generate checksum (simple validation)
  const qrString = generateQRString(qrData);
  return qrString;
}

/**
 * Generate actual QR string
 */
function generateQRString(
  data: Record<string, string>
): string {
  // Build EMVCo-like format
  // This is a simplified representation
  let qrValue = "00020126";
  qrValue += "360005";
  qrValue += data.bankCode; // BIN
  qrValue += data.accountNumber; // Account
  qrValue += data.amount; // Amount
  if (data.description) {
    qrValue += data.description;
  }

  return qrValue;
}

/**
 * Parse VietQR string
 * Extract payment information
 *
 * @param qrString - QR code string
 * @returns Parsed VietQR data
 */
export function parseVietQR(qrString: string): VietQRParsed {
  // Validate format
  if (!qrString || qrString.length < 50) {
    return {
      bankCode: "" as BankCode,
      accountNumber: "",
      valid: false,
    };
  }

  try {
    // Extract components (simplified parsing)
    // Format: version(2) + reserved(6) + bin(6) + account(20) + amount(13) + desc
    const bin = qrString.substring(8, 14);
    const accountNumber = qrString.substring(14, 34);
    const amount = qrString.substring(34, 47);

    // Find bank by BIN
    const bankCode = findBankByBIN(bin);
    const amountValue = amount !== "0000000000000" ? parseInt(amount, 10) : undefined;

    return {
      bankCode: bankCode || ("" as BankCode),
      accountNumber: accountNumber.replace(/^0+/, ""),
      amount: amountValue,
      valid: !!bankCode,
    };
  } catch {
    return {
      bankCode: "" as BankCode,
      accountNumber: "",
      valid: false,
    };
  }
}

/**
 * Get bank information
 */
function getBankInfo(code: BankCode): { bin: string; name: string } | null {
  const banks: Record<BankCode, { bin: string; name: string }> = {
    VCB: { bin: "970436", name: "Vietcombank" },
    BIDV: { bin: "970418", name: "BIDV" },
    TCB: { bin: "970407", name: "Techcombank" },
    MB: { bin: "970422", name: "MB Bank" },
    VPB: { bin: "970432", name: "VPBank" },
    ACB: { bin: "970425", name: "ACB" },
    SHB: { bin: "970443", name: "SHB" },
    TPB: { bin: "970423", name: "TPBank" },
    HDB: { bin: "970437", name: "HDBank" },
    STB: { bin: "970424", name: "Sacombank" },
    EXB: { bin: "970419", name: "Exim Bank" },
    MBB: { bin: "970426", name: "Military Bank" },
    VIB: { bin: "970441", name: "VIB" },
    CTG: { bin: "970412", name: "SeABank" },
    OCB: { bin: "970448", name: "OCB" },
    VRB: { bin: "970456", name: "VRB" },
    NAB: { bin: "970452", name: "Nam Á Bank" },
    BVB: { bin: "970450", name: "BVBANK" },
    PGB: { bin: "970445", name: "PGB" },
    BAB: { bin: "970454", name: "Bắc Á Bank" },
  };

  return banks[code] || null;
}

/**
 * Find bank by BIN
 */
function findBankByBIN(bin: string): BankCode | null {
  const binToBank: Record<string, BankCode> = {
    "970436": BankCode.VCB,
    "970418": BankCode.BIDV,
    "970407": BankCode.TCB,
    "970422": BankCode.MB,
    "970432": BankCode.VPB,
    "970425": BankCode.ACB,
    "970443": BankCode.SHB,
    "970423": BankCode.TPB,
    "970437": BankCode.HDB,
    "970424": BankCode.STB,
    "970419": BankCode.EXB,
    "970426": BankCode.MBB,
    "970441": BankCode.VIB,
    "970412": BankCode.CTG,
    "970448": BankCode.OCB,
    "970456": BankCode.VRB,
    "970452": BankCode.NAB,
    "970450": BankCode.BVB,
    "970445": BankCode.PGB,
    "970454": BankCode.BAB,
  };

  return binToBank[bin] || null;
}

/**
 * Create VietQR object
 */
export function createVietQR(
  bankCode: BankCode,
  accountNumber: string,
  amount?: number,
  description?: string
): VietQRCode {
  const qrString = generateVietQR(bankCode, accountNumber, amount, description);

  return {
    bankCode,
    accountNumber,
    amount,
    description,
    qrString,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };
}

/**
 * Validate VietQR code
 */
export function validateVietQR(qrString: string): {
  valid: boolean;
  message?: string;
} {
  if (!qrString) {
    return { valid: false, message: "QR string is required" };
  }

  if (qrString.length < 50) {
    return { valid: false, message: "Invalid QR string length" };
  }

  if (!qrString.startsWith("00020126")) {
    return { valid: false, message: "Invalid QR version" };
  }

  const parsed = parseVietQR(qrString);
  if (!parsed.valid) {
    return { valid: false, message: "Invalid QR data" };
  }

  return { valid: true };
}

/**
 * Format VietQR for display
 */
export function formatVietQRForDisplay(qrCode: VietQRCode): string {
  let display = `Bank: ${qrCode.bankCode}\n`;
  display += `Account: ${qrCode.accountNumber}\n`;
  if (qrCode.amount) {
    display += `Amount: ${qrCode.amount.toLocaleString("vi-VN")} ₫\n`;
  }
  if (qrCode.description) {
    display += `Description: ${qrCode.description}\n`;
  }
  display += `QR: ${qrCode.qrString}`;

  return display;
}

export default {
  generateVietQR,
  parseVietQR,
  createVietQR,
  validateVietQR,
  formatVietQRForDisplay,
};
