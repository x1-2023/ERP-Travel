// ============================================================
// Vietnamese e-Invoice Engine — Hóa đơn điện tử
// Compliant with: Nghị định 123/2020/NĐ-CP, Thông tư 78/2021/TT-BTC
// ============================================================

import { numberToVietnameseWords } from '../gl-engine';

// ==================== Types ====================

export interface EInvoiceInput {
  invoiceTemplate: string;    // Mẫu hóa đơn: 01GTKT (GTGT), 02GTTT (Bán hàng)
  invoiceSeries: string;      // Ký hiệu: 1C26TAA
  seller: {
    taxCode: string;
    name: string;
    address: string;
    phone?: string;
    bankAccount?: string;
    bankName?: string;
  };
  buyer: {
    taxCode?: string;
    name: string;
    address?: string;
    phone?: string;
    paymentMethod?: string;   // TM (Cash), CK (Transfer), TM/CK
  };
  items: EInvoiceItemInput[];
  currency?: string;
  exchangeRate?: number;
  notes?: string;
}

export interface EInvoiceItemInput {
  itemName: string;
  itemCode?: string;
  unit?: string;              // Đơn vị tính
  quantity: number;
  unitPrice: number;
  vatRate: number;            // 0, 0.05, 0.08, 0.10, -1 (not subject)
  discount?: number;
}

export interface EInvoiceOutput {
  invoiceNumber: string;
  invoiceDate: Date;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  amountInWords: string;
  lookupCode: string;
  xmlContent: string;
  qrCodeData: string;
  lines: Array<EInvoiceItemInput & {
    amount: number;
    vatAmount: number;
    totalAmount: number;
  }>;
}

// ==================== Invoice Generation ====================

/**
 * Generate e-Invoice data structure
 */
export function generateEInvoice(
  input: EInvoiceInput,
  invoiceNumber: string,
  invoiceDate: Date = new Date()
): EInvoiceOutput {
  let subtotal = 0;
  let totalVat = 0;

  const lines = input.items.map(item => {
    const amount = item.quantity * item.unitPrice - (item.discount || 0);
    const vatAmount = item.vatRate > 0 ? amount * item.vatRate : 0;
    const totalAmount = amount + vatAmount;

    subtotal += amount;
    totalVat += vatAmount;

    return {
      ...item,
      amount,
      vatAmount,
      totalAmount,
    };
  });

  const totalAmount = subtotal + totalVat;
  const amountInWords = numberToVietnameseWords(totalAmount);
  const lookupCode = generateLookupCode();

  const xmlContent = generateEInvoiceXML({
    ...input,
    invoiceNumber,
    invoiceDate,
    subtotal,
    vatAmount: totalVat,
    totalAmount,
    amountInWords,
    lookupCode,
    lines,
  });

  const qrCodeData = generateQRCodeData({
    sellerTaxCode: input.seller.taxCode,
    invoiceTemplate: input.invoiceTemplate,
    invoiceSeries: input.invoiceSeries,
    invoiceNumber,
    invoiceDate,
    totalAmount,
    lookupCode,
  });

  return {
    invoiceNumber,
    invoiceDate,
    subtotal,
    vatAmount: totalVat,
    totalAmount,
    amountInWords,
    lookupCode,
    xmlContent,
    qrCodeData,
    lines,
  };
}

// ==================== XML Generation ====================

/**
 * Generate e-Invoice XML per Thông tư 78/2021/TT-BTC
 */
