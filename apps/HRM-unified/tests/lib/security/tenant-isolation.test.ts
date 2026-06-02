// tests/lib/security/tenant-isolation.test.ts
// Unit tests cho Multi-tenant Security

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock session
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}))

describe('Multi-tenant Security', () => {
    // ══════════════════════════════════════════════════════════════════════
    // TENANT ID EXTRACTION
    // ══════════════════════════════════════════════════════════════════════

    describe('Tenant ID Extraction', () => {
        interface Session {
            user: {
                id: string
                tenantId: string
                role: string
            }
        }

        function extractTenantId(session: Session | null): string | null {
            return session?.user?.tenantId || null
        }

        it('should extract tenant ID from session', () => {
            const session: Session = {
                user: { id: 'user-1', tenantId: 'tenant-1', role: 'USER' },
            }
            expect(extractTenantId(session)).toBe('tenant-1')
        })

        it('should return null for missing session', () => {
            expect(extractTenantId(null)).toBeNull()
        })

        it('should return null for missing user', () => {
            expect(extractTenantId({} as Session)).toBeNull()
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // TENANT CONTEXT VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Tenant Context Validation', () => {
        function validateTenantAccess(
            requestedTenantId: string,
            sessionTenantId: string,
            isSuperAdmin: boolean = false
        ): boolean {
            // Super admin can access any tenant
            if (isSuperAdmin) return true
            // Normal users can only access their own tenant
            return requestedTenantId === sessionTenantId
        }

        it('should allow access to own tenant', () => {
            expect(validateTenantAccess('tenant-1', 'tenant-1')).toBe(true)
        })

        it('should deny access to different tenant', () => {
            expect(validateTenantAccess('tenant-2', 'tenant-1')).toBe(false)
        })

        it('should allow super admin to access any tenant', () => {
            expect(validateTenantAccess('tenant-2', 'tenant-1', true)).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // QUERY BUILDER WITH TENANT
    // ══════════════════════════════════════════════════════════════════════

    describe('Query Builder with Tenant', () => {
        interface QueryWhere {
            tenantId: string
            [key: string]: unknown
        }

        function buildTenantQuery(
            tenantId: string,
            additionalWhere: Record<string, unknown> = {}
        ): QueryWhere {
            return {
                tenantId,
                ...additionalWhere,
            }
        }

        function validateQueryHasTenant(query: QueryWhere): boolean {
            return !!query.tenantId && typeof query.tenantId === 'string'
        }

        it('should always include tenantId in query', () => {
            const query = buildTenantQuery('tenant-1')
            expect(query.tenantId).toBe('tenant-1')
        })

        it('should merge additional where conditions', () => {
            const query = buildTenantQuery('tenant-1', { status: 'ACTIVE' })
            expect(query.tenantId).toBe('tenant-1')
            expect(query.status).toBe('ACTIVE')
        })

        it('should validate query has tenant', () => {
            expect(validateQueryHasTenant({ tenantId: 'tenant-1' })).toBe(true)
            expect(validateQueryHasTenant({ tenantId: '' })).toBe(false)
        })

        it('should not allow overriding tenantId', () => {
            const query = buildTenantQuery('tenant-1', { tenantId: 'hacked' })
            // tenantId should be enforced from session, not from input
            expect(query.tenantId).toBe('tenant-1')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // RESPONSE FILTERING
    // ══════════════════════════════════════════════════════════════════════

    describe('Response Filtering', () => {
        interface TenantEntity {
            id: string
            tenantId: string
            [key: string]: unknown
        }

        function filterByTenant<T extends TenantEntity>(
            items: T[],
            tenantId: string
        ): T[] {
            return items.filter(item => item.tenantId === tenantId)
        }

        function assertTenantOwnership(item: TenantEntity | null, tenantId: string): boolean {
            if (!item) return false
            return item.tenantId === tenantId
        }

        it('should filter items by tenant', () => {
            const items = [
                { id: '1', tenantId: 'tenant-1', name: 'A' },
                { id: '2', tenantId: 'tenant-2', name: 'B' },
                { id: '3', tenantId: 'tenant-1', name: 'C' },
            ]

            const filtered = filterByTenant(items, 'tenant-1')
            expect(filtered).toHaveLength(2)
            expect(filtered.every(i => i.tenantId === 'tenant-1')).toBe(true)
        })

        it('should assert tenant ownership', () => {
            const item = { id: '1', tenantId: 'tenant-1' }
            expect(assertTenantOwnership(item, 'tenant-1')).toBe(true)
            expect(assertTenantOwnership(item, 'tenant-2')).toBe(false)
        })

        it('should handle null item', () => {
            expect(assertTenantOwnership(null, 'tenant-1')).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CROSS-TENANT DATA LEAKAGE PREVENTION
    // ══════════════════════════════════════════════════════════════════════

    describe('Cross-tenant Data Leakage Prevention', () => {
        interface Employee {
            id: string
            tenantId: string
            name: string
            salary?: number
        }

        function sanitizeForTenant(employee: Employee, requestingTenantId: string): Employee | null {
            // If not same tenant, don't return anything
            if (employee.tenantId !== requestingTenantId) {
                return null
            }
            return employee
        }

        function canAccessResource(
            resourceTenantId: string,
            userTenantId: string
        ): boolean {
            return resourceTenantId === userTenantId
        }

        it('should allow access to own tenant data', () => {
            const employee: Employee = { id: '1', tenantId: 'tenant-1', name: 'John', salary: 5000 }
            const result = sanitizeForTenant(employee, 'tenant-1')
            expect(result).not.toBeNull()
            expect(result?.salary).toBe(5000)
        })

        it('should block access to other tenant data', () => {
            const employee: Employee = { id: '1', tenantId: 'tenant-1', name: 'John', salary: 5000 }
            const result = sanitizeForTenant(employee, 'tenant-2')
            expect(result).toBeNull()
        })

        it('should check resource access', () => {
            expect(canAccessResource('tenant-1', 'tenant-1')).toBe(true)
            expect(canAccessResource('tenant-1', 'tenant-2')).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // TENANT SCOPED OPERATIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('Tenant Scoped Operations', () => {
        interface CreateInput {
            name: string
            departmentId?: string
        }

        interface CreateInputWithTenant extends CreateInput {
            tenantId: string
        }

        function scopeCreateInput(input: CreateInput, tenantId: string): CreateInputWithTenant {
            return {
                ...input,
                tenantId,
            }
        }

        function scopeUpdateWhere(id: string, tenantId: string): { id: string; tenantId: string } {
            return { id, tenantId }
        }

        function scopeDeleteWhere(id: string, tenantId: string): { id: string; tenantId: string } {
            return { id, tenantId }
        }

        it('should add tenantId to create input', () => {
            const input = { name: 'Test Employee' }
            const scoped = scopeCreateInput(input, 'tenant-1')
            expect(scoped.tenantId).toBe('tenant-1')
            expect(scoped.name).toBe('Test Employee')
        })

        it('should scope update where clause', () => {
            const where = scopeUpdateWhere('emp-1', 'tenant-1')
            expect(where).toEqual({ id: 'emp-1', tenantId: 'tenant-1' })
        })

        it('should scope delete where clause', () => {
            const where = scopeDeleteWhere('emp-1', 'tenant-1')
            expect(where).toEqual({ id: 'emp-1', tenantId: 'tenant-1' })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // TENANT HEADER VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Tenant Header Validation', () => {
        function validateTenantHeader(
            headerTenantId: string | null,
            sessionTenantId: string
        ): { valid: boolean; error?: string } {
            // If no header provided, use session tenant (valid)
            if (!headerTenantId) {
                return { valid: true }
            }

            // If header provided, must match session
            if (headerTenantId !== sessionTenantId) {
                return { valid: false, error: 'Tenant mismatch' }
            }

            return { valid: true }
        }

        it('should accept request without tenant header', () => {
            const result = validateTenantHeader(null, 'tenant-1')
            expect(result.valid).toBe(true)
        })

        it('should accept matching tenant header', () => {
            const result = validateTenantHeader('tenant-1', 'tenant-1')
            expect(result.valid).toBe(true)
        })

        it('should reject mismatched tenant header', () => {
            const result = validateTenantHeader('tenant-2', 'tenant-1')
            expect(result.valid).toBe(false)
            expect(result.error).toBe('Tenant mismatch')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // API ROUTE PROTECTION
    // ══════════════════════════════════════════════════════════════════════

    describe('API Route Protection', () => {
        interface ApiContext {
            tenantId: string
            userId: string
            role: string
        }

        type ProtectedHandler<T> = (context: ApiContext, ...args: unknown[]) => Promise<T>

        function withTenantProtection<T>(
            handler: ProtectedHandler<T>,
            context: ApiContext | null
        ): Promise<T> | { error: string; status: number } {
            if (!context) {
                return { error: 'Unauthorized', status: 401 }
            }

            if (!context.tenantId) {
                return { error: 'Tenant ID required', status: 400 }
            }

            return handler(context)
        }

        it('should reject requests without context', () => {
            const handler: ProtectedHandler<{ data: string }> = async () => ({ data: 'test' })
            const result = withTenantProtection(handler, null)
            expect(result).toEqual({ error: 'Unauthorized', status: 401 })
        })

        it('should reject requests without tenantId', () => {
            const handler: ProtectedHandler<{ data: string }> = async () => ({ data: 'test' })
            const context = { tenantId: '', userId: 'user-1', role: 'USER' }
            const result = withTenantProtection(handler, context)
            expect(result).toEqual({ error: 'Tenant ID required', status: 400 })
        })

        it('should allow valid requests', async () => {
            const handler: ProtectedHandler<{ data: string }> = async () => ({ data: 'test' })
            const context = { tenantId: 'tenant-1', userId: 'user-1', role: 'USER' }
            const result = await withTenantProtection(handler, context)
            expect(result).toEqual({ data: 'test' })
        })
    })
})
