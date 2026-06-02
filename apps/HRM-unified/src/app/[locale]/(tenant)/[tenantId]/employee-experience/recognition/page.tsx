// src/app/[locale]/(tenant)/[tenantId]/employee-experience/recognition/page.tsx
// Recognition & Kudos Page

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Award,
  Heart,
  MessageCircle,
  Trophy,
  Star,
  Users,
  Zap,
  Target,
  Lightbulb,
  Handshake,
  Clock,
  TrendingUp,
} from 'lucide-react'

// Mock data
const kudosCategories = [
  { id: '1', name: 'Team Player', emoji: '🤝', points: 10, color: 'bg-blue-100 text-blue-800' },
  { id: '2', name: 'Innovation', emoji: '💡', points: 15, color: 'bg-purple-100 text-purple-800' },
  { id: '3', name: 'Going Extra Mile', emoji: '🚀', points: 20, color: 'bg-orange-100 text-orange-800' },
  { id: '4', name: 'Problem Solver', emoji: '🔧', points: 15, color: 'bg-green-100 text-green-800' },
  { id: '5', name: 'Mentor', emoji: '🎓', points: 15, color: 'bg-indigo-100 text-indigo-800' },
  { id: '6', name: 'Customer Focus', emoji: '⭐', points: 10, color: 'bg-yellow-100 text-yellow-800' },
  { id: '7', name: 'Leadership', emoji: '👑', points: 20, color: 'bg-amber-100 text-amber-800' },
  { id: '8', name: 'Positive Attitude', emoji: '😊', points: 5, color: 'bg-pink-100 text-pink-800' },
]

const mockRecognitions = [
  {
    id: '1',
    giver: { name: 'Nguyen Van A', avatar: '', department: 'Engineering' },
    receiver: { name: 'Tran Thi B', avatar: '', department: 'Product' },
    category: kudosCategories[0],
    message: 'Thank you for helping me debug that critical issue at 11pm last night! Your dedication to the team is amazing.',
    points: 10,
    reactions: [{ emoji: '❤️', count: 5 }, { emoji: '👏', count: 8 }],
    comments: 2,
    createdAt: '2 hours ago',
    isPublic: true,
  },
  {
    id: '2',
    giver: { name: 'Le Van C', avatar: '', department: 'Sales' },
    receiver: { name: 'Pham Thi D', avatar: '', department: 'Marketing' },
    category: kudosCategories[1],
    message: 'The new campaign idea was brilliant! It exceeded our expectations and generated 3x more leads.',
    points: 15,
    reactions: [{ emoji: '🔥', count: 12 }, { emoji: '💡', count: 6 }],
    comments: 4,
    createdAt: '5 hours ago',
    isPublic: true,
  },
  {
    id: '3',
    giver: { name: 'Hoang Van E', avatar: '', department: 'HR' },
    receiver: { name: 'Nguyen Thi F', avatar: '', department: 'Finance' },
    category: kudosCategories[2],
    message: 'Thank you for staying late to close the month-end reports. Your extra effort made our audit smooth!',
    points: 20,
    reactions: [{ emoji: '🙏', count: 7 }, { emoji: '⭐', count: 4 }],
    comments: 1,
    createdAt: 'Yesterday',
    isPublic: true,
  },
]

const leaderboard = [
  { rank: 1, name: 'Tran Thi B', department: 'Product', points: 245, kudosReceived: 18 },
  { rank: 2, name: 'Nguyen Van A', department: 'Engineering', points: 210, kudosReceived: 15 },
  { rank: 3, name: 'Pham Thi D', department: 'Marketing', points: 185, kudosReceived: 12 },
  { rank: 4, name: 'Le Van C', department: 'Sales', points: 165, kudosReceived: 11 },
  { rank: 5, name: 'Hoang Van E', department: 'HR', points: 150, kudosReceived: 10 },
]

export default function RecognitionPage() {
  const [giveKudosOpen, setGiveKudosOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const myStats = {
    pointsGiven: 65,
    pointsRemaining: 35,
    monthlyAllowance: 100,
    kudosGiven: 8,
    kudosReceived: 12,
    totalPointsReceived: 145,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recognition & Kudos</h1>
          <p className="text-muted-foreground">
            Celebrate achievements and appreciate your colleagues
          </p>
        </div>
        <Dialog open={giveKudosOpen} onOpenChange={setGiveKudosOpen}>
          <DialogTrigger asChild>
            <Button>
              <Award className="mr-2 h-4 w-4" />
              Give Kudos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Give Kudos</DialogTitle>
              <DialogDescription>
                Recognize a colleague for their great work
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Who do you want to recognize?</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nguyen Van A - Engineering</SelectItem>
                    <SelectItem value="2">Tran Thi B - Product</SelectItem>
                    <SelectItem value="3">Le Van C - Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {kudosCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span className="mr-2">{cat.emoji}</span>
                      {cat.name}
                      <Badge variant="secondary" className="ml-auto">
                        {cat.points} pts
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Tell them why you're giving this kudos..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Points remaining: {myStats.pointsRemaining} / {myStats.monthlyAllowance}</span>
                <span>Cost: {kudosCategories.find(c => c.id === selectedCategory)?.points || 0} points</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGiveKudosOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setGiveKudosOpen(false)}>
                  Send Kudos
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Remaining</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats.pointsRemaining}</div>
            <Progress value={(myStats.pointsRemaining / myStats.monthlyAllowance) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {myStats.pointsGiven} / {myStats.monthlyAllowance} used this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kudos Given</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats.kudosGiven}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kudos Received</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats.kudosReceived}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats.totalPointsReceived}</div>
            <p className="text-xs text-muted-foreground">Earned this year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recognition Feed */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="wall" className="space-y-4">
            <TabsList>
              <TabsTrigger value="wall">Recognition Wall</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="given">Given</TabsTrigger>
            </TabsList>

            <TabsContent value="wall" className="space-y-4">
              {mockRecognitions.map((recognition) => (
                <Card key={recognition.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={recognition.giver.avatar} />
                        <AvatarFallback>
                          {recognition.giver.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{recognition.giver.name}</span>
                          <span className="text-muted-foreground">recognized</span>
                          <span className="font-semibold">{recognition.receiver.name}</span>
                          <Badge className={recognition.category.color}>
                            {recognition.category.emoji} {recognition.category.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {recognition.giver.department} · {recognition.createdAt}
                        </p>
                        <p className="mt-3">{recognition.message}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            {recognition.reactions.map((reaction, index) => (
                              <Button key={index} variant="ghost" size="sm" className="h-8 px-2">
                                <span className="mr-1">{reaction.emoji}</span>
                                <span className="text-xs">{reaction.count}</span>
                              </Button>
                            ))}
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {recognition.comments}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="received" className="space-y-4">
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your received kudos will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="given" className="space-y-4">
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Kudos you've given will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Monthly Leaderboard
              </CardTitle>
              <CardDescription>Top recognized employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((person, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {person.rank}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{person.points}</p>
                      <p className="text-xs text-muted-foreground">{person.kudosReceived} kudos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Popular recognition types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kudosCategories.slice(0, 5).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <span>{cat.emoji}</span>
                      {cat.name}
                    </span>
                    <Badge variant="secondary">{cat.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
