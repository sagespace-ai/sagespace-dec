"use client"

import type { SageProfile } from "@/types/sage-selector"
import { cn } from "@/lib/utils"

interface HolographicChamberProps {
  selectedSages: SageProfile[]
  isSpinning: boolean
}

export function HolographicChamber({ selectedSages, isSpinning }: HolographicChamberProps) {
  const getAuraColor = (specialty: string) => {
    const colors: Record<string, string> = {
      "Health & Mindfulness": "from-green-500 to-emerald-500",
      "Science & Research": "from-blue-500 to-indigo-500",
      "Culinary Arts": "from-orange-500 to-amber-500",
      "Fitness & Athletics": "from-red-500 to-pink-500",
      "Creative Arts": "from-purple-500 to-fuchsia-500",
    }
    return colors[specialty] || "from-cyan-500 to-blue-500"
  }

  return (
    <div className="relative">
      <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/30 overflow-hidden">
        {/* Holographic grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksIDkyLCAyNDYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        {/* Spinning animation overlay */}
        {isSpinning && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
        )}

        {/* Display selected sages */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {selectedSages.length === 0 ? (
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-30">🎯</div>
              <div className="text-sm text-slate-400">Select a sage to begin</div>
            </div>
          ) : selectedSages.length === 1 ? (
            <div className="text-center">
              <div className={cn("relative inline-block", isSpinning && "animate-spin")}>
                {/* Aura glow */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full blur-2xl opacity-50",
                    `bg-gradient-to-br ${getAuraColor(selectedSages[0].specialty)}`,
                  )}
                />
                <div className="relative text-8xl drop-shadow-2xl">{selectedSages[0].avatar}</div>
              </div>
              <div className="mt-4 text-lg font-semibold text-white">{selectedSages[0].name}</div>
              <div className="text-sm text-cyan-400">{selectedSages[0].specialty}</div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {selectedSages.map((sage, index) => {
                const angle = (index / selectedSages.length) * Math.PI * 2 - Math.PI / 2
                const radius = 35
                const x = 50 + radius * Math.cos(angle)
                const y = 50 + radius * Math.sin(angle)

                return (
                  <div
                    key={sage.id}
                    className={cn(
                      "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
                      isSpinning && "animate-pulse",
                    )}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full blur-xl opacity-50",
                          `bg-gradient-to-br ${getAuraColor(sage.specialty)}`,
                        )}
                      />
                      <div className="relative text-4xl">{sage.avatar}</div>
                    </div>
                  </div>
                )
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold text-cyan-400">Circle of {selectedSages.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Particle effects when spinning */}
        {isSpinning && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-200" />
            <div className="absolute bottom-1/4 left-3/4 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-400" />
          </>
        )}
      </div>

      {/* Circle indicator for multiple sages */}
      {selectedSages.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="text-xs text-slate-400">Circle of {selectedSages.length}</div>
          <div className="flex gap-1">
            {selectedSages.map((sage) => (
              <div key={sage.id} className="text-lg">
                {sage.avatar}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
