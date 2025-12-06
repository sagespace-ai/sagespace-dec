"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SageTemplate, StarterConversation } from "@/lib/sage-templates"
import { getPersonalizedStarterConversations } from "@/lib/personalization"
import type { UserProfile } from "@/types/user"
import type { ChatMessage } from "@/types/chat"

interface SageCardProps {
  sage: SageTemplate
  user?: UserProfile | null
  recentMessages?: ChatMessage[]
  onStartChat?: (sageId: string, starterPrompt?: string) => void
  showStarters?: boolean
  className?: string
}

export function SageCard({
  sage,
  user,
  recentMessages = [],
  onStartChat,
  showStarters = true,
  className = "",
}: SageCardProps) {
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null)

  const personalizedStarters = getPersonalizedStarterConversations(sage, user || null, recentMessages, 5)

  const handleStarterClick = (starter: StarterConversation) => {
    setSelectedStarter(starter.id)
    if (onStartChat) {
      onStartChat(sage.id, starter.prompt)
    }
  }

  return (
    <Card className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 ${className}`}>
      {/* Sage Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{sage.avatar}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{sage.name}</h3>
          <p className="text-sm text-cyan-400 mb-2">{sage.role}</p>
          {sage.synopsis && (
            <p className="text-sm text-slate-300 leading-relaxed">{sage.synopsis}</p>
          )}
        </div>
      </div>

      {/* Capabilities */}
      {sage.capabilities && sage.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sage.capabilities.slice(0, 3).map((cap, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30"
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* Starter Conversations */}
      {showStarters && personalizedStarters.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Try this:
          </p>
          <div className="space-y-2">
            {personalizedStarters.map((starter) => (
              <button
                key={starter.id}
                onClick={() => handleStarterClick(starter)}
                disabled={selectedStarter === starter.id}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedStarter === starter.id
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-cyan-500/30 hover:text-white"
                }`}
              >
                <div className="font-medium text-sm mb-1">{starter.title}</div>
                {starter.description && (
                  <div className="text-xs text-slate-400">{starter.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start Chat Button (if no starters or as fallback) */}
      {(!showStarters || personalizedStarters.length === 0) && onStartChat && (
        <Button
          onClick={() => onStartChat(sage.id)}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
        >
          Start Conversation
        </Button>
      )}
    </Card>
  )
}

