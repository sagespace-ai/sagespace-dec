"use client"

import type { SageMode } from "@/types/sage-selector"
import { cn } from "@/lib/utils"

interface ModeSelectorProps {
  selectedMode: SageMode
  onSelectMode: (mode: SageMode) => void
}

const modes = [
  {
    id: "single" as SageMode,
    icon: "🎯",
    label: "Single Sage",
    description: "1-on-1 conversation",
    gradient: "from-pink-500/20 to-purple-500/20",
  },
  {
    id: "circle" as SageMode,
    icon: "🌀",
    label: "Sage Circle",
    description: "Team collaboration",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "duel" as SageMode,
    icon: "⚔️",
    label: "Sage Duel",
    description: "Debate & compete",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "council" as SageMode,
    icon: "🏛️",
    label: "Sage Council",
    description: "Multi-agent reasoning",
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
]

export function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Select Mode</h3>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300",
              "hover:scale-105 active:scale-95",
              selectedMode === mode.id
                ? "border-cyan-500 bg-gradient-to-br " + mode.gradient
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600",
            )}
          >
            {selectedMode === mode.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 animate-pulse" />
            )}
            <div className="relative">
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{mode.label}</div>
              <div className="text-xs text-slate-400">{mode.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
