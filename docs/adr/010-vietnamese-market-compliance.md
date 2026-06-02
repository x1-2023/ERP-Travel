# ADR-010: Vietnamese Market Compliance Built-In

**Trạng thái / Status**: Accepted
**Ngày / Date**: 2026-03-29
**Người quyết định / Deciders**: VietERP Core Team

## Bối cảnh / Context

VietERP is positioned as a Vietnam-first ERP solution. Vietnamese businesses require compliance with:
- Thông tư 200/2014/TT-BCT (TT200): Accounting software requirements
  - Digital signature capability
  - Invoice numbering and archival
  - Account code requirements (standard chart of accounts)
- Thông tư 78/2014/TT-BTC: Tax accounting requirements for VAT
  - Input/output VAT tracking
  - VAT invoice requirements
  - Deduction limitations
- Nghị định 123/2020/NĐ-CP (NĐ123): E-invoice regulations
  - Digital signature on invoices
  - Submission to tax authority within 30 days
  - Invoice status tracking (issued, submitted, adjusted)
- BHXH Requirements: Social insurance and health insurance integration
  - Payroll deductions for employee insurance
  - Monthly reporting to insurance authorities
  - Contribution tracking per employee
- Currency: All amounts in Vietnamese Dong (VND), no multi-currency initially
- Language: Vietnamese UI and documentation
- Business Registration: Integration with Vietnam Business Registry (future)

VietERP được định vị là giải pháp ERP hướng tới Việt Nam. Các doanh nghiệp Việt Nam yêu cầu tuân thủ với:
- Thông tư 200/2014/TT-BCT (TT200): Yêu cầu phần mềm kế toán
  - Khả năng ký chữ ký kỹ thuật số
  - Đánh số hóa đơn và lưu trữ
  - Yêu cầu mã tài khoản
- Thông tư 78/2014/TT-BTC: Yêu cầu kế toán thuế cho VAT
  - Theo dõi VAT đầu vào/đầu ra
  - Yêu cầu hóa đơn VAT
  - Giới hạn khấu trừ
- Nghị định 123/2020/NĐ-CP (NĐ123): Quy định hóa đơn điện tử
  - Chữ ký số trên hóa đơn
  - Nộp cho cơ quan thuế trong vòng 30 ngày
  - Theo dõi trạng thái hóa đơn
- Yêu cầu BHXH: Tích hợp bảo hiểm xã hội
  - Khấu trừ lương cho bảo hiểm nhân viên
  - Báo cáo hàng tháng cho cơ quan bảo hiểm
  - Theo dõi đóng góp cho mỗi nhân viên
- Tiền tệ: Tất cả số tiền tính bằng Đồng Việt Nam (VND)
- Ngôn ngữ: Giao diện tiếng Việt và tài liệu

Building compliance into the core product rather than as add-ons ensures reliability and reduces future maintenance burden.

## Quyết định / Decision

**Build Vietnamese compliance features directly into VietERP** rather than as optional plugins.

Xây dựng **các tính năng tuân thủ tiếng Việt trực tiếp vào VietERP** thay vì làm plugin tùy chọn.

**Implementation**:
- TT200 Module: Digital signature service, invoice storage, account code mapping
- TT200 Module: Dịch vụ chữ ký kỹ thuật số, lưu trữ hóa đơn, ánh xạ mã tài khoản
- NĐ123 Module: E-invoice generation, status tracking, tax authority submission integration
- NĐ123 Module: Tạo hóa đơn điện tử, theo dõi trạng thái, tích hợp nộp cơ quan thuế
- VAT Module: Input/output VAT tracking, VAT invoice requirements, compliance checks
- VAT Module: Theo dõi VAT đầu vào/đầu ra, yêu cầu hóa đơn VAT
- BHXH Module: Payroll insurance deductions, monthly reporting templates
- BHXH Module: Khấu trừ bảo hiểm lương, mẫu báo cáo hàng tháng
- Vietnamese Localization: Language, date format (DD/MM/YYYY), currency formatting
- Vietnamese Localization: Ngôn ngữ, định dạng ngày (DD/MM/YYYY), định dạng tiền tệ
- Audit Logging: All accounting events logged per TT200 requirements
- Audit Logging: Tất cả các sự kiện kế toán được ghi lại theo yêu cầu TT200

**Configuration**:
- `packages/compliance-vn/` for all Vietnamese-specific logic
- `apps/accounting/` integrates compliance modules
- Type-safe enums for: VAT categories, invoice status, BHXH contribution types
- API endpoints: `/api/invoices/e-invoice`, `/api/vat-reports`, `/api/bhxh-reports`

