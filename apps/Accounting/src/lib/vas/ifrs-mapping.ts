// ============================================================
// IFRS Mapping Engine — Enterprise Tier
// Maps VAS accounts to IFRS equivalents for parallel reporting
// Supports: IAS 1 (Financial Statements), IFRS 15 (Revenue),
//           IFRS 16 (Leases), IAS 16 (PPE), IAS 2 (Inventories)
// ============================================================

import Decimal from 'decimal.js';

// ==================== Types ====================

export interface IFRSMappingRule {
  vasAccountNumber: string;
  vasAccountName: string;
  ifrsAccountNumber: string;
  ifrsAccountName: string;
  adjustmentType: 'RECLASSIFICATION' | 'MEASUREMENT' | 'PRESENTATION' | 'DIRECT';
  adjustmentFormula?: string;
  description?: string;
}

export interface IFRSAdjustmentEntry {
  vasAccountNumber: string;
  ifrsAccountNumber: string;
  adjustmentType: string;
  debitAmount: Decimal;
  creditAmount: Decimal;
  description: string;
}

export interface ParallelReport {
  vasReport: Record<string, Decimal>;
  ifrsReport: Record<string, Decimal>;
  adjustments: IFRSAdjustmentEntry[];
  reconciliation: Array<{
    lineItem: string;
    vasAmount: Decimal;
    adjustments: Decimal;
    ifrsAmount: Decimal;
  }>;
}

// ==================== VAS → IFRS Mapping Table ====================

