"use client"

import type { Mood } from "@/types/sage-selector"
import { cn } from "@/lib/utils"

interface MoodSelectorProps {
  selectedMood: Mood | null
  onSelectMood: (mood: Mood) => void
}

const moods: { id: Mood; icon: string; label: string }[] = [
  { id: "focused", icon: "🎯", label: "Focused" },
  { id: "curious", icon: "🤔", label: "Curious" },
  { id: "stressed", icon: "😰", label: "Stressed" },
  { id: "calm", icon: "😌", label: "Calm" },
  { id: "overwhelmed", icon: "😵", label: "Overwhelmed" },
  { id: "playful", icon: "🎮", label: "Playful" },
]

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400">How are you feeling?</div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelectMood(mood.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap",
              "hover:scale-105 active:scale-95",
              selectedMood === mood.id
                ? "border-pink-500 bg-pink-500/20 text-white"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600",
            )}
          >
            <span className="text-lg">{mood.icon}</span>
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
