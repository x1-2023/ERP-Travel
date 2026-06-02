import type { ImportError } from '@/types/import'

interface EmployeeRow {
  [key: string]: unknown
}

export function validateEmployeeRow(row: EmployeeRow, rowNum: number): ImportError[] {
  const errors: ImportError[] = []
  const employeeCode = String(row['Mã NV'] || row.employeeCode || '').trim()
  const fullName = String(row['Họ và tên'] || row.fullName || '').trim()
  const email = String(row['Email'] || row.email || '').trim()
  const phone = String(row['Số điện thoại'] || row.phone || '').trim()
  const dateOfBirth = String(row['Ngày sinh'] || row.dateOfBirth || '').trim()
  const gender = String(row['Giới tính'] || row.gender || '').trim()

  if (!employeeCode) {
    errors.push({ row: rowNum, field: 'employeeCode', error: 'Mã nhân viên bắt buộc' })
  } else if (!/^[A-Za-z0-9\-_]+$/.test(employeeCode)) {
    errors.push({ row: rowNum, field: 'employeeCode', value: employeeCode, error: 'Mã nhân viên không hợp lệ' })
  }

  if (!fullName) {
    errors.push({ row: rowNum, field: 'fullName', error: 'Họ tên bắt buộc' })
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push({ row: rowNum, field: 'email', value: email, error: 'Email không hợp lệ' })
    }
  }

  if (phone) {
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(phone)) {
      errors.push({ row: rowNum, field: 'phone', value: phone, error: 'Số điện thoại không hợp lệ' })
    }
  }

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth)
    if (isNaN(dob.getTime())) {
      errors.push({ row: rowNum, field: 'dateOfBirth', value: dateOfBirth, error: 'Ngày sinh không hợp lệ' })
    }
  }

  if (gender) {
    const validGenders = ['MALE', 'FEMALE', 'OTHER', 'Nam', 'Nữ', 'Khác', 'nam', 'nữ', 'khác']
    if (!validGenders.includes(gender)) {
      errors.push({ row: rowNum, field: 'gender', value: gender, error: 'Giới tính không hợp lệ' })
    }
  }

  return errors
}

export function normalizeGender(gender: string): 'MALE' | 'FEMALE' | 'OTHER' {
  const map: Record<string, 'MALE' | 'FEMALE' | 'OTHER'> = {
    'nam': 'MALE',
    'male': 'MALE',
    'nữ': 'FEMALE',
    'nu': 'FEMALE',
    'female': 'FEMALE',
    'khác': 'OTHER',
    'khac': 'OTHER',
    'other': 'OTHER',
  }
  return map[gender.toLowerCase()] || 'OTHER'
}
