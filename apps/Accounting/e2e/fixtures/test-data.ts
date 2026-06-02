/**
 * Test data factory for Accounting module E2E tests.
 * Provides Vietnamese accounting data according to TT200 standards.
 */

export const TEST_PREFIX = '[E2E-ACC]'

/**
 * Vietnamese Chart of Accounts data (TT200 compliant)
 */
export const chartOfAccounts = {
  cash: {
    code: '111',
    name: 'Tiền mặt',
    accountType: 'ASSET',
    description: 'Tiền mặt tại quỹ',
  },
  bankDeposit: {
    code: '112',
    name: 'Tiền gửi Ngân hàng',
    accountType: 'ASSET',
    description: 'Tiền gửi tại các ngân hàng',
  },
  accountsReceivable: {
    code: '131',
    name: 'Phải thu khách hàng',
    accountType: 'ASSET',
    description: 'Các khoản phải thu từ khách hàng',
  },
  accountsPayable: {
    code: '331',
    name: 'Phải trả nhà cung cấp',
    accountType: 'LIABILITY',
    description: 'Các khoản phải trả cho nhà cung cấp',
  },
  revenue: {
    code: '511',
    name: 'Doanh thu bán hàng',
    accountType: 'REVENUE',
    description: 'Doanh thu từ bán hàng hóa',
  },
  costOfGoods: {
    code: '632',
    name: 'Giá vốn hàng bán',
    accountType: 'EXPENSE',
    description: 'Giá vốn của hàng bán',
  },
}

/**
 * Sample journal entry data
 */
export function createJournalEntryData() {
  const timestamp = Date.now()
  return {
    date: new Date().toISOString().split('T')[0],
    description: `${TEST_PREFIX} Bút toán kiểm tra ${timestamp}`,
    entries: [
      {
        account: '111', // Cash
        debit: 1000000,
        credit: 0,
        description: 'Tiền mặt vào',
      },
      {
        account: '112', // Bank Deposit
        debit: 0,
        credit: 1000000,
        description: 'Tiền gửi ngân hàng',
      },
    ],
  }
}

/**
 * Sample invoice data (Sales Invoice)
 */
export function createSalesInvoiceData() {
  const timestamp = Date.now()
  return {
    invoiceNo: `${TEST_PREFIX}-BH-${timestamp}`,
    date: new Date().toISOString().split('T')[0],
    customerName: `${TEST_PREFIX} Khách hàng ABC`,
    customerTaxId: '0123456789',
    customerAddress: '123 Đường ABC, TP. Hồ Chí Minh',
    items: [
      {
        description: 'Sản phẩm A',
        quantity: 10,
        unitPrice: 100000,
        amount: 1000000,
      },
    ],
    totalAmount: 1000000,
    totalTax: 100000,
    totalWithTax: 1100000,
  }
}

/**
 * Sample invoice data (Purchase Invoice)
 */
export function createPurchaseInvoiceData() {
  const timestamp = Date.now()
  return {
    invoiceNo: `${TEST_PREFIX}-MH-${timestamp}`,
    date: new Date().toISOString().split('T')[0],
    supplierName: `${TEST_PREFIX} Nhà cung cấp XYZ`,
    supplierTaxId: '9876543210',
    supplierAddress: '456 Đường XYZ, TP. Hồ Chí Minh',
    items: [
      {
        description: 'Nguyên vật liệu B',
        quantity: 5,
        unitPrice: 200000,
        amount: 1000000,
      },
    ],
    totalAmount: 1000000,
    totalTax: 100000,
    totalWithTax: 1100000,
  }
}

/**
 * Sample tax declaration data
 */
export function createTaxDeclarationData() {
  const timestamp = Date.now()
  return {
    period: new Date().toISOString().split('-').slice(0, 2).join('-'), // YYYY-MM
    type: 'VAT',
    salesInvoices: {
      quantity: 5,
      totalAmount: 10000000,
    },
    purchaseInvoices: {
      quantity: 3,
      totalAmount: 5000000,
    },
    totalVatOutput: 1000000,
    totalVatInput: 500000,
    totalVatPayable: 500000,
  }
}

/**
 * Sample bank statement data
 */
export function createBankStatementData() {
  const timestamp = Date.now()
  return {
    bankName: 'Ngân hàng Vietcombank',
    accountNumber: '0123456789',
    statementDate: new Date().toISOString().split('T')[0],
    openingBalance: 5000000,
    closingBalance: 7500000,
    transactions: [
      {
        date: new Date().toISOString().split('T')[0],
        description: `${TEST_PREFIX} Tiền vào từ khách hàng`,
        amount: 2500000,
        type: 'CREDIT',
      },
    ],
  }
}

/**
 * Sample budget data
 */
export function createBudgetData() {
  const year = new Date().getFullYear()
  return {
    year,
    accounts: [
      {
        account: '632', // Cost of goods
        budgetAmount: 10000000,
        description: `${TEST_PREFIX} Ngân sách COGS ${year}`,
      },
    ],
  }
}

/**
 * Account codes for common usage
 */
export const ACCOUNT_CODES = {
  CASH: '111',
  BANK: '112',
  RECEIVABLE: '131',
  PAYABLE: '331',
  REVENUE: '511',
  COGS: '632',
}
