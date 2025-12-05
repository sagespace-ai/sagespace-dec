"use client"

import type { SageMode, SageSummary } from "@/types/sage-selector"
import { cn } from "@/lib/utils"

interface HologramPreviewProps {
  mode: SageMode
  primary: SageSummary | null
  members: SageSummary[]
  isDiscovering: boolean
}

export function HologramPreview({ mode, primary, members, isDiscovering }: HologramPreviewProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl p-8 border-2 transition-all duration-500",
        isDiscovering
          ? "bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-cyan-400/50"
          : "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700",
      )}
      style={{ minHeight: "280px" }}
    >
      {/* Center hologram */}
      <div className="flex items-center justify-center h-full">
        {isDiscovering ? (
          <div className="text-center space-y-3">
            <div className="text-6xl animate-pulse">🔮</div>
            <div className="text-sm text-cyan-400">Discovering perfect sage...</div>
          </div>
        ) : primary ? (
          <div className="text-center space-y-2">
            <div className="text-7xl mb-4">{primary.emoji || "🧙"}</div>
            <div className="text-xl font-bold text-white">{primary.name}</div>
            <div className="text-sm text-slate-400">{primary.domain}</div>
            {mode !== "single" && members.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {members.slice(0, 4).map((sage) => (
                  <div key={sage.id} className="text-2xl opacity-70">
                    {sage.emoji || "🧙"}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-5xl opacity-30">🔮</div>
            <div className="text-sm text-slate-500">Select a mode and discover your sage</div>
          </div>
        )}
      </div>

      {/* Ambient glow effect */}
      {isDiscovering && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
        </div>
      )}
    </div>
  )
}