**Cấu hình**:
- `packages/compliance-vn/` cho tất cả logic cụ thể tiếng Việt
- `apps/accounting/` tích hợp các mô-đun tuân thủ
- Enum an toàn kiểu cho: Danh mục VAT, trạng thái hóa đơn
- Điểm cuối API: `/api/invoices/e-invoice`, `/api/vat-reports`, `/api/bhxh-reports`

## Phương án thay thế / Alternatives Considered

### Plugin System for Compliance
- Pros: Modularity, easier to update independently
- Cons: Fragmented architecture, late-stage bolting on, support complexity
- **Rejected**: Core product should include core requirements

### Third-Party Compliance API
- Pros: Don't maintain compliance; delegated to specialists
- Cons: Vendor lock-in, additional cost per organization, API latency
- **Rejected**: VietERP's competitive advantage includes compliance expertise

### Manual Compliance Workflows
- Pros: Simplest MVP
- Cons: User errors, incomplete audit trails, non-compliant documents
- **Rejected**: Regulatory risk; automation essential

## Hệ quả / Consequences

### Tích cực / Positive

1. **Regulatory Compliance**: Built-in TT200, NĐ123, BHXH support from day one
   - Tuân thủ quy định: Hỗ trợ TT200, NĐ123, BHXH tích hợp sẵn
2. **Market Fit**: Vietnamese businesses immediately compliant without extra setup
   - Phù hợp thị trường: Doanh nghiệp Việt Nam ngay lập tức tuân thủ
3. **Competitive Advantage**: Built-in compliance vs. competitors' add-ons
   - Lợi thế cạnh tranh: Tuân thủ tích hợp so với tính năng bổ sung của đối thủ
4. **Audit Trail**: Automatic logging satisfies TT200 documentation requirements
   - Dấu vết kiểm toán: Ghi nhật ký tự động thỏa mãn yêu cầu tài liệu TT200
5. **Reduced User Error**: Compliance checks prevent invalid transactions
   - Giảm lỗi người dùng: Kiểm tra tuân thủ ngăn chặn giao dịch không hợp lệ
6. **Regulatory Updates**: Changes to TT200, NĐ123 trigger product updates
   - Cập nhật quy định: Thay đổi đối với TT200, NĐ123 kích hoạt cập nhật sản phẩm

### Tiêu cực / Negative

1. **Development Complexity**: Compliance code intertwined with business logic
   - Độ phức tạp phát triển: Mã tuân thủ liên kết với logic kinh doanh
2. **Maintenance Burden**: Regulatory changes require product updates and deployments
   - Gánh nặng bảo trì: Thay đổi quy định yêu cầu cập nhật sản phẩm
3. **Testing Overhead**: Complex compliance scenarios require extensive test coverage
   - Overhead kiểm tra: Các kịch bản tuân thủ phức tạp yêu cầu độ bao phủ kiểm tra rộng
4. **Knowledge Requirements**: Team must maintain Vietnamese tax/accounting expertise
   - Yêu cầu kiến thức: Nhóm phải duy trì kiến thức thuế/kế toán tiếng Việt
5. **Future Localization Cost**: Other countries' requirements become harder to add
   - Chi phí địa phương hóa trong tương lai: Yêu cầu của các quốc gia khác trở nên khó hơn

## Tham khảo / References

- [Thông tư 200/2014/TT-BCT (TT200)](https://thuvienphapluat.vn/van-ban/Thue/Thong-tu-200-2014-TT-BCT-Quy-trinh-them-sua-xoa-du-lieu-phan-mem-ke-toan-119779.aspx)
- [Thông tư 78/2014/TT-BTC (VAT)](https://thuvienphapluat.vn/van-ban/Thue/Thong-tu-78-2014-TT-BTC-huong-dan-Luat-Gia-tri-gia-tang-4558.aspx)
- [Nghị định 123/2020/NĐ-CP (NĐ123 - E-Invoice)](https://thuvienphapluat.vn/van-ban/Thue/Nghi-dinh-123-2020-ND-CP-hoa-don-dien-tu-467246.aspx)
- [BHXH Integration Guidelines](https://www.bhxh.gov.vn/)
- VietERP Compliance: `packages/compliance-vn/`, `apps/accounting/`, `libs/vn-localization/`

---

**Ảnh hưởng đến / Impacts**:
- Product Architecture
- Feature Development Roadmap
- Quality Assurance and Testing Strategy
- Regulatory Risk Management
- Go-to-Market Strategy for Vietnamese Market
- Localization for Future Markets
