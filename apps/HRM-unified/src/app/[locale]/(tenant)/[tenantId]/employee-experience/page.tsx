// src/app/[locale]/(tenant)/[tenantId]/employee-experience/page.tsx
// Employee Experience Dashboard

import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ClipboardList,
  Award,
  Newspaper,
  UserMinus,
  TrendingUp,
  Users,
  Star,
  Bell,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Employee Experience | HR Platform',
  description: 'Employee engagement, surveys, recognition, and communication hub',
}

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export default async function EmployeeExperiencePage({ params }: PageProps) {
  const { tenantId } = await params

  const modules = [
    {
      title: 'Pulse Surveys',
      description: 'Measure employee engagement with quick surveys and eNPS tracking',
      icon: ClipboardList,
      href: `/${tenantId}/employee-experience/surveys`,
      stats: { label: 'Response Rate', value: '78%' },
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Recognition & Kudos',
      description: 'Celebrate achievements and give kudos to colleagues',
      icon: Award,
      href: `/${tenantId}/employee-experience/recognition`,
      stats: { label: 'This Month', value: '156 kudos' },
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Company Feed',
      description: 'Stay updated with company news, events, and announcements',
      icon: Newspaper,
      href: `/${tenantId}/employee-experience/feed`,
      stats: { label: 'Unread', value: '12 posts' },
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Offboarding',
      description: 'Manage employee separations with structured workflows',
      icon: UserMinus,
      href: `/${tenantId}/employee-experience/offboarding`,
      stats: { label: 'In Progress', value: '3 active' },
      color: 'text-red-600 bg-red-100',
    },
  ]

  const quickStats = [
    { label: 'eNPS Score', value: '+42', icon: TrendingUp, trend: '+5 from last month' },
    { label: 'Active Employees', value: '248', icon: Users, trend: '+12 this quarter' },
    { label: 'Recognition Given', value: '1,247', icon: Star, trend: 'This year' },
    { label: 'Survey Responses', value: '89%', icon: Bell, trend: 'Completion rate' },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Experience</h1>
          <p className="text-muted-foreground">
            Engage, recognize, and communicate with your team
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${module.color}`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{module.stats.label}</p>
                  <p className="text-lg font-semibold">{module.stats.value}</p>
                </div>
                <Link href={module.href}>
                  <Button>Open</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <Award className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nguyen Van A gave kudos to Tran Thi B</p>
                <p className="text-xs text-muted-foreground">Team Player - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly Pulse Survey completed</p>
                <p className="text-xs text-muted-foreground">85% response rate - Yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <Newspaper className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">New announcement: Q4 Company Update</p>
                <p className="text-xs text-muted-foreground">Posted by CEO - 2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
