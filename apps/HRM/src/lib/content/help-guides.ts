export type HelpStep = {
  icon: string
  title: string
  description: string
  tip?: string
}

export type HelpSection = {
  title: string
  steps: HelpStep[]
}

export type HelpGuide = {
  slug: string
  title: string
  subtitle: string
  icon: string
  color: string
  readingTime: string
  excelAnalogy: string
  sections: HelpSection[]
  relatedSlugs?: string[]
}

export const helpGuides: HelpGuide[] = [
  // --- GUIDE 1: IMPORT EXCEL ---
  {
    slug: "import-excel",
    title: "Nhập dữ liệu từ Excel",
    subtitle: "Chuyển toàn bộ danh sách nhân viên từ file Excel vào hệ thống chỉ trong vài phút",
    icon: "\u{1F4E5}",
    color: "green",
    readingTime: "~4 phút",
    excelAnalogy: "Giống như bạn copy-paste dữ liệu giữa 2 sheet — nhưng hệ thống tự map cột và kiểm tra lỗi thay bạn.",
    sections: [
      {
        title: "Chuẩn bị file Excel",
        steps: [
          {
            icon: "\u{1F4CB}",
            title: "Không cần đúng format sẵn",
            description: "File Excel hiện tại của bạn thế nào cũng được — dù tên cột là 'Họ tên', 'Full name' hay 'Tên NV', AI đều hiểu được.",
            tip: "Mẹo: File có ít nhất cột Họ tên, Ngày sinh, Phòng ban là đủ để bắt đầu.",
          },
          {
            icon: "\u{1F522}",
            title: "Tối đa 5.000 dòng mỗi lần",
            description: "Nếu danh sách nhiều hơn, chia làm nhiều lần import. Mỗi lần hệ thống xử lý độc lập.",
          },
          {
            icon: "\u{1F4BE}",
            title: "Lưu file định dạng .xlsx hoặc .csv",
            description: "File .xls cũ cần save lại thành .xlsx trước (File → Save As → Excel Workbook).",
          },
        ],
      },
      {
        title: "Thực hiện import",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào menu Nhập Dữ Liệu",
            description: "Trên sidebar, tìm mục 'Nhập Dữ Liệu' (chỉ hiện với tài khoản Admin). Chọn loại dữ liệu là 'Nhân viên'.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Upload file và chờ AI phân tích",
            description: "Kéo thả hoặc click chọn file. AI sẽ đọc hàng tiêu đề và đề xuất mapping tự động trong vài giây.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "Kiểm tra mapping cột",
            description: "Màn hình hiện bảng: cột Excel của bạn → trường trong hệ thống. Nếu AI map sai, bạn có thể chỉnh lại bằng dropdown.",
            tip: "Mẹo: Cột nào AI không chắc sẽ hiện màu vàng — chú ý kiểm tra những cột này trước.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Bấm 'Kiểm tra trước' — đừng vội import ngay",
            description: "Hệ thống sẽ chạy kiểm tra toàn bộ và báo lỗi (nếu có): trùng CCCD, thiếu thông tin bắt buộc, định dạng ngày sai...",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Xem kết quả và xác nhận",
            description: "Nếu không có lỗi đỏ → bấm 'Nhập dữ liệu'. Nếu có lỗi, sửa trong file Excel rồi upload lại — chỉ mất 1 phút.",
          },
        ],
      },
      {
        title: "Nếu cần hoàn tác",
        steps: [
          {
            icon: "\u21A9\uFE0F",
            title: "Bấm 'Hoàn tác' trong vòng 24 giờ",
            description: "Hệ thống lưu lại toàn bộ dữ liệu vừa import. Bấm 'Hoàn tác' sẽ xóa sạch batch vừa nhập — không ảnh hưởng dữ liệu cũ.",
            tip: "Mẹo: Luôn làm Dry Run trước. Hoàn tác chỉ là lưới an toàn, không phải thói quen.",
          },
        ],
      },
    ],
    relatedSlugs: ["them-nhan-vien", "tinh-luong-dau-tien"],
  },

  // --- GUIDE 2: TÍNH LƯƠNG THÁNG ĐẦU TIÊN ---
  {
    slug: "tinh-luong-dau-tien",
    title: "Tính lương tháng đầu tiên",
    subtitle: "Từ bảng chấm công đến phiếu lương gửi email — quy trình 5 bước",
    icon: "\u{1F4B0}",
    color: "blue",
    readingTime: "~5 phút",
    excelAnalogy: "Giống như file Excel tính lương của bạn — nhưng công thức thuế TNCN, BHXH đã được tính sẵn, không cần nhập tay.",
    sections: [
      {
        title: "Trước khi bắt đầu",
        steps: [
          {
            icon: "\u2705",
            title: "Đảm bảo nhân viên đã có hợp đồng active",
            description: "Mỗi NV cần có ít nhất 1 hợp đồng đang hiệu lực với mức lương cơ bản. Nếu chưa có, vào hồ sơ NV → tab Hợp đồng → tạo mới.",
          },
          {
            icon: "\u2705",
            title: "Chấm công đã sync (hoặc bỏ qua nếu tính theo tháng đủ)",
            description: "Nếu bạn chấm công bằng file Excel, vào module Chấm Công → Import để đưa dữ liệu vào trước. Không bắt buộc — có thể điều chỉnh sau.",
          },
        ],
      },
      {
        title: "Tạo bảng lương",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Bảng Lương → Tạo mới",
            description: "Chọn tháng và năm. Hệ thống tự tính số ngày công chuẩn của tháng đó (đã trừ ngày lễ Tết, Quốc khánh, Giỗ Tổ...).",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Bấm 'Khởi tạo' — hệ thống tự tạo dòng cho từng NV",
            description: "Mỗi nhân viên đang làm việc sẽ có 1 dòng trong bảng lương, với lương HĐ, công chuẩn, BH đã điền sẵn.",
            tip: "Mẹo: NV nghỉ việc giữa tháng vẫn xuất hiện — hệ thống tự tính pro-ration cho họ.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "Kiểm tra và điều chỉnh từng người (nếu cần)",
            description: "Click vào tên NV để xem chi tiết. Bạn có thể sửa công thực tế, thêm phụ cấp OT, hoặc nhập số ngày tạm ứng.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Gửi duyệt và phê duyệt",
            description: "Bấm 'Gửi duyệt' → HR Manager nhận thông báo → bấm 'Duyệt'. Sau khi duyệt, bảng lương bị khóa không sửa được.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Đánh dấu đã trả và gửi phiếu lương",
            description: "Sau khi chuyển khoản xong, bấm 'Đánh dấu đã trả'. Hệ thống sẽ tự gửi email phiếu lương đến từng nhân viên.",
          },
        ],
      },
      {
        title: "Hệ thống tự tính gì cho bạn?",
        steps: [
          {
            icon: "\u{1F9EE}",
            title: "Thuế TNCN lũy tiến (bậc thang)",
            description: "Không cần nhớ 7 bậc thuế. Hệ thống tự áp dụng đúng bậc dựa trên thu nhập chịu thuế, đã trừ giảm trừ gia cảnh và người phụ thuộc.",
          },
          {
            icon: "\u{1F3E5}",
            title: "BHXH, BHYT, BHTN — cả 2 phần NLĐ và công ty",
            description: "Tỷ lệ theo quy định hiện hành (NLĐ: 10,5%, CTY: 21,5%). NV thử việc được tự động bỏ qua BH.",
          },
        ],
      },
    ],
    relatedSlugs: ["import-excel", "them-nhan-vien"],
  },

  // --- GUIDE 3: THÊM NHÂN VIÊN MỚI ---
  {
    slug: "them-nhan-vien",
    title: "Thêm nhân viên mới",
    subtitle: "Tạo hồ sơ, tạo hợp đồng và onboarding chỉ trong 10 phút",
    icon: "\u{1F464}",
    color: "purple",
    readingTime: "~3 phút",
    excelAnalogy: "Thay vì thêm 1 dòng vào file Excel, bạn điền form 4 bước — hệ thống tự sinh mã NV và kết nối với tất cả module khác.",
    sections: [
      {
        title: "Tạo hồ sơ nhân viên",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Nhân viên → Thêm nhân viên",
            description: "Form chia 4 bước: Thông tin cơ bản → Địa chỉ & liên hệ → Thông tin việc làm → Tài khoản ngân hàng.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Mã nhân viên tự sinh — không cần nhập",
            description: "Hệ thống tự tạo mã theo format RTR-YYYY-NNN (ví dụ: RTR-2026-042). Bạn không cần quản lý mã thủ công.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "Chọn phòng ban và chức vụ từ danh sách có sẵn",
            description: "Phòng ban và chức vụ do Admin tạo trong phần Quản trị. Nếu chưa có phòng ban mới → liên hệ Admin thêm trước.",
          },
        ],
      },
      {
        title: "Tạo hợp đồng lao động",
        steps: [
          {
            icon: "4\uFE0F\u20E3",
            title: "Vào tab 'Hợp đồng' trong hồ sơ NV vừa tạo",
            description: "Chọn loại hợp đồng: Thử việc (≤60 ngày), Có Thời Hạn, hoặc Vô Thời Hạn. Điền lương cơ bản và các khoản phụ cấp.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Bấm 'Kích hoạt' để hợp đồng có hiệu lực",
            description: "Chỉ khi hợp đồng được kích hoạt, NV mới xuất hiện trong bảng lương tháng tiếp theo.",
            tip: "Mẹo: Mỗi NV chỉ có 1 hợp đồng Active tại 1 thời điểm. Kích hoạt HĐ mới sẽ tự hết hạn HĐ cũ.",
          },
        ],
      },
      {
        title: "Người phụ thuộc (giảm thuế TNCN)",
        steps: [
          {
            icon: "\u{1F468}\u200D\u{1F469}\u200D\u{1F466}",
            title: "Vào tab 'NPT' để thêm người phụ thuộc",
            description: "Mỗi NPT (con, bố/mẹ...) được giảm trừ 4.400.000đ/tháng khỏi thu nhập chịu thuế. Điền CCCD và mối quan hệ.",
            tip: "Mẹo: Thêm NPT càng sớm càng tốt — giảm thuế được tính từ tháng bạn thêm vào.",
          },
        ],
      },
    ],
    relatedSlugs: ["tinh-luong-dau-tien", "import-excel"],
  },

  // --- GUIDE 4: TUYỂN DỤNG & KANBAN ---
  {
    slug: "tuyen-dung-kanban",
    title: "Tuyển dụng & Kanban ứng viên",
    subtitle: "Quản lý toàn bộ pipeline tuyển dụng — từ mở JD đến nhận việc",
    icon: "\u{1F3AF}",
    color: "orange",
    readingTime: "~3 phút",
    excelAnalogy: "Thay vì file Excel theo dõi ứng viên với nhiều cột status, bạn có bảng Kanban kéo thả — nhìn một cái biết ai đang ở bước nào.",
    sections: [
      {
        title: "Tạo yêu cầu tuyển dụng (JD)",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Tuyển Dụng → Tạo yêu cầu mới",
            description: "Điền vị trí, số lượng, mô tả công việc, yêu cầu. Lưu dưới dạng bản nháp (Draft) trước khi công bố.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Bấm 'Mở tuyển' khi sẵn sàng đăng",
            description: "Hệ thống tạo link ứng tuyển công khai. Chia sẻ link này cho ứng viên — họ điền form không cần tài khoản.",
          },
        ],
      },
      {
        title: "Quản lý ứng viên bằng Kanban",
        steps: [
          {
            icon: "3\uFE0F\u20E3",
            title: "Xem bảng Kanban — 6 cột trạng thái",
            description: "Applied → Screening → Interview → Offer → Accepted / Rejected. Mỗi card là 1 ứng viên, có tên + vị trí ứng tuyển.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Kéo thả card để chuyển bước",
            description: "Kéo card từ 'Applied' sang 'Screening' khi bạn đã liên hệ. Hệ thống tự ghi nhận thời gian chuyển status.",
            tip: "Mẹo: Không thể kéo từ Accepted về bước trước — đây là thiết kế có chủ đích để tránh nhầm lẫn.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Lọc nhanh theo vị trí hoặc phòng ban",
            description: "Dùng dropdown phía trên bảng để chỉ xem ứng viên của 1 JD cụ thể. Hoặc tìm kiếm theo tên/email/SĐT.",
          },
        ],
      },
      {
        title: "Ứng viên nhận việc → tự tạo hồ sơ NV",
        steps: [
          {
            icon: "6\uFE0F\u20E3",
            title: "Kéo sang cột 'Accepted' và xác nhận",
            description: "Hệ thống hỏi bạn có muốn tạo hồ sơ nhân viên từ thông tin ứng viên không. Bấm 'Có' — thông tin tự điền vào form.",
            tip: "Mẹo: Bạn vẫn cần vào hồ sơ NV để bổ sung CCCD, tài khoản ngân hàng và tạo hợp đồng.",
          },
        ],
      },
    ],
    relatedSlugs: ["them-nhan-vien"],
  },

  // ─── GUIDE 5: DASHBOARD ───────────────────────────────────────────
  {
    slug: "dashboard",
    title: "Đọc Dashboard & Cảnh báo",
    subtitle: "Nắm bắt tình hình nhân sự toàn công ty chỉ trong 30 giây",
    icon: "\u{1F4CA}",
    color: "blue",
    readingTime: "~2 phút",
    excelAnalogy: "Giống như sheet 'Tổng hợp' trong file Excel của bạn — nhưng tự cập nhật mỗi phút, không cần F9.",
    sections: [
      {
        title: "Các con số phía trên (Stats Grid)",
        steps: [
          {
            icon: "\u{1F465}",
            title: "Tổng nhân viên & phân loại trạng thái",
            description: "Hàng đầu tiên hiện: Tổng NV đang làm, đang thử việc, đã nghỉ. Click vào ô nào sẽ chuyển thẳng đến danh sách NV đã lọc sẵn.",
          },
          {
            icon: "\u26A0\uFE0F",
            title: "Hợp đồng sắp hết hạn (60 ngày tới)",
            description: "Ô màu vàng cam — danh sách NV có HĐ hết hạn trong 2 tháng tới. Cần gia hạn hoặc ký HĐ mới trước khi hết hạn.",
            tip: "Mẹo: Xử lý những HĐ này trước cuối tháng để tránh ảnh hưởng bảng lương.",
          },
        ],
      },
      {
        title: "Biểu đồ phía dưới",
        steps: [
          {
            icon: "\u{1F4C8}",
            title: "Biểu đồ cột — Nhân viên theo phòng ban",
            description: "Nhìn nhanh phân bổ headcount. Phòng ban nào cao nhất, phòng ban nào thiếu người so với kỳ vọng.",
          },
          {
            icon: "\u{1F4C9}",
            title: "Biểu đồ xu hướng — Vào/ra theo tháng",
            description: "Đường xanh là NV vào mới, đường đỏ là NV nghỉ. Tháng nào 2 đường giao nhau là tháng turnover cao — đáng chú ý.",
          },
        ],
      },
      {
        title: "Phần chờ xử lý (Pending items)",
        steps: [
          {
            icon: "\u{1F514}",
            title: "Danh sách việc đang chờ bạn",
            description: "Hiện tất cả item cần bạn hành động: tạm ứng chờ duyệt, báo cáo chờ duyệt, sự kiện HR chờ phê duyệt. Click thẳng vào từng item để xử lý.",
            tip: "Mẹo: Dashboard refresh tự động mỗi 60 giây — không cần F5.",
          },
        ],
      },
    ],
    relatedSlugs: ["them-nhan-vien", "tinh-luong-dau-tien"],
  },

  // ─── GUIDE 6: CHẤM CÔNG ───────────────────────────────────────────
  {
    slug: "cham-cong",
    title: "Chấm công & Theo dõi giờ làm",
    subtitle: "Check-in/out hàng ngày và xem tổng hợp chấm công cả tháng",
    icon: "\u{1F550}",
    color: "green",
    readingTime: "~3 phút",
    excelAnalogy: "Thay vì bảng Excel ghi giờ vào/ra và tự tính tổng giờ — hệ thống ghi nhận tự động và báo ngay nếu đi trễ.",
    sections: [
      {
        title: "Nhân viên: Check-in & check-out hàng ngày",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Chấm Công → Bấm 'Check In'",
            description: "Ghi nhận giờ vào. Icon chuyển xanh nếu đúng giờ, vàng nếu đi trễ. Hệ thống lưu thời gian UTC+7 (giờ Việt Nam).",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Cuối ngày bấm 'Check Out'",
            description: "Hệ thống tự tính số giờ làm. Nếu quên check-out, HR có thể điều chỉnh thủ công.",
            tip: "Mẹo: Chỉ được check-in trong khung giờ 6:00–12:00 SA. Ngoài giờ này hệ thống sẽ từ chối.",
          },
        ],
      },
      {
        title: "HR: Xem & chỉnh sửa bảng chấm công",
        steps: [
          {
            icon: "3\uFE0F\u20E3",
            title: "Bảng lưới NV × Ngày — nhìn một cái biết cả tháng",
            description: "Mỗi ô là 1 ngày của 1 NV. Icon màu xanh = đủ giờ, vàng = trễ, đỏ = vắng, trắng = nghỉ lễ/cuối tuần.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Sửa thủ công nếu NV quên check-in/out",
            description: "Click vào ô ngày → nhập giờ vào/ra → bắt buộc điền lý do điều chỉnh. Hệ thống đánh dấu 'Đã sửa thủ công' cho minh bạch.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Import hàng loạt từ máy chấm công",
            description: "Nếu đang dùng máy chấm vân tay xuất file Excel → bấm 'Import' → upload file. AI tự map cột NV và giờ giấc.",
          },
          {
            icon: "6\uFE0F\u20E3",
            title: "Sync vào bảng lương khi cần",
            description: "Bấm 'Sync vào Bảng Lương' để cập nhật công thực tế cho tháng đang tính. Làm bước này trước khi khởi tạo bảng lương.",
          },
        ],
      },
    ],
    relatedSlugs: ["tinh-luong-dau-tien"],
  },

  // ─── GUIDE 7: TẠM ỨNG LƯƠNG ──────────────────────────────────────
  {
    slug: "tam-ung-luong",
    title: "Tạm ứng lương",
    subtitle: "Nhân viên xin tạm ứng — HR duyệt — tự trừ vào lương cuối tháng",
    icon: "\u{1F4B3}",
    color: "orange",
    readingTime: "~2 phút",
    excelAnalogy: "Thay vì ghi vào cột 'Tạm ứng' trong Excel và nhớ trừ thủ công — hệ thống tự trừ vào bảng lương khi được duyệt.",
    sections: [
      {
        title: "Nhân viên: Gửi yêu cầu tạm ứng",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Tạm Ứng → Tạo yêu cầu mới",
            description: "Nhập số tiền và lý do. Hệ thống kiểm tra tự động: tối thiểu 500.000đ, tối đa 50% lương tháng của bạn.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Chỉ được có 1 yêu cầu đang chờ duyệt",
            description: "Nếu đã có yêu cầu PENDING, không tạo thêm được. Chờ HR duyệt hoặc từ chối yêu cầu cũ trước.",
          },
        ],
      },
      {
        title: "HR: Duyệt hoặc từ chối",
        steps: [
          {
            icon: "3\uFE0F\u20E3",
            title: "Xem danh sách yêu cầu đang chờ",
            description: "Vào Tạm Ứng → tab 'Chờ duyệt'. Hiện tên NV, số tiền, lý do, ngày gửi.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Bấm 'Duyệt' — hệ thống tự xử lý phần còn lại",
            description: "Khi duyệt, hệ thống tự tạo khoản khấu trừ trong bảng lương tháng này. Nhân viên thấy ngay trong phiếu lương.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Từ chối thì phải điền lý do",
            description: "Nhân viên sẽ nhận thông báo kèm lý do từ chối. Sau khi từ chối, NV có thể gửi yêu cầu mới.",
            tip: "Mẹo: Số tiền tạm ứng tự động trừ vào 'Thực lĩnh' — không cần nhớ hay điền tay trong bảng lương.",
          },
        ],
      },
    ],
    relatedSlugs: ["tinh-luong-dau-tien"],
  },

  // ─── GUIDE 8: BIẾN ĐỘNG NHÂN SỰ ─────────────────────────────────
  {
    slug: "bien-dong-nhan-su",
    title: "Biến động nhân sự",
    subtitle: "Chuyển phòng ban, thăng chức, điều chỉnh lương — có lưu vết đầy đủ",
    icon: "\u{1F504}",
    color: "purple",
    readingTime: "~3 phút",
    excelAnalogy: "Thay vì sửa trực tiếp vào file Excel và không biết ai sửa lúc mấy giờ — mọi thay đổi qua hệ thống đều có trạng thái duyệt và lịch sử.",
    sections: [
      {
        title: "Tạo sự kiện biến động",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Biến Động Nhân Sự → Tạo sự kiện mới",
            description: "Chọn nhân viên và loại sự kiện: Chuyển phòng ban, Thăng chức, Điều chỉnh lương, Thay đổi chức vụ, hoặc Kỷ luật.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Điền thông tin thay đổi",
            description: "Ví dụ: chuyển từ 'Phòng Kỹ thuật' sang 'Phòng Kinh doanh', hiệu lực từ ngày 01/04/2026. Hệ thống hiện giá trị cũ và mới song song.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "Sự kiện tạo ra ở trạng thái PENDING — chưa áp dụng ngay",
            description: "Thay đổi chỉ có hiệu lực sau khi HR Manager phê duyệt. Đây là bước kiểm soát 2 lớp, tránh thay đổi nhầm.",
            tip: "Mẹo: Điền ngày hiệu lực chính xác — hệ thống áp dụng đúng ngày đó, không phải ngày duyệt.",
          },
        ],
      },
      {
        title: "Phê duyệt (HR Manager)",
        steps: [
          {
            icon: "4\uFE0F\u20E3",
            title: "Xem tab 'Chờ duyệt' → Duyệt hoặc từ chối",
            description: "Khi duyệt, hệ thống tự cập nhật hồ sơ nhân viên: phòng ban mới, chức vụ mới, lương mới — đúng ngày hiệu lực đã đặt.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Lịch sử thay đổi lưu đầy đủ trong hồ sơ NV",
            description: "Vào hồ sơ NV → tab Thông tin → cuộn xuống: thấy toàn bộ lịch sử 'Phòng ban: Kỹ thuật → Kinh doanh (01/04/2026, duyệt bởi HR Manager)'.",
          },
        ],
      },
    ],
    relatedSlugs: ["them-nhan-vien", "danh-gia-nang-luc"],
  },

  // ─── GUIDE 9: OFFBOARDING ────────────────────────────────────────
  {
    slug: "offboarding",
    title: "Quy trình nghỉ việc",
    subtitle: "Xử lý nghỉ việc đúng quy trình — từ đơn đến bàn giao hoàn tất",
    icon: "\u{1F6AA}",
    color: "orange",
    readingTime: "~3 phút",
    excelAnalogy: "Thay vì checklist Excel nghỉ việc gửi qua email — hệ thống tạo checklist tự động và theo dõi từng bước ai làm rồi, ai chưa.",
    sections: [
      {
        title: "Khởi tạo quy trình nghỉ việc",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào hồ sơ NV → tab Offboarding → Tạo",
            description: "Điền ngày nghỉ dự kiến và lý do. Hệ thống tạo instance offboarding ở trạng thái INITIATED.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Trưởng phòng duyệt trước",
            description: "Trưởng phòng nhận thông báo → bấm Duyệt → trạng thái MANAGER_APPROVED. Nếu từ chối, quy trình dừng lại.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "HR Manager duyệt — checklist tự tạo ra",
            description: "Sau khi HR duyệt, hệ thống tự tạo danh sách công việc cần hoàn tất: thu hồi thiết bị, thanh toán lương cuối, thu thẻ từ...",
          },
        ],
      },
      {
        title: "Hoàn tất bàn giao",
        steps: [
          {
            icon: "4\uFE0F\u20E3",
            title: "Tick từng task trong checklist",
            description: "Mỗi task tick xong là ghi nhận ai làm, lúc mấy giờ. Không cần email qua lại để xác nhận.",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Bấm 'Hoàn tất' khi tick hết — NV chuyển sang RESIGNED",
            description: "Hồ sơ NV tự cập nhật trạng thái RESIGNED, không xuất hiện trong bảng lương tháng sau.",
            tip: "Mẹo: NV nghỉ giữa tháng vẫn được tính lương pro-ration cho những ngày đã làm.",
          },
        ],
      },
      {
        title: "Nếu NV rút đơn nghỉ việc",
        steps: [
          {
            icon: "\u21A9\uFE0F",
            title: "Bấm 'Hủy offboarding' trước khi hoàn tất",
            description: "NV tự động quay lại trạng thái ACTIVE. Tất cả task chưa làm bị xóa. Lương tháng tiếp theo tính bình thường.",
          },
        ],
      },
    ],
    relatedSlugs: ["bien-dong-nhan-su", "tinh-luong-dau-tien"],
  },

  // ─── GUIDE 10: ĐÁNH GIÁ NĂNG LỰC ────────────────────────────────
  {
    slug: "danh-gia-nang-luc",
    title: "Đánh giá năng lực",
    subtitle: "Quy trình đánh giá 360 độ — từ tự đánh giá đến kết quả cuối cùng",
    icon: "\u2B50",
    color: "blue",
    readingTime: "~4 phút",
    excelAnalogy: "Thay vì file Excel đánh giá gửi qua email rồi tổng hợp tay — hệ thống thu thập đủ 3 chiều và tính điểm tự động.",
    sections: [
      {
        title: "HR: Tạo đợt đánh giá",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào Đánh Giá → Tạo đợt mới",
            description: "Đặt tên đợt (VD: 'Đánh giá giữa năm 2026'), chọn loại (Giữa năm / Cuối năm / Thử việc), đặt deadline.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Phân công nhân viên vào đợt",
            description: "Chọn toàn bộ hoặc từng NV. Mỗi NV được gán 1 phiếu đánh giá riêng — họ nhận thông báo tự động.",
          },
        ],
      },
      {
        title: "Nhân viên: Tự đánh giá",
        steps: [
          {
            icon: "3\uFE0F\u20E3",
            title: "Vào Đánh Giá → Tìm phiếu của mình → Bắt đầu",
            description: "Điền 5 nhóm năng lực cốt lõi của RTR (kéo slider 1–5 sao). Viết điểm mạnh và điểm cần cải thiện — tối thiểu 50 ký tự mỗi ô.",
            tip: "Mẹo: Ô nào chưa đủ 50 ký tự thì nút Nộp vẫn bị mờ — cần viết đủ mới submit được.",
          },
        ],
      },
      {
        title: "Trưởng phòng: Đánh giá manager",
        steps: [
          {
            icon: "4\uFE0F\u20E3",
            title: "Sau khi NV nộp, trưởng phòng nhận thông báo",
            description: "Vào tab Manager trong phiếu → đánh giá từng năng lực → thêm nhận xét. Điểm manager sẽ ẩn với NV cho đến khi HR công bố.",
          },
        ],
      },
      {
        title: "HR: Tổng hợp & công bố kết quả",
        steps: [
          {
            icon: "5\uFE0F\u20E3",
            title: "Xem bảng tiến độ — ai đã làm, ai chưa",
            description: "Trang tổng hợp đợt hiện trạng thái từng NV: Chờ tự đánh giá / Chờ Manager / HR đang xem xét / Hoàn tất.",
          },
          {
            icon: "6\uFE0F\u20E3",
            title: "HR chọn đánh giá cuối và bấm 'Hoàn tất'",
            description: "NV thấy kết quả và điểm tổng hợp. Có thể trigger HR Event ngay từ kết quả: thăng chức, điều chỉnh lương.",
          },
        ],
      },
    ],
    relatedSlugs: ["bien-dong-nhan-su", "kpi"],
  },

  // ─── GUIDE 11: KPI ───────────────────────────────────────────────
  {
    slug: "kpi",
    title: "Quản lý KPI",
    subtitle: "Nhập điểm KPI tháng và liên kết tự động vào bảng lương",
    icon: "\u{1F3AF}",
    color: "green",
    readingTime: "~2 phút",
    excelAnalogy: "Thay vì cột KPI trong Excel và nhân tay với lương — hệ thống tính thưởng KPI và đưa thẳng vào bảng lương.",
    sections: [
      {
        title: "Tạo và nhập điểm KPI",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Vào KPI → Tạo kỳ → Chọn tháng/năm",
            description: "Hệ thống tự load danh sách NV đang làm việc. Mỗi NV có 1 dòng để nhập điểm.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Nhập điểm cho từng người (thang 0–100)",
            description: "Điểm lưu ngay, không cần Save từng dòng. Hệ thống tự tính KPI Amount dựa trên điểm và công thức đã cấu hình.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "Công bố để NV có thể xem",
            description: "Khi bấm 'Công bố', NV thấy điểm KPI của mình trong phần hồ sơ. Trước đó họ không thấy.",
            tip: "Mẹo: Nhập xong điểm thì công bố ngay — NV thường hỏi điểm KPI vào đầu tháng.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Khóa KPI khi không cần sửa thêm",
            description: "Sau khi bảng lương đã chốt, bấm 'Khóa' để đảm bảo không ai vô tình sửa điểm KPI tháng đã trả lương.",
          },
        ],
      },
    ],
    relatedSlugs: ["tinh-luong-dau-tien", "danh-gia-nang-luc"],
  },

  // ─── GUIDE 12: MẪU HỒ SƠ ────────────────────────────────────────
  {
    slug: "mau-ho-so",
    title: "Tạo văn bản từ mẫu",
    subtitle: "Upload template Word một lần — điền thông tin NV tự động mãi mãi",
    icon: "\u{1F4C4}",
    color: "purple",
    readingTime: "~3 phút",
    excelAnalogy: "Giống như mail merge trong Word/Excel — bạn có template với các ô trống, hệ thống tự điền thông tin từng NV vào.",
    sections: [
      {
        title: "Upload template lần đầu (Admin / HR Manager)",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Chuẩn bị file Word (.docx) với placeholder",
            description: "Trong file Word, thay các thông tin cần tự điền bằng {{ten_nhan_vien}}, {{ma_nv}}, {{phong_ban}}, {{luong_co_ban}}... theo đúng cú pháp ngoặc nhọn đôi.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Vào Mẫu Hồ Sơ → Upload → Đặt tên và danh mục",
            description: "Hệ thống tự scan file và nhận diện tất cả các placeholder. Bạn không cần khai báo thủ công.",
          },
          {
            icon: "3\uFE0F\u20E3",
            title: "Kiểm tra và gán nhãn từng trường",
            description: "Bước 2 hiện danh sách placeholder đã scan. Xác nhận mỗi trường là auto-fill (lấy từ hồ sơ NV) hay điền tay khi xuất.",
            tip: "Mẹo: Trường nào không chắc → để là 'điền tay' — an toàn hơn để auto-fill sai.",
          },
        ],
      },
      {
        title: "Tạo văn bản cho nhân viên",
        steps: [
          {
            icon: "4\uFE0F\u20E3",
            title: "Vào template → Chọn nhân viên",
            description: "Gõ tên NV trong ô tìm kiếm. Hệ thống tự điền họ tên, mã NV, phòng ban, chức vụ, lương, ngày vào làm...",
          },
          {
            icon: "5\uFE0F\u20E3",
            title: "Điền thêm các trường thủ công (nếu có)",
            description: "Ví dụ: nội dung thư xác nhận, số lần vi phạm... Những trường không có trong hồ sơ NV thì điền tay ở đây.",
          },
          {
            icon: "6\uFE0F\u20E3",
            title: "Bấm 'Tải xuống' — nhận file .docx hoàn chỉnh",
            description: "File Word đã điền đầy đủ, sẵn sàng in hoặc ký số. Không cần mở Word và tìm từng chỗ để sửa.",
          },
        ],
      },
    ],
    relatedSlugs: ["them-nhan-vien"],
  },

  // ─── GUIDE 13: BÁO CÁO TỔNG HỢP ─────────────────────────────────
  {
    slug: "bao-cao-tong-hop",
    title: "Báo cáo BHXH & Thuế",
    subtitle: "Xuất đúng mẫu báo cáo nhà nước — D02-TS và 05/QTT-TNCN",
    icon: "\u{1F4D1}",
    color: "blue",
    readingTime: "~3 phút",
    excelAnalogy: "Thay vì tổng hợp thủ công từ bảng lương vào mẫu D02 hay QTT-TNCN — hệ thống tự tổng hợp và xuất đúng format nộp cơ quan.",
    sections: [
      {
        title: "Báo cáo nhân sự tổng hợp",
        steps: [
          {
            icon: "\u{1F4CA}",
            title: "Vào Báo cáo → Nhân sự → Chọn năm",
            description: "Hiện headcount theo tháng, biến động vào/ra, tỷ lệ turnover, phân bổ theo phòng ban và loại hợp đồng.",
          },
          {
            icon: "\u{1F4E5}",
            title: "Export Excel — 3 sheet trong 1 file",
            description: "Sheet 1: Tổng quan theo tháng. Sheet 2: Biến động chi tiết. Sheet 3: Danh sách HĐ sắp hết hạn. Dùng được để báo cáo BGĐ.",
          },
        ],
      },
      {
        title: "Báo cáo BHXH (Mẫu D02-TS)",
        steps: [
          {
            icon: "\u{1F3E5}",
            title: "Vào Báo cáo → BHXH → Chọn tháng/năm",
            description: "Hiện: tổng số lao động, NV đăng ký mới trong tháng, NV thôi tham gia, tổng quỹ lương đóng BH.",
          },
          {
            icon: "\u{1F4E5}",
            title: "Bấm 'Export D02' — nhận file đúng mẫu D02-TS",
            description: "File Excel xuất ra theo đúng format cơ quan BHXH yêu cầu. Mã cơ quan BH lấy từ cài đặt hệ thống.",
            tip: "Mẹo: Kiểm tra mã cơ quan BH đã nhập đúng trong Quản Trị → Cài đặt trước khi xuất lần đầu.",
          },
        ],
      },
      {
        title: "Báo cáo Thuế (Mẫu 05/QTT-TNCN)",
        steps: [
          {
            icon: "\u{1F4B9}",
            title: "Vào Báo cáo → Thuế → Chọn năm",
            description: "Tổng hợp toàn bộ: tổng thu nhập chịu thuế, thuế đã khấu trừ của từng NV trong năm. Biểu đồ theo tháng.",
          },
          {
            icon: "\u{1F4E5}",
            title: "Bấm 'Export 05/QTT' — file quyết toán thuế năm",
            description: "Dùng để nộp cơ quan thuế cuối năm. Dữ liệu lấy từ tất cả bảng lương APPROVED/PAID trong năm chọn.",
          },
        ],
      },
    ],
    relatedSlugs: ["tinh-luong-dau-tien"],
  },

  // ─── GUIDE 14: QUẢN TRỊ HỆ THỐNG ────────────────────────────────
  {
    slug: "quan-tri-he-thong",
    title: "Quản trị hệ thống",
    subtitle: "Thiết lập phòng ban, chức vụ, tài khoản và cấu hình ban đầu",
    icon: "\u2699\uFE0F",
    color: "orange",
    readingTime: "~3 phút",
    excelAnalogy: "Giống như sheet 'Danh mục' trong Excel — nơi bạn định nghĩa danh sách phòng ban, chức vụ để các sheet khác dùng chung.",
    sections: [
      {
        title: "Thiết lập danh mục (làm một lần đầu)",
        steps: [
          {
            icon: "1\uFE0F\u20E3",
            title: "Tạo phòng ban: Quản Trị → Phòng Ban → Thêm",
            description: "Tạo tất cả phòng ban trước khi thêm nhân viên. Ví dụ: Kỹ thuật, Kinh doanh, Hành chính, Sản xuất.",
          },
          {
            icon: "2\uFE0F\u20E3",
            title: "Tạo chức vụ: Quản Trị → Chức Vụ → Thêm",
            description: "Tạo danh sách chức vụ dùng chung toàn công ty. Ví dụ: Kỹ sư, Nhân viên, Trưởng phòng, Giám đốc.",
          },
        ],
      },
      {
        title: "Quản lý tài khoản người dùng",
        steps: [
          {
            icon: "3\uFE0F\u20E3",
            title: "Tạo tài khoản cho HR, Trưởng phòng: Quản Trị → Người Dùng",
            description: "Mỗi người dùng có 1 email đăng nhập và 1 Role (HR_MANAGER, HR_STAFF, DEPT_MANAGER...). Role quyết định họ thấy và làm được gì.",
          },
          {
            icon: "4\uFE0F\u20E3",
            title: "Đổi mật khẩu khi cần",
            description: "Admin có thể reset mật khẩu bất kỳ tài khoản nào. Người dùng tự đổi mật khẩu trong trang Profile.",
            tip: "Mẹo: Tạo tài khoản với mật khẩu tạm → yêu cầu người dùng đổi ngay sau lần đăng nhập đầu tiên.",
          },
        ],
      },
      {
        title: "Nhật ký hệ thống (Audit Log)",
        steps: [
          {
            icon: "5\uFE0F\u20E3",
            title: "Quản Trị → Nhật Ký — xem ai làm gì, lúc nào",
            description: "Mọi hành động quan trọng đều được ghi lại: tạo/sửa/xóa NV, duyệt lương, thay đổi cài đặt. Filter theo loại hành động hoặc ngày.",
          },
          {
            icon: "6\uFE0F\u20E3",
            title: "Click vào log có dấu {...} để xem chi tiết thay đổi",
            description: "Hiện JSON diff: giá trị trước và sau thay đổi. Dùng để kiểm tra khi có tranh chấp hoặc dữ liệu bị sửa nhầm.",
          },
        ],
      },
    ],
    relatedSlugs: ["them-nhan-vien", "import-excel"],
  },
]

export function getGuideBySlug(slug: string): HelpGuide | undefined {
  return helpGuides.find((g) => g.slug === slug)
}

export function getRelatedGuides(slug: string): HelpGuide[] {
  const guide = getGuideBySlug(slug)
  if (!guide?.relatedSlugs) return []
  return guide.relatedSlugs
    .map((s) => getGuideBySlug(s))
    .filter(Boolean) as HelpGuide[]
}
