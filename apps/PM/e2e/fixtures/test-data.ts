/**
 * Test data for PM (Project Management) E2E tests
 * Vietnamese project, task, and team data
 */

export const TEST_PROJECTS = {
  website: {
    name: '[E2E] Dự án Website Thương mại điện tử',
    description: 'Xây dựng website bán hàng trực tuyến',
    status: 'active',
    manager: '[E2E] Nguyễn Quản lý',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  mobileApp: {
    name: '[E2E] Dự án Ứng dụng di động',
    description: 'Phát triển ứng dụng mobile',
    status: 'planning',
    manager: '[E2E] Trần Quản lý',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  infrastructure: {
    name: '[E2E] Dự án Cơ sở hạ tầng',
    description: 'Nâng cấp hạ tầng IT',
    status: 'active',
    manager: '[E2E] Lê Quản lý',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
}

export const TEST_TASKS = {
  design: {
    title: '[E2E] Thiết kế giao diện người dùng',
    description: 'Thiết kế UI/UX cho trang chủ',
    status: 'todo',
    priority: 'high',
    assignee: '[E2E] Nhân viên thiết kế',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  development: {
    title: '[E2E] Phát triển API backend',
    description: 'Xây dựng các endpoint REST API',
    status: 'in_progress',
    priority: 'high',
    assignee: '[E2E] Nhân viên phát triển',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  testing: {
    title: '[E2E] Kiểm thử tổng hợp',
    description: 'Kiểm thử toàn bộ hệ thống',
    status: 'todo',
    priority: 'medium',
    assignee: '[E2E] Nhân viên QA',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  documentation: {
    title: '[E2E] Viết tài liệu',
    description: 'Hoàn thành tài liệu dự án',
    status: 'todo',
    priority: 'low',
    assignee: '[E2E] Nhân viên tài liệu',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
}

export const TASK_STATUSES = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  in_review: 'Đang xem xét',
  done: 'Hoàn thành',
  blocked: 'Bị chặn',
}

export const TASK_PRIORITIES = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn cấp',
}

export const PROJECT_STATUSES = {
  planning: 'Lập kế hoạch',
  active: 'Đang chạy',
  on_hold: 'Tạm dừng',
  completed: 'Hoàn thành',
  cancelled: 'Hủy bỏ',
}

export const TEAM_MEMBERS = [
  {
    name: '[E2E] Nguyễn Trưởng dự án',
    email: `pm-${Date.now()}@pm.local`,
    role: 'Project Manager',
  },
  {
    name: '[E2E] Trần Lập trình viên',
    email: `dev-${Date.now()}@pm.local`,
    role: 'Developer',
  },
  {
    name: '[E2E] Lê Kiểm thử',
    email: `qa-${Date.now()}@pm.local`,
    role: 'QA Engineer',
  },
  {
    name: '[E2E] Phạm Thiết kế',
    email: `design-${Date.now()}@pm.local`,
    role: 'Designer',
  },
]
