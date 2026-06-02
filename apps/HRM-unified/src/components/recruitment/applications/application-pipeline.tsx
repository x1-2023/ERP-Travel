'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Application } from '@/types/recruitment'
import { PIPELINE_STAGES } from '@/lib/recruitment/constants'
import { PipelineColumn } from './pipeline-column'
import { ApplicationCard } from './application-card'

interface ApplicationPipelineProps {
  pipeline: Record<string, Application[]>
  onStatusChange: (applicationId: string, newStatus: string) => Promise<void>
  onViewApplication: (application: Application) => void
}

export function ApplicationPipeline({
  pipeline,
  onStatusChange,
  onViewApplication,
}: ApplicationPipelineProps) {
  const [activeApplication, setActiveApplication] = useState<Application | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const applicationId = event.active.id as string
    for (const applications of Object.values(pipeline)) {
      const app = applications.find((a) => a.id === applicationId)
      if (app) {
        setActiveApplication(app)
        break
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveApplication(null)

    if (!over) return

    const applicationId = active.id as string
    const newStatus = over.id as string

    let currentStatus = ''
    for (const [status, applications] of Object.entries(pipeline)) {
      if (applications.find((a) => a.id === applicationId)) {
        currentStatus = status
        break
      }
    }

    if (currentStatus !== newStatus) {
      await onStatusChange(applicationId, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.filter((s) => !['REJECTED', 'HIRED'].includes(s.id)).map(
          (stage) => (
            <PipelineColumn
              key={stage.id}
              id={stage.id}
              title={stage.label}
              count={pipeline[stage.id]?.length || 0}
              color={stage.color}
            >
              <SortableContext
                items={pipeline[stage.id]?.map((a) => a.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {pipeline[stage.id]?.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onClick={() => onViewApplication(application)}
                  />
                ))}
              </SortableContext>
            </PipelineColumn>
          )
        )}
      </div>
      <DragOverlay>
        {activeApplication && (
          <ApplicationCard application={activeApplication} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}
