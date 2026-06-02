import { Injectable } from '@nestjs/common';

export interface CategoryValue {
  value: string;
  label: string;
}

export interface CategoryType {
  type: string;
  label: string;
  description: string;
  count: number;
}

@Injectable()
export class CategoriesService {
  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ALL CATEGORY TYPES
  // ═══════════════════════════════════════════════════════════════════════════
  getAllCategoryTypes(): CategoryType[] {
    return [
      {
        type: 'channels',
        label: 'Channels',
        description: 'Distribution channels for trade promotions (MT, GT, etc.)',
        count: this.getChannels().length,
      },
      {
        type: 'templates',
        label: 'Template Categories',
        description: 'Promotion template categories (Seasonal, Display, etc.)',
        count: this.getTemplates().length,
      },
      {
        type: 'deductions',
        label: 'Deduction Categories',
        description: 'Deduction classification categories for trade deductions',
        count: this.getDeductions().length,
      },
      {
        type: 'files',
        label: 'File Categories',
        description: 'Document and file classification types',
        count: this.getFiles().length,
      },
      {
        type: 'accounts',
        label: 'GL Account Types',
        description: 'General Ledger account classification types',
        count: this.getAccounts().length,
      },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANNEL ENUM VALUES
  // ═══════════════════════════════════════════════════════════════════════════
  getChannels(): CategoryValue[] {
    return [
      { value: 'MT', label: 'Modern Trade' },
      { value: 'GT', label: 'General Trade' },
      { value: 'ECOMMERCE', label: 'E-Commerce' },
      { value: 'HORECA', label: 'HoReCa' },
      { value: 'OTHER', label: 'Other' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE CATEGORY ENUM VALUES
  // ═══════════════════════════════════════════════════════════════════════════
  getTemplates(): CategoryValue[] {
    return [
      { value: 'SEASONAL', label: 'Seasonal' },
      { value: 'DISPLAY', label: 'Display' },
      { value: 'LISTING', label: 'Listing' },
      { value: 'REBATE', label: 'Rebate' },
      { value: 'CUSTOM', label: 'Custom' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEDUCTION CATEGORY ENUM VALUES
  // ═══════════════════════════════════════════════════════════════════════════
  getDeductions(): CategoryValue[] {
    return [
      { value: 'TRADE_PROMOTION', label: 'Trade Promotion' },
      { value: 'PRICING', label: 'Pricing' },
      { value: 'LOGISTICS', label: 'Logistics' },
      { value: 'QUALITY', label: 'Quality' },
      { value: 'ADVERTISING', label: 'Advertising' },
      { value: 'OTHER', label: 'Other' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE CATEGORY ENUM VALUES
  // ═══════════════════════════════════════════════════════════════════════════
  getFiles(): CategoryValue[] {
    return [
      { value: 'POA', label: 'POA' },
      { value: 'POP', label: 'POP' },
      { value: 'INVOICE', label: 'Invoice' },
      { value: 'CONTRACT', label: 'Contract' },
      { value: 'REPORT', label: 'Report' },
      { value: 'OTHER', label: 'Other' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GL ACCOUNT TYPE ENUM VALUES
  // ═══════════════════════════════════════════════════════════════════════════
  getAccounts(): CategoryValue[] {
    return [
      { value: 'ASSET', label: 'Asset' },
      { value: 'LIABILITY', label: 'Liability' },
      { value: 'EQUITY', label: 'Equity' },
      { value: 'REVENUE', label: 'Revenue' },
      { value: 'EXPENSE', label: 'Expense' },
    ];
  }
}
