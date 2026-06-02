# HƯỚNG DẪN KIỂM THỬ — VietERP HRM System

**Phiên bản:** 1.0
**Ngày:** 09/03/2026
**Dành cho:** Nhân sự HR thực hiện kiểm thử chức năng (UAT)

---

## MỤC LỤC

1. [Thông tin đăng nhập](#1-thông-tin-đăng-nhập)
2. [Module 1: Dashboard](#2-module-1-dashboard)
3. [Module 2: Quản lý Nhân viên](#3-module-2-quản-lý-nhân-viên)
4. [Module 3: Hợp đồng](#4-module-3-hợp-đồng)
5. [Module 4: Người phụ thuộc (NPT)](#5-module-4-người-phụ-thuộc)
6. [Module 5: Chấm công](#6-module-5-chấm-công)
7. [Module 6: Bảng lương](#7-module-6-bảng-lương)
8. [Module 7: Tạm ứng lương](#8-module-7-tạm-ứng-lương)
9. [Module 8: Tuyển dụng](#9-module-8-tuyển-dụng)
10. [Module 9: Biến động nhân sự](#10-module-9-biến-động-nhân-sự)
11. [Module 10: Nghỉ việc (Offboarding)](#11-module-10-offboarding)
12. [Module 11: Đánh giá năng lực](#12-module-11-đánh-giá-năng-lực)
13. [Module 12: KPI](#13-module-12-kpi)
14. [Module 13: Mẫu hồ sơ (Templates)](#14-module-13-mẫu-hồ-sơ)
15. [Module 14: Báo cáo tổng hợp](#15-module-14-báo-cáo-tổng-hợp)
16. [Module 15: Import dữ liệu AI](#16-module-15-import-dữ-liệu-ai)
17. [Module 16: Quản trị hệ thống](#17-module-16-quản-trị-hệ-thống)
18. [Module 17: Thông báo & Profile](#18-module-17-thông-báo--profile)
19. [Kiểm thử phân quyền (RBAC)](#19-kiểm-thử-phân-quyền-rbac)
20. [Kiểm thử responsive](#20-kiểm-thử-responsive)
21. [Checklist tổng hợp](#21-checklist-tổng-hợp)

---

## 1. THÔNG TIN ĐĂNG NHẬP

| Tài khoản | Role | Mật khẩu |
|---|---|---|
| admin@rtr.vn | SUPER_ADMIN | RTR@2026 |
| hr@rtr.vn | HR_MANAGER | RTR@2026 |
| hrstaff@rtr.vn | HR_STAFF | RTR@2026 |
| kythuat.mgr@rtr.vn | DEPT_MANAGER | RTR@2026 |
| nhanvien@rtr.vn | EMPLOYEE | RTR@2026 |
| ketoan@rtr.vn | ACCOUNTANT | RTR@2026 |

> **Lưu ý:** Đăng nhập sai 5 lần sẽ bị khóa 15 phút.

---

## 2. MODULE 1: DASHBOARD

**URL:** `/`
**Role:** Tất cả (sau khi đăng nhập)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| D-01 | Xem tổng quan | Đăng nhập → Dashboard hiện ra | Thấy stats grid: Tổng NV, Đang làm, Thử việc, Đã nghỉ, HĐ sắp hết... | |
| D-02 | Biểu đồ phòng ban | Cuộn xuống phần biểu đồ | Thấy biểu đồ cột phòng ban + biểu đồ xu hướng | |
| D-03 | Cảnh báo HĐ hết hạn | Xem phần cảnh báo | Hiển thị danh sách HĐ sắp hết hạn (trong 60 ngày) | |
| D-04 | Danh sách chờ duyệt | Xem phần pending | Hiển thị các item chờ xử lý | |

---

## 3. MODULE 2: QUẢN LÝ NHÂN VIÊN

**URL:** `/employees`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN, DEPT_MANAGER

### 3.1 Danh sách nhân viên

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| E-01 | Xem danh sách | Vào /employees | Hiện bảng NV với cột: Mã, Tên, Phòng, Chức vụ, Trạng thái | |
| E-02 | Tìm kiếm | Nhập tên NV vào ô tìm kiếm | Lọc đúng NV (debounce 300ms) | |
| E-03 | Lọc trạng thái | Chọn filter "Thử việc" | Chỉ hiện NV thử việc | |
| E-04 | Sắp xếp | Click header cột | Sắp xếp tăng/giảm | |
| E-05 | Sticky header | Cuộn xuống nhiều NV | Header bảng dính trên đầu | |

### 3.2 Tạo nhân viên mới

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| E-06 | Tạo NV đầy đủ | Bấm "Thêm NV" → Điền form 4 bước → Lưu | NV mới xuất hiện trong danh sách, mã NV tự sinh | |
| E-07 | Validate SĐT | Nhập SĐT < 10 số | Hiện lỗi validate | |
| E-08 | Validate CCCD | Nhập CCCD > 12 ký tự | Chặn nhập (maxLength=12) | |
| E-09 | CCCD trùng | Nhập CCCD đã tồn tại | Thông báo "CCCD/CMND đã tồn tại" (409) | |
| E-10 | Form responsive | Xem trên mobile 375px | Bước label ẩn, chỉ hiện icon; form co lại hợp lý | |

### 3.3 Xem & sửa chi tiết

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| E-11 | Xem chi tiết NV | Click vào 1 NV | Hiện tabs: Thông tin, HĐ, Onboarding, Biến động, NPT, Offboarding | |
| E-12 | Sửa thông tin | Click "Chỉnh sửa" → Sửa SĐT → Lưu | SĐT cập nhật, lịch sử thay đổi ghi nhận | |
| E-13 | Lịch sử thay đổi | Xem tab Thông tin → cuộn xuống | Hiện "Phòng ban: Kỹ thuật → Kinh doanh" (không phải UUID) | |
| E-14 | NV xem hồ sơ mình | Đăng nhập `nhanvien@rtr.vn` → /employees/[id] | Chỉ xem được bản thân, STK bị mask (****1234) | |

---

## 4. MODULE 3: HỢP ĐỒNG

**URL:** `/employees/[id]` → Tab "Hợp đồng"
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| C-01 | Tạo HĐ thử việc | Chọn loại "Thử việc" → Điền ngày → Nhập lương → Tạo | HĐ mới hiện trong danh sách, số HĐ tự sinh | |
| C-02 | Validate thử việc ≤60 ngày | Chọn ngày bắt đầu/kết thúc > 60 ngày | Server báo lỗi | |
| C-03 | Tạo HĐ chính thức | Chọn "Có Thời Hạn" → Điền thông tin → Tạo | HĐ tạo OK, hiện phụ cấp đầy đủ | |
| C-04 | Kích hoạt HĐ | Click "Kích hoạt" trên HĐ mới | HĐ cũ chuyển EXPIRED, HĐ mới chuyển ACTIVE | |
| C-05 | Lương hiện đúng format | Xem lương trong HĐ | Hiện dạng "15.000.000đ" (có dấu chấm ngàn) | |

---

## 5. MODULE 4: NGƯỜI PHỤ THUỘC

**URL:** `/employees/[id]` → Tab "NPT"
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| NPT-01 | Thêm NPT | Bấm "Thêm NPT" → Điền họ tên, CCCD, quan hệ → Lưu | NPT hiện trong danh sách, dependentCount tăng | |
| NPT-02 | Giảm trừ tính đúng | Thêm 2 NPT → Xem bảng lương NV đó | Giảm trừ NPT = 2 × 4.400.000đ = 8.800.000đ | |
| NPT-03 | Vô hiệu NPT | Bấm toggle tắt NPT | NPT chuyển inactive, dependentCount giảm | |

---

## 6. MODULE 5: CHẤM CÔNG

**URL:** `/attendance`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN (bảng tổng); EMPLOYEE (chấm công cá nhân)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| A-01 | Check-in | Đăng nhập NV → /attendance → Bấm "Check In" | Ghi nhận giờ vào, icon ✅ hoặc 🟡(trễ) | |
| A-02 | Check-out | Bấm "Check Out" sau khi đã check-in | Ghi nhận giờ ra, tính workHours | |
| A-03 | Check-in trước 6h hoặc sau 12h | Thử check-in ngoài giờ | Server từ chối | |
| A-04 | Xem bảng tổng HR | Đăng nhập HR → /attendance | Bảng lưới: NV × ngày, icon trạng thái, sticky header | |
| A-05 | Sửa chấm công | Click vào ô ngày → Sửa giờ vào/ra → Nhập lý do → Lưu | Record cập nhật, isManualEdit = true | |
| A-06 | Import chấm công | Bấm "Import" → Upload file Excel | Dữ liệu chấm công được nhập hàng loạt | |
| A-07 | Sync vào bảng lương | Bấm "Sync vào Bảng Lương" | Thông báo sync thành công, actualDays cập nhật | |
| A-08 | Chọn tháng/năm | Đổi dropdown tháng/năm | Bảng load lại đúng tháng | |

---

## 7. MODULE 6: BẢNG LƯƠNG

**URL:** `/payroll`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN, ACCOUNTANT

### 7.1 Quy trình cơ bản

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| P-01 | Tạo bảng lương | /payroll/new → Chọn tháng/năm → Tạo | Bảng lương DRAFT mới | |
| P-02 | Khởi tạo NV | Bấm "Khởi tạo" | Tự tạo records cho tất cả NV ACTIVE/PROBATION | |
| P-03 | Ngày công chuẩn trừ lễ | Tạo bảng lương tháng 1 (có Tết DL 1/1) | standardDays ít hơn 1 ngày so với tính tay (không có lễ) | |
| P-04 | Pro-ration NV nghỉ giữa tháng | NV nghỉ ngày 15 → Khởi tạo bảng lương | actualDays = số ngày làm từ 1→15 (trừ T7/CN) | |
| P-05 | Xem chi tiết NV | Click vào 1 NV trong bảng | Drawer mở ra: lương HĐ, công, tăng thêm, giảm trừ, THỰC LĨNH | |
| P-06 | Sửa công thực tế | Sửa "Công thực tế" = 20 → "Lưu & Tính Lại" | totalActualSalary thay đổi tương ứng | |
| P-07 | Thêm khoản tăng thêm | Chọn "OT ngày thường" → Nhập 500.000 → Bấm + | Khoản mới hiện trong danh sách, Tổng TN tăng | |
| P-08 | Xóa khoản tăng thêm | Bấm icon xóa bên cạnh khoản | Khoản biến mất, Tổng TN giảm | |
| P-09 | Nhập tạm ứng | Nhập 2.000.000 vào ô Tạm ứng → Lưu | Thực lĩnh giảm 2tr | |

### 7.2 Kiểm tra công thức lương

| # | Test Case | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|
| P-10 | BHXH có trần | Lương CB > 46.800.000 → BH tính trên 46.800.000, không vượt | |
| P-11 | Phụ cấp miễn thuế có trần | Cơm > 730K → chỉ 730K miễn thuế; ĐT > 1M → chỉ 1M | |
| P-12 | Thuế TNCN lũy tiến | Thu nhập chịu thuế 20tr → Thuế = 5M×5% + 5M×10% + 10M×15% | |
| P-13 | Thử việc không đóng BH | NV Probation → BH NLĐ = 0, BH CTY = 0 | |
| P-14 | Giảm trừ NPT | NV có 2 NPT → Giảm trừ = 11M + 2×4.4M = 19.8M | |

### 7.3 Duyệt & Thanh toán

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| P-15 | Submit bảng lương | Bấm "Gửi duyệt" | Status → SUBMITTED, lock chỉnh sửa | |
| P-16 | Approve bảng lương | HR_MANAGER bấm "Duyệt" | Status → APPROVED, NV locked | |
| P-17 | Race condition approve | 2 người duyệt đồng thời | Chỉ 1 thành công, người kia nhận lỗi CONCURRENT_CONFLICT | |
| P-18 | Mark Paid | Bấm "Đánh dấu đã trả" | Status → PAID | |
| P-19 | Gửi phiếu lương email | Bấm "Gửi phiếu lương" | Email gửi cho NV (hoặc console.log nếu chưa cấu hình SMTP) | |
| P-20 | Export Excel | Bấm "Xuất Excel" | File .xlsx tải về, dữ liệu khớp | |

---

## 8. MODULE 7: TẠM ỨNG LƯƠNG

**URL:** `/advances`
**Role:** Tất cả (NV tự tạo, HR duyệt)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| ADV-01 | Tạo yêu cầu tạm ứng | NV đăng nhập → /advances → Tạo → Nhập 3.000.000 | Request PENDING | |
| ADV-02 | Validate tối thiểu 500K | Nhập 200.000 | Báo lỗi | |
| ADV-03 | Validate tối đa 50% lương | Lương 15M, nhập 8.000.000 | Báo lỗi (vượt 50%) | |
| ADV-04 | Không tạo trùng | Đã có 1 PENDING → Tạo thêm | Báo lỗi "đã có yêu cầu đang chờ" | |
| ADV-05 | HR duyệt | HR đăng nhập → Approve | Status → APPROVED, tự tạo PayrollItem ADVANCE_DEDUCTION | |
| ADV-06 | HR từ chối | HR bấm Reject + nhập lý do | Status → REJECTED | |

---

## 9. MODULE 8: TUYỂN DỤNG

**URL:** `/recruitment`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN, DEPT_MANAGER

### 9.1 Yêu cầu tuyển dụng (JR)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| R-01 | Tạo JR | /recruitment/requisitions/new → Điền form → Tạo | JR mới, status = DRAFT | |
| R-02 | Mở tuyển | Vào JR → Bấm "Mở tuyển" | Status → OPEN | |
| R-03 | Form public | Copy link apply → Mở incognito | Form ứng tuyển hiển thị công khai | |

### 9.2 Kanban ứng viên

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| R-04 | Xem Kanban | /recruitment → Tab Kanban | 6 cột: Applied, Screening, Interview, Offer, Accepted, Rejected | |
| R-05 | Kéo thả chuyển status | Kéo card từ "Applied" → "Screening" | Card chuyển cột, API cập nhật | |
| R-06 | Lọc theo JR | Chọn dropdown "Yêu cầu" | Chỉ hiện ứng viên của JR đó | |
| R-07 | Lọc theo phòng ban | Chọn dropdown "Phòng ban" | Lọc đúng | |
| R-08 | Tìm ứng viên | Nhập tên/email/SĐT | Filter real-time (debounce) | |
| R-09 | Chuyển ACCEPTED | Kéo sang "Accepted" + confirm | Tự động tạo Employee mới trong hệ thống | |
| R-10 | Chuyển không hợp lệ | Kéo từ "Accepted" → "Applied" | Báo lỗi "chuyển trạng thái không hợp lệ" | |

### 9.3 Ứng tuyển công khai

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| R-11 | Nộp đơn | Mở /apply/[id] → Điền form → Nộp | Thành công, xuất hiện trên Kanban ở cột "Applied" | |
| R-12 | Upload CV | Chọn file PDF → Nộp | File upload thành công | |

---

## 10. MODULE 9: BIẾN ĐỘNG NHÂN SỰ

**URL:** `/hr-events`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| HE-01 | Tạo chuyển phòng ban | Chọn NV → Loại "Chuyển phòng ban" → Chọn phòng mới → Tạo | Event PENDING | |
| HE-02 | Tạo thăng chức | Chọn NV → "Thăng chức" → Chọn chức vụ mới → Tạo | Event PENDING | |
| HE-03 | Tạo điều chỉnh lương | Chọn NV → "Điều chỉnh lương" → Nhập lương mới → Tạo | Event PENDING | |
| HE-04 | Tạo kỷ luật | Chọn "Kỷ luật" → Chọn mức → Nhập lý do → Tạo | Event PENDING | |
| HE-05 | Duyệt sự kiện | HR_MANAGER bấm "Duyệt" | Status → APPROVED, thay đổi áp dụng lên NV | |
| HE-06 | Từ chối sự kiện | Bấm "Từ chối" → Nhập lý do | Status → REJECTED | |
| HE-07 | Lọc theo trạng thái | Bấm tab "Chờ duyệt" | Chỉ hiện event PENDING | |

---

## 11. MODULE 10: OFFBOARDING

**URL:** `/offboarding`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN, DEPT_MANAGER

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| OB-01 | Tạo đơn nghỉ việc | Vào chi tiết NV → Tab Offboarding → Tạo | Instance INITIATED | |
| OB-02 | QL duyệt | DEPT_MANAGER bấm duyệt | Status → MANAGER_APPROVED | |
| OB-03 | HR duyệt | HR_MANAGER bấm duyệt | Status → HR_APPROVED → IN_PROGRESS, tasks tạo ra | |
| OB-04 | Hoàn thành tasks | Check hết tasks → Bấm hoàn tất | Status → COMPLETED, NV chuyển RESIGNED | |
| OB-05 | Hủy offboarding | Bấm "Hủy" trên offboarding | Status → CANCELLED, NV quay lại ACTIVE | |
| OB-06 | Lọc theo trạng thái | Chọn filter dropdown | Chỉ hiện offboarding đúng status | |

---

## 12. MODULE 11: ĐÁNH GIÁ NĂNG LỰC

**URL:** `/reviews`
**Role:** HR (tạo, tổng hợp), EMPLOYEE (tự đánh giá), DEPT_MANAGER (đánh giá manager)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| RV-01 | Tạo đợt đánh giá | Bấm "Tạo Đợt" → Điền tên, loại, ngày → Tạo | Đợt mới hiện trong danh sách | |
| RV-02 | NV tự đánh giá | NV đăng nhập → /reviews/r/[id] → Chọn điểm + điền text ≥50 ký tự → Nộp | Status → MANAGER_PENDING | |
| RV-03 | Manager đánh giá | Manager vào → Tab Manager → Chọn điểm → Nộp | Status → HR_REVIEWING | |
| RV-04 | Năng lực cốt lõi | Kéo slider các competency | Điểm lưu đúng | |
| RV-05 | HR tổng hợp | HR vào tab "Kết quả" → Chọn đánh giá cuối → Bấm "Hoàn tất" | Status → COMPLETED | |
| RV-06 | Trigger HR Event | Bấm "Trigger HR Event" → Chọn Thăng chức → Tạo | HR Event PENDING tạo ra ở /hr-events | |
| RV-07 | Validate min 50 ký tự | Nhập điểm mạnh < 50 ký tự | Nút submit disable | |

---

## 13. MODULE 12: KPI

**URL:** `/kpi`
**Role:** HR_MANAGER, SUPER_ADMIN (tạo/nhập), tất cả (xem)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| KPI-01 | Tạo kỳ KPI | Chọn tháng/năm → Tạo | Kỳ KPI DRAFT, tự load NV | |
| KPI-02 | Nhập điểm KPI | Vào chi tiết → Nhập điểm cho từng NV → Lưu | Điểm lưu OK, tự tính KPI amount | |
| KPI-03 | Công bố KPI | Bấm "Công bố" | Status → PUBLISHED, NV có thể xem | |
| KPI-04 | Khóa KPI | Bấm "Khóa" | Status → LOCKED, không sửa được | |

---

## 14. MODULE 13: MẪU HỒ SƠ (TEMPLATES)

**URL:** `/templates`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| T-01 | Upload template .docx | /templates/upload → Chọn file → Điền tên, danh mục → Tạo | File upload OK, tự scan placeholder | |
| T-02 | Định nghĩa fields | Bước 2 → Sửa label, loại, auto-fill → Lưu | Fields lưu OK | |
| T-03 | Tạo hồ sơ | Vào template → Chọn NV → Auto-fill thông tin → Tải xuống | File .docx tải về, placeholder đã thay | |
| T-04 | Auto-fill NV | Chọn nhân viên trong dropdown | Các field tự điền (tên, mã NV, phòng ban, lương...) | |
| T-05 | Preview & versioning | Upload phiên bản mới | Version tăng, preview hiện đúng | |

---

## 15. MODULE 14: BÁO CÁO TỔNG HỢP

**URL:** `/reports-hub`
**Role:** HR_MANAGER, HR_STAFF, SUPER_ADMIN

### 15.1 Báo cáo Nhân sự

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| RPT-01 | Xem báo cáo NS | /reports-hub/hr → Chọn năm | Headcount, biểu đồ, biến động chi tiết | |
| RPT-02 | Lọc theo quý | Chọn Quý 1 | Dữ liệu filter theo Q1 | |
| RPT-03 | Export Excel | Bấm "Export Excel" | File tải về | |

### 15.2 Báo cáo BHXH (D02-TS)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| RPT-04 | Xem BHXH | /reports-hub/insurance → Chọn tháng/năm | Tổng NV, Đăng ký mới, Thôi TG, quỹ lương | |
| RPT-05 | Tab đăng ký mới | Click tab "Đăng ký mới" | Danh sách NV mới tham gia BH | |
| RPT-06 | Export D02 | Bấm "Export D02" | File D02-TS.xlsx tải về | |

### 15.3 Báo cáo Thuế (05/QTT-TNCN)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| RPT-07 | Xem thuế | /reports-hub/tax → Chọn năm | Tổng TN chịu thuế, thuế đã khấu trừ, biểu đồ tháng | |
| RPT-08 | Export 05/QTT | Bấm "Export 05/QTT" | File Excel tải về | |

### 15.4 Lương tổng hợp

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| RPT-09 | Xem lương tổng hợp | /reports-hub/payroll-summary → Chọn năm | Tổng chi phí NS, biểu đồ cột, bảng theo tháng & phòng ban | |

---

## 16. MODULE 15: IMPORT DỮ LIỆU AI

**URL:** `/import`
**Role:** SUPER_ADMIN only

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| IM-01 | Upload Excel | Chọn loại (NV/Phòng ban/Chức vụ/HĐ) → Upload file | AI tự map cột, hiện preview | |
| IM-02 | Xem mapping | Kiểm tra cột đề xuất của AI | Mapping hợp lý, có thể sửa | |
| IM-03 | Dry Run | Bấm "Kiểm tra trước" | Hiện kết quả: bao nhiêu OK, bao nhiêu lỗi | |
| IM-04 | Thực thi import | Bấm "Nhập dữ liệu" | Dữ liệu import thành công | |
| IM-05 | Rollback | Bấm "Hoàn tác" | Dữ liệu đã nhập bị xóa | |
| IM-06 | Download template | Bấm "Tải mẫu" | File Excel mẫu tải về | |

---

## 17. MODULE 16: QUẢN TRỊ HỆ THỐNG

**URL:** `/admin`
**Role:** SUPER_ADMIN only

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| AD-01 | Quản lý users | /admin/users → Tạo/sửa/xóa user | CRUD OK | |
| AD-02 | Quản lý phòng ban | /admin/departments → CRUD | Tạo/sửa/xóa phòng ban OK | |
| AD-03 | Quản lý chức vụ | /admin/positions → CRUD | Tạo/sửa/xóa chức vụ OK | |
| AD-04 | Nhật ký hệ thống | /admin/audit-logs | Hiện log hành động, filter theo hành động/đối tượng/ngày | |
| AD-05 | Xem chi tiết log | Click vào 1 log có metadata | Expand hiện JSON diff | |

---

## 18. MODULE 17: THÔNG BÁO & PROFILE

### 18.1 Thông báo

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| NF-01 | Xem chuông thông báo | Click biểu tượng chuông trên header | Dropdown hiện danh sách thông báo | |
| NF-02 | Badge số chưa đọc | Có thông báo chưa đọc | Badge đỏ hiện số (max 99+) | |
| NF-03 | Click thông báo | Click 1 thông báo có link | Chuyển trang đúng, mark read | |
| NF-04 | Đọc tất cả | Bấm "Đọc tất cả" | Tất cả mark read, badge biến mất | |

### 18.2 Profile

**URL:** `/profile`
**Role:** Tất cả

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| PF-01 | Xem profile | /profile | Hiện thông tin cá nhân | |
| PF-02 | Sửa thông tin | Sửa SĐT, địa chỉ → Lưu | Cập nhật OK | |
| PF-03 | Đổi mật khẩu | Nhập MK cũ + MK mới → Lưu | Đổi thành công, đăng nhập lại với MK mới | |
| PF-04 | Xem phiếu lương | Tab "Phiếu lương" | Hiện danh sách phiếu lương đã PAID | |

---

## 19. KIỂM THỬ PHÂN QUYỀN (RBAC)

> Test bằng cách đăng nhập từng role và truy cập URL trực tiếp.

| # | Role | URL test | Kết quả mong đợi | Pass/Fail |
|---|---|---|---|---|
| RBAC-01 | EMPLOYEE | /payroll | Redirect → /unauthorized | |
| RBAC-02 | EMPLOYEE | /hr-events | Redirect → /unauthorized | |
| RBAC-03 | EMPLOYEE | /admin | Redirect → /unauthorized | |
| RBAC-04 | EMPLOYEE | /import | Redirect → /unauthorized | |
| RBAC-05 | DEPT_MANAGER | /payroll | Redirect → /unauthorized | |
| RBAC-06 | DEPT_MANAGER | /admin | Redirect → /unauthorized | |
| RBAC-07 | ACCOUNTANT | /recruitment | Redirect → /unauthorized | |
| RBAC-08 | ACCOUNTANT | /hr-events | Redirect → /unauthorized | |
| RBAC-09 | HR_STAFF | /admin | Redirect → /unauthorized | |
| RBAC-10 | HR_STAFF | /import | Redirect → /unauthorized | |
| RBAC-11 | EMPLOYEE | /employees/[other-id] | 403 Forbidden (chỉ xem bản thân) | |
| RBAC-12 | SUPER_ADMIN | Tất cả URL | Truy cập OK | |

---

## 20. KIỂM THỬ RESPONSIVE

> Test trên Chrome DevTools (hoặc thiết bị thật)

| # | Viewport | Trang test | Kiểm tra | Pass/Fail |
|---|---|---|---|---|
| RS-01 | 375px (iPhone SE) | Dashboard | Layout không vỡ, stats grid co lại | |
| RS-02 | 375px | /employees | Bảng cuộn ngang, header sticky | |
| RS-03 | 375px | /payroll/[id] | Drawer full-width, padding phù hợp | |
| RS-04 | 375px | /recruitment (Kanban) | Các cột cuộn ngang | |
| RS-05 | 768px (iPad) | Dashboard | Layout 2 cột | |
| RS-06 | 768px | /employees/new | Form 2 cột, step label hiện | |
| RS-07 | 1440px (Desktop) | Dashboard | Stats grid đầy đủ cột | |

---

## 21. CHECKLIST TỔNG HỢP

### Tier 1 — Bắt buộc (Blocking Release)

- [ ] Đăng nhập / đăng xuất OK (6 accounts)
- [ ] RBAC: Employee không vào Payroll, Admin, HR Events
- [ ] Tạo NV → Tạo HĐ → Kích hoạt HĐ OK
- [ ] Chấm công check-in/out OK
- [ ] Bảng lương: Tạo → Khởi tạo → Submit → Approve → Paid OK
- [ ] Tính lương đúng (BH có trần, thuế lũy tiến, NPT giảm trừ)
- [ ] Ngày lễ VN trừ khỏi ngày công chuẩn
- [ ] NV nghỉ giữa tháng: pro-ration đúng
- [ ] Tuyển dụng: Tạo JR → Kéo thả Kanban → Accepted tạo NV OK
- [ ] Export Excel lương / BHXH / Thuế tải về OK
- [ ] Thông báo hiện đúng, click chuyển trang OK

### Tier 2 — Khuyến nghị

- [ ] Sửa thông tin NV → Lịch sử thay đổi hiện tên phòng ban (không phải UUID)
- [ ] Tạm ứng: validate min/max, duyệt tạo PayrollItem
- [ ] Đánh giá năng lực: flow 4 bước (Tự → Manager → HR → Complete)
- [ ] Biến động NS: Tạo → Duyệt → Áp dụng lên NV OK
- [ ] Offboarding: flow đầy đủ, hủy offboarding quay lại ACTIVE
- [ ] Templates: Upload → Scan → Generate .docx OK
- [ ] Import AI: Upload → Map → Dry run → Execute → Rollback OK
- [ ] Responsive trên mobile 375px không vỡ layout

### Tier 3 — Tùy chọn

- [ ] Brute-force: 5 lần sai → khóa 15 phút
- [ ] Audit log ghi nhận mọi hành động
- [ ] Dashboard refresh tự động mỗi 60s
- [ ] Thông báo chuông refresh mỗi 60s
- [ ] Touch target ≥ 48px trên mobile

---

## GHI CHÚ

- **Khi phát hiện lỗi:** Ghi rõ bước tái hiện, ảnh chụp màn hình, tài khoản test, URL.
- **Severity:**
  - **Critical:** Không thể sử dụng module, sai số liệu tài chính
  - **Major:** Chức năng chính bị lỗi nhưng có workaround
  - **Minor:** UI không đẹp, typo, UX không tốt
- **Môi trường test:** Trình duyệt Chrome (mới nhất), Safari (mobile)
