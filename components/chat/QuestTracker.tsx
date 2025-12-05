"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ZapIcon, AwardIcon, TrendingUpIcon } from "@/components/icons"
import type { Quest } from "@/types/sagechat"

interface QuestTrackerProps {
  quests: Quest[]
  onQuestComplete?: (questId: string) => void
}

export function QuestTracker({ quests, onQuestComplete }: QuestTrackerProps) {
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null)

  const activeQuests = quests.filter((q) => q.progress < q.target)
  const completedQuests = quests.filter((q) => q.progress >= q.target)

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-yellow-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AwardIcon className="w-4 h-4 text-yellow-400" />
          Active Quests
        </h3>
        <span className="text-xs text-slate-400">{activeQuests.length} active</span>
      </div>

      <div className="space-y-3">
        {activeQuests.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            <div className="text-3xl mb-2">🎯</div>
            <p>No active quests. Keep chatting to unlock new challenges!</p>
          </div>
        ) : (
          activeQuests.map((quest) => {
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)
            const isExpanded = expandedQuest === quest.id

            return (
              <div
                key={quest.id}
                className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg cursor-pointer hover:border-yellow-500/50 transition-all"
                onClick={() => setExpandedQuest(isExpanded ? null : quest.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-1">{quest.title}</div>
                    {isExpanded && <p className="text-xs text-slate-300 mb-2">{quest.description}</p>}
                  </div>
                  <div className="text-xs text-yellow-400 font-semibold ml-2">
                    {quest.progress}/{quest.target}
                  </div>
                </div>

                <Progress value={progressPercent} className="h-2 mb-2" />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ZapIcon className="w-3 h-3" />
                    <span>+{quest.reward.xp} XP</span>
                    {quest.reward.artifacts && quest.reward.artifacts.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{quest.reward.artifacts.length} Artifacts</span>
                      </>
                    )}
                  </div>
                  {quest.expiresAt && (
                    <div className="text-orange-400">Expires: {new Date(quest.expiresAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {completedQuests.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
            <TrendingUpIcon className="w-3 h-3" />
            Recently Completed ({completedQuests.length})
          </div>
          <div className="space-y-1">
            {completedQuests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>{quest.title}</span>
                <span className="text-yellow-400">+{quest.reward.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