function generateEInvoiceXML(data: {
  invoiceTemplate: string;
  invoiceSeries: string;
  invoiceNumber: string;
  invoiceDate: Date;
  seller: EInvoiceInput['seller'];
  buyer: EInvoiceInput['buyer'];
  lines: Array<EInvoiceItemInput & { amount: number; vatAmount: number; totalAmount: number }>;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  amountInWords: string;
  lookupCode: string;
  currency?: string;
  exchangeRate?: number;
}): string {
  const dateStr = data.invoiceDate.toISOString().split('T')[0];
  const currency = data.currency || 'VND';

  const itemsXml = data.lines.map((line, idx) => `
      <HHDVu>
        <STT>${idx + 1}</STT>
        <MHHDVu>${line.itemCode || ''}</MHHDVu>
        <THHDVu>${escapeXml(line.itemName)}</THHDVu>
        <DVTinh>${line.unit || ''}</DVTinh>
        <SLuong>${line.quantity}</SLuong>
        <DGia>${line.unitPrice}</DGia>
        <ThTien>${line.amount}</ThTien>
        <TSuat>${formatVATRate(line.vatRate)}</TSuat>
        <TThue>${line.vatAmount}</TThue>
      </HHDVu>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<HDon>
  <DLHDon>
    <TTChung>
      <KHMSHDon>${data.invoiceTemplate}</KHMSHDon>
      <KHHDon>${data.invoiceSeries}</KHHDon>
      <SHDon>${data.invoiceNumber}</SHDon>
      <NLap>${dateStr}</NLap>
      <DVTTe>${currency}</DVTTe>
      <TGia>${data.exchangeRate || 1}</TGia>
      <HTTToan>${data.buyer.paymentMethod || 'CK'}</HTTToan>
      <MaCQTCap></MaCQTCap>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>${escapeXml(data.seller.name)}</Ten>
        <MST>${data.seller.taxCode}</MST>
        <DChi>${escapeXml(data.seller.address)}</DChi>
        <SDThoai>${data.seller.phone || ''}</SDThoai>
        <STKNHang>${data.seller.bankAccount || ''}</STKNHang>
        <TNHang>${data.seller.bankName || ''}</TNHang>
      </NBan>
      <NMua>
        <Ten>${escapeXml(data.buyer.name)}</Ten>
        <MST>${data.buyer.taxCode || ''}</MST>
        <DChi>${escapeXml(data.buyer.address || '')}</DChi>
      </NMua>
      <DSHHDVu>${itemsXml}
      </DSHHDVu>
      <TToan>
        <TgTCThue>${data.subtotal}</TgTCThue>
        <TgTThue>${data.vatAmount}</TgTThue>
        <TgTTTBSo>${data.totalAmount}</TgTTTBSo>
        <TgTTTBChu>${escapeXml(data.amountInWords)}</TgTTTBChu>
      </TToan>
    </NDHDon>
  </DLHDon>
  <MCCQT>${data.lookupCode}</MCCQT>
</HDon>`;
}

// ==================== QR Code ====================

/**
 * Generate QR code data string for e-Invoice
 * Per Thông tư 78/2021, QR contains: seller MST, invoice template,
 * series, number, total, lookup code, and verification URL
 */
function generateQRCodeData(data: {
  sellerTaxCode: string;
  invoiceTemplate: string;
  invoiceSeries: string;
  invoiceNumber: string;
  invoiceDate: Date;
  totalAmount: number;
  lookupCode: string;
}): string {
  const dateStr = data.invoiceDate.toISOString().split('T')[0];
  return [
    data.sellerTaxCode,
    data.invoiceTemplate,
    data.invoiceSeries,
    data.invoiceNumber,
    dateStr,
    data.totalAmount.toString(),
    data.lookupCode,
    `https://hoadondientu.gdt.gov.vn/${data.lookupCode}`,
  ].join('|');
}

// ==================== Adjustment & Replacement ====================

/**
 * Generate adjustment e-Invoice (Hóa đơn điều chỉnh)
 * Per Nghị định 123, Article 19
 */
export function generateAdjustmentInvoice(
  originalInvoice: { number: string; series: string; date: Date },
  adjustmentReason: string,
  adjustmentItems: EInvoiceItemInput[],
  sellerInfo: EInvoiceInput['seller'],
  buyerInfo: EInvoiceInput['buyer']
): EInvoiceInput & { adjustmentOf: string; invoiceType: string } {
  return {
    invoiceTemplate: '01GTKT',
    invoiceSeries: originalInvoice.series,
    seller: sellerInfo,
    buyer: buyerInfo,
    items: adjustmentItems,
    notes: `Điều chỉnh cho HĐ số ${originalInvoice.number} ngày ${originalInvoice.date.toLocaleDateString('vi-VN')}. Lý do: ${adjustmentReason}`,
    adjustmentOf: originalInvoice.number,
    invoiceType: 'ADJUSTMENT',
  };
}

/**
 * Generate replacement e-Invoice (Hóa đơn thay thế)
 * Per Nghị định 123, Article 19
 */
export function generateReplacementInvoice(
  originalInvoice: { number: string; series: string; date: Date },
  replacementReason: string,
  newItems: EInvoiceItemInput[],
  sellerInfo: EInvoiceInput['seller'],
  buyerInfo: EInvoiceInput['buyer']
): EInvoiceInput & { replacementOf: string; invoiceType: string } {
  return {
    invoiceTemplate: '01GTKT',
    invoiceSeries: originalInvoice.series,
    seller: sellerInfo,
    buyer: buyerInfo,
    items: newItems,
    notes: `Thay thế cho HĐ số ${originalInvoice.number} ngày ${originalInvoice.date.toLocaleDateString('vi-VN')}. Lý do: ${replacementReason}`,
    replacementOf: originalInvoice.number,
    invoiceType: 'REPLACEMENT',
  };
}

// ==================== Helpers ====================

function generateLookupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatVATRate(rate: number): string {
  if (rate === -1) return 'KCT';     // Không chịu thuế
  if (rate === 0) return '0%';
  return `${(rate * 100).toFixed(0)}%`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
