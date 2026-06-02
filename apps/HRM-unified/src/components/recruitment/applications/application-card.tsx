'use client'

import { Card } from '@/components/ui/card'
import type { Application } from '@/types/recruitment'
import { APPLICATION_SOURCE } from '@/lib/recruitment/constants'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ApplicationCardProps {
  application: Application
  onClick?: () => void
  isDragging?: boolean
}

export function ApplicationCard({ application, onClick, isDragging }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: application.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const daysInStage = Math.floor(
    (Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  const source = APPLICATION_SOURCE[application.source]?.label || application.source

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="p-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <div className="font-medium text-sm">{application.candidate?.fullName}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {application.requisition?.title}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{source}</span>
          <span className="text-xs text-muted-foreground">{daysInStage}d</span>
        </div>
        {application.overallRating && (
          <div className="mt-1 text-xs font-medium text-yellow-600">
            Rating: {application.overallRating}/5
          </div>
        )}
      </Card>
    </div>
  )
}
