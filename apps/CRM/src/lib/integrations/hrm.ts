import { callModule } from '@/lib/integration'

export async function getEmployeeInfo(hrmEmployeeId: string): Promise<any | null> {
  try {
    return await callModule('hrm', `/api/internal/employees/${hrmEmployeeId}`)
  } catch {
    return null
  }
}
