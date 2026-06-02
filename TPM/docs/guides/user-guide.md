# User Guide - Trade Promotion Management System

## Giới thiệu / Introduction

Hệ thống Quản lý Khuyến mãi Thương mại (TPM) giúp doanh nghiệp quản lý toàn bộ quy trình khuyến mãi từ lập kế hoạch đến quyết toán.

The Trade Promotion Management System helps businesses manage the entire promotion lifecycle from planning to settlement.

---

## Mục lục / Table of Contents

1. [Bắt đầu / Getting Started](#bắt-đầu--getting-started)
2. [Dashboard](#dashboard)
3. [Quản lý Khuyến mãi / Promotion Management](#quản-lý-khuyến-mãi--promotion-management)
4. [Quy trình Duyệt / Approval Workflow](#quy-trình-duyệt--approval-workflow)
5. [Quản lý Claims](#quản-lý-claims)
6. [Tài chính / Finance](#tài-chính--finance)
7. [Báo cáo / Reports](#báo-cáo--reports)
8. [AI Insights](#ai-insights)

---

## Bắt đầu / Getting Started

### Đăng nhập / Login

1. Truy cập hệ thống tại URL được cung cấp
2. Nhập email và mật khẩu
3. Nhấn "Đăng nhập"

**Lưu ý**: Sau 5 lần đăng nhập sai, tài khoản sẽ bị khóa trong 5 phút.

### Giao diện chính / Main Interface

```
┌─────────────────────────────────────────────────────────┐
│  Logo    Search...              🔔  👤 Nguyen Van A ▼  │
├─────────┬───────────────────────────────────────────────┤
│         │                                               │
│ 📊 Dashboard │      Main Content Area                  │
│ 📋 Promotions│                                         │
│ 📄 Claims    │                                         │
│ 💰 Finance   │                                         │
│ 📈 Reports   │                                         │
│ 🤖 AI        │                                         │
│ ⚙️ Settings  │                                         │
│         │                                               │
└─────────┴───────────────────────────────────────────────┘
```

---

## Dashboard

Dashboard hiển thị tổng quan các chỉ số quan trọng:

### Các Widget chính

| Widget | Mô tả |
|--------|-------|
| **Tổng ngân sách** | Ngân sách được phân bổ và đã sử dụng |
| **Khuyến mãi hoạt động** | Số lượng chương trình đang chạy |
| **Claims chờ xử lý** | Claims cần duyệt hoặc xử lý |
| **ROI trung bình** | Hiệu quả đầu tư khuyến mãi |

### Biểu đồ

- **Xu hướng doanh số**: So sánh doanh số có/không khuyến mãi
- **Phân bổ ngân sách**: Theo khu vực, kênh, sản phẩm
- **Tiến độ mục tiêu**: % hoàn thành mục tiêu theo tháng

### Bộ lọc

- **Khoảng thời gian**: Tuần này, tháng này, quý này, năm
- **Khu vực**: Miền Bắc, Miền Trung, Miền Nam
- **Kênh**: GT, MT, Horeca

---

## Quản lý Khuyến mãi / Promotion Management

### Tạo khuyến mãi mới

1. Vào **Promotions** → **Tạo mới**
2. Điền thông tin cơ bản:

| Trường | Mô tả | Bắt buộc |
|--------|-------|----------|
| Tên khuyến mãi | Tên chương trình | ✅ |
| Mã khuyến mãi | Mã định danh duy nhất | ✅ |
| Loại | Discount, Rebate, POSM, Display... | ✅ |
| Ngày bắt đầu | Ngày hiệu lực | ✅ |
| Ngày kết thúc | Ngày kết thúc | ✅ |
| Ngân sách | Tổng ngân sách chương trình | ✅ |
| Mô tả | Chi tiết chương trình | |

3. Chọn đối tượng áp dụng:
   - **Khu vực**: Chọn vùng địa lý
   - **Kênh**: Chọn kênh bán hàng
   - **Khách hàng**: Chọn nhà phân phối, đại lý

4. Thiết lập cơ chế:
   - **Mục tiêu doanh số**: Baseline và target
   - **Tỷ lệ chiết khấu**: % hoặc số tiền cố định
   - **Điều kiện**: Điều kiện để được hưởng

5. Nhấn **Lưu nháp** hoặc **Gửi duyệt**

### Các loại khuyến mãi

#### Discount (Chiết khấu)
- Giảm giá trực tiếp trên hóa đơn
- Áp dụng theo % hoặc số tiền

#### Rebate (Thưởng doanh số)
- Thưởng khi đạt mục tiêu
- Tính cuối kỳ

#### Display (Trưng bày)
- Hỗ trợ trưng bày sản phẩm
- Yêu cầu hình ảnh xác nhận

#### POSM (Vật phẩm quảng cáo)
- Cung cấp POSM miễn phí
- Theo dõi số lượng

### Trạng thái khuyến mãi

```
Draft ──▶ Pending ──▶ Approved ──▶ Active ──▶ Completed
   │         │            │
   │         ▼            │
   │      Rejected        │
   │         │            │
   └─────────┴────────────┴──▶ Cancelled
```

| Trạng thái | Mô tả | Hành động có thể |
|------------|-------|------------------|
| Draft | Bản nháp | Sửa, Xóa, Gửi duyệt |
| Pending | Chờ duyệt | Duyệt, Từ chối |
| Approved | Đã duyệt | Kích hoạt, Hủy |
| Active | Đang chạy | Hoàn thành, Hủy |
| Completed | Hoàn thành | Xem báo cáo |
| Rejected | Bị từ chối | Sửa và gửi lại |
| Cancelled | Đã hủy | Không có |

---

## Quy trình Duyệt / Approval Workflow

### Cấp duyệt

1. **Cấp 1 - ASM**: Ngân sách < 50 triệu
2. **Cấp 2 - RSM**: Ngân sách 50-200 triệu
3. **Cấp 3 - NSM**: Ngân sách > 200 triệu

### Duyệt khuyến mãi

1. Vào **Promotions** → **Chờ duyệt**
2. Chọn khuyến mãi cần duyệt
3. Xem chi tiết và đánh giá
4. Chọn **Duyệt** hoặc **Từ chối**
5. Nhập ghi chú (bắt buộc khi từ chối)

### Thông báo

- Email thông báo khi có khuyến mãi chờ duyệt
- Push notification trên hệ thống
- Nhắc nhở sau 24h nếu chưa xử lý

---

## Quản lý Claims

### Tạo Claim

1. Vào **Claims** → **Tạo mới**
2. Chọn khuyến mãi liên quan
3. Chọn khách hàng
4. Nhập thông tin claim:

| Trường | Mô tả |
|--------|-------|
| Kỳ claim | Tháng/quý áp dụng |
| Doanh số thực tế | Doanh số đạt được |
| Số tiền claim | Số tiền yêu cầu |
| Ghi chú | Thông tin bổ sung |

5. Đính kèm chứng từ:
   - Báo cáo doanh số
   - Hóa đơn
   - Hình ảnh (nếu cần)

6. Nhấn **Gửi claim**

### Xử lý Claim

#### Đối với nhân viên kinh doanh
1. Tạo và gửi claim
2. Theo dõi trạng thái
3. Bổ sung thông tin nếu cần

#### Đối với người duyệt
1. Kiểm tra thông tin claim
2. Xác minh chứng từ
3. Duyệt hoặc từ chối

#### Đối với kế toán
1. Kiểm tra claim đã duyệt
2. Tạo bút toán
3. Đối chiếu và quyết toán

### Trạng thái Claim

| Trạng thái | Mô tả |
|------------|-------|
| Submitted | Đã gửi, chờ xử lý |
| Under Review | Đang kiểm tra |
| Approved | Đã duyệt |
| Rejected | Bị từ chối |
| Processing | Đang xử lý thanh toán |
| Paid | Đã thanh toán |

---

## Tài chính / Finance

### Accruals (Dự phòng)

Theo dõi dự phòng chi phí khuyến mãi:

1. **Xem Accruals**: Finance → Accruals
2. **Tạo Accrual**: Tự động từ khuyến mãi hoặc tạo thủ công
3. **Điều chỉnh**: Cập nhật số liệu khi có thay đổi

### Deductions (Khấu trừ)

Quản lý các khoản khấu trừ:

1. **Nhập Deduction**: Finance → Deductions → Tạo mới
2. **Matching**: Đối chiếu với Claims
3. **Reconcile**: Hoàn tất đối chiếu

### Journals (Bút toán)

Tạo và quản lý bút toán kế toán:

```
Debit:  Chi phí khuyến mãi (641)
Credit: Phải trả khách hàng (331)
```

### Báo cáo tài chính

- **Tổng hợp chi phí**: Theo kỳ, khu vực, kênh
- **Đối chiếu**: Claims vs Deductions
- **Aging**: Phân tích tuổi nợ

---

## Báo cáo / Reports

### Báo cáo có sẵn

| Báo cáo | Mô tả |
|---------|-------|
| Promotion Performance | Hiệu quả từng chương trình |
| ROI Analysis | Phân tích ROI |
| Budget Utilization | Sử dụng ngân sách |
| Claims Summary | Tổng hợp claims |
| Customer Performance | Hiệu quả theo khách hàng |
| Regional Analysis | Phân tích theo vùng |

### Tạo báo cáo

1. Vào **Reports** → Chọn loại báo cáo
2. Thiết lập bộ lọc:
   - Khoảng thời gian
   - Khu vực
   - Kênh
   - Sản phẩm
3. Nhấn **Tạo báo cáo**
4. Xem trên web hoặc xuất file

### Xuất báo cáo

- **Excel**: Đầy đủ dữ liệu để phân tích
- **PDF**: Để trình bày, báo cáo
- **CSV**: Để tích hợp hệ thống khác

### Lên lịch báo cáo

1. Chọn báo cáo → **Lên lịch**
2. Thiết lập:
   - Tần suất: Hàng ngày, tuần, tháng
   - Thời gian gửi
   - Người nhận
3. Lưu lịch

---

## AI Insights

### Dự báo hiệu quả

AI phân tích dữ liệu lịch sử để dự báo:

- **ROI dự kiến**: Ước tính ROI của khuyến mãi mới
- **Doanh số dự báo**: Doanh số kỳ vọng
- **Ngân sách tối ưu**: Gợi ý phân bổ ngân sách

### Gợi ý tối ưu

Hệ thống đề xuất:

- **Khách hàng tiềm năng**: Khách hàng nên tập trung
- **Thời điểm tốt**: Khi nào chạy khuyến mãi
- **Mức chiết khấu**: Tỷ lệ tối ưu

### Cảnh báo

AI phát hiện và cảnh báo:

- **Bất thường**: Claims có dấu hiệu bất thường
- **Rủi ro**: Khuyến mãi có khả năng thất bại
- **Cơ hội**: Cơ hội chưa khai thác

### Sử dụng AI Insights

1. Vào **AI** → **Insights**
2. Xem các gợi ý được tạo tự động
3. Nhấn vào từng gợi ý để xem chi tiết
4. Chọn **Áp dụng** hoặc **Bỏ qua**

---

## Phím tắt / Keyboard Shortcuts

| Phím | Chức năng |
|------|-----------|
| `Ctrl + N` | Tạo mới |
| `Ctrl + S` | Lưu |
| `Ctrl + F` | Tìm kiếm |
| `Ctrl + /` | Mở trợ giúp |
| `Esc` | Đóng dialog |

---

## Câu hỏi thường gặp / FAQ

### Q: Làm sao để sửa khuyến mãi đã gửi duyệt?
A: Yêu cầu người duyệt từ chối, sau đó sửa và gửi lại.

### Q: Claim bị từ chối, làm sao xử lý?
A: Xem lý do từ chối, bổ sung thông tin/chứng từ và tạo claim mới.

### Q: Báo cáo không hiển thị đủ dữ liệu?
A: Kiểm tra bộ lọc và quyền truy cập. Liên hệ admin nếu cần mở rộng quyền.

### Q: Quên mật khẩu?
A: Nhấn "Quên mật khẩu" trên trang đăng nhập để nhận email reset.

---

## Hỗ trợ / Support

- **Email**: support@company.com
- **Hotline**: 1900-xxxx
- **Giờ hỗ trợ**: 8:00 - 17:30 (Thứ 2 - Thứ 6)
