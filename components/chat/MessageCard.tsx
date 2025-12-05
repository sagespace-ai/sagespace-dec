"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { SparklesIcon, ShareIcon, BookmarkIcon, ZapIcon } from "@/components/icons"

interface MessageCardProps {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sageEmoji?: string
  sageName?: string
  artifacts?: Array<{
    type: string
    name: string
    emoji: string
    preview?: string
  }>
  xpEarned?: number
  onReact?: (reaction: string) => void
  onShare?: () => void
  onRemix?: () => void
}

export function MessageCard({
  role,
  content,
  timestamp,
  sageEmoji,
  sageName,
  artifacts,
  xpEarned,
  onReact,
  onShare,
  onRemix,
}: MessageCardProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleReaction = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))
    onReact?.(emoji)
  }

  const quickReactions = ["❤️", "🔥", "💡", "🎯", "✨", "🙌"]

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} animate-slide-up group`}>
      <Card
        className={`max-w-[85%] p-4 rounded-2xl border-2 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.02] ${
          role === "user"
            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30 text-white ml-auto"
            : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-white"
        }`}
      >
        {/* Message Header */}
        <div className="flex items-start gap-3 mb-3">
          {role === "assistant" && sageEmoji && <div className="text-2xl flex-shrink-0">{sageEmoji}</div>}
          <div className="flex-1">
            {role === "assistant" && sageName && (
              <div className="text-sm font-semibold text-white mb-1">{sageName}</div>
            )}
            {/* Message Content */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        </div>

        {/* Artifacts */}
        {artifacts && artifacts.length > 0 && (
          <div className="mt-4 space-y-2">
            {artifacts.map((artifact, idx) => (
              <div
                key={idx}
                className="p-3 bg-black/30 border border-yellow-500/30 rounded-xl flex items-center gap-3 hover:border-yellow-500/50 transition-all cursor-pointer"
              >
                <div className="text-2xl">{artifact.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-yellow-400">{artifact.name}</div>
                  <div className="text-xs text-slate-400">{artifact.type}</div>
                </div>
                <SparklesIcon className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* XP Reward */}
        {xpEarned && xpEarned > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
            <ZapIcon className="w-3 h-3" />
            <span>+{xpEarned} XP earned</span>
          </div>
        )}

        {/* Reactions Bar */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="w-7 h-7 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all hover:scale-110 text-sm"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 hover:bg-white/10 rounded-lg transition-all ${
                isBookmarked ? "text-yellow-400" : "text-slate-400"
              }`}
              title="Bookmark"
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onShare}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
              title="Share"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reaction Count */}
        {Object.keys(reactions).length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {Object.entries(reactions).map(([emoji, count]) => (
              <span key={emoji} className="text-xs px-2 py-1 bg-white/5 rounded-full">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-slate-400 mt-2">
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </Card>
    </div>
  )
}
