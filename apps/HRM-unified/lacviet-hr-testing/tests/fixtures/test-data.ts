// tests/fixtures/test-data.ts

/**
 * LAC VIET HR - Test Data & Fixtures
 * Centralized test data for E2E and stress tests
 */

import { faker } from '@faker-js/faker';

faker.locale = 'vi';

// ════════════════════════════════════════════════════════════════════════════════
// USER CREDENTIALS
// ════════════════════════════════════════════════════════════════════════════════

export const testUsers = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@company.com',
    password: 'AdminP@ss123!',
    fullName: 'Nguyễn Văn Admin',
    role: 'ADMIN',
  },
  
  hrManager: {
    id: 'user-hr-001',
    email: 'hr.manager@company.com',
    password: 'HrP@ss123!',
    fullName: 'Trần Thị HR',
    role: 'HR_MANAGER',
  },
  
  manager: {
    id: 'user-manager-001',
    email: 'manager@company.com',
    password: 'ManagerP@ss123!',
    fullName: 'Lê Văn Manager',
    role: 'MANAGER',
    departmentId: 'dept-engineering',
  },
  
  employee: {
    id: 'user-employee-001',
    email: 'employee@company.com',
    password: 'EmployeeP@ss123!',
    fullName: 'Phạm Thị Employee',
    role: 'EMPLOYEE',
    departmentId: 'dept-engineering',
  },
  
  mfaUser: {
    id: 'user-mfa-001',
    email: 'mfa.user@company.com',
    password: 'MfaP@ss123!',
    fullName: 'Hoàng Văn MFA',
    role: 'EMPLOYEE',
    mfaEnabled: true,
  },
  
  existingEmployee: {
    id: 'emp-existing-001',
    code: 'NV000001',
    email: 'existing.employee@company.com',
    password: 'ExistP@ss123!',
    fullName: 'Nguyễn Văn Existing',
    department: 'Engineering',
    role: 'EMPLOYEE',
  },

  hr: {
    id: 'user-hr-001',
    email: 'hr@company.com',
    password: 'HrP@ss123!',
    fullName: 'Trần Thị HR',
    role: 'HR',
    departmentId: 'dept-hr',
  },

  payroll: {
    id: 'user-payroll-001',
    email: 'payroll@company.com',
    password: 'PayrollP@ss123!',
    fullName: 'Nguyễn Văn Payroll',
    role: 'PAYROLL_ADMIN',
    departmentId: 'dept-finance',
  },

  recruitment: {
    id: 'user-recruitment-001',
    email: 'recruitment@company.com',
    password: 'RecruitP@ss123!',
    fullName: 'Lê Thị Tuyển Dụng',
    role: 'RECRUITER',
    departmentId: 'dept-hr',
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ════════════════════════════════════════════════════════════════════════════════

export const testDepartments = {
  engineering: {
    id: 'dept-engineering',
    name: 'Engineering',
    code: 'ENG',
    managerId: testUsers.manager.id,
  },
  hr: {
    id: 'dept-hr',
    name: 'Human Resources',
    code: 'HR',
    managerId: testUsers.hrManager.id,
  },
  finance: {
    id: 'dept-finance',
    name: 'Finance',
    code: 'FIN',
    managerId: 'user-finance-manager',
  },
  marketing: {
    id: 'dept-marketing',
    name: 'Marketing',
    code: 'MKT',
    managerId: 'user-marketing-manager',
  },
  sales: {
    id: 'dept-sales',
    name: 'Sales',
    code: 'SALES',
    managerId: 'user-sales-manager',
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// POSITIONS
// ════════════════════════════════════════════════════════════════════════════════

export const testPositions = {
  developer: {
    id: 'pos-developer',
    name: 'Software Developer',
    code: 'DEV',
    level: 3,
  },
  seniorDeveloper: {
    id: 'pos-senior-dev',
    name: 'Senior Software Developer',
    code: 'SR_DEV',
    level: 4,
  },
  teamLead: {
    id: 'pos-team-lead',
    name: 'Team Lead',
    code: 'TL',
    level: 5,
  },
  manager: {
    id: 'pos-manager',
    name: 'Department Manager',
    code: 'MGR',
    level: 6,
  },
  hrSpecialist: {
    id: 'pos-hr-specialist',
    name: 'HR Specialist',
    code: 'HR_SPEC',
    level: 3,
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// LEAVE TYPES
// ════════════════════════════════════════════════════════════════════════════════

export const leaveTypes = {
  annual: {
    id: 'leave-annual',
    name: 'Nghỉ phép năm',
    code: 'ANNUAL',
    maxDays: 12,
  },
  sick: {
    id: 'leave-sick',
    name: 'Nghỉ ốm',
    code: 'SICK',
    maxDays: 30,
  },
  maternity: {
    id: 'leave-maternity',
    name: 'Nghỉ thai sản',
    code: 'MATERNITY',
    maxDays: 180,
  },
  marriage: {
    id: 'leave-marriage',
    name: 'Nghỉ kết hôn',
    code: 'MARRIAGE',
    maxDays: 3,
  },
  bereavement: {
    id: 'leave-bereavement',
    name: 'Nghỉ tang',
    code: 'BEREAVEMENT',
    maxDays: 3,
  },
  unpaid: {
    id: 'leave-unpaid',
    name: 'Nghỉ không lương',
    code: 'UNPAID',
    maxDays: 30,
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// DATA GENERATORS
// ════════════════════════════════════════════════════════════════════════════════

export function generateRandomEmail(): string {
  return `test.${Date.now()}.${Math.random().toString(36).substring(7)}@company.com`;
}

export function generateEmployeeData(): {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  positionId: string;
  hireDate: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  idNumber: string;
  address: string;
} {
  const gender = faker.helpers.arrayElement(['MALE', 'FEMALE'] as const);
  
  return {
    firstName: faker.person.lastName(), // In Vietnamese, family name comes first
    lastName: faker.person.firstName(gender === 'MALE' ? 'male' : 'female'),
    email: generateRandomEmail(),
    phone: faker.phone.number('09########'),
    departmentId: faker.helpers.arrayElement(Object.values(testDepartments)).id,
    positionId: faker.helpers.arrayElement(Object.values(testPositions)).id,
    hireDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    birthDate: faker.date.birthdate({ min: 22, max: 55, mode: 'age' }).toISOString().split('T')[0],
    gender,
    idNumber: faker.string.numeric(12),
    address: faker.location.streetAddress() + ', ' + faker.location.city(),
  };
}

export function generateLeaveRequestData(): {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  isHalfDay: boolean;
} {
  const startDate = faker.date.soon({ days: 30 });
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 5 }));
  
  return {
    leaveType: faker.helpers.arrayElement(Object.values(leaveTypes)).name,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    reason: faker.lorem.sentence(),
    isHalfDay: faker.datatype.boolean({ probability: 0.2 }),
  };
}

export function generateAttendanceData(): {
  date: string;
  checkIn: string;
  checkOut: string;
  workingHours: number;
} {
  const date = faker.date.recent({ days: 30 });
  const checkInHour = faker.number.int({ min: 7, max: 9 });
  const checkInMinute = faker.number.int({ min: 0, max: 59 });
  const checkOutHour = faker.number.int({ min: 17, max: 19 });
  const checkOutMinute = faker.number.int({ min: 0, max: 59 });
  
  return {
    date: date.toISOString().split('T')[0],
    checkIn: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`,
    checkOut: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`,
    workingHours: checkOutHour - checkInHour,
  };
}

export function generateCandidateData(): {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  expectedSalary: number;
  skills: string[];
} {
  return {
    firstName: faker.person.lastName(),
    lastName: faker.person.firstName(),
    email: faker.internet.email(),
    phone: faker.phone.number('09########'),
    position: faker.helpers.arrayElement(['Software Developer', 'Senior Developer', 'Team Lead', 'QA Engineer']),
    experience: faker.number.int({ min: 1, max: 15 }),
    expectedSalary: faker.number.int({ min: 10000000, max: 50000000 }),
    skills: faker.helpers.arrayElements(
      ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'AWS', 'Docker'],
      { min: 2, max: 5 }
    ),
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// BATCH GENERATORS
// ════════════════════════════════════════════════════════════════════════════════

export function generateEmployeeBatch(count: number) {
  return Array.from({ length: count }, () => generateEmployeeData());
}

export function generateLeaveRequestBatch(count: number) {
  return Array.from({ length: count }, () => generateLeaveRequestData());
}

export function generateOvertimeData(): {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  hours: number;
} {
  const date = faker.date.soon({ days: 14 });
  const startHour = faker.number.int({ min: 18, max: 19 });
  const endHour = faker.number.int({ min: 20, max: 23 });

  return {
    date: date.toISOString().split('T')[0],
    startTime: `${startHour.toString().padStart(2, '0')}:00`,
    endTime: `${endHour.toString().padStart(2, '0')}:00`,
    reason: faker.lorem.sentence(),
    hours: endHour - startHour,
  };
}

export function generatePayrollPeriodData(): {
  month: string;
  year: string;
  startDate: string;
  endDate: string;
  payDate: string;
} {
  const now = new Date();
  const month = (now.getMonth() + 1).toString();
  const year = now.getFullYear().toString();

  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const payDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);

  return {
    month,
    year,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    payDate: payDate.toISOString().split('T')[0],
  };
}

export function generateSalaryAdjustmentData(): {
  type: 'BONUS' | 'DEDUCTION' | 'ALLOWANCE';
  amount: number;
  note: string;
  recurring: boolean;
} {
  return {
    type: faker.helpers.arrayElement(['BONUS', 'DEDUCTION', 'ALLOWANCE'] as const),
    amount: faker.number.int({ min: 500000, max: 10000000 }),
    note: faker.lorem.sentence(),
    recurring: faker.datatype.boolean({ probability: 0.3 }),
  };
}

export function generateShiftData(): {
  name: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
} {
  const shiftType = faker.helpers.arrayElement(['morning', 'afternoon', 'night']);

  const shifts = {
    morning: { start: '06:00', end: '14:00', breakStart: '10:00', breakEnd: '10:30' },
    afternoon: { start: '14:00', end: '22:00', breakStart: '18:00', breakEnd: '18:30' },
    night: { start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '02:30' },
  };

  const shift = shifts[shiftType];

  return {
    name: faker.helpers.arrayElement(['Ca Sáng', 'Ca Chiều', 'Ca Đêm', 'Ca Hành Chính']),
    startTime: shift.start,
    endTime: shift.end,
    breakStart: shift.breakStart,
    breakEnd: shift.breakEnd,
  };
}

export function generateRandomDate(daysFromNow: number = 30): string {
  const date = faker.date.soon({ days: daysFromNow });
  return date.toISOString().split('T')[0];
}

export function generateJobPostingData(): {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
} {
  return {
    title: faker.helpers.arrayElement([
      'Software Developer',
      'Senior Developer',
      'DevOps Engineer',
      'QA Engineer',
      'Product Manager',
      'UI/UX Designer',
      'Data Analyst',
    ]),
    department: faker.helpers.arrayElement(Object.values(testDepartments)).name,
    location: faker.helpers.arrayElement(['Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Remote']),
    employmentType: faker.helpers.arrayElement(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
    salaryMin: faker.number.int({ min: 10000000, max: 30000000 }),
    salaryMax: faker.number.int({ min: 30000000, max: 80000000 }),
    description: faker.lorem.paragraphs(3),
    requirements: faker.helpers.arrayElements(
      [
        '3+ years experience',
        'Bachelor degree in CS',
        'Good English communication',
        'Team player',
        'Problem solving skills',
        'Experience with Agile',
      ],
      { min: 3, max: 5 }
    ),
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS (for reference)
// ════════════════════════════════════════════════════════════════════════════════

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  employees: {
    list: '/api/employees',
    detail: (id: string) => `/api/employees/${id}`,
    create: '/api/employees',
    update: (id: string) => `/api/employees/${id}`,
    delete: (id: string) => `/api/employees/${id}`,
    search: '/api/employees/search',
  },
  departments: {
    list: '/api/departments',
    tree: '/api/departments/tree',
    detail: (id: string) => `/api/departments/${id}`,
  },
  leave: {
    list: '/api/leave',
    detail: (id: string) => `/api/leave/${id}`,
    create: '/api/leave',
    approve: (id: string) => `/api/leave/${id}/approve`,
    reject: (id: string) => `/api/leave/${id}/reject`,
    balance: '/api/leave/balance',
  },
  attendance: {
    list: '/api/attendance',
    checkIn: '/api/attendance/check-in',
    checkOut: '/api/attendance/check-out',
    summary: '/api/attendance/summary',
  },
  dashboard: {
    stats: '/api/dashboard/stats',
    charts: '/api/dashboard/charts',
  },
};

export default {
  testUsers,
  testDepartments,
  testPositions,
  leaveTypes,
  generateRandomEmail,
  generateEmployeeData,
  generateLeaveRequestData,
  generateAttendanceData,
  generateCandidateData,
  generateEmployeeBatch,
  generateLeaveRequestBatch,
  API_ENDPOINTS,
};
