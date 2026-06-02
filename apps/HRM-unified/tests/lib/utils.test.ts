// tests/lib/utils.test.ts
// Unit tests cho Utility Functions

import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
    // ══════════════════════════════════════════════════════════════════════
    // STRING UTILITIES
    // ══════════════════════════════════════════════════════════════════════

    describe('String Utilities', () => {
        // Slug generation
        function slugify(text: string): string {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'd')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
        }

        it('should convert to lowercase', () => {
            expect(slugify('Hello World')).toBe('hello-world')
        })

        it('should handle Vietnamese characters', () => {
            expect(slugify('Nguyễn Văn Anh')).toBe('nguyen-van-anh')
        })

        it('should handle Đ character', () => {
            expect(slugify('Đặng Thị Thủy')).toBe('dang-thi-thuy')
        })

        it('should replace spaces with dashes', () => {
            expect(slugify('hello world test')).toBe('hello-world-test')
        })

        it('should remove special characters', () => {
            expect(slugify('hello@world!')).toBe('helloworld')
        })

        // Truncate
        function truncate(text: string, maxLength: number, suffix: string = '...'): string {
            if (text.length <= maxLength) return text
            return text.slice(0, maxLength - suffix.length) + suffix
        }

        it('should not truncate short text', () => {
            expect(truncate('hello', 10)).toBe('hello')
        })

        it('should truncate long text', () => {
            expect(truncate('hello world', 8)).toBe('hello...')
        })

        it('should use custom suffix', () => {
            expect(truncate('hello world', 8, '…')).toBe('hello w…')
        })

        // Capitalize
        function capitalize(text: string): string {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        }

        function capitalizeWords(text: string): string {
            return text.split(' ').map(capitalize).join(' ')
        }

        it('should capitalize first letter', () => {
            expect(capitalize('hello')).toBe('Hello')
        })

        it('should capitalize all words', () => {
            expect(capitalizeWords('hello world')).toBe('Hello World')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // NUMBER UTILITIES
    // ══════════════════════════════════════════════════════════════════════

    describe('Number Utilities', () => {
        // Format VND
        function formatVND(amount: number): string {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
            }).format(amount)
        }

        it('should format VND correctly', () => {
            expect(formatVND(1000000)).toBe('1.000.000 ₫')
        })

        it('should format zero', () => {
            expect(formatVND(0)).toBe('0 ₫')
        })

        it('should format negative amount', () => {
            expect(formatVND(-500000)).toBe('-500.000 ₫')
        })

        // Format number with separators
        function formatNumber(num: number): string {
            return new Intl.NumberFormat('vi-VN').format(num)
        }

        it('should format number with thousand separators', () => {
            expect(formatNumber(1234567)).toBe('1.234.567')
        })

        // Clamp
        function clamp(value: number, min: number, max: number): number {
            return Math.min(Math.max(value, min), max)
        }

        it('should clamp value to min', () => {
            expect(clamp(-5, 0, 100)).toBe(0)
        })

        it('should clamp value to max', () => {
            expect(clamp(150, 0, 100)).toBe(100)
        })

        it('should not clamp value within range', () => {
            expect(clamp(50, 0, 100)).toBe(50)
        })

        // Round to decimals
        function roundTo(value: number, decimals: number): number {
            const factor = Math.pow(10, decimals)
            return Math.round(value * factor) / factor
        }

        it('should round to 2 decimals', () => {
            expect(roundTo(3.14159, 2)).toBe(3.14)
        })

        it('should round to 0 decimals', () => {
            expect(roundTo(3.7, 0)).toBe(4)
        })

        // Percentage
        function toPercentage(value: number, total: number, decimals: number = 1): number {
            if (total === 0) return 0
            return roundTo((value / total) * 100, decimals)
        }

        it('should calculate percentage', () => {
            expect(toPercentage(25, 100)).toBe(25)
            expect(toPercentage(1, 3)).toBe(33.3)
        })

        it('should handle zero total', () => {
            expect(toPercentage(10, 0)).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // DATE UTILITIES
    // ══════════════════════════════════════════════════════════════════════

    describe('Date Utilities', () => {
        // Format date
        function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
            const options: Intl.DateTimeFormatOptions = format === 'short'
                ? { day: '2-digit', month: '2-digit', year: 'numeric' }
                : { day: 'numeric', month: 'long', year: 'numeric' }
            return new Intl.DateTimeFormat('vi-VN', options).format(date)
        }

        it('should format date short', () => {
            const date = new Date('2024-01-15')
            expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/)
        })

        // Add days
        function addDays(date: Date, days: number): Date {
            const result = new Date(date)
            result.setDate(result.getDate() + days)
            return result
        }

        it('should add days', () => {
            const date = new Date('2024-01-15')
            const result = addDays(date, 5)
            expect(result.getDate()).toBe(20)
        })

        it('should handle month overflow', () => {
            const date = new Date('2024-01-30')
            const result = addDays(date, 5)
            expect(result.getMonth()).toBe(1) // February
        })

        // Difference in days
        function diffDays(date1: Date, date2: Date): number {
            const diff = Math.abs(date2.getTime() - date1.getTime())
            return Math.floor(diff / (1000 * 60 * 60 * 24))
        }

        it('should calculate difference in days', () => {
            const date1 = new Date('2024-01-01')
            const date2 = new Date('2024-01-10')
            expect(diffDays(date1, date2)).toBe(9)
        })

        // Is weekend
        function isWeekend(date: Date): boolean {
            const day = date.getDay()
            return day === 0 || day === 6
        }

        it('should detect Saturday as weekend', () => {
            const saturday = new Date('2024-01-13')
            expect(isWeekend(saturday)).toBe(true)
        })

        it('should detect Sunday as weekend', () => {
            const sunday = new Date('2024-01-14')
            expect(isWeekend(sunday)).toBe(true)
        })

        it('should detect Monday as weekday', () => {
            const monday = new Date('2024-01-15')
            expect(isWeekend(monday)).toBe(false)
        })

        // Get working days in month
        function getWorkingDaysInMonth(year: number, month: number): number {
            const firstDay = new Date(year, month, 1)
            const lastDay = new Date(year, month + 1, 0)
            let workingDays = 0

            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                if (!isWeekend(d)) workingDays++
            }

            return workingDays
        }

        it('should calculate working days in January 2024', () => {
            const workingDays = getWorkingDaysInMonth(2024, 0) // January
            expect(workingDays).toBe(23)
        })

        // Start of day
        function startOfDay(date: Date): Date {
            const result = new Date(date)
            result.setHours(0, 0, 0, 0)
            return result
        }

        it('should get start of day', () => {
            const date = new Date('2024-01-15T14:30:45')
            const result = startOfDay(date)
            expect(result.getHours()).toBe(0)
            expect(result.getMinutes()).toBe(0)
        })

        // Is same day
        function isSameDay(date1: Date, date2: Date): boolean {
            return startOfDay(date1).getTime() === startOfDay(date2).getTime()
        }

        it('should detect same day', () => {
            const date1 = new Date('2024-01-15T08:00:00')
            const date2 = new Date('2024-01-15T17:00:00')
            expect(isSameDay(date1, date2)).toBe(true)
        })

        it('should detect different days', () => {
            const date1 = new Date('2024-01-15')
            const date2 = new Date('2024-01-16')
            expect(isSameDay(date1, date2)).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // ARRAY UTILITIES
    // ══════════════════════════════════════════════════════════════════════

    describe('Array Utilities', () => {
        // Chunk array
        function chunk<T>(array: T[], size: number): T[][] {
            const result: T[][] = []
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size))
            }
            return result
        }

        it('should chunk array', () => {
            const arr = [1, 2, 3, 4, 5]
            expect(chunk(arr, 2)).toEqual([[1, 2], [3, 4], [5]])
        })

        it('should handle empty array', () => {
            expect(chunk([], 2)).toEqual([])
        })

        // Group by
        function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
            return array.reduce((result, item) => {
                const group = String(item[key])
                if (!result[group]) result[group] = []
                result[group].push(item)
                return result
            }, {} as Record<string, T[]>)
        }

        it('should group by key', () => {
            const items = [
                { id: 1, category: 'A' },
                { id: 2, category: 'B' },
                { id: 3, category: 'A' },
            ]
            const grouped = groupBy(items, 'category')
            expect(grouped['A'].length).toBe(2)
            expect(grouped['B'].length).toBe(1)
        })

        // Unique
        function unique<T>(array: T[]): T[] {
            return [...new Set(array)]
        }

        it('should remove duplicates', () => {
            expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
        })

        // Sort by
        function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
            return [...array].sort((a, b) => {
                const aVal = a[key]
                const bVal = b[key]
                const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
                return order === 'asc' ? comparison : -comparison
            })
        }

        it('should sort ascending', () => {
            const items = [{ name: 'c' }, { name: 'a' }, { name: 'b' }]
            const sorted = sortBy(items, 'name', 'asc')
            expect(sorted[0].name).toBe('a')
        })

        it('should sort descending', () => {
            const items = [{ name: 'a' }, { name: 'c' }, { name: 'b' }]
            const sorted = sortBy(items, 'name', 'desc')
            expect(sorted[0].name).toBe('c')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // OBJECT UTILITIES
    // ══════════════════════════════════════════════════════════════════════

    describe('Object Utilities', () => {
        // Pick
        function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
            const result = {} as Pick<T, K>
            keys.forEach(key => {
                if (key in obj) result[key] = obj[key]
            })
            return result
        }

        it('should pick specified keys', () => {
            const obj = { a: 1, b: 2, c: 3 }
            expect(pick(obj, ['a', 'b'])).toEqual({ a: 1, b: 2 })
        })

        // Omit
        function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
            const result = { ...obj }
            keys.forEach(key => delete result[key])
            return result
        }

        it('should omit specified keys', () => {
            const obj = { a: 1, b: 2, c: 3 }
            expect(omit(obj, ['c'])).toEqual({ a: 1, b: 2 })
        })

        // Deep clone
        function deepClone<T>(obj: T): T {
            return JSON.parse(JSON.stringify(obj))
        }

        it('should deep clone object', () => {
            const obj = { a: { b: { c: 1 } } }
            const clone = deepClone(obj)
            clone.a.b.c = 2
            expect(obj.a.b.c).toBe(1)
        })

        // Is empty
        function isEmpty(obj: object): boolean {
            return Object.keys(obj).length === 0
        }

        it('should detect empty object', () => {
            expect(isEmpty({})).toBe(true)
            expect(isEmpty({ a: 1 })).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // VIETNAMESE UTILITIES
    // ══════════════════════════════════════════════════════════════════════

    describe('Vietnamese Utilities', () => {
        // Remove diacritics
        function removeDiacritics(text: string): string {
            return text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
        }

        it('should remove Vietnamese diacritics', () => {
            expect(removeDiacritics('Xin chào')).toBe('Xin chao')
            expect(removeDiacritics('Nguyễn Văn Anh')).toBe('Nguyen Van Anh')
            expect(removeDiacritics('Đặng Thị Thủy')).toBe('Dang Thi Thuy')
        })

        // Phone number formatting
        function formatPhoneVN(phone: string): string {
            const cleaned = phone.replace(/\D/g, '')
            if (cleaned.length === 10) {
                return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
            }
            if (cleaned.length === 11 && cleaned.startsWith('84')) {
                return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
            }
            return phone
        }

        it('should format 10-digit phone', () => {
            expect(formatPhoneVN('0901234567')).toBe('0901 234 567')
        })

        it('should format phone with country code', () => {
            expect(formatPhoneVN('84901234567')).toBe('+84 901 234 567')
        })

        // ID number validation (CCCD)
        function isValidCCCD(idNumber: string): boolean {
            const cleaned = idNumber.replace(/\D/g, '')
            return cleaned.length === 12
        }

        it('should validate 12-digit CCCD', () => {
            expect(isValidCCCD('123456789012')).toBe(true)
            expect(isValidCCCD('12345678901')).toBe(false)
        })
    })
})
