// ============================================================
// Financial Reports Engine
// VAS-compliant: Balance Sheet (B01-DN), P&L (B02-DN),
// Cash Flow Statement (B03-DN), Notes (B09-DN)
// ============================================================

import Decimal from 'decimal.js';
import type { TrialBalanceRow } from '../gl-engine';

// ==================== Types ====================

export interface BalanceSheetReport {
  reportDate: Date;
  tenantId: string;
  currency: string;
  // A. TÀI SẢN NGẮN HẠN
  currentAssets: {
    cashAndEquivalents: Decimal;        // I. Tiền và tương đương tiền (111, 112, 113)
    shortTermInvestments: Decimal;      // II. Đầu tư tài chính ngắn hạn (121, 128)
    shortTermReceivables: Decimal;      // III. Các khoản phải thu ngắn hạn (131, 133, 136, 138, 141)
    inventories: Decimal;               // IV. Hàng tồn kho (151-157)
    otherCurrentAssets: Decimal;        // V. Tài sản ngắn hạn khác
    totalCurrentAssets: Decimal;
  };
  // B. TÀI SẢN DÀI HẠN
  nonCurrentAssets: {
    longTermReceivables: Decimal;       // I. Các khoản phải thu dài hạn
    fixedAssets: Decimal;               // II. Tài sản cố định (211-214)
    investmentProperty: Decimal;        // III. Bất động sản đầu tư (217)
    longTermInvestments: Decimal;       // IV. Đầu tư tài chính dài hạn (221, 222, 228)
    otherNonCurrentAssets: Decimal;     // V. Tài sản dài hạn khác (241, 242, 243, 244)
    totalNonCurrentAssets: Decimal;
  };
  totalAssets: Decimal;
  // C. NỢ PHẢI TRẢ
  liabilities: {
    currentLiabilities: Decimal;        // I. Nợ ngắn hạn (331-338, 341 ngắn hạn)
    nonCurrentLiabilities: Decimal;     // II. Nợ dài hạn (341 dài hạn, 343, 347)
    totalLiabilities: Decimal;
  };
  // D. VỐN CHỦ SỞ HỮU
  equity: {
    ownersEquity: Decimal;              // I. Vốn chủ sở hữu (411)
    reserves: Decimal;                  // II. Các quỹ (414, 417, 418)
    retainedEarnings: Decimal;          // III. Lợi nhuận chưa phân phối (421)
    otherEquity: Decimal;               // IV. Khác (412, 413, 419)
    totalEquity: Decimal;
  };
  totalLiabilitiesAndEquity: Decimal;
  isBalanced: boolean;
}

export interface IncomeStatementReport {
  periodStart: Date;
  periodEnd: Date;
  tenantId: string;
  currency: string;
  // 1. Doanh thu bán hàng
  grossRevenue: Decimal;                // TK 511
  revenueDeductions: Decimal;           // TK 521 (discounts, returns, allowances)
  netRevenue: Decimal;                  // Doanh thu thuần
  // 2. Giá vốn hàng bán
  costOfGoodsSold: Decimal;             // TK 632
  grossProfit: Decimal;                 // Lợi nhuận gộp
  // 3. Doanh thu tài chính
  financialIncome: Decimal;             // TK 515
  financialExpenses: Decimal;           // TK 635
  // 4. Chi phí hoạt động
  sellingExpenses: Decimal;             // TK 641
  adminExpenses: Decimal;               // TK 642
  operatingProfit: Decimal;             // Lợi nhuận từ HĐKD
  // 5. Thu nhập/chi phí khác
  otherIncome: Decimal;                 // TK 711
  otherExpenses: Decimal;               // TK 811
  otherProfit: Decimal;                 // Lợi nhuận khác
  // 6. Kết quả
  profitBeforeTax: Decimal;             // Lợi nhuận trước thuế
  citExpense: Decimal;                  // TK 821
  netProfit: Decimal;                   // Lợi nhuận sau thuế
}

export interface CashFlowReport {
  periodStart: Date;
  periodEnd: Date;
  tenantId: string;
  operatingActivities: Decimal;
  investingActivities: Decimal;
  financingActivities: Decimal;
  netCashChange: Decimal;
  openingCash: Decimal;
  closingCash: Decimal;
}

// ==================== Report Builders ====================

/**
 * Build Balance Sheet (Bảng cân đối kế toán — Mẫu B01-DN)
 */
