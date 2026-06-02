// tests/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { employeesMock, generateEmployee } from './data/employees.mock';
import { leaveRequestsMock, leaveBalancesMock } from './data/leave.mock';

/**
 * LAC VIET HR - MSW Mock Handlers
 * API mocks for unit and component testing
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: items.slice(start, end),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// AUTH HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

const authHandlers = [
  // Login
  http.post(`${BASE_URL}/api/auth/login`, async ({ request }) => {
    await delay(100);

    const body = await request.json() as { email: string; password: string };

    // Valid test credentials
    const validUsers = [
      { email: 'admin@test.your-domain.com', password: 'Admin@123456', role: 'ADMIN' },
      { email: 'manager@test.your-domain.com', password: 'Manager@123456', role: 'MANAGER' },
      { email: 'employee@test.your-domain.com', password: 'Employee@123456', role: 'EMPLOYEE' },
    ];

    const user = validUsers.find(u => u.email === body.email && u.password === body.password);

    if (user) {
      return HttpResponse.json({
        success: true,
        token: `mock-jwt-token-${user.role.toLowerCase()}`,
        user: {
          id: `user-${user.role.toLowerCase()}`,
          email: user.email,
          name: `Test ${user.role}`,
          role: user.role,
        },
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Email hoặc mật khẩu không đúng' },
      { status: 401 }
    );
  }),

  // Logout
  http.post(`${BASE_URL}/api/auth/logout`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),

  // Get current user
  http.get(`${BASE_URL}/api/auth/me`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const role = token.includes('admin') ? 'ADMIN' : token.includes('manager') ? 'MANAGER' : 'EMPLOYEE';

    return HttpResponse.json({
      id: `user-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@test.your-domain.com`,
      name: `Test ${role}`,
      role,
    });
  }),
];

// ════════════════════════════════════════════════════════════════════════════════
// EMPLOYEE HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

let employees = [...employeesMock];

const employeeHandlers = [
  // List employees
  http.get(`${BASE_URL}/api/employees`, async ({ request }) => {
    await delay(100);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');
    const department = url.searchParams.get('department');

    let filtered = [...employees];

    // Apply search
    if (search) {
      filtered = filtered.filter(e =>
        e.firstName.toLowerCase().includes(search) ||
        e.lastName.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.employeeCode.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    // Apply department filter
    if (department) {
      filtered = filtered.filter(e => e.department?.id === department);
    }

    const result = paginate(filtered, page, limit);

    return HttpResponse.json({
      employees: result.data,
      pagination: result.pagination,
    });
  }),

  // Get employee by ID
  http.get(`${BASE_URL}/api/employees/:id`, async ({ params }) => {
    await delay(50);

    const employee = employees.find(e => e.id === params.id);

    if (!employee) {
      return HttpResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    return HttpResponse.json(employee);
  }),

  // Create employee
  http.post(`${BASE_URL}/api/employees`, async ({ request }) => {
    await delay(100);

    const body = await request.json() as Record<string, unknown>;

    // Check for duplicate email
    if (employees.some(e => e.email === body.email)) {
      return HttpResponse.json(
        { error: 'Email đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    // Check for duplicate employee code
    if (body.employeeCode && employees.some(e => e.employeeCode === body.employeeCode)) {
      return HttpResponse.json(
        { error: 'Mã nhân viên đã tồn tại' },
        { status: 400 }
      );
    }

    const newEmployee = generateEmployee({
      ...body,
      id: `emp-${Date.now()}`,
    } as Partial<typeof employeesMock[0]>);

    employees.push(newEmployee);

    return HttpResponse.json(newEmployee, { status: 201 });
  }),

  // Update employee
  http.put(`${BASE_URL}/api/employees/:id`, async ({ params, request }) => {
    await delay(100);

    const body = await request.json() as Record<string, unknown>;
    const index = employees.findIndex(e => e.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    // Check for duplicate email (excluding current employee)
    if (body.email && employees.some(e => e.email === body.email && e.id !== params.id)) {
      return HttpResponse.json(
        { error: 'Email đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    employees[index] = { ...employees[index], ...body } as typeof employees[0];

    return HttpResponse.json(employees[index]);
  }),

  // Delete employee
  http.delete(`${BASE_URL}/api/employees/:id`, async ({ params }) => {
    await delay(100);

    const index = employees.findIndex(e => e.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    // Soft delete
    employees[index].status = 'TERMINATED';

    return HttpResponse.json({ success: true, message: 'Đã xóa nhân viên thành công' });
  }),
];

// ════════════════════════════════════════════════════════════════════════════════
// LEAVE HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

let leaveRequests = [...leaveRequestsMock];

const leaveHandlers = [
  // List leave requests
  http.get(`${BASE_URL}/api/leave`, async ({ request }) => {
    await delay(100);

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const employeeId = url.searchParams.get('employeeId');

    let filtered = [...leaveRequests];

    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    if (employeeId) {
      filtered = filtered.filter(r => r.employeeId === employeeId);
    }

    return HttpResponse.json({
      leaveRequests: filtered,
      total: filtered.length,
    });
  }),

  // Get leave balances
  http.get(`${BASE_URL}/api/leave/balance/:employeeId`, async ({ params }) => {
    await delay(50);

    const balances = leaveBalancesMock.filter(b => b.employeeId === params.employeeId);

    return HttpResponse.json({ balances });
  }),

  // Create leave request
  http.post(`${BASE_URL}/api/leave`, async ({ request }) => {
    await delay(100);

    const body = await request.json() as Record<string, unknown>;

    // Validate date range
    const startDate = new Date(body.startDate as string);
    const endDate = new Date(body.endDate as string);

    if (endDate < startDate) {
      return HttpResponse.json(
        { error: 'Ngày kết thúc phải sau ngày bắt đầu' },
        { status: 400 }
      );
    }

    // Check for overlapping requests
    const hasOverlap = leaveRequests.some(r =>
      r.employeeId === body.employeeId &&
      r.status !== 'CANCELLED' &&
      r.status !== 'REJECTED' &&
      new Date(r.startDate) <= endDate &&
      new Date(r.endDate) >= startDate
    );

    if (hasOverlap) {
      return HttpResponse.json(
        { error: 'Yêu cầu trùng với yêu cầu nghỉ phép khác' },
        { status: 400 }
      );
    }

    // Calculate total days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check balance
    const balance = leaveBalancesMock.find(
      b => b.employeeId === body.employeeId && b.leaveType === body.leaveType
    );

    if (balance && totalDays > balance.balance) {
      return HttpResponse.json(
        { error: 'Số ngày nghỉ vượt quá số ngày phép còn lại' },
        { status: 400 }
      );
    }

    const newRequest = {
      id: `leave-${Date.now()}`,
      ...body,
      totalDays,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    leaveRequests.push(newRequest as typeof leaveRequests[0]);

    return HttpResponse.json(newRequest, { status: 201 });
  }),

  // Approve/Reject leave request
  http.patch(`${BASE_URL}/api/leave/:id/approve`, async ({ params, request }) => {
    await delay(100);

    const body = await request.json() as { action: 'APPROVE' | 'REJECT'; comment?: string };
    const index = leaveRequests.findIndex(r => r.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Không tìm thấy yêu cầu' },
        { status: 404 }
      );
    }

    if (body.action === 'REJECT' && !body.comment) {
      return HttpResponse.json(
        { error: 'Vui lòng nhập lý do từ chối' },
        { status: 400 }
      );
    }

    leaveRequests[index] = {
      ...leaveRequests[index],
      status: body.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      approvedAt: new Date().toISOString(),
      approverComment: body.comment,
    };

    return HttpResponse.json(leaveRequests[index]);
  }),

  // Cancel leave request
  http.patch(`${BASE_URL}/api/leave/:id/cancel`, async ({ params }) => {
    await delay(100);

    const index = leaveRequests.findIndex(r => r.id === params.id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Không tìm thấy yêu cầu' },
        { status: 404 }
      );
    }

    if (leaveRequests[index].status !== 'PENDING') {
      return HttpResponse.json(
        { error: 'Chỉ có thể hủy yêu cầu đang chờ duyệt' },
        { status: 400 }
      );
    }

    leaveRequests[index].status = 'CANCELLED';

    return HttpResponse.json(leaveRequests[index]);
  }),
];

// ════════════════════════════════════════════════════════════════════════════════
// DASHBOARD HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

const dashboardHandlers = [
  http.get(`${BASE_URL}/api/dashboard`, async () => {
    await delay(100);

    return HttpResponse.json({
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
      newHiresThisMonth: 5,
      turnoverRate: 8.5,
      pendingApprovals: leaveRequests.filter(r => r.status === 'PENDING').length,
      attendanceRate: 95.2,
    });
  }),

  http.get(`${BASE_URL}/api/analytics/workforce`, async () => {
    await delay(100);

    return HttpResponse.json({
      summary: {
        total: employees.length,
        active: employees.filter(e => e.status === 'ACTIVE').length,
        onLeave: 5,
        probation: employees.filter(e => e.status === 'PROBATION').length,
      },
      byDepartment: [
        { name: 'IT', count: 50 },
        { name: 'HR', count: 20 },
        { name: 'Sales', count: 80 },
        { name: 'Marketing', count: 30 },
      ],
      byGender: [
        { gender: 'MALE', count: 100 },
        { gender: 'FEMALE', count: 80 },
      ],
      trend: [
        { month: '2024-01', count: 170 },
        { month: '2024-02', count: 175 },
        { month: '2024-03', count: 180 },
      ],
    });
  }),
];

// ════════════════════════════════════════════════════════════════════════════════
// NOTIFICATION HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

const notificationHandlers = [
  http.get(`${BASE_URL}/api/notifications`, async () => {
    await delay(50);

    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          type: 'LEAVE_APPROVED',
          title: 'Yêu cầu nghỉ phép đã được phê duyệt',
          message: 'Yêu cầu nghỉ phép từ 01/03 đến 03/03 đã được phê duyệt.',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'SYSTEM',
          title: 'Cập nhật hệ thống',
          message: 'Hệ thống sẽ bảo trì vào 20:00 ngày 15/03.',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      unreadCount: 1,
    });
  }),

  http.patch(`${BASE_URL}/api/notifications/:id/read`, async () => {
    return HttpResponse.json({ success: true });
  }),
];

// ════════════════════════════════════════════════════════════════════════════════
// EXPORT ALL HANDLERS
// ════════════════════════════════════════════════════════════════════════════════

export const handlers = [
  ...authHandlers,
  ...employeeHandlers,
  ...leaveHandlers,
  ...dashboardHandlers,
  ...notificationHandlers,
];

// Reset function for tests
export function resetMockData() {
  employees = [...employeesMock];
  leaveRequests = [...leaveRequestsMock];
}
