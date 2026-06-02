// ============================================================
// VAS Chart of Accounts — Hệ thống tài khoản kế toán Việt Nam
// Based on Circular 200/2014/TT-BTC (TT200) for large enterprises
// Reference: Thông tư 200/2014/TT-BTC ngày 22/12/2014
// ============================================================

export interface VASAccount {
  accountNumber: string;
  name: string;
  nameEn: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'CONTRA_ASSET' | 'CONTRA_REVENUE';
  accountGroup: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  level: number;
  parentAccount?: string;
  isSystemAccount: boolean;
}

/**
 * VAS Standard Chart of Accounts — TT200
 * Complete listing of Loại 1 through Loại 9
 */
export const VAS_CHART_OF_ACCOUNTS: VASAccount[] = [
  // ============================================================
  // LOẠI 1 — TÀI SẢN NGẮN HẠN (Current Assets)
  // ============================================================
  { accountNumber: '111', name: 'Tiền mặt', nameEn: 'Cash on hand', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '1111', name: 'Tiền Việt Nam', nameEn: 'VND cash', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '111', isSystemAccount: true },
  { accountNumber: '1112', name: 'Ngoại tệ', nameEn: 'Foreign currency cash', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '111', isSystemAccount: true },
  { accountNumber: '1113', name: 'Vàng tiền tệ', nameEn: 'Monetary gold', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '111', isSystemAccount: false },

  { accountNumber: '112', name: 'Tiền gửi ngân hàng', nameEn: 'Bank deposits', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '1121', name: 'Tiền Việt Nam', nameEn: 'VND bank deposits', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '112', isSystemAccount: true },
  { accountNumber: '1122', name: 'Ngoại tệ', nameEn: 'Foreign currency deposits', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '112', isSystemAccount: true },
  { accountNumber: '1123', name: 'Vàng tiền tệ', nameEn: 'Monetary gold deposits', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '112', isSystemAccount: false },

  { accountNumber: '113', name: 'Tiền đang chuyển', nameEn: 'Cash in transit', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },

  { accountNumber: '121', name: 'Chứng khoán kinh doanh', nameEn: 'Trading securities', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '128', name: 'Đầu tư nắm giữ đến ngày đáo hạn', nameEn: 'Held-to-maturity investments', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },

  { accountNumber: '131', name: 'Phải thu của khách hàng', nameEn: 'Accounts receivable', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '133', name: 'Thuế GTGT được khấu trừ', nameEn: 'Input VAT deductible', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '1331', name: 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', nameEn: 'Input VAT on goods/services', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '133', isSystemAccount: true },
  { accountNumber: '1332', name: 'Thuế GTGT được khấu trừ của TSCĐ', nameEn: 'Input VAT on fixed assets', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 2, parentAccount: '133', isSystemAccount: true },

  { accountNumber: '136', name: 'Phải thu nội bộ', nameEn: 'Internal receivables', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '138', name: 'Phải thu khác', nameEn: 'Other receivables', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '141', name: 'Tạm ứng', nameEn: 'Advances to employees', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },

  { accountNumber: '151', name: 'Hàng mua đang đi đường', nameEn: 'Goods in transit', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '152', name: 'Nguyên liệu, vật liệu', nameEn: 'Raw materials', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '153', name: 'Công cụ, dụng cụ', nameEn: 'Tools and supplies', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '154', name: 'Chi phí SXKD dở dang', nameEn: 'Work in progress', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '155', name: 'Thành phẩm', nameEn: 'Finished goods', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '156', name: 'Hàng hóa', nameEn: 'Merchandise', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '157', name: 'Hàng gửi đi bán', nameEn: 'Goods sent on consignment', accountType: 'ASSET', accountGroup: 'GROUP_1', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },

  // ============================================================
  // LOẠI 2 — TÀI SẢN DÀI HẠN (Non-current Assets)
  // ============================================================
  { accountNumber: '211', name: 'Tài sản cố định hữu hình', nameEn: 'Tangible fixed assets', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '2111', name: 'Nhà cửa, vật kiến trúc', nameEn: 'Buildings', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '211', isSystemAccount: true },
  { accountNumber: '2112', name: 'Máy móc, thiết bị', nameEn: 'Machinery & equipment', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '211', isSystemAccount: true },
  { accountNumber: '2113', name: 'Phương tiện vận tải', nameEn: 'Vehicles', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '211', isSystemAccount: true },
  { accountNumber: '2114', name: 'Thiết bị văn phòng', nameEn: 'Office equipment', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '211', isSystemAccount: true },
  { accountNumber: '2118', name: 'TSCĐ hữu hình khác', nameEn: 'Other tangible fixed assets', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '211', isSystemAccount: false },

  { accountNumber: '212', name: 'Tài sản cố định thuê tài chính', nameEn: 'Finance lease assets', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '213', name: 'Tài sản cố định vô hình', nameEn: 'Intangible fixed assets', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '2131', name: 'Quyền sử dụng đất', nameEn: 'Land use rights', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '213', isSystemAccount: true },
  { accountNumber: '2135', name: 'Phần mềm máy tính', nameEn: 'Computer software', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '213', isSystemAccount: true },
  { accountNumber: '2138', name: 'TSCĐ vô hình khác', nameEn: 'Other intangible assets', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 2, parentAccount: '213', isSystemAccount: false },

  { accountNumber: '214', name: 'Hao mòn TSCĐ', nameEn: 'Accumulated depreciation', accountType: 'CONTRA_ASSET', accountGroup: 'GROUP_2', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '2141', name: 'Hao mòn TSCĐ hữu hình', nameEn: 'Accum. depr. tangible', accountType: 'CONTRA_ASSET', accountGroup: 'GROUP_2', normalBalance: 'CREDIT', level: 2, parentAccount: '214', isSystemAccount: true },
  { accountNumber: '2142', name: 'Hao mòn TSCĐ thuê tài chính', nameEn: 'Accum. depr. finance lease', accountType: 'CONTRA_ASSET', accountGroup: 'GROUP_2', normalBalance: 'CREDIT', level: 2, parentAccount: '214', isSystemAccount: false },
  { accountNumber: '2143', name: 'Hao mòn TSCĐ vô hình', nameEn: 'Accum. amort. intangible', accountType: 'CONTRA_ASSET', accountGroup: 'GROUP_2', normalBalance: 'CREDIT', level: 2, parentAccount: '214', isSystemAccount: true },
  { accountNumber: '2147', name: 'Hao mòn BĐS đầu tư', nameEn: 'Accum. depr. investment property', accountType: 'CONTRA_ASSET', accountGroup: 'GROUP_2', normalBalance: 'CREDIT', level: 2, parentAccount: '214', isSystemAccount: false },

  { accountNumber: '217', name: 'Bất động sản đầu tư', nameEn: 'Investment property', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },

  { accountNumber: '221', name: 'Đầu tư vào công ty con', nameEn: 'Investments in subsidiaries', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '222', name: 'Đầu tư vào công ty liên doanh, liên kết', nameEn: 'Investments in JV/associates', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '228', name: 'Đầu tư khác', nameEn: 'Other investments', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },

  { accountNumber: '229', name: 'Dự phòng tổn thất tài sản', nameEn: 'Provision for asset losses', accountType: 'CONTRA_ASSET', accountGroup: 'GROUP_2', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '241', name: 'Xây dựng cơ bản dở dang', nameEn: 'Construction in progress', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '242', name: 'Chi phí trả trước', nameEn: 'Prepaid expenses', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '243', name: 'Tài sản thuế thu nhập hoãn lại', nameEn: 'Deferred tax assets', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '244', name: 'Cầm cố, thế chấp, ký quỹ, ký cược', nameEn: 'Pledges, mortgages, deposits', accountType: 'ASSET', accountGroup: 'GROUP_2', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },

  // ============================================================
  // LOẠI 3 — NỢ PHẢI TRẢ (Liabilities)
  // ============================================================
  { accountNumber: '331', name: 'Phải trả cho người bán', nameEn: 'Accounts payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '333', name: 'Thuế và các khoản phải nộp Nhà nước', nameEn: 'Taxes payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '3331', name: 'Thuế GTGT phải nộp', nameEn: 'Output VAT payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: true },
  { accountNumber: '33311', name: 'Thuế GTGT đầu ra', nameEn: 'Output VAT', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 3, parentAccount: '3331', isSystemAccount: true },
  { accountNumber: '33312', name: 'Thuế GTGT hàng nhập khẩu', nameEn: 'Import VAT', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 3, parentAccount: '3331', isSystemAccount: false },
  { accountNumber: '3332', name: 'Thuế tiêu thụ đặc biệt', nameEn: 'Special consumption tax', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: false },
  { accountNumber: '3333', name: 'Thuế xuất, nhập khẩu', nameEn: 'Import/export duties', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: false },
  { accountNumber: '3334', name: 'Thuế thu nhập doanh nghiệp', nameEn: 'Corporate income tax', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: true },
  { accountNumber: '3335', name: 'Thuế thu nhập cá nhân', nameEn: 'Personal income tax', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: true },
  { accountNumber: '3336', name: 'Thuế tài nguyên', nameEn: 'Natural resources tax', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: false },
  { accountNumber: '3337', name: 'Thuế nhà đất, tiền thuê đất', nameEn: 'Land/property tax', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: false },
  { accountNumber: '3338', name: 'Thuế khác', nameEn: 'Other taxes', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: false },
  { accountNumber: '3339', name: 'Phí, lệ phí và khoản nộp khác', nameEn: 'Fees and other levies', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '333', isSystemAccount: false },

  { accountNumber: '334', name: 'Phải trả người lao động', nameEn: 'Payroll payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '3341', name: 'Phải trả công nhân viên', nameEn: 'Employee payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '334', isSystemAccount: true },
  { accountNumber: '3348', name: 'Phải trả người lao động khác', nameEn: 'Other labor payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '334', isSystemAccount: false },

  { accountNumber: '335', name: 'Chi phí phải trả', nameEn: 'Accrued expenses', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '336', name: 'Phải trả nội bộ', nameEn: 'Internal payables', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '337', name: 'Thanh toán theo tiến độ kế hoạch HĐXD', nameEn: 'Construction contract progress billings', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '338', name: 'Phải trả, phải nộp khác', nameEn: 'Other payables', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '3381', name: 'Tài sản thừa chờ giải quyết', nameEn: 'Surplus assets pending resolution', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: false },
  { accountNumber: '3382', name: 'Kinh phí công đoàn', nameEn: 'Union fund', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: true },
  { accountNumber: '3383', name: 'Bảo hiểm xã hội', nameEn: 'Social insurance', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: true },
  { accountNumber: '3384', name: 'Bảo hiểm y tế', nameEn: 'Health insurance', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: true },
  { accountNumber: '3385', name: 'Phải trả về cổ phần hóa', nameEn: 'Equitization payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: false },
  { accountNumber: '3386', name: 'Bảo hiểm thất nghiệp', nameEn: 'Unemployment insurance', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: true },
  { accountNumber: '3387', name: 'Doanh thu chưa thực hiện', nameEn: 'Unearned revenue', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: false },
  { accountNumber: '3388', name: 'Phải trả, phải nộp khác', nameEn: 'Other payables', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '338', isSystemAccount: false },

  { accountNumber: '341', name: 'Vay và nợ thuê tài chính', nameEn: 'Borrowings and finance leases', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '3411', name: 'Các khoản đi vay', nameEn: 'Borrowings', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '341', isSystemAccount: true },
  { accountNumber: '3412', name: 'Nợ thuê tài chính', nameEn: 'Finance lease liabilities', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 2, parentAccount: '341', isSystemAccount: false },

  { accountNumber: '343', name: 'Trái phiếu phát hành', nameEn: 'Bonds payable', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '344', name: 'Nhận ký quỹ, ký cược', nameEn: 'Deposits received', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '347', name: 'Thuế thu nhập hoãn lại phải trả', nameEn: 'Deferred tax liabilities', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '352', name: 'Dự phòng phải trả', nameEn: 'Provisions', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '353', name: 'Quỹ khen thưởng, phúc lợi', nameEn: 'Bonus and welfare fund', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '356', name: 'Quỹ phát triển khoa học và công nghệ', nameEn: 'R&D fund', accountType: 'LIABILITY', accountGroup: 'GROUP_3', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },

  // ============================================================
  // LOẠI 4 — VỐN CHỦ SỞ HỮU (Equity)
  // ============================================================
  { accountNumber: '411', name: 'Vốn đầu tư của chủ sở hữu', nameEn: 'Owner\'s equity', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '4111', name: 'Vốn góp của chủ sở hữu', nameEn: 'Contributed capital', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 2, parentAccount: '411', isSystemAccount: true },
  { accountNumber: '4112', name: 'Thặng dư vốn cổ phần', nameEn: 'Share premium', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 2, parentAccount: '411', isSystemAccount: false },
  { accountNumber: '4113', name: 'Quyền chọn chuyển đổi trái phiếu', nameEn: 'Convertible bond options', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 2, parentAccount: '411', isSystemAccount: false },
  { accountNumber: '4118', name: 'Vốn khác', nameEn: 'Other capital', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 2, parentAccount: '411', isSystemAccount: false },

  { accountNumber: '412', name: 'Chênh lệch đánh giá lại tài sản', nameEn: 'Revaluation surplus', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '413', name: 'Chênh lệch tỷ giá hối đoái', nameEn: 'Foreign exchange differences', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '414', name: 'Quỹ đầu tư phát triển', nameEn: 'Development investment fund', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '417', name: 'Quỹ dự phòng tài chính', nameEn: 'Financial reserve fund', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '418', name: 'Các quỹ khác thuộc vốn chủ sở hữu', nameEn: 'Other equity funds', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: false },
  { accountNumber: '419', name: 'Cổ phiếu quỹ', nameEn: 'Treasury shares', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '421', name: 'Lợi nhuận sau thuế chưa phân phối', nameEn: 'Retained earnings', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '4211', name: 'Lợi nhuận sau thuế chưa phân phối năm trước', nameEn: 'Prior year retained earnings', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 2, parentAccount: '421', isSystemAccount: true },
  { accountNumber: '4212', name: 'Lợi nhuận sau thuế chưa phân phối năm nay', nameEn: 'Current year retained earnings', accountType: 'EQUITY', accountGroup: 'GROUP_4', normalBalance: 'CREDIT', level: 2, parentAccount: '421', isSystemAccount: true },

  // ============================================================
  // LOẠI 5 — DOANH THU (Revenue)
  // ============================================================
  { accountNumber: '511', name: 'Doanh thu bán hàng và cung cấp dịch vụ', nameEn: 'Revenue from sales & services', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '5111', name: 'Doanh thu bán hàng hóa', nameEn: 'Sales of goods', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 2, parentAccount: '511', isSystemAccount: true },
  { accountNumber: '5112', name: 'Doanh thu bán thành phẩm', nameEn: 'Sales of finished goods', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 2, parentAccount: '511', isSystemAccount: true },
  { accountNumber: '5113', name: 'Doanh thu cung cấp dịch vụ', nameEn: 'Service revenue', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 2, parentAccount: '511', isSystemAccount: true },
  { accountNumber: '5114', name: 'Doanh thu trợ cấp, trợ giá', nameEn: 'Subsidized revenue', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 2, parentAccount: '511', isSystemAccount: false },
  { accountNumber: '5117', name: 'Doanh thu kinh doanh bất động sản', nameEn: 'Real estate revenue', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 2, parentAccount: '511', isSystemAccount: false },
  { accountNumber: '5118', name: 'Doanh thu khác', nameEn: 'Other revenue', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 2, parentAccount: '511', isSystemAccount: false },

  { accountNumber: '515', name: 'Doanh thu hoạt động tài chính', nameEn: 'Financial income', accountType: 'REVENUE', accountGroup: 'GROUP_5', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
  { accountNumber: '521', name: 'Các khoản giảm trừ doanh thu', nameEn: 'Revenue deductions', accountType: 'CONTRA_REVENUE', accountGroup: 'GROUP_5', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '5211', name: 'Chiết khấu thương mại', nameEn: 'Trade discounts', accountType: 'CONTRA_REVENUE', accountGroup: 'GROUP_5', normalBalance: 'DEBIT', level: 2, parentAccount: '521', isSystemAccount: true },
  { accountNumber: '5212', name: 'Hàng bán bị trả lại', nameEn: 'Sales returns', accountType: 'CONTRA_REVENUE', accountGroup: 'GROUP_5', normalBalance: 'DEBIT', level: 2, parentAccount: '521', isSystemAccount: true },
  { accountNumber: '5213', name: 'Giảm giá hàng bán', nameEn: 'Sales allowances', accountType: 'CONTRA_REVENUE', accountGroup: 'GROUP_5', normalBalance: 'DEBIT', level: 2, parentAccount: '521', isSystemAccount: true },

  // ============================================================
  // LOẠI 6 — CHI PHÍ SẢN XUẤT KINH DOANH (Operating Expenses)
  // ============================================================
  { accountNumber: '621', name: 'Chi phí nguyên liệu, vật liệu trực tiếp', nameEn: 'Direct material costs', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '622', name: 'Chi phí nhân công trực tiếp', nameEn: 'Direct labor costs', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '623', name: 'Chi phí sử dụng máy thi công', nameEn: 'Construction machinery costs', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '627', name: 'Chi phí sản xuất chung', nameEn: 'Manufacturing overhead', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '6271', name: 'Chi phí nhân viên phân xưởng', nameEn: 'Factory staff costs', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 2, parentAccount: '627', isSystemAccount: true },
  { accountNumber: '6272', name: 'Chi phí vật liệu', nameEn: 'Factory materials', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 2, parentAccount: '627', isSystemAccount: true },
  { accountNumber: '6273', name: 'Chi phí dụng cụ sản xuất', nameEn: 'Factory tools', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 2, parentAccount: '627', isSystemAccount: true },
  { accountNumber: '6274', name: 'Chi phí khấu hao TSCĐ', nameEn: 'Factory depreciation', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 2, parentAccount: '627', isSystemAccount: true },
  { accountNumber: '6277', name: 'Chi phí dịch vụ mua ngoài', nameEn: 'Outsourced services', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 2, parentAccount: '627', isSystemAccount: true },
  { accountNumber: '6278', name: 'Chi phí bằng tiền khác', nameEn: 'Other factory overhead', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 2, parentAccount: '627', isSystemAccount: true },

  { accountNumber: '631', name: 'Giá thành sản xuất', nameEn: 'Cost of production', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: false },
  { accountNumber: '632', name: 'Giá vốn hàng bán', nameEn: 'Cost of goods sold', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '635', name: 'Chi phí tài chính', nameEn: 'Financial expenses', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '641', name: 'Chi phí bán hàng', nameEn: 'Selling expenses', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '642', name: 'Chi phí quản lý doanh nghiệp', nameEn: 'General & admin expenses', accountType: 'EXPENSE', accountGroup: 'GROUP_6', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },

  // ============================================================
  // LOẠI 7 — THU NHẬP KHÁC (Other Income)
  // ============================================================
  { accountNumber: '711', name: 'Thu nhập khác', nameEn: 'Other income', accountType: 'REVENUE', accountGroup: 'GROUP_7', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },

  // ============================================================
  // LOẠI 8 — CHI PHÍ KHÁC (Other Expenses)
  // ============================================================
  { accountNumber: '811', name: 'Chi phí khác', nameEn: 'Other expenses', accountType: 'EXPENSE', accountGroup: 'GROUP_8', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '821', name: 'Chi phí thuế thu nhập doanh nghiệp', nameEn: 'CIT expense', accountType: 'EXPENSE', accountGroup: 'GROUP_8', normalBalance: 'DEBIT', level: 1, isSystemAccount: true },
  { accountNumber: '8211', name: 'Chi phí thuế TNDN hiện hành', nameEn: 'Current CIT expense', accountType: 'EXPENSE', accountGroup: 'GROUP_8', normalBalance: 'DEBIT', level: 2, parentAccount: '821', isSystemAccount: true },
  { accountNumber: '8212', name: 'Chi phí thuế TNDN hoãn lại', nameEn: 'Deferred CIT expense', accountType: 'EXPENSE', accountGroup: 'GROUP_8', normalBalance: 'DEBIT', level: 2, parentAccount: '821', isSystemAccount: false },

  // ============================================================
  // LOẠI 9 — XÁC ĐỊNH KẾT QUẢ KINH DOANH (P&L Determination)
  // ============================================================
  { accountNumber: '911', name: 'Xác định kết quả kinh doanh', nameEn: 'Income summary', accountType: 'EQUITY', accountGroup: 'GROUP_9', normalBalance: 'CREDIT', level: 1, isSystemAccount: true },
];

/**
 * Get VAS accounts filtered by group
 */
export function getAccountsByGroup(group: string): VASAccount[] {
  return VAS_CHART_OF_ACCOUNTS.filter(a => a.accountGroup === group);
}

/**
 * Get account by number
 */
export function getAccountByNumber(accountNumber: string): VASAccount | undefined {
  return VAS_CHART_OF_ACCOUNTS.find(a => a.accountNumber === accountNumber);
}

/**
 * Get all top-level (parent) accounts
 */
export function getParentAccounts(): VASAccount[] {
  return VAS_CHART_OF_ACCOUNTS.filter(a => a.level === 1);
}

/**
 * Get child accounts for a given parent
 */
export function getChildAccounts(parentAccountNumber: string): VASAccount[] {
  return VAS_CHART_OF_ACCOUNTS.filter(a => a.parentAccount === parentAccountNumber);
}

/**
 * Total accounts in the chart
 */
export const VAS_TOTAL_ACCOUNTS = VAS_CHART_OF_ACCOUNTS.length;
