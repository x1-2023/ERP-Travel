// src/app/[locale]/(tenant)/[tenantId]/employee-experience/offboarding/page.tsx
// Offboarding Management Page

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Plus,
  UserMinus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Laptop,
  Building,
  CreditCard,
  Key,
  Users,
  FileText,
  Shield,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react'

// Mock data
const mockOffboardings = [
  {
    id: '1',
    employee: {
      name: 'Nguyen Van A',
      avatar: '',
      position: 'Senior Developer',
      department: 'Engineering',
    },
    separationType: 'RESIGNATION',
    lastWorkingDay: '2024-02-15',
    status: 'IN_PROGRESS',
    progress: 65,
    completedTasks: 13,
    totalTasks: 20,
    initiatedBy: 'HR Manager',
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    employee: {
      name: 'Tran Thi B',
      avatar: '',
      position: 'Product Manager',
      department: 'Product',
    },
    separationType: 'RESIGNATION',
    lastWorkingDay: '2024-02-28',
    status: 'PENDING',
    progress: 15,
    completedTasks: 3,
    totalTasks: 20,
    initiatedBy: 'HR Manager',
    createdAt: '2024-01-25',
  },
  {
    id: '3',
    employee: {
      name: 'Le Van C',
      avatar: '',
      position: 'Sales Executive',
      department: 'Sales',
    },
    separationType: 'TERMINATION',
    lastWorkingDay: '2024-01-31',
    status: 'COMPLETED',
    progress: 100,
    completedTasks: 18,
    totalTasks: 18,
    initiatedBy: 'HR Director',
    createdAt: '2024-01-15',
    completedAt: '2024-01-31',
  },
]

const mockTasks = {
  IT: [
    { id: '1', title: 'Revoke system access', status: 'COMPLETED', assignee: 'IT Admin', dueDate: '2024-02-15', isRequired: true },
    { id: '2', title: 'Collect laptop and equipment', status: 'PENDING', assignee: 'IT Admin', dueDate: '2024-02-15', isRequired: true },
    { id: '3', title: 'Transfer email and files', status: 'IN_PROGRESS', assignee: 'IT Admin', dueDate: '2024-02-12', isRequired: true },
    { id: '4', title: 'Remove from software licenses', status: 'PENDING', assignee: 'IT Admin', dueDate: '2024-02-15', isRequired: true },
  ],
  HR: [
    { id: '5', title: 'Process final payroll', status: 'IN_PROGRESS', assignee: 'Payroll Specialist', dueDate: '2024-02-10', isRequired: true },
    { id: '6', title: 'Prepare employment certificate', status: 'PENDING', assignee: 'HR Admin', dueDate: '2024-02-12', isRequired: true },
    { id: '7', title: 'Update employee records', status: 'PENDING', assignee: 'HR Admin', dueDate: '2024-02-15', isRequired: true },
    { id: '8', title: 'Conduct exit interview', status: 'COMPLETED', assignee: 'HR Manager', dueDate: '2024-02-08', isRequired: false },
    { id: '9', title: 'Process benefits termination', status: 'PENDING', assignee: 'Benefits Admin', dueDate: '2024-02-15', isRequired: true },
  ],
  FINANCE: [
    { id: '10', title: 'Settle expense claims', status: 'COMPLETED', assignee: 'Finance Admin', dueDate: '2024-02-08', isRequired: true },
    { id: '11', title: 'Collect company credit card', status: 'COMPLETED', assignee: 'Finance Admin', dueDate: '2024-02-12', isRequired: false },
  ],
  FACILITIES: [
    { id: '12', title: 'Collect access cards and keys', status: 'PENDING', assignee: 'Office Admin', dueDate: '2024-02-15', isRequired: true },
    { id: '13', title: 'Clear desk and personal items', status: 'PENDING', assignee: 'Office Admin', dueDate: '2024-02-15', isRequired: true },
  ],
  MANAGER: [
    { id: '14', title: 'Knowledge transfer', status: 'IN_PROGRESS', assignee: 'Engineering Manager', dueDate: '2024-02-08', isRequired: true },
    { id: '15', title: 'Reassign responsibilities', status: 'COMPLETED', assignee: 'Engineering Manager', dueDate: '2024-02-10', isRequired: true },
    { id: '16', title: 'Client handover', status: 'PENDING', assignee: 'Engineering Manager', dueDate: '2024-02-08', isRequired: false },
  ],
}

const categoryIcons: Record<string, any> = {
  IT: Laptop,
  HR: Users,
  FINANCE: CreditCard,
  FACILITIES: Key,
  MANAGER: Building,
  LEGAL: FileText,
  SECURITY: Shield,
}

