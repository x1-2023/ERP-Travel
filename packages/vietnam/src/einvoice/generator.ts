/**
 * E-Invoice Generator Module
 * Nghị định 123/2020/NĐ-CP format compliance
 * Generates and validates e-invoices
 */

import {
  EInvoice,
  CURRENCY_CODE,
} from "../types/index.js";
import type {
  EInvoiceValidationResult,
  EInvoiceSignature,
} from "./types.js";

/**
 * Generate unique e-invoice ID
 * Format: YYYYMMDDHHMMSS-XXXXX (timestamp + random)
 */
export function generateEInvoiceId(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `${timestamp}-${random}`;
}

/**
 * Format invoice number per regulation
 * Format: Series/SequentialNumber/TaxCode/IssuedDate
 *
 * @param series - Invoice series code
 * @param number - Sequential number
 * @param taxCode - Company tax code
 * @param date - Issue date
 * @returns Formatted invoice number
 */
export function formatInvoiceNumber(
  series: string,
  number: number,
  taxCode?: string,
  date?: Date
): string {
  const paddedNumber = String(number).padStart(6, "0");

  if (taxCode && date) {
    const dateStr = date
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    return `${series}/${paddedNumber}/${taxCode}/${dateStr}`;
  }

  return `${series}/${paddedNumber}`;
}

/**
 * Parse invoice number
 */
export function parseInvoiceNumber(
  invoiceNumber: string
): {
  series: string;
  number: number;
  taxCode?: string;
  date?: Date;
} {
  const parts = invoiceNumber.split("/");

  if (parts.length === 2) {
    return {
      series: parts[0],
      number: parseInt(parts[1], 10),
    };
  }

  if (parts.length === 4) {
    // Parse date from format YYYYMMDD
    const dateStr = parts[3];
    const year = parseInt(dateStr.slice(0, 4), 10);
    const month = parseInt(dateStr.slice(4, 6), 10);
    const day = parseInt(dateStr.slice(6, 8), 10);
    const date = new Date(year, month - 1, day);

    return {
      series: parts[0],
      number: parseInt(parts[1], 10),
      taxCode: parts[2],
      date,
    };
  }

  throw new Error(`Invalid invoice number format: ${invoiceNumber}`);
}

/**
 * Validate e-invoice structure
 * Checks compliance with Nghị định 123/2020/NĐ-CP
 */
