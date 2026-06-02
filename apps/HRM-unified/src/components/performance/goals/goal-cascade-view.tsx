'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { GoalProgress } from './goal-progress'
import { GOAL_TYPE } from '@/lib/performance/constants'
import type { Goal } from '@/types/performance'

interface GoalCascadeViewProps {
  goals: Goal[]
}

interface GoalNode {
  goal: Goal
  children: GoalNode[]
  level: number
}

function buildTree(goals: Goal[]): GoalNode[] {
  const goalMap = new Map<string, GoalNode>()
  const roots: GoalNode[] = []

  goals.forEach((goal) => {
    goalMap.set(goal.id, { goal, children: [], level: 0 })
  })

  goals.forEach((goal) => {
    const node = goalMap.get(goal.id)!
    if (goal.parentGoalId && goalMap.has(goal.parentGoalId)) {
      const parent = goalMap.get(goal.parentGoalId)!
      node.level = parent.level + 1
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

const typeColorMap: Record<string, string> = {
  purple: 'border-purple-500/50 bg-purple-500/10',
  blue: 'border-blue-500/50 bg-blue-500/10',
  green: 'border-success/50 bg-success/10',
  orange: 'border-primary/50 bg-primary/10',
}

const typeLabelColorMap: Record<string, string> = {
  purple: 'text-purple-400',
  blue: 'text-blue-400',
  green: 'text-success',
  orange: 'text-primary',
}

function GoalNodeItem({ node }: { node: GoalNode }) {
  const typeInfo = GOAL_TYPE[node.goal.goalType as keyof typeof GOAL_TYPE]
  const color = typeInfo?.color || 'blue'

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-sm border',
          typeColorMap[color]
        )}
        style={{ marginLeft: `${node.level * 24}px` }}
      >
        {node.level > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <div
              className="border-l border-b border-muted-foreground/30"
              style={{ width: '12px', height: '12px', marginTop: '-12px' }}
            />
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {typeInfo && (
              <span className={cn('text-[10px] font-medium', typeLabelColorMap[color])}>
                [{typeInfo.label}]
              </span>
            )}
            <span className="text-sm font-medium truncate">{node.goal.title}</span>
          </div>
          <div className="mt-1 max-w-[200px]">
            <GoalProgress progress={node.goal.progress} size="sm" />
          </div>
        </div>
        <div className="text-xs font-data text-muted-foreground shrink-0">
          {node.goal.progress}%
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <GoalNodeItem key={child.goal.id} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

export function GoalCascadeView({ goals }: GoalCascadeViewProps) {
  const tree = buildTree(goals)

  if (tree.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Chưa có mục tiêu nào
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tree.map((node) => (
        <GoalNodeItem key={node.goal.id} node={node} />
      ))}
    </div>
  )
}
