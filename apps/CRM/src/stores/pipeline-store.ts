'use client'

import { create } from 'zustand'

interface PipelineState {
  activeDealId: string | null
  dragOverStageId: string | null
  setActiveDeal: (id: string | null) => void
  setDragOverStage: (id: string | null) => void
}

export const usePipelineStore = create<PipelineState>((set) => ({
  activeDealId: null,
  dragOverStageId: null,
  setActiveDeal: (id) => set({ activeDealId: id }),
  setDragOverStage: (id) => set({ dragOverStageId: id }),
}))
