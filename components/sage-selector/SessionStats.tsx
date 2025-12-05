"use client"

import { MessageSquare, Zap, Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { SessionStats as ISessionStats } from "@/types/sage-selector"

interface SessionStatsProps {
  stats: ISessionStats
}

export function SessionStats({ stats }: SessionStatsProps) {
  return (
    <Card className="p-4 bg-slate-900/80 border-cyan-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-slate-200">Session Stats</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Messages Sent
          </span>
          <span className="text-slate-100 font-medium">{stats.messagesSent}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            XP Earned
          </span>
          <span className="text-yellow-400 font-bold">+{stats.xpEarned}</span>
        </div>
      </div>
    </Card>
  )
}