export function buildBalanceSheet(
  trialBalance: TrialBalanceRow[],
  reportDate: Date,
  tenantId: string
): BalanceSheetReport {
  const getBalance = (prefix: string): Decimal => {
    return trialBalance
      .filter(row => row.accountNumber.startsWith(prefix))
      .reduce((sum, row) => {
        const closingNet = new Decimal(row.closingDebit).minus(new Decimal(row.closingCredit));
        return sum.plus(closingNet);
      }, new Decimal(0));
  };

  const getCreditBalance = (prefix: string): Decimal => {
    return trialBalance
      .filter(row => row.accountNumber.startsWith(prefix))
      .reduce((sum, row) => {
        return sum.plus(new Decimal(row.closingCredit).minus(new Decimal(row.closingDebit)));
      }, new Decimal(0));
  };

  // Current Assets
  const cashAndEquivalents = getBalance('111').plus(getBalance('112')).plus(getBalance('113'));
  const shortTermInvestments = getBalance('121').plus(getBalance('128'));
  const shortTermReceivables = getBalance('131').plus(getBalance('133')).plus(getBalance('136')).plus(getBalance('138')).plus(getBalance('141'));
  const inventories = getBalance('151').plus(getBalance('152')).plus(getBalance('153')).plus(getBalance('154')).plus(getBalance('155')).plus(getBalance('156')).plus(getBalance('157'));
  const otherCurrentAssets = new Decimal(0);
  const totalCurrentAssets = cashAndEquivalents.plus(shortTermInvestments).plus(shortTermReceivables).plus(inventories).plus(otherCurrentAssets);

  // Non-current Assets
  const fixedAssets = getBalance('211').plus(getBalance('212')).plus(getBalance('213')).minus(getCreditBalance('214'));
  const investmentProperty = getBalance('217');
  const longTermInvestments = getBalance('221').plus(getBalance('222')).plus(getBalance('228')).minus(getCreditBalance('229'));
  const longTermReceivables = new Decimal(0);
  const otherNCA = getBalance('241').plus(getBalance('242')).plus(getBalance('243')).plus(getBalance('244'));
  const totalNonCurrentAssets = fixedAssets.plus(investmentProperty).plus(longTermInvestments).plus(longTermReceivables).plus(otherNCA);

  const totalAssets = totalCurrentAssets.plus(totalNonCurrentAssets);

  // Liabilities
  const currentLiabilities = getCreditBalance('331').plus(getCreditBalance('333')).plus(getCreditBalance('334')).plus(getCreditBalance('335')).plus(getCreditBalance('336')).plus(getCreditBalance('337')).plus(getCreditBalance('338')).plus(getCreditBalance('352')).plus(getCreditBalance('353'));
  const nonCurrentLiabilities = getCreditBalance('341').plus(getCreditBalance('343')).plus(getCreditBalance('344')).plus(getCreditBalance('347')).plus(getCreditBalance('356'));
  const totalLiabilities = currentLiabilities.plus(nonCurrentLiabilities);

  // Equity
  const ownersEquity = getCreditBalance('411');
  const reserves = getCreditBalance('414').plus(getCreditBalance('417')).plus(getCreditBalance('418'));
  const retainedEarnings = getCreditBalance('421');
  const otherEquity = getCreditBalance('412').plus(getCreditBalance('413')).minus(getBalance('419'));
  const totalEquity = ownersEquity.plus(reserves).plus(retainedEarnings).plus(otherEquity);

  const totalLiabilitiesAndEquity = totalLiabilities.plus(totalEquity);

  return {
    reportDate,
    tenantId,
    currency: 'VND',
    currentAssets: {
      cashAndEquivalents,
      shortTermInvestments,
      shortTermReceivables,
      inventories,
      otherCurrentAssets,
      totalCurrentAssets,
    },
    nonCurrentAssets: {
      longTermReceivables,
      fixedAssets,
      investmentProperty,
      longTermInvestments,
      otherNonCurrentAssets: otherNCA,
      totalNonCurrentAssets,
    },
    totalAssets,
    liabilities: {
      currentLiabilities,
      nonCurrentLiabilities,
      totalLiabilities,
    },
    equity: {
      ownersEquity,
      reserves,
      retainedEarnings,
      otherEquity,
      totalEquity,
    },
    totalLiabilitiesAndEquity,
    isBalanced: totalAssets.equals(totalLiabilitiesAndEquity),
  };
}

/**
 * Build Income Statement (Báo cáo KQHĐKD — Mẫu B02-DN)
 */
