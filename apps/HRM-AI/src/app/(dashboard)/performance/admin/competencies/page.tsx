'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, Plus, Layers } from 'lucide-react'
import { CompetencyFramework, Competency } from '@/types/performance'
import { COMPETENCY_CATEGORIES } from '@/lib/performance/constants'

function CompetencyCard({ competency }: { competency: Competency }) {
  return (
    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-zinc-200">{competency.name}</p>
          {competency.description && (
            <p className="text-xs text-zinc-500 mt-1">{competency.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {competency.category && (
            <Badge variant="secondary" className="text-xs bg-zinc-700">{competency.category}</Badge>
          )}
          {competency.isCore && (
            <Badge className="text-xs bg-amber-500/20 text-amber-400">Core</Badge>
          )}
        </div>
      </div>
      {competency.levels && Object.keys(competency.levels).length > 0 && (
        <div className="mt-3 space-y-1">
          {Object.entries(competency.levels).map(([level, desc]) => (
            <div key={level} className="flex gap-2 text-xs">
              <span className="text-amber-400 font-medium w-16 shrink-0">Level {level}:</span>
              <span className="text-zinc-400">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CompetenciesPage() {
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFrameworks() {
      try {
        const res = await fetch('/api/performance/competencies')
        if (res.ok) {
          const data = await res.json()
          setFrameworks(Array.isArray(data) ? data : data.frameworks || [])
        }
      } catch {
        setFrameworks([])
      } finally {
        setLoading(false)
      }
    }
    loadFrameworks()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-64 bg-zinc-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Khung năng lực</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-700 text-zinc-300">
            <Plus className="mr-2 h-4 w-4" /> Thêm năng lực
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="mr-2 h-4 w-4" /> Thêm framework
          </Button>
        </div>
      </div>

      {frameworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <Award className="h-16 w-16 mb-4 text-zinc-700" />
          <p className="text-lg">Chưa có khung năng lực nào</p>
          <p className="text-sm text-zinc-600 mt-1">Tạo framework để định nghĩa các năng lực cần đánh giá</p>
        </div>
      ) : (
        <div className="space-y-6">
          {frameworks.map((framework) => (
            <Card key={framework.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-amber-400" />
                    <div>
                      <CardTitle className="text-zinc-100">{framework.name}</CardTitle>
                      {framework.description && (
                        <p className="text-xs text-zinc-500 mt-1">{framework.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={framework.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}>
                    {framework.isActive ? 'Đang sử dụng' : 'Không hoạt động'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {framework.competencies.length === 0 ? (
                  <p className="text-sm text-zinc-600 text-center py-4">Chưa có năng lực nào trong framework này</p>
                ) : (
                  <div className="space-y-3">
                    {/* Group by category */}
                    {COMPETENCY_CATEGORIES.map((category) => {
                      const comps = framework.competencies.filter((c) => c.category === category)
                      if (comps.length === 0) return null
                      return (
                        <div key={category}>
                          <p className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">{category}</p>
                          <div className="space-y-2">
                            {comps.map((comp) => (
                              <CompetencyCard key={comp.id} competency={comp} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    {/* Uncategorized */}
                    {framework.competencies.filter((c) => !c.category || !COMPETENCY_CATEGORIES.includes(c.category as any)).length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">Khác</p>
                        <div className="space-y-2">
                          {framework.competencies
                            .filter((c) => !c.category || !COMPETENCY_CATEGORIES.includes(c.category as any))
                            .map((comp) => (
                              <CompetencyCard key={comp.id} competency={comp} />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
