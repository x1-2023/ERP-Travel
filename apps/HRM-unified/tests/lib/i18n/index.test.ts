// tests/lib/i18n/index.test.ts
// Unit tests cho i18n module

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { vi as viTranslations } from '@/lib/i18n/vi'
import { en as enTranslations } from '@/lib/i18n/en'

describe('i18n Module', () => {
    // ══════════════════════════════════════════════════════════════════════
    // TRANSLATION STRUCTURE
    // ══════════════════════════════════════════════════════════════════════

    describe('Translation Structure', () => {
        it('should have matching top-level keys', () => {
            const viKeys = Object.keys(viTranslations).sort()
            const enKeys = Object.keys(enTranslations).sort()

            expect(viKeys).toEqual(enKeys)
        })

        it('should have all common keys in both languages', () => {
            const viCommon = Object.keys(viTranslations.common)
            const enCommon = Object.keys(enTranslations.common)

            expect(viCommon.sort()).toEqual(enCommon.sort())
        })

        it('should have all nav keys in both languages', () => {
            const viNav = Object.keys(viTranslations.nav)
            const enNav = Object.keys(enTranslations.nav)

            expect(viNav.sort()).toEqual(enNav.sort())
        })

        it('should have all employees keys in both languages', () => {
            const viEmp = Object.keys(viTranslations.employees)
            const enEmp = Object.keys(enTranslations.employees)

            expect(viEmp.sort()).toEqual(enEmp.sort())
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // VIETNAMESE TRANSLATIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('Vietnamese Translations', () => {
        it('should have correct common translations', () => {
            expect(viTranslations.common.save).toBe('Lưu')
            expect(viTranslations.common.cancel).toBe('Huỷ')
            expect(viTranslations.common.delete).toBe('Xoá')
        })

        it('should have correct nav translations', () => {
            expect(viTranslations.nav.dashboard).toBe('Tổng quan')
            expect(viTranslations.nav.employees).toBe('Nhân viên')
            expect(viTranslations.nav.payroll).toBe('Bảng lương')
        })

        it('should have correct date translations', () => {
            expect(viTranslations.dateTime.months).toHaveLength(12)
            expect(viTranslations.dateTime.weekdays).toHaveLength(7)
            expect(viTranslations.dateTime.today).toBe('Hôm nay')
        })

        it('should have Vietnamese currency', () => {
            expect(viTranslations.number.currency).toBe('VND')
            expect(viTranslations.number.currencySymbol).toBe('₫')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // ENGLISH TRANSLATIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('English Translations', () => {
        it('should have correct common translations', () => {
            expect(enTranslations.common.save).toBe('Save')
            expect(enTranslations.common.cancel).toBe('Cancel')
            expect(enTranslations.common.delete).toBe('Delete')
        })

        it('should have correct nav translations', () => {
            expect(enTranslations.nav.dashboard).toBe('Dashboard')
            expect(enTranslations.nav.employees).toBe('Employees')
            expect(enTranslations.nav.payroll).toBe('Payroll')
        })

        it('should have correct date translations', () => {
            expect(enTranslations.dateTime.months).toHaveLength(12)
            expect(enTranslations.dateTime.weekdays).toHaveLength(7)
            expect(enTranslations.dateTime.today).toBe('Today')
        })

        it('should have English month names', () => {
            expect(enTranslations.dateTime.months[0]).toBe('January')
            expect(enTranslations.dateTime.months[11]).toBe('December')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // TRANSLATION UTILITY
    // ══════════════════════════════════════════════════════════════════════

    describe('getTranslation Utility', () => {
        function getTranslation(
            translations: Record<string, unknown>,
            key: string
        ): string {
            const keys = key.split('.')
            let current: unknown = translations

            for (const k of keys) {
                if (current && typeof current === 'object' && k in current) {
                    current = (current as Record<string, unknown>)[k]
                } else {
                    return key
                }
            }

            return typeof current === 'string' ? current : key
        }

        it('should get nested translation', () => {
            expect(getTranslation(viTranslations, 'common.save')).toBe('Lưu')
            expect(getTranslation(enTranslations, 'common.save')).toBe('Save')
        })

        it('should return key if not found', () => {
            expect(getTranslation(viTranslations, 'unknown.key')).toBe('unknown.key')
        })

        it('should handle deep nesting', () => {
            expect(getTranslation(viTranslations, 'employees.title')).toBe('Quản lý nhân viên')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // COMPLETENESS CHECK
    // ══════════════════════════════════════════════════════════════════════

    describe('Translation Completeness', () => {
        function countKeys(obj: Record<string, unknown>, prefix = ''): string[] {
            const keys: string[] = []

            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    keys.push(...countKeys(value as Record<string, unknown>, fullKey))
                } else {
                    keys.push(fullKey)
                }
            }

            return keys
        }

        it('should have same number of translation keys', () => {
            const viKeys = countKeys(viTranslations as Record<string, unknown>)
            const enKeys = countKeys(enTranslations as Record<string, unknown>)

            expect(viKeys.length).toBe(enKeys.length)
        })

        it('should not have empty strings in Vietnamese', () => {
            const viKeys = countKeys(viTranslations as Record<string, unknown>)

            for (const key of viKeys) {
                const value = key.split('.').reduce<unknown>(
                    (obj, k) => (obj as Record<string, unknown>)?.[k],
                    viTranslations
                )
                if (typeof value === 'string') {
                    expect(value.length, `Empty value at ${key}`).toBeGreaterThan(0)
                }
            }
        })

        it('should not have empty strings in English', () => {
            const enKeys = countKeys(enTranslations as Record<string, unknown>)

            for (const key of enKeys) {
                const value = key.split('.').reduce<unknown>(
                    (obj, k) => (obj as Record<string, unknown>)?.[k],
                    enTranslations
                )
                if (typeof value === 'string') {
                    expect(value.length, `Empty value at ${key}`).toBeGreaterThan(0)
                }
            }
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LOCALE DETECTION
    // ══════════════════════════════════════════════════════════════════════

    describe('Locale Detection', () => {
        function detectLocale(acceptLanguage: string): 'vi' | 'en' {
            if (acceptLanguage.includes('vi')) return 'vi'
            return 'en'
        }

        it('should detect Vietnamese', () => {
            expect(detectLocale('vi-VN,vi;q=0.9,en;q=0.8')).toBe('vi')
            expect(detectLocale('vi')).toBe('vi')
        })

        it('should default to English', () => {
            expect(detectLocale('en-US')).toBe('en')
            expect(detectLocale('fr-FR,en;q=0.5')).toBe('en')
            expect(detectLocale('')).toBe('en')
        })
    })
})
