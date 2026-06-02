import type { Tool } from "@anthropic-ai/sdk/resources/messages"

export const HR_COPILOT_SYSTEM = `Bạn là AI HR Copilot của Công ty Cổ phần VietERP Việt Nam.
Bạn có thể tra cứu thông tin nhân sự thực tế và trả lời câu hỏi bằng tiếng Việt.

Khả năng của bạn:
- Tra cứu thông tin nhân viên (tên, phòng ban, chức vụ, ngày vào)
- Kiểm tra trạng thái hợp đồng và ngày hết hạn
- Xem thống kê tổng quan (số NV, phân bố phòng ban)
- Kiểm tra báo cáo đang chờ duyệt
- Xem tóm tắt bảng lương kỳ gần nhất
- Kiểm tra số ngày phép còn lại của nhân viên
- Xem chi tiết phân bổ nhân sự theo phòng ban (headcount, trưởng phòng, vị trí)
- Phân tích bất thường chấm công (đi muộn, vắng, pattern, OT chưa ghi nhận)
- Gợi ý thông minh khi sync chấm công vào bảng lương
- Dự báo nhân lực tuần tới

Nguyên tắc:
- Luôn trả lời bằng tiếng Việt
- Ngắn gọn, chính xác, chuyên nghiệp
- Không tiết lộ thông tin nhạy cảm (lương cụ thể) trừ khi user có quyền HR_MANAGER+
- Nếu không tìm thấy thông tin → nói rõ "Không tìm thấy dữ liệu"
- Không bịa thông tin`

export const HR_TOOLS: Tool[] = [
  {
    name: "search_employees",
    description: "Tìm kiếm nhân viên theo tên, mã NV, hoặc phòng ban",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Tên, mã NV hoặc phòng ban" },
        status: { type: "string", enum: ["ACTIVE", "PROBATION", "ALL"], description: "Lọc theo trạng thái" },
        limit: { type: "number", description: "Số kết quả tối đa (default: 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_dashboard_stats",
    description: "Lấy thống kê tổng quan: số NV, HĐ sắp hết hạn, báo cáo pending, phân bố phòng ban",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_expiring_contracts",
    description: "Lấy danh sách hợp đồng sắp hết hạn trong N ngày",
    input_schema: {
      type: "object" as const,
      properties: {
        days: { type: "number", description: "Số ngày tới (default: 30)" },
      },
    },
  },
  {
    name: "get_pending_reports",
    description: "Lấy danh sách báo cáo đang chờ duyệt",
    input_schema: {
      type: "object" as const,
      properties: {
        level: { type: "string", enum: ["L1", "L2", "ALL"], description: "Cấp duyệt (default: ALL)" },
      },
    },
  },
  {
    name: "get_payroll_summary",
    description: "Lấy tóm tắt bảng lương kỳ gần nhất",
    input_schema: {
      type: "object" as const,
      properties: {
        month: { type: "number", description: "Tháng" },
        year: { type: "number", description: "Năm" },
      },
    },
  },
  {
    name: "get_leave_balance",
    description: "Kiểm tra số ngày phép còn lại của nhân viên",
    input_schema: {
      type: "object" as const,
      properties: {
        employeeId: { type: "string", description: "ID nhân viên" },
        employeeName: { type: "string", description: "Hoặc tìm theo tên" },
      },
    },
  },
  {
    name: "get_department_breakdown",
    description: "Xem chi tiết phân bổ nhân sự theo phòng ban: headcount, trưởng phòng, danh sách vị trí, trạng thái nhân viên",
    input_schema: {
      type: "object" as const,
      properties: {
        departmentId: { type: "string", description: "ID phòng ban cụ thể (để trống = tất cả)" },
      },
    },
  },
  {
    name: "get_attendance_anomalies",
    description: "Phân tích và phát hiện bất thường chấm công: đi muộn liên tục, vắng nhiều, pattern nghỉ, OT chưa ghi nhận, thiếu check-out",
    input_schema: {
      type: "object" as const,
      properties: {
        month: { type: "number", description: "Tháng (default: tháng hiện tại)" },
        year: { type: "number", description: "Năm (default: năm hiện tại)" },
      },
    },
  },
  {
    name: "get_attendance_suggestions",
    description: "Gợi ý thông minh: OT chưa tạo đơn, ngày vắng chưa có đơn phép, nhân viên thiếu dữ liệu chấm công",
    input_schema: {
      type: "object" as const,
      properties: {
        month: { type: "number", description: "Tháng" },
        year: { type: "number", description: "Năm" },
      },
    },
  },
  {
    name: "get_attendance_forecast",
    description: "Dự báo nhân lực tuần tới: số người dự kiến có mặt theo phòng ban, mức rủi ro thiếu người",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
]
