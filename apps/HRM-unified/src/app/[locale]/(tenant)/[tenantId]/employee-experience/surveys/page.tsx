// src/app/[locale]/(tenant)/[tenantId]/employee-experience/surveys/page.tsx
// Surveys & Feedback Page

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// Mock data
const mockSurveys = [
  {
    id: '1',
    title: 'January 2024 Pulse Survey',
    type: 'PULSE',
    status: 'COMPLETED',
    responses: 185,
    totalTargets: 200,
    responseRate: 92.5,
    createdAt: '2024-01-15',
    closedAt: '2024-01-22',
  },
  {
    id: '2',
    title: 'Q4 Employee Engagement Survey',
    type: 'ENGAGEMENT',
    status: 'ACTIVE',
    responses: 156,
    totalTargets: 248,
    responseRate: 62.9,
    createdAt: '2024-01-20',
    endsAt: '2024-02-05',
  },
  {
    id: '3',
    title: 'eNPS Survey - February',
    type: 'ENPS',
    status: 'DRAFT',
    responses: 0,
    totalTargets: 248,
    responseRate: 0,
    createdAt: '2024-01-25',
    scheduledAt: '2024-02-01',
  },
]

const enpsHistory = [
  { month: 'Aug', score: 35 },
  { month: 'Sep', score: 38 },
  { month: 'Oct', score: 40 },
  { month: 'Nov', score: 37 },
  { month: 'Dec', score: 42 },
  { month: 'Jan', score: 45 },
]

export default function SurveysPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
    }
    return <Badge className={styles[status as keyof typeof styles] || styles.DRAFT}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      PULSE: 'bg-purple-100 text-purple-800',
      ENPS: 'bg-orange-100 text-orange-800',
      ENGAGEMENT: 'bg-blue-100 text-blue-800',
      EXIT: 'bg-red-100 text-red-800',
      ONBOARDING: 'bg-green-100 text-green-800',
    }
    return <Badge variant="outline" className={styles[type as keyof typeof styles]}>{type}</Badge>
  }

  const currentENPS = enpsHistory[enpsHistory.length - 1].score
  const previousENPS = enpsHistory[enpsHistory.length - 2].score
  const enpsTrend = currentENPS - previousENPS

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surveys & Feedback</h1>
          <p className="text-muted-foreground">
            Measure engagement and gather employee feedback
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Survey</DialogTitle>
              <DialogDescription>
                Choose a survey type to get started
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Survey Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select survey type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PULSE">Pulse Survey (Quick check-in)</SelectItem>
                    <SelectItem value="ENPS">eNPS Survey (Loyalty measure)</SelectItem>
                    <SelectItem value="ENGAGEMENT">Engagement Survey (Comprehensive)</SelectItem>
                    <SelectItem value="EXIT">Exit Survey</SelectItem>
                    <SelectItem value="ONBOARDING">Onboarding Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Survey Title</Label>
                <Input placeholder="e.g., February 2024 Pulse Survey" />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea placeholder="Brief description of the survey purpose" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setCreateDialogOpen(false)}>
                  Create Survey
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current eNPS</CardTitle>
            {enpsTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{currentENPS}</div>
            <p className={`text-xs ${enpsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {enpsTrend >= 0 ? '+' : ''}{enpsTrend} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Average across all surveys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Currently collecting responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* eNPS Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>eNPS Trend</CardTitle>
          <CardDescription>
            Employee Net Promoter Score over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-40">
            {enpsHistory.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${(item.score / 50) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
                <span className="text-sm font-medium">+{item.score}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Promoters (9-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>Passives (7-8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Detractors (0-6)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Surveys List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Surveys</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockSurveys.map((survey) => (
            <Card key={survey.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{survey.title}</h3>
                        {getTypeBadge(survey.type)}
                        {getStatusBadge(survey.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created {survey.createdAt}
                        {survey.status === 'ACTIVE' && survey.endsAt && (
                          <> · Ends {survey.endsAt}</>
                        )}
                        {survey.status === 'COMPLETED' && survey.closedAt && (
                          <> · Closed {survey.closedAt}</>
                        )}
                        {survey.status === 'DRAFT' && survey.scheduledAt && (
                          <> · Scheduled for {survey.scheduledAt}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {survey.responses} / {survey.totalTargets} responses
                      </div>
                      <Progress value={survey.responseRate} className="w-32 h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {survey.responseRate}% response rate
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {survey.status === 'DRAFT' ? 'Edit' : 'View Results'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {mockSurveys
            .filter((s) => s.status === 'ACTIVE')
            .map((survey) => (
              <Card key={survey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{survey.title}</h3>
                        {getTypeBadge(survey.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Ends {survey.endsAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{survey.responseRate}%</div>
                        <div className="text-xs text-muted-foreground">Response Rate</div>
                      </div>
                      <Button>Send Reminder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {mockSurveys
            .filter((s) => s.status === 'COMPLETED')
            .map((survey) => (
              <Card key={survey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{survey.title}</h3>
                        {getTypeBadge(survey.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <CheckCircle2 className="inline h-3 w-3 mr-1 text-green-600" />
                        Completed with {survey.responseRate}% response rate
                      </p>
                    </div>
                    <Button variant="outline">View Results</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {mockSurveys
            .filter((s) => s.status === 'DRAFT')
            .map((survey) => (
              <Card key={survey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{survey.title}</h3>
                        {getTypeBadge(survey.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <AlertCircle className="inline h-3 w-3 mr-1 text-yellow-600" />
                        {survey.scheduledAt
                          ? `Scheduled for ${survey.scheduledAt}`
                          : 'Not yet scheduled'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Edit</Button>
                      <Button>Launch Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
