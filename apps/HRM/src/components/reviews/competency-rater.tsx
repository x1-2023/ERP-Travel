"use client"

import { RTR_COMPETENCIES, calculateWeightedScore, scoreToRating, RATING_LABELS } from "@/lib/config/competencies"
import { Star } from "lucide-react"

interface CompetencyRaterProps {
  scores: Record<string, number>
  onChange: (scores: Record<string, number>) => void
  readOnly?: boolean
}

export function CompetencyRater({ scores, onChange, readOnly }: CompetencyRaterProps) {
  const weightedScore = calculateWeightedScore(scores)
  const suggestedRating = scoreToRating(weightedScore)
  const ratingInfo = RATING_LABELS[suggestedRating]

  return (
    <div className="space-y-3">
      {RTR_COMPETENCIES.map((c) => {
        const currentScore = scores[c.key] || 0
        return (
          <div key={c.key} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">Trọng số: {(c.weight * 100).toFixed(0)}%</div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={readOnly}
                  className={`p-0.5 ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
                  onClick={() => {
                    if (!readOnly) {
                      onChange({ ...scores, [c.key]: star === currentScore ? 0 : star })
                    }
                  }}
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= currentScore
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-medium w-8 text-right">{currentScore || "-"}</span>
            </div>
          </div>
        )
      })}

      <div className="border-t pt-3 flex items-center justify-between">
        <span className="text-sm font-medium">Điểm tổng hợp:</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{weightedScore.toFixed(1)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${ratingInfo.color}`}>
            {ratingInfo.label}
          </span>
        </div>
      </div>
    </div>
  )
}