export default function OffboardingPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedOffboarding, setSelectedOffboarding] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return <Badge className={styles[status as keyof typeof styles] || styles.PENDING}>{status.replace('_', ' ')}</Badge>
  }

  const getSeparationBadge = (type: string) => {
    const styles = {
      RESIGNATION: 'bg-blue-100 text-blue-800',
      TERMINATION: 'bg-red-100 text-red-800',
      RETIREMENT: 'bg-purple-100 text-purple-800',
      CONTRACT_END: 'bg-orange-100 text-orange-800',
      MUTUAL_AGREEMENT: 'bg-green-100 text-green-800',
    }
    return <Badge variant="outline" className={styles[type as keyof typeof styles]}>{type.replace('_', ' ')}</Badge>
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  const selectedData = selectedOffboarding
    ? mockOffboardings.find((o) => o.id === selectedOffboarding)
    : null

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offboarding</h1>
          <p className="text-muted-foreground">
            Manage employee separations with structured workflows
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start Offboarding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Start Offboarding Process</DialogTitle>
              <DialogDescription>
                Initialize the separation workflow for an employee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nguyen Van D - Engineering</SelectItem>
                    <SelectItem value="2">Tran Thi E - Marketing</SelectItem>
                    <SelectItem value="3">Le Van F - Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Separation Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIGNATION">Resignation</SelectItem>
                    <SelectItem value="TERMINATION">Termination</SelectItem>
                    <SelectItem value="RETIREMENT">Retirement</SelectItem>
                    <SelectItem value="CONTRACT_END">Contract End</SelectItem>
                    <SelectItem value="MUTUAL_AGREEMENT">Mutual Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last Working Day</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea placeholder="Brief reason for separation" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setCreateDialogOpen(false)}>
                  Start Process
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offboardings</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all offboardings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Separations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Offboarding List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Offboardings</CardTitle>
              <CardDescription>Click to view details</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="active">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="active"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="m-0">
                  <div className="divide-y">
                    {mockOffboardings
                      .filter((o) => o.status !== 'COMPLETED')
                      .map((offboarding) => (
                        <div
                          key={offboarding.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedOffboarding === offboarding.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedOffboarding(offboarding.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={offboarding.employee.avatar} />
                              <AvatarFallback>
                                {offboarding.employee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {offboarding.employee.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {offboarding.employee.position}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            {getStatusBadge(offboarding.status)}
                            <span className="text-xs text-muted-foreground">
                              Last day: {offboarding.lastWorkingDay}
                            </span>
                          </div>
                          <Progress value={offboarding.progress} className="h-1 mt-2" />
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="m-0">
                  <div className="divide-y">
                    {mockOffboardings
                      .filter((o) => o.status === 'COMPLETED')
                      .map((offboarding) => (
                        <div
                          key={offboarding.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedOffboarding === offboarding.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedOffboarding(offboarding.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={offboarding.employee.avatar} />
                              <AvatarFallback>
                                {offboarding.employee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {offboarding.employee.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Completed {offboarding.completedAt}
                              </p>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Task Details */}
        <div className="lg:col-span-2">
          {selectedData ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedData.employee.avatar} />
                      <AvatarFallback>
                        {selectedData.employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedData.employee.name}</CardTitle>
                      <CardDescription>
                        {selectedData.employee.position} · {selectedData.employee.department}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeparationBadge(selectedData.separationType)}
                    {getStatusBadge(selectedData.status)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Last Working Day</p>
                    <p className="text-sm font-medium">{selectedData.lastWorkingDay}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedData.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{selectedData.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                    <p className="text-sm font-medium">
                      {selectedData.completedTasks} / {selectedData.totalTasks} completed
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={['IT', 'HR']} className="w-full">
                  {Object.entries(mockTasks).map(([category, tasks]) => {
                    const Icon = categoryIcons[category] || FileText
                    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length
                    return (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{category}</span>
                            <Badge variant="secondary" className="ml-2">
                              {completedCount}/{tasks.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                              >
                                <div className="mt-0.5">
                                  {getTaskStatusIcon(task.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm font-medium ${
                                      task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
                                    }`}>
                                      {task.title}
                                    </p>
                                    {task.isRequired && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Assigned to: {task.assignee} · Due: {task.dueDate}
                                  </p>
                                </div>
                                {task.status !== 'COMPLETED' && (
                                  <Button variant="ghost" size="sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserMinus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Select an offboarding to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
