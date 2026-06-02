export const TEST_USERS = {
  admin: {
    email: "admin@demo.com",
    password: "Admin@123",
    name: "Admin Demo",
  },
  hr: {
    email: "hr@demo.com",
    password: "HRManager@123",
    name: "HR Manager",
  },
} as const

export const UI_TEXT = {
  login: {
    title: "Đăng nhập",
    subtitle: "Nhập email và mật khẩu để truy cập hệ thống",
    emailPlaceholder: "email@congty.vn",
    passwordPlaceholder: "Nhập mật khẩu",
    submitButton: "Đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    invalidEmail: "Email không hợp lệ",
    requiredPassword: "Mật khẩu là bắt buộc",
  },
  dashboard: {
    title: "Tổng quan",
    metrics: {
      totalEmployees: "Tổng nhân viên",
      activeToday: "Đi làm hôm nay",
      onLeave: "Đang nghỉ phép",
      pendingApprovals: "Chờ duyệt",
    },
    sections: {
      attendanceTrend: "Xu hướng chấm công tuần này",
      departmentChart: "Phân bổ theo phòng ban",
      recentActivities: "Hoạt động gần đây",
    },
  },
  sidebar: {
    aiCommand: "AI Command",
    dashboard: "Tổng quan",
    sections: {
      people: "Con người",
      operations: "Vận hành",
      development: "Phát triển",
    },
    items: {
      employees: "Nhân viên",
      organization: "Tổ chức",
      attendance: "Chấm công",
      payroll: "Bảng lương",
    },
  },
  employees: {
    pageTitle: "Nhân viên",
  },
} as const
