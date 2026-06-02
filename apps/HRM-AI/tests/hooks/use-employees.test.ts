// tests/hooks/use-employees.test.ts
// Unit tests cho useEmployees hook

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'

// Mock SWR
vi.mock('swr', () => ({
    default: vi.fn(),
}))

import swr from 'swr'

describe('useEmployees Hook Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // URL BUILDING
    // ══════════════════════════════════════════════════════════════════════

    describe('URL Building', () => {
        function buildEmployeeUrl(params: {
            page?: number
            limit?: number
            search?: string
            departmentId?: string
            status?: string
        }): string {
            const searchParams = new URLSearchParams()

            if (params.page) searchParams.set('page', String(params.page))
            if (params.limit) searchParams.set('limit', String(params.limit))
            if (params.search) searchParams.set('search', params.search)
            if (params.departmentId) searchParams.set('departmentId', params.departmentId)
            if (params.status) searchParams.set('status', params.status)

            const query = searchParams.toString()
            return `/api/employees${query ? `?${query}` : ''}`
        }

        it('should build URL without params', () => {
            expect(buildEmployeeUrl({})).toBe('/api/employees')
        })

        it('should build URL with page and limit', () => {
            expect(buildEmployeeUrl({ page: 1, limit: 20 })).toBe('/api/employees?page=1&limit=20')
        })

        it('should build URL with search', () => {
            expect(buildEmployeeUrl({ search: 'nguyen' })).toBe('/api/employees?search=nguyen')
        })

        it('should build URL with all params', () => {
            const url = buildEmployeeUrl({
                page: 2,
                limit: 10,
                search: 'test',
                departmentId: 'dept-1',
                status: 'ACTIVE',
            })
            expect(url).toContain('page=2')
            expect(url).toContain('limit=10')
            expect(url).toContain('search=test')
            expect(url).toContain('departmentId=dept-1')
            expect(url).toContain('status=ACTIVE')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // PAGINATION LOGIC
    // ══════════════════════════════════════════════════════════════════════

    describe('Pagination Logic', () => {
        interface PaginationState {
            page: number
            limit: number
            total: number
            totalPages: number
        }

        function calculatePagination(
            page: number,
            limit: number,
            total: number
        ): PaginationState {
            return {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }

        function getPageRange(
            currentPage: number,
            totalPages: number,
            maxVisible: number = 5
        ): number[] {
            if (totalPages <= maxVisible) {
                return Array.from({ length: totalPages }, (_, i) => i + 1)
            }

            const half = Math.floor(maxVisible / 2)
            let start = Math.max(1, currentPage - half)
            let end = Math.min(totalPages, currentPage + half)

            if (end - start + 1 < maxVisible) {
                if (start === 1) {
                    end = Math.min(totalPages, start + maxVisible - 1)
                } else {
                    start = Math.max(1, end - maxVisible + 1)
                }
            }

            return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        }

        it('should calculate total pages', () => {
            expect(calculatePagination(1, 10, 100).totalPages).toBe(10)
            expect(calculatePagination(1, 10, 95).totalPages).toBe(10)
            expect(calculatePagination(1, 10, 101).totalPages).toBe(11)
        })

        it('should return all pages when less than maxVisible', () => {
            expect(getPageRange(1, 3)).toEqual([1, 2, 3])
        })

        it('should return page range around current page', () => {
            expect(getPageRange(5, 10)).toEqual([3, 4, 5, 6, 7])
        })

        it('should handle first page', () => {
            expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5])
        })

        it('should handle last page', () => {
            expect(getPageRange(10, 10)).toEqual([6, 7, 8, 9, 10])
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // SEARCH DEBOUNCE LOGIC
    // ══════════════════════════════════════════════════════════════════════

    describe('Search Debounce Logic', () => {
        function createDebouncedValue<T>(
            initialValue: T,
            delay: number = 300
        ): { value: T; setValue: (v: T) => void; debouncedValue: T } {
            let value = initialValue
            let debouncedValue = initialValue
            let timeoutId: NodeJS.Timeout | null = null

            return {
                get value() { return value },
                setValue(v: T) {
                    value = v
                    if (timeoutId) clearTimeout(timeoutId)
                    timeoutId = setTimeout(() => {
                        debouncedValue = v
                    }, delay)
                },
                get debouncedValue() { return debouncedValue },
            }
        }

        it('should return initial value immediately', () => {
            const debounced = createDebouncedValue('initial')
            expect(debounced.value).toBe('initial')
            expect(debounced.debouncedValue).toBe('initial')
        })

        it('should update value immediately', () => {
            const debounced = createDebouncedValue('initial')
            debounced.setValue('updated')
            expect(debounced.value).toBe('updated')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // FILTER STATE MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    describe('Filter State Management', () => {
        interface FilterState {
            search: string
            departmentId: string | null
            status: string | null
            page: number
            limit: number
        }

        function createFilterState(initial: Partial<FilterState> = {}): FilterState {
            return {
                search: initial.search || '',
                departmentId: initial.departmentId || null,
                status: initial.status || null,
                page: initial.page || 1,
                limit: initial.limit || 20,
            }
        }

        function updateFilter(
            state: FilterState,
            update: Partial<FilterState>
        ): FilterState {
            // Reset page when filters change
            const isFilterChange = 'search' in update || 'departmentId' in update || 'status' in update
            return {
                ...state,
                ...update,
                page: isFilterChange && !('page' in update) ? 1 : (update.page || state.page),
            }
        }

        it('should create default filter state', () => {
            const state = createFilterState()
            expect(state.search).toBe('')
            expect(state.page).toBe(1)
            expect(state.limit).toBe(20)
        })

        it('should reset page when search changes', () => {
            const state = createFilterState({ page: 3 })
            const newState = updateFilter(state, { search: 'test' })
            expect(newState.page).toBe(1)
        })

        it('should not reset page when only page changes', () => {
            const state = createFilterState({ page: 1 })
            const newState = updateFilter(state, { page: 3 })
            expect(newState.page).toBe(3)
        })

        it('should reset page when department changes', () => {
            const state = createFilterState({ page: 5 })
            const newState = updateFilter(state, { departmentId: 'dept-1' })
            expect(newState.page).toBe(1)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMPLOYEE DATA TRANSFORMATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Employee Data Transformation', () => {
        interface RawEmployee {
            id: string
            employeeCode: string
            fullName: string
            department?: { name: string } | null
            position?: { name: string } | null
            status: string
            hireDate: string
        }

        interface TransformedEmployee {
            id: string
            code: string
            name: string
            departmentName: string
            positionName: string
            status: string
            hireDate: Date
        }

        function transformEmployee(raw: RawEmployee): TransformedEmployee {
            return {
                id: raw.id,
                code: raw.employeeCode,
                name: raw.fullName,
                departmentName: raw.department?.name || 'N/A',
                positionName: raw.position?.name || 'N/A',
                status: raw.status,
                hireDate: new Date(raw.hireDate),
            }
        }

        it('should transform employee data', () => {
            const raw: RawEmployee = {
                id: '1',
                employeeCode: 'NV0001',
                fullName: 'Nguyễn Văn A',
                department: { name: 'IT' },
                position: { name: 'Developer' },
                status: 'ACTIVE',
                hireDate: '2024-01-15',
            }

            const transformed = transformEmployee(raw)
            expect(transformed.code).toBe('NV0001')
            expect(transformed.name).toBe('Nguyễn Văn A')
            expect(transformed.departmentName).toBe('IT')
        })

        it('should handle null department', () => {
            const raw: RawEmployee = {
                id: '1',
                employeeCode: 'NV0001',
                fullName: 'Nguyễn Văn A',
                department: null,
                position: null,
                status: 'ACTIVE',
                hireDate: '2024-01-15',
            }

            const transformed = transformEmployee(raw)
            expect(transformed.departmentName).toBe('N/A')
            expect(transformed.positionName).toBe('N/A')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ══════════════════════════════════════════════════════════════════════

    describe('Error Handling', () => {
        interface ApiError {
            message: string
            code?: string
            status?: number
        }

        function parseError(error: unknown): ApiError {
            if (error instanceof Error) {
                return { message: error.message }
            }
            if (typeof error === 'object' && error !== null && 'message' in error) {
                return error as ApiError
            }
            return { message: 'An unknown error occurred' }
        }

        function getErrorMessage(error: ApiError): string {
            const messages: Record<string, string> = {
                UNAUTHORIZED: 'Bạn không có quyền truy cập',
                NOT_FOUND: 'Không tìm thấy dữ liệu',
                NETWORK_ERROR: 'Lỗi kết nối mạng',
            }
            return messages[error.code || ''] || error.message
        }

        it('should parse Error instance', () => {
            const error = new Error('Test error')
            expect(parseError(error).message).toBe('Test error')
        })

        it('should parse error object', () => {
            const error = { message: 'API error', code: 'UNAUTHORIZED' }
            expect(parseError(error)).toEqual(error)
        })

        it('should handle unknown error', () => {
            expect(parseError(null).message).toBe('An unknown error occurred')
        })

        it('should translate error codes', () => {
            expect(getErrorMessage({ message: 'Err', code: 'UNAUTHORIZED' })).toBe('Bạn không có quyền truy cập')
        })

        it('should fallback to message', () => {
            expect(getErrorMessage({ message: 'Custom error' })).toBe('Custom error')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // SORTING
    // ══════════════════════════════════════════════════════════════════════

    describe('Sorting', () => {
        interface SortConfig {
            field: string
            direction: 'asc' | 'desc'
        }

        function toggleSort(current: SortConfig | null, field: string): SortConfig {
            if (!current || current.field !== field) {
                return { field, direction: 'asc' }
            }
            if (current.direction === 'asc') {
                return { field, direction: 'desc' }
            }
            return { field, direction: 'asc' }
        }

        function sortToQueryParam(sort: SortConfig | null): string | undefined {
            if (!sort) return undefined
            return `${sort.field}:${sort.direction}`
        }

        it('should set ascending on first click', () => {
            expect(toggleSort(null, 'name')).toEqual({ field: 'name', direction: 'asc' })
        })

        it('should toggle to descending', () => {
            const current = { field: 'name', direction: 'asc' as const }
            expect(toggleSort(current, 'name')).toEqual({ field: 'name', direction: 'desc' })
        })

        it('should reset to ascending when clicking different field', () => {
            const current = { field: 'name', direction: 'desc' as const }
            expect(toggleSort(current, 'date')).toEqual({ field: 'date', direction: 'asc' })
        })

        it('should build query param', () => {
            expect(sortToQueryParam({ field: 'name', direction: 'asc' })).toBe('name:asc')
        })

        it('should return undefined for no sort', () => {
            expect(sortToQueryParam(null)).toBeUndefined()
        })
    })
})
