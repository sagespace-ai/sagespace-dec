"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import type { RecommendationResult, SageSummary } from "@/types/sage-selector"

interface PerfectMatchesListProps {
  result: RecommendationResult
  selectedSageId: string | null
  onSelect: (sage: SageSummary) => void
}

export function PerfectMatchesList({ result, selectedSageId, onSelect }: PerfectMatchesListProps) {
  return (
    <Card className="p-4 bg-slate-900/80 border-purple-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-slate-200">Perfect Matches</h3>
      </div>

      <p className="text-xs text-slate-400 mb-4">{result.rationale}</p>

      <div className="space-y-2">
        {result.candidates.map((sage) => (
          <Button
            key={sage.id}
            variant="ghost"
            onClick={() => onSelect(sage)}
            className={`w-full justify-start gap-3 h-auto p-3 ${
              selectedSageId === sage.id
                ? "bg-purple-500/20 border border-purple-500/50"
                : "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
            }`}
          >
            <div className="text-2xl">{sage.emoji || "🧙"}</div>
            <div className="flex-1 text-left">
              <div className="font-medium text-slate-200 text-sm">{sage.name}</div>
              <div className="text-xs text-slate-400">{sage.domain}</div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  )
}
