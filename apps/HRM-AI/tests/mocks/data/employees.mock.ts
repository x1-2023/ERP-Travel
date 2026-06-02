// tests/mocks/data/employees.mock.ts

/**
 * LAC VIET HR - Mock Employee Data
 * Test data for unit and integration tests
 */

export interface MockEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'TERMINATED';
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    name: string;
  };
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export const employeesMock: MockEmployee[] = [
  {
    id: 'emp-001',
    employeeCode: 'TEST-EMP-001',
    firstName: 'Nguyễn',
    lastName: 'Văn Test',
    email: 'nguyen.vantest@test.your-domain.com',
    phone: '0901234567',
    status: 'ACTIVE',
    department: { id: 'dept-it', name: 'IT Department (Test)' },
    position: { id: 'pos-dev', name: 'Developer' },
    hireDate: '2022-01-15',
    createdAt: '2022-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'emp-002',
    employeeCode: 'TEST-EMP-002',
    firstName: 'Trần',
    lastName: 'Thị Test',
    email: 'tran.thitest@test.your-domain.com',
    phone: '0902345678',
    status: 'ACTIVE',
    department: { id: 'dept-hr', name: 'HR Department (Test)' },
    position: { id: 'pos-hr', name: 'HR Specialist' },
    hireDate: '2021-06-01',
    createdAt: '2021-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'emp-003',
    employeeCode: 'TEST-EMP-003',
    firstName: 'Lê',
    lastName: 'Văn Test',
    email: 'le.vantest@test.your-domain.com',
    phone: '0903456789',
    status: 'ACTIVE',
    department: { id: 'dept-sales', name: 'Sales Department (Test)' },
    position: { id: 'pos-sales', name: 'Sales Executive' },
    hireDate: '2023-03-15',
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'emp-004',
    employeeCode: 'TEST-EMP-004',
    firstName: 'Phạm',
    lastName: 'Thị Test',
    email: 'pham.thitest@test.your-domain.com',
    phone: '0904567890',
    status: 'PROBATION',
    department: { id: 'dept-it', name: 'IT Department (Test)' },
    position: { id: 'pos-dev', name: 'Junior Developer' },
    hireDate: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'emp-005',
    employeeCode: 'TEST-EMP-005',
    firstName: 'Hoàng',
    lastName: 'Văn Test',
    email: 'hoang.vantest@test.your-domain.com',
    phone: '0905678901',
    status: 'INACTIVE',
    department: { id: 'dept-hr', name: 'HR Department (Test)' },
    position: { id: 'pos-hr', name: 'HR Manager' },
    hireDate: '2019-01-01',
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2023-12-31T00:00:00Z',
  },
];

// Generate employee with custom data
export function generateEmployee(overrides: Partial<MockEmployee> = {}): MockEmployee {
  const id = overrides.id || `emp-${Date.now()}`;
  const timestamp = new Date().toISOString();

  return {
    id,
    employeeCode: `EMP-${Date.now()}`,
    firstName: 'Generated',
    lastName: 'Employee',
    email: `generated.${Date.now()}@test.com`,
    phone: '0901234567',
    status: 'ACTIVE',
    department: { id: 'dept-it', name: 'IT Department' },
    position: { id: 'pos-dev', name: 'Developer' },
    hireDate: '2024-01-01',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

// Generate multiple employees
export function generateEmployees(count: number): MockEmployee[] {
  return Array.from({ length: count }, (_, i) =>
    generateEmployee({
      id: `emp-gen-${i + 1}`,
      employeeCode: `GEN-${String(i + 1).padStart(3, '0')}`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      email: `employee${i + 1}@test.com`,
    })
  );
}

export const departmentsMock = [
  { id: 'dept-it', name: 'IT Department (Test)', code: 'IT-TEST' },
  { id: 'dept-hr', name: 'HR Department (Test)', code: 'HR-TEST' },
  { id: 'dept-sales', name: 'Sales Department (Test)', code: 'SALES-TEST' },
  { id: 'dept-finance', name: 'Finance Department (Test)', code: 'FIN-TEST' },
  { id: 'dept-marketing', name: 'Marketing Department (Test)', code: 'MKT-TEST' },
];

export const positionsMock = [
  { id: 'pos-dev', name: 'Developer', departmentId: 'dept-it' },
  { id: 'pos-senior-dev', name: 'Senior Developer', departmentId: 'dept-it' },
  { id: 'pos-hr', name: 'HR Specialist', departmentId: 'dept-hr' },
  { id: 'pos-hr-mgr', name: 'HR Manager', departmentId: 'dept-hr' },
  { id: 'pos-sales', name: 'Sales Executive', departmentId: 'dept-sales' },
];
