"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ContentBlock } from "@/types/chat"
import { SparklesIcon, CheckCircleIcon, TrendingUpIcon } from "@/components/icons"

interface ContentBlockRendererProps {
  block: ContentBlock
  onQuestComplete?: (questId: string) => void
}

export function ContentBlockRenderer({ block, onQuestComplete }: ContentBlockRendererProps) {
  switch (block.type) {
    case "text":
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.text}</p>

    case "image":
      return (
        <Card className="mt-3 overflow-hidden border-cyan-500/30">
          <img src={block.url || "/placeholder.svg"} alt={block.alt || "Generated image"} className="w-full" />
        </Card>
      )

    case "audio":
      return (
        <Card className="mt-3 p-4 border-purple-500/30">
          <audio controls className="w-full">
            <source src={block.url} />
          </audio>
          {block.title && <p className="text-xs text-slate-400 mt-2">{block.title}</p>}
        </Card>
      )

    case "video":
      return (
        <Card className="mt-3 overflow-hidden border-pink-500/30">
          <video controls className="w-full">
            <source src={block.url} />
          </video>
          {block.title && <p className="text-xs text-slate-400 p-2">{block.title}</p>}
        </Card>
      )

    case "post":
      return (
        <Card className="mt-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📄</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{block.title}</h4>
              <p className="text-sm text-slate-300 mb-2">{block.summary}</p>
              <p className="text-xs text-slate-400 mb-3">{block.bodyPreview}</p>
              {block.permalink && (
                <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50">
                  Read Full Article
                </Button>
              )}
            </div>
          </div>
        </Card>
      )

    case "knowledge_card":
      return (
        <Card className="mt-3 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-2">{block.title}</h4>
              <ul className="space-y-1">
                {block.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {block.sourceUrl && (
                <a href={block.sourceUrl} className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
                  View Source →
                </a>
              )}
            </div>
          </div>
        </Card>
      )

    case "artifact":
      const rarityColors = {
        common: "from-gray-500/20 to-slate-500/20 border-gray-500/50",
        rare: "from-blue-500/20 to-cyan-500/20 border-blue-500/50",
        epic: "from-purple-500/20 to-pink-500/20 border-purple-500/50",
        legendary: "from-yellow-500/20 to-orange-500/20 border-yellow-500/50",
      }
      return (
        <Card className={`mt-3 p-4 bg-gradient-to-r ${rarityColors[block.rarity]} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="relative flex items-center gap-3">
            <div className="text-4xl animate-bounce">{block.iconEmoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400 uppercase">{block.rarity}</span>
              </div>
              <h4 className="font-bold text-white mb-1">{block.name}</h4>
              <p className="text-sm text-slate-300">{block.description}</p>
            </div>
          </div>
        </Card>
      )

    case "quest":
      return (
        <Card className="mt-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚔️</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-white">{block.title}</h4>
                {block.status === "completed" && <CheckCircleIcon className="w-4 h-4 text-green-400" />}
              </div>
              <p className="text-sm text-slate-300 mb-2">{block.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Goal: {block.goal}</div>
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">+{block.rewardXp} XP</span>
                </div>
              </div>
              {block.status !== "completed" && onQuestComplete && (
                <Button
                  size="sm"
                  onClick={() => onQuestComplete(block.id)}
                  className="mt-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 w-full"
                >
                  Mark as Complete
                </Button>
              )}
            </div>
          </div>
        </Card>
      )

    default:
      return null
  }
}