export function buildIncomeStatement(
  trialBalance: TrialBalanceRow[],
  periodStart: Date,
  periodEnd: Date,
  tenantId: string
): IncomeStatementReport {
  const getPeriodCredit = (prefix: string): Decimal => {
    return trialBalance
      .filter(row => row.accountNumber.startsWith(prefix))
      .reduce((sum, row) => sum.plus(new Decimal(row.periodCredit)), new Decimal(0));
  };

  const getPeriodDebit = (prefix: string): Decimal => {
    return trialBalance
      .filter(row => row.accountNumber.startsWith(prefix))
      .reduce((sum, row) => sum.plus(new Decimal(row.periodDebit)), new Decimal(0));
  };

  const grossRevenue = getPeriodCredit('511');
  const revenueDeductions = getPeriodDebit('521');
  const netRevenue = grossRevenue.minus(revenueDeductions);

  const costOfGoodsSold = getPeriodDebit('632');
  const grossProfit = netRevenue.minus(costOfGoodsSold);

  const financialIncome = getPeriodCredit('515');
  const financialExpenses = getPeriodDebit('635');
  const sellingExpenses = getPeriodDebit('641');
  const adminExpenses = getPeriodDebit('642');

  const operatingProfit = grossProfit
    .plus(financialIncome)
    .minus(financialExpenses)
    .minus(sellingExpenses)
    .minus(adminExpenses);

  const otherIncome = getPeriodCredit('711');
  const otherExpenses = getPeriodDebit('811');
  const otherProfit = otherIncome.minus(otherExpenses);

  const profitBeforeTax = operatingProfit.plus(otherProfit);
  const citExpense = getPeriodDebit('821');
  const netProfit = profitBeforeTax.minus(citExpense);

  return {
    periodStart,
    periodEnd,
    tenantId,
    currency: 'VND',
    grossRevenue,
    revenueDeductions,
    netRevenue,
    costOfGoodsSold,
    grossProfit,
    financialIncome,
    financialExpenses,
    sellingExpenses,
    adminExpenses,
    operatingProfit,
    otherIncome,
    otherExpenses,
    otherProfit,
    profitBeforeTax,
    citExpense,
    netProfit,
  };
}

/**
 * Build Cash Flow Statement (Báo cáo LCTT — Mẫu B03-DN)
 * Indirect method
 */
export function buildCashFlowStatement(
  incomeStatement: IncomeStatementReport,
  balanceSheetStart: BalanceSheetReport,
  balanceSheetEnd: BalanceSheetReport
): CashFlowReport {
  // Simplified indirect method
  const netProfit = incomeStatement.netProfit;

  // Operating adjustments (depreciation + working capital changes)
  const depreciationAddBack = new Decimal(0); // Would come from depreciation entries
  const receivablesChange = balanceSheetEnd.currentAssets.shortTermReceivables
    .minus(balanceSheetStart.currentAssets.shortTermReceivables).negated();
  const inventoryChange = balanceSheetEnd.currentAssets.inventories
    .minus(balanceSheetStart.currentAssets.inventories).negated();
  const payablesChange = balanceSheetEnd.liabilities.currentLiabilities
    .minus(balanceSheetStart.liabilities.currentLiabilities);

  const operatingActivities = netProfit
    .plus(depreciationAddBack)
    .plus(receivablesChange)
    .plus(inventoryChange)
    .plus(payablesChange);

  // Investing (simplified)
  const fixedAssetChange = balanceSheetEnd.nonCurrentAssets.fixedAssets
    .minus(balanceSheetStart.nonCurrentAssets.fixedAssets).negated();
  const investingActivities = fixedAssetChange;

  // Financing (simplified)
  const equityChange = balanceSheetEnd.equity.totalEquity
    .minus(balanceSheetStart.equity.totalEquity);
  const debtChange = balanceSheetEnd.liabilities.nonCurrentLiabilities
    .minus(balanceSheetStart.liabilities.nonCurrentLiabilities);
  const financingActivities = equityChange.plus(debtChange);

  const netCashChange = operatingActivities.plus(investingActivities).plus(financingActivities);
  const openingCash = balanceSheetStart.currentAssets.cashAndEquivalents;
  const closingCash = openingCash.plus(netCashChange);

  return {
    periodStart: incomeStatement.periodStart,
    periodEnd: incomeStatement.periodEnd,
    tenantId: incomeStatement.tenantId,
    operatingActivities,
    investingActivities,
    financingActivities,
    netCashChange,
    openingCash,
    closingCash,
  };
}
