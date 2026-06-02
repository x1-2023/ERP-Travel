export const AUDIT_ACTIONS: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Tạo mới', color: 'green' },
  UPDATE: { label: 'Cập nhật', color: 'blue' },
  DELETE: { label: 'Xóa', color: 'red' },
  LOGIN: { label: 'Đăng nhập', color: 'gray' },
  LOGOUT: { label: 'Đăng xuất', color: 'gray' },
  EXPORT: { label: 'Xuất dữ liệu', color: 'purple' },
  IMPORT: { label: 'Nhập dữ liệu', color: 'orange' },
  APPROVE: { label: 'Duyệt', color: 'green' },
  REJECT: { label: 'Từ chối', color: 'red' },
}

export const ENTITY_TYPES: Record<string, string> = {
  Employee: 'Nhân viên',
  User: 'Người dùng',
  Department: 'Phòng ban',
  Contract: 'Hợp đồng',
  LeaveRequest: 'Đơn nghỉ phép',
  OvertimeRequest: 'Đơn tăng ca',
  Payroll: 'Bảng lương',
  Attendance: 'Chấm công',
  LeavePolicy: 'Chính sách nghỉ phép',
  ApiKey: 'API Key',
  Webhook: 'Webhook',
  EmailTemplate: 'Mẫu email',
}
