'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { User, Building, Briefcase, Mail, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string | null
  hireDate: string | Date
  department?: {
    name: string
  } | null
  position?: {
    name: string
  } | null
  manager?: {
    firstName: string
    lastName: string
  } | null
}

interface ESSProfileCardProps {
  employee: Employee
}

export function ESSProfileCard({ employee }: ESSProfileCardProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={employee.avatarUrl || undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-semibold">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Mã NV: {employee.employeeCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>

              {employee.department && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.department.name}</span>
                </div>
              )}

              {employee.position && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.position.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Vào làm:{' '}
                  {format(new Date(employee.hireDate), 'dd/MM/yyyy', {
                    locale: vi,
                  })}
                </span>
              </div>

              {employee.manager && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    QL: {employee.manager.firstName} {employee.manager.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
