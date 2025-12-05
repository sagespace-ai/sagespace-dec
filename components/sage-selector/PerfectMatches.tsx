"use client"

import type { SageProfile } from "@/types/sage-selector"
import { cn } from "@/lib/utils"

interface PerfectMatchesProps {
  sages: SageProfile[]
  onSelectSage: (sage: SageProfile) => void
  title?: string
}

export function PerfectMatches({ sages, onSelectSage, title = "Perfect Matches" }: PerfectMatchesProps) {
  if (sages.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="text-xs text-cyan-400">✨ AI Curated</div>
      </div>
      <div className="space-y-2">
        {sages.map((sage) => (
          <button
            key={sage.id}
            onClick={() => onSelectSage(sage)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
              "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/50",
              "hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            <div className="text-3xl">{sage.avatar}</div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-white text-sm">{sage.name}</div>
              <div className="text-xs text-slate-400">{sage.specialty}</div>
            </div>
            {sage.trending && <div className="text-xs text-pink-400 font-semibold">🔥 Trending</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