export function validateEInvoice(invoice: EInvoice): EInvoiceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!invoice.invoiceNumber || invoice.invoiceNumber.trim() === "") {
    errors.push("Invoice number is required");
  }

  if (!invoice.series || invoice.series.trim() === "") {
    errors.push("Invoice series is required");
  }

  if (!invoice.date || !(invoice.date instanceof Date)) {
    errors.push("Invoice date is required and must be a valid date");
  }

  // Validate seller information
  if (!invoice.seller) {
    errors.push("Seller information is required");
  } else {
    if (!invoice.seller.name || invoice.seller.name.trim() === "") {
      errors.push("Seller name is required");
    }
    if (!invoice.seller.address || invoice.seller.address.trim() === "") {
      errors.push("Seller address is required");
    }
  }

  // Validate buyer information
  if (!invoice.buyer) {
    errors.push("Buyer information is required");
  } else {
    if (!invoice.buyer.name || invoice.buyer.name.trim() === "") {
      errors.push("Buyer name is required");
    }
    // Tax code is optional for individual buyers
  }

  // Validate items
  if (!invoice.items || invoice.items.length === 0) {
    errors.push("At least one invoice item is required");
  } else {
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      if (!item.description || item.description.trim() === "") {
        errors.push(`Item ${i + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${i + 1}: Quantity must be positive`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Item ${i + 1}: Unit price cannot be negative`);
      }
    }
  }

  // Validate totals
  const calculatedTotal = invoice.items.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );
  const expectedTotal = invoice.totalBeforeVAT + invoice.totalVAT;

  if (Math.abs(calculatedTotal - expectedTotal) > 1) {
    errors.push(
      `Total mismatch: calculated ${calculatedTotal}, expected ${expectedTotal}`
    );
  }

  // Validate payment method
  if (!invoice.paymentMethod) {
    errors.push("Payment method is required");
  }

  // Validate currency code
  if (invoice.currencyCode !== CURRENCY_CODE) {
    warnings.push(
      `Currency should be ${CURRENCY_CODE}, got ${invoice.currencyCode}`
    );
  }

  // Check for tax code (recommended for B2B)
  if (!invoice.seller.taxCode) {
    warnings.push("Seller tax code is recommended");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate e-invoice XML
 * Format: Nghị định 123/2020/NĐ-CP compliant XML
 */
export function generateEInvoiceXML(invoice: EInvoice): string {
  const validation = validateEInvoice(invoice);
  if (!validation.valid) {
    throw new Error(`Invalid invoice: ${validation.errors.join(", ")}`);
  }

  const invoiceId = invoice.id || generateEInvoiceId();
  const issueDateISO = invoice.date.toISOString().split("T")[0];
  const dueDateISO = invoice.dueDate
    ? invoice.dueDate.toISOString().split("T")[0]
    : "";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<EInvoice>
  <InvoiceId>${escapeXML(invoiceId)}</InvoiceId>
  <InvoiceNumber>${escapeXML(invoice.invoiceNumber)}</InvoiceNumber>
  <Series>${escapeXML(invoice.series)}</Series>
  <IssueDate>${issueDateISO}</IssueDate>`;

  if (dueDateISO) {
    xml += `\n  <DueDate>${dueDateISO}</DueDate>`;
  }

  xml += `
  <Seller>
    <Name>${escapeXML(invoice.seller.name)}</Name>`;

  if (invoice.seller.taxCode) {
    xml += `\n    <TaxCode>${escapeXML(invoice.seller.taxCode)}</TaxCode>`;
  }

  xml += `
    <Address>${escapeXML(invoice.seller.address)}</Address>`;

  if (invoice.seller.phone) {
    xml += `\n    <Phone>${escapeXML(invoice.seller.phone)}</Phone>`;
  }

  if (invoice.seller.email) {
    xml += `\n    <Email>${escapeXML(invoice.seller.email)}</Email>`;
  }

  if (invoice.seller.accountNumber && invoice.seller.bankName) {
    xml += `
    <BankAccount>
      <Number>${escapeXML(invoice.seller.accountNumber)}</Number>
      <BankName>${escapeXML(invoice.seller.bankName)}</BankName>`;
    if ((invoice.seller as any).swiftCode) {
      xml += `
      <SwiftCode>${escapeXML((invoice.seller as any).swiftCode)}</SwiftCode>`;
    }
    xml += `
    </BankAccount>`;
  }

  xml += `
  </Seller>
  <Buyer>
    <Name>${escapeXML(invoice.buyer.name)}</Name>`;

  if (invoice.buyer.taxCode) {
    xml += `\n    <TaxCode>${escapeXML(invoice.buyer.taxCode)}</TaxCode>`;
  }

  xml += `
    <Address>${escapeXML(invoice.buyer.address)}</Address>`;

  if (invoice.buyer.phone) {
    xml += `\n    <Phone>${escapeXML(invoice.buyer.phone)}</Phone>`;
  }

  if (invoice.buyer.email) {
    xml += `\n    <Email>${escapeXML(invoice.buyer.email)}</Email>`;
  }

  xml += `
  </Buyer>
  <Items>`;

  for (const item of invoice.items) {
    xml += `
    <Item>
      <Description>${escapeXML(item.description)}</Description>
      <Quantity>${item.quantity}</Quantity>
      <Unit>${escapeXML(item.unit)}</Unit>
      <UnitPrice>${item.unitPrice}</UnitPrice>`;

    if (item.discount !== undefined && item.discount > 0) {
      xml += `\n      <Discount>${item.discount}</Discount>`;
    }

    if (item.discountPercentage !== undefined && item.discountPercentage > 0) {
      xml += `\n      <DiscountPercentage>${item.discountPercentage}</DiscountPercentage>`;
    }

    xml += `
      <Amount>${item.amount}</Amount>
      <VATRate>${item.vatRate}</VATRate>
      <VATAmount>${item.vatAmount}</VATAmount>
      <TotalAmount>${item.totalAmount}</TotalAmount>
    </Item>`;
  }

  xml += `
  </Items>
  <Summary>
    <TotalBeforeVAT>${invoice.totalBeforeVAT}</TotalBeforeVAT>
    <TotalVAT>${invoice.totalVAT}</TotalVAT>`;

  if (invoice.totalDiscount !== undefined && invoice.totalDiscount > 0) {
    xml += `\n    <TotalDiscount>${invoice.totalDiscount}</TotalDiscount>`;
  }

  xml += `
    <TotalAfterVAT>${invoice.totalAfterVAT}</TotalAfterVAT>
  </Summary>
  <PaymentMethod>${escapeXML(invoice.paymentMethod)}</PaymentMethod>
  <CurrencyCode>${escapeXML(invoice.currencyCode)}</CurrencyCode>
  <Status>${escapeXML(invoice.status)}</Status>`;

  if (invoice.signature) {
    xml += `\n  <Signature>${escapeXML(invoice.signature)}</Signature>`;
  }

  if (invoice.notes) {
    xml += `\n  <Notes>${escapeXML(invoice.notes)}</Notes>`;
  }

  xml += `\n</EInvoice>`;

  return xml;
}

/**
 * Sign e-invoice
 * Creates signature record (actual cryptographic signing handled by provider)
 */
export function signEInvoice(
  invoice: EInvoice,
  signerName: string,
  certificateNumber?: string
): EInvoiceSignature {
  const xml = generateEInvoiceXML(invoice);
  const signatureValue = createSignatureValue(xml);

  return {
    signatureValue,
    signerName,
    signingDate: new Date(),
    certificateNumber,
  };
}

/**
 * Create simple signature value (MD5 hash for demo)
 * In production, use proper digital signature with certificate
 */
function createSignatureValue(content: string): string {
  // Simple hash-based signature for demonstration
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string | number): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default {
  generateEInvoiceId,
  formatInvoiceNumber,
  parseInvoiceNumber,
  validateEInvoice,
  generateEInvoiceXML,
  signEInvoice,
};
