import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: vi })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return ''
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return ''
  const n = typeof num === 'string' ? parseFloat(num) : num
  return new Intl.NumberFormat('vi-VN').format(n)
}

export function generateEmployeeCode(prefix: string = 'NV', sequence: number): string {
  return `${prefix}${String(sequence).padStart(5, '0')}`
}

export function generateContractNumber(prefix: string = 'HD', year: number, sequence: number): string {
  return `${prefix}${year}/${String(sequence).padStart(4, '0')}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
