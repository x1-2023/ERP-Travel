"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, SkipForward, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import { useState } from "react"

interface OnboardingTask {
  id: string
  taskKey: string
  title: string
  description: string | null
  status: "PENDING" | "DONE" | "SKIPPED"
  doneAt: string | null
  doneBy: string | null
  note: string | null
  dueDate: string | null
}

interface OnboardingData {
  checklist: {
    id: string
    completedAt: string | null
    tasks: OnboardingTask[]
  } | null
  progress: { total: number; done: number; percent: number } | null
  message?: string
}

export function OnboardingTab({ employeeId }: { employeeId: string }) {
  const queryClient = useQueryClient()
  const [skipTaskId, setSkipTaskId] = useState<string | null>(null)
  const [skipNote, setSkipNote] = useState("")

  const { data, isLoading } = useQuery<OnboardingData>({
    queryKey: ["onboarding", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/onboarding`)
      return res.json()
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/employees/${employeeId}/onboarding/${taskId}/complete`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] })
    },
  })

  const skipMutation = useMutation({
    mutationFn: async ({ taskId, note }: { taskId: string; note: string }) => {
      const res = await fetch(`/api/employees/${employeeId}/onboarding/${taskId}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      setSkipTaskId(null)
      setSkipNote("")
      queryClient.invalidateQueries({ queryKey: ["onboarding", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] })
    },
  })

  if (isLoading) return <div className="text-center py-8 text-slate-400">Đang tải...</div>

  if (!data?.checklist) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          {data?.message || "Chưa có checklist onboarding"}
        </CardContent>
      </Card>
    )
  }

  const { checklist, progress } = data

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tiến độ onboarding</span>
            <span className="text-sm text-slate-500">
              {progress?.done}/{progress?.total} ({progress?.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${progress?.percent || 0}%`, backgroundColor: "#1E3A5F" }}
            />
          </div>
          {checklist.completedAt && (
            <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Hoàn tất onboarding ngày {formatDate(checklist.completedAt)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="space-y-2">
        {checklist.tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="py-4 flex items-center gap-4">
              {/* Status icon */}
              <div className="shrink-0">
                {task.status === "DONE" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : task.status === "SKIPPED" ? (
                  <SkipForward className="h-5 w-5 text-slate-400" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${task.status !== "PENDING" ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {task.status === "DONE" ? "Hoàn thành" : task.status === "SKIPPED" ? "Bỏ qua" : "Chờ xử lý"}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                )}
                {task.dueDate && task.status === "PENDING" && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hạn: {formatDate(task.dueDate)}
                  </p>
                )}
                {task.note && (
                  <p className="text-xs text-slate-400 mt-0.5 italic">Ghi chú: {task.note}</p>
                )}
              </div>

              {/* Actions */}
              {task.status === "PENDING" && (
                <div className="flex items-center gap-2 shrink-0">
                  {skipTaskId === task.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skipNote}
                        onChange={(e) => setSkipNote(e.target.value)}
                        placeholder="Lý do bỏ qua..."
                        className="text-xs border rounded px-2 py-1 w-40"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!skipNote || skipMutation.isPending}
                        onClick={() => skipMutation.mutate({ taskId: task.id, note: skipNote })}
                      >
                        OK
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setSkipTaskId(null); setSkipNote("") }}>
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        style={{ backgroundColor: "#1E3A5F" }}
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(task.id)}
                      >
                        {completeMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Hoàn thành"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSkipTaskId(task.id)}
                      >
                        Bỏ qua
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
