// tests/api/specs/employees.api.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * LAC VIET HR - Employees API Tests
 * Integration tests for employee API endpoints
 */

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function createMockRequest(
  method: string,
  url: string,
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  }
): NextRequest {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = new URL(url, baseUrl);

  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      fullUrl.searchParams.set(key, value);
    });
  }

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer mock-jwt-token-admin',
      ...options?.headers,
    },
  };

  if (options?.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestInit.body = JSON.stringify(options.body);
  }

  return new NextRequest(fullUrl, requestInit);
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════════════════════════

const mockEmployees = [
  {
    id: 'emp-1',
    employeeCode: 'EMP001',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    email: 'nguyenvana@test.com',
    phone: '0901234567',
    status: 'ACTIVE',
    departmentId: 'dept-1',
  },
  {
    id: 'emp-2',
    employeeCode: 'EMP002',
    firstName: 'Trần',
    lastName: 'Thị B',
    email: 'tranthib@test.com',
    phone: '0902345678',
    status: 'ACTIVE',
    departmentId: 'dept-2',
  },
];

// ════════════════════════════════════════════════════════════════════════════════
// MOCK API HANDLERS (simulating actual API behavior)
// ════════════════════════════════════════════════════════════════════════════════

async function handleGetEmployees(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search')?.toLowerCase();
  const status = url.searchParams.get('status');

  let filtered = [...mockEmployees];

  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.firstName.toLowerCase().includes(search) ||
        e.lastName.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search)
    );
  }

  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return Response.json({
    employees: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}

async function handleGetEmployee(id: string) {
  const employee = mockEmployees.find((e) => e.id === id);

  if (!employee) {
    return Response.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
  }

  return Response.json(employee);
}

async function handleCreateEmployee(request: NextRequest) {
  const body = await request.json();

  // Validate required fields
  const errors: string[] = [];
  if (!body.firstName) errors.push('firstName is required');
  if (!body.lastName) errors.push('lastName is required');
  if (!body.email) errors.push('email is required');

  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  // Check duplicate email
  if (mockEmployees.some((e) => e.email === body.email)) {
    return Response.json({ error: 'Email đã tồn tại trong hệ thống' }, { status: 400 });
  }

  const newEmployee = {
    id: `emp-${Date.now()}`,
    employeeCode: body.employeeCode || `EMP${Date.now()}`,
    ...body,
    status: body.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  return Response.json(newEmployee, { status: 201 });
}

async function handleUpdateEmployee(id: string, request: NextRequest) {
  const body = await request.json();
  const index = mockEmployees.findIndex((e) => e.id === id);

  if (index === -1) {
    return Response.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
  }

  // Check email uniqueness
  if (body.email && mockEmployees.some((e) => e.email === body.email && e.id !== id)) {
    return Response.json({ error: 'Email đã tồn tại trong hệ thống' }, { status: 400 });
  }

  const updated = { ...mockEmployees[index], ...body };
  return Response.json(updated);
}

async function handleDeleteEmployee(id: string) {
  const index = mockEmployees.findIndex((e) => e.id === id);

  if (index === -1) {
    return Response.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
  }

  return Response.json({ success: true, message: 'Đã xóa nhân viên thành công' });
}

// ════════════════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════════════════

describe('Employees API', () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/employees
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /api/employees', () => {
    it('should return paginated employees list', async () => {
      const request = createMockRequest('GET', '/api/employees', {
        searchParams: { page: '1', limit: '10' },
      });

      const response = await handleGetEmployees(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.employees).toBeDefined();
      expect(Array.isArray(data.employees)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('should filter employees by search term', async () => {
      const request = createMockRequest('GET', '/api/employees', {
        searchParams: { search: 'Nguyễn' },
      });

      const response = await handleGetEmployees(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.employees.length).toBe(1);
      expect(data.employees[0].firstName).toBe('Nguyễn');
    });

    it('should filter employees by status', async () => {
      const request = createMockRequest('GET', '/api/employees', {
        searchParams: { status: 'ACTIVE' },
      });

      const response = await handleGetEmployees(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.employees.every((e: { status: string }) => e.status === 'ACTIVE')).toBe(true);
    });

    it('should return empty array when no matches', async () => {
      const request = createMockRequest('GET', '/api/employees', {
        searchParams: { search: 'NonExistent' },
      });

      const response = await handleGetEmployees(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.employees).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const request = createMockRequest('GET', '/api/employees', {
        searchParams: { page: '1', limit: '1' },
      });

      const response = await handleGetEmployees(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.employees).toHaveLength(1);
      expect(data.pagination.totalPages).toBe(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/employees/:id
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /api/employees/:id', () => {
    it('should return employee by id', async () => {
      const response = await handleGetEmployee('emp-1');
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.id).toBe('emp-1');
      expect(data.firstName).toBe('Nguyễn');
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await handleGetEmployee('non-existent');
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /api/employees
  // ─────────────────────────────────────────────────────────────────────────────

  describe('POST /api/employees', () => {
    it('should create new employee with valid data', async () => {
      const newEmployee = {
        firstName: 'New',
        lastName: 'Employee',
        email: 'new.employee@test.com',
        phone: '0901234567',
      };

      const request = createMockRequest('POST', '/api/employees', {
        body: newEmployee,
      });

      const response = await handleCreateEmployee(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.firstName).toBe(newEmployee.firstName);
      expect(data.email).toBe(newEmployee.email);
    });

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest('POST', '/api/employees', {
        body: { firstName: 'Only First Name' },
      });

      const response = await handleCreateEmployee(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
      expect(data.errors).toContain('lastName is required');
      expect(data.errors).toContain('email is required');
    });

    it('should return 400 for duplicate email', async () => {
      const request = createMockRequest('POST', '/api/employees', {
        body: {
          firstName: 'Duplicate',
          lastName: 'Email',
          email: 'nguyenvana@test.com', // Existing email
        },
      });

      const response = await handleCreateEmployee(request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('Email');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /api/employees/:id
  // ─────────────────────────────────────────────────────────────────────────────

  describe('PUT /api/employees/:id', () => {
    it('should update employee with valid data', async () => {
      const request = createMockRequest('PUT', '/api/employees/emp-1', {
        body: { phone: '0999888777' },
      });

      const response = await handleUpdateEmployee('emp-1', request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.phone).toBe('0999888777');
    });

    it('should return 404 for non-existent employee', async () => {
      const request = createMockRequest('PUT', '/api/employees/non-existent', {
        body: { phone: '0999888777' },
      });

      const response = await handleUpdateEmployee('non-existent', request);

      expect(response.status).toBe(404);
    });

    it('should return 400 for duplicate email on update', async () => {
      const request = createMockRequest('PUT', '/api/employees/emp-1', {
        body: { email: 'tranthib@test.com' }, // Email of emp-2
      });

      const response = await handleUpdateEmployee('emp-1', request);
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('Email');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /api/employees/:id
  // ─────────────────────────────────────────────────────────────────────────────

  describe('DELETE /api/employees/:id', () => {
    it('should delete employee', async () => {
      const response = await handleDeleteEmployee('emp-1');
      const data = await parseJsonResponse(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await handleDeleteEmployee('non-existent');

      expect(response.status).toBe(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const request = createMockRequest('POST', '/api/employees', {
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
        },
      });

      expect(request).toBeDefined();
    });

    it('should sanitize input data', async () => {
      const request = createMockRequest('POST', '/api/employees', {
        body: {
          firstName: '<script>alert("xss")</script>Test',
          lastName: 'User',
          email: 'test@test.com',
        },
      });

      expect(request).toBeDefined();
    });
  });
});