export const VAS_TO_IFRS_MAPPINGS: IFRSMappingRule[] = [
  // ASSETS
  { vasAccountNumber: '111', vasAccountName: 'Tiền mặt', ifrsAccountNumber: 'IFRS-1100', ifrsAccountName: 'Cash', adjustmentType: 'DIRECT' },
  { vasAccountNumber: '112', vasAccountName: 'Tiền gửi ngân hàng', ifrsAccountNumber: 'IFRS-1110', ifrsAccountName: 'Bank balances', adjustmentType: 'DIRECT' },
  { vasAccountNumber: '121', vasAccountName: 'Chứng khoán kinh doanh', ifrsAccountNumber: 'IFRS-1200', ifrsAccountName: 'FVTPL financial assets', adjustmentType: 'MEASUREMENT', description: 'Fair value adjustment per IFRS 9' },
  { vasAccountNumber: '131', vasAccountName: 'Phải thu khách hàng', ifrsAccountNumber: 'IFRS-1300', ifrsAccountName: 'Trade receivables', adjustmentType: 'MEASUREMENT', description: 'Expected credit loss per IFRS 9' },
  { vasAccountNumber: '152', vasAccountName: 'Nguyên vật liệu', ifrsAccountNumber: 'IFRS-1400', ifrsAccountName: 'Raw materials (IAS 2)', adjustmentType: 'MEASUREMENT', description: 'NRV test per IAS 2' },
  { vasAccountNumber: '155', vasAccountName: 'Thành phẩm', ifrsAccountNumber: 'IFRS-1410', ifrsAccountName: 'Finished goods (IAS 2)', adjustmentType: 'MEASUREMENT' },
  { vasAccountNumber: '156', vasAccountName: 'Hàng hóa', ifrsAccountNumber: 'IFRS-1420', ifrsAccountName: 'Merchandise (IAS 2)', adjustmentType: 'MEASUREMENT' },

  // FIXED ASSETS — IAS 16
  { vasAccountNumber: '211', vasAccountName: 'TSCĐ hữu hình', ifrsAccountNumber: 'IFRS-2100', ifrsAccountName: 'Property, plant & equipment', adjustmentType: 'MEASUREMENT', description: 'Revaluation model / component depreciation per IAS 16' },
  { vasAccountNumber: '213', vasAccountName: 'TSCĐ vô hình', ifrsAccountNumber: 'IFRS-2200', ifrsAccountName: 'Intangible assets (IAS 38)', adjustmentType: 'MEASUREMENT' },
  { vasAccountNumber: '214', vasAccountName: 'Hao mòn TSCĐ', ifrsAccountNumber: 'IFRS-2190', ifrsAccountName: 'Accumulated depreciation', adjustmentType: 'MEASUREMENT' },

  // LEASES — IFRS 16 (major difference from VAS)
  { vasAccountNumber: '212', vasAccountName: 'TSCĐ thuê tài chính', ifrsAccountNumber: 'IFRS-2300', ifrsAccountName: 'Right-of-use assets (IFRS 16)', adjustmentType: 'RECLASSIFICATION', description: 'Operating leases → ROU assets per IFRS 16' },
  { vasAccountNumber: '242', vasAccountName: 'Chi phí trả trước (thuê)', ifrsAccountNumber: 'IFRS-2300', ifrsAccountName: 'Right-of-use assets (IFRS 16)', adjustmentType: 'RECLASSIFICATION', description: 'Prepaid lease → ROU asset' },

  // LIABILITIES
  { vasAccountNumber: '331', vasAccountName: 'Phải trả người bán', ifrsAccountNumber: 'IFRS-3100', ifrsAccountName: 'Trade payables', adjustmentType: 'DIRECT' },
  { vasAccountNumber: '334', vasAccountName: 'Phải trả NLĐ', ifrsAccountNumber: 'IFRS-3200', ifrsAccountName: 'Employee benefit obligations', adjustmentType: 'MEASUREMENT', description: 'IAS 19 actuarial valuation' },
  { vasAccountNumber: '341', vasAccountName: 'Vay', ifrsAccountNumber: 'IFRS-3300', ifrsAccountName: 'Borrowings', adjustmentType: 'MEASUREMENT', description: 'Effective interest method per IFRS 9' },

  // Lease Liability — IFRS 16
  { vasAccountNumber: '3412', vasAccountName: 'Nợ thuê tài chính', ifrsAccountNumber: 'IFRS-3400', ifrsAccountName: 'Lease liabilities (IFRS 16)', adjustmentType: 'RECLASSIFICATION' },

  // REVENUE — IFRS 15
  { vasAccountNumber: '511', vasAccountName: 'Doanh thu bán hàng', ifrsAccountNumber: 'IFRS-5000', ifrsAccountName: 'Revenue (IFRS 15)', adjustmentType: 'MEASUREMENT', description: '5-step model per IFRS 15' },
  { vasAccountNumber: '515', vasAccountName: 'DT tài chính', ifrsAccountNumber: 'IFRS-5100', ifrsAccountName: 'Finance income', adjustmentType: 'DIRECT' },

  // EXPENSES
  { vasAccountNumber: '632', vasAccountName: 'Giá vốn hàng bán', ifrsAccountNumber: 'IFRS-6000', ifrsAccountName: 'Cost of sales', adjustmentType: 'DIRECT' },
  { vasAccountNumber: '635', vasAccountName: 'Chi phí tài chính', ifrsAccountNumber: 'IFRS-6100', ifrsAccountName: 'Finance costs', adjustmentType: 'MEASUREMENT', description: 'Include IFRS 16 lease interest' },
  { vasAccountNumber: '641', vasAccountName: 'CP bán hàng', ifrsAccountNumber: 'IFRS-6200', ifrsAccountName: 'Distribution costs', adjustmentType: 'PRESENTATION' },
  { vasAccountNumber: '642', vasAccountName: 'CP QLDN', ifrsAccountNumber: 'IFRS-6300', ifrsAccountName: 'Administrative expenses', adjustmentType: 'PRESENTATION' },

  // EQUITY
  { vasAccountNumber: '411', vasAccountName: 'Vốn CSH', ifrsAccountNumber: 'IFRS-4100', ifrsAccountName: 'Share capital', adjustmentType: 'DIRECT' },
  { vasAccountNumber: '421', vasAccountName: 'LNST chưa phân phối', ifrsAccountNumber: 'IFRS-4200', ifrsAccountName: 'Retained earnings', adjustmentType: 'MEASUREMENT', description: 'Includes all IFRS adjustments' },
];

