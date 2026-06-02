// tests/mocks/data/leave.mock.ts

/**
 * LAC VIET HR - Mock Leave Data
 * Test data for leave-related tests
 */

export interface MockLeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'WEDDING' | 'BEREAVEMENT';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverComment?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface MockLeaveBalance {
  id: string;
  employeeId: string;
  leaveType: string;
  year: number;
  entitled: number;
  used: number;
  balance: number;
}

export const leaveRequestsMock: MockLeaveRequest[] = [
  {
    id: 'leave-001',
    employeeId: 'emp-001',
    leaveType: 'ANNUAL',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    totalDays: 3,
    reason: 'Việc gia đình',
    status: 'PENDING',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'leave-002',
    employeeId: 'emp-002',
    leaveType: 'SICK',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    totalDays: 2,
    reason: 'Cảm cúm',
    status: 'APPROVED',
    approverComment: 'Chúc bạn mau khỏe',
    createdAt: '2024-02-14T08:00:00Z',
    approvedAt: '2024-02-14T10:00:00Z',
  },
  {
    id: 'leave-003',
    employeeId: 'emp-003',
    leaveType: 'ANNUAL',
    startDate: '2024-02-20',
    endDate: '2024-02-25',
    totalDays: 6,
    reason: 'Du lịch cùng gia đình',
    status: 'REJECTED',
    rejectionReason: 'Thiếu nhân sự trong thời gian này',
    createdAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'leave-004',
    employeeId: 'emp-001',
    leaveType: 'ANNUAL',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    totalDays: 3,
    reason: 'Nghỉ Tết',
    status: 'APPROVED',
    approverComment: 'Đồng ý',
    createdAt: '2024-01-05T08:00:00Z',
    approvedAt: '2024-01-06T09:00:00Z',
  },
  {
    id: 'leave-005',
    employeeId: 'emp-004',
    leaveType: 'UNPAID',
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    totalDays: 5,
    reason: 'Việc cá nhân',
    status: 'PENDING',
    createdAt: '2024-03-25T14:00:00Z',
  },
];

export const leaveBalancesMock: MockLeaveBalance[] = [
  {
    id: 'bal-001',
    employeeId: 'emp-001',
    leaveType: 'ANNUAL',
    year: 2024,
    entitled: 12,
    used: 3,
    balance: 9,
  },
  {
    id: 'bal-002',
    employeeId: 'emp-001',
    leaveType: 'SICK',
    year: 2024,
    entitled: 30,
    used: 0,
    balance: 30,
  },
  {
    id: 'bal-003',
    employeeId: 'emp-002',
    leaveType: 'ANNUAL',
    year: 2024,
    entitled: 14,
    used: 2,
    balance: 12,
  },
  {
    id: 'bal-004',
    employeeId: 'emp-002',
    leaveType: 'SICK',
    year: 2024,
    entitled: 30,
    used: 2,
    balance: 28,
  },
  {
    id: 'bal-005',
    employeeId: 'emp-003',
    leaveType: 'ANNUAL',
    year: 2024,
    entitled: 12,
    used: 0,
    balance: 12,
  },
  {
    id: 'bal-006',
    employeeId: 'emp-004',
    leaveType: 'ANNUAL',
    year: 2024,
    entitled: 12,
    used: 0,
    balance: 12,
  },
];

// Generate leave request
export function generateLeaveRequest(overrides: Partial<MockLeaveRequest> = {}): MockLeaveRequest {
  const id = overrides.id || `leave-${Date.now()}`;
  const startDate = overrides.startDate || '2024-03-01';
  const endDate = overrides.endDate || '2024-03-03';

  return {
    id,
    employeeId: 'emp-001',
    leaveType: 'ANNUAL',
    startDate,
    endDate,
    totalDays: 3,
    reason: 'Test leave request',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Leave type labels (Vietnamese)
export const leaveTypeLabels: Record<string, string> = {
  ANNUAL: 'Nghỉ phép năm',
  SICK: 'Nghỉ ốm',
  UNPAID: 'Nghỉ không lương',
  MATERNITY: 'Nghỉ thai sản',
  PATERNITY: 'Nghỉ chăm con',
  WEDDING: 'Nghỉ cưới',
  BEREAVEMENT: 'Nghỉ tang',
};

// Leave status labels (Vietnamese)
export const leaveStatusLabels: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
};