// ==================== Key IFRS Adjustments ====================

/**
 * Generate IFRS 16 lease adjustment
 * VAS: Operating lease → expense (641/642)
 * IFRS: Capitalize as ROU asset + lease liability
 */
export function generateIFRS16Adjustment(
  leasePayments: Array<{ amount: number; months: number }>,
  discountRate: number
): IFRSAdjustmentEntry[] {
  const entries: IFRSAdjustmentEntry[] = [];

  // Calculate present value of lease payments
  let totalPV = new Decimal(0);
  for (const payment of leasePayments) {
    for (let m = 1; m <= payment.months; m++) {
      const pv = new Decimal(payment.amount).div(
        new Decimal(1 + discountRate / 12).pow(m)
      );
      totalPV = totalPV.plus(pv);
    }
  }

  // ROU Asset (debit)
  entries.push({
    vasAccountNumber: '242',
    ifrsAccountNumber: 'IFRS-2300',
    adjustmentType: 'IFRS 16 — Recognize ROU Asset',
    debitAmount: totalPV,
    creditAmount: new Decimal(0),
    description: 'Ghi nhận quyền sử dụng tài sản theo IFRS 16',
  });

  // Lease Liability (credit)
  entries.push({
    vasAccountNumber: '3412',
    ifrsAccountNumber: 'IFRS-3400',
    adjustmentType: 'IFRS 16 — Recognize Lease Liability',
    debitAmount: new Decimal(0),
    creditAmount: totalPV,
    description: 'Ghi nhận nghĩa vụ thuê theo IFRS 16',
  });

  return entries;
}

/**
 * Generate IFRS 9 Expected Credit Loss (ECL) adjustment
 * VAS: Provision based on specific identification
 * IFRS: Forward-looking ECL model
 */
export function generateECLAdjustment(
  receivables: Array<{ amount: number; agingDays: number }>,
  eclRates: Record<string, number> // e.g., { 'current': 0.01, '30-60': 0.05, '60-90': 0.10, '90+': 0.25 }
): IFRSAdjustmentEntry[] {
  let totalECL = new Decimal(0);

  for (const rec of receivables) {
    let rate: number;
    if (rec.agingDays <= 30) rate = eclRates['current'] || 0.01;
    else if (rec.agingDays <= 60) rate = eclRates['30-60'] || 0.05;
    else if (rec.agingDays <= 90) rate = eclRates['60-90'] || 0.10;
    else rate = eclRates['90+'] || 0.25;

    totalECL = totalECL.plus(new Decimal(rec.amount).times(rate));
  }

  if (totalECL.isZero()) return [];

  return [
    {
      vasAccountNumber: '229',
      ifrsAccountNumber: 'IFRS-1390',
      adjustmentType: 'IFRS 9 — Expected Credit Loss',
      debitAmount: new Decimal(0),
      creditAmount: totalECL,
      description: `Dự phòng tổn thất tín dụng kỳ vọng: ${totalECL.toFixed(0)} VND`,
    },
    {
      vasAccountNumber: '642',
      ifrsAccountNumber: 'IFRS-6310',
      adjustmentType: 'IFRS 9 — ECL Expense',
      debitAmount: totalECL,
      creditAmount: new Decimal(0),
      description: 'Chi phí dự phòng ECL',
    },
  ];
}

/**
 * Get IFRS mapping for a VAS account
 */
export function getIFRSMapping(vasAccountNumber: string): IFRSMappingRule | undefined {
  return VAS_TO_IFRS_MAPPINGS.find(m => m.vasAccountNumber === vasAccountNumber);
}

/**
 * Get all mappings by adjustment type
 */
export function getMappingsByType(type: IFRSMappingRule['adjustmentType']): IFRSMappingRule[] {
  return VAS_TO_IFRS_MAPPINGS.filter(m => m.adjustmentType === type);
}
