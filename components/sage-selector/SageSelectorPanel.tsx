"use client"

import { useState } from "react"
import { ModeSelector } from "./ModeSelector"
import { HologramPreview } from "./HologramPreview"
import { MoodSelector } from "./MoodSelector"
import { DiscoverButton } from "./DiscoverButton"
import { PerfectMatchesList } from "./PerfectMatchesList"
import { BrowseMultiverseButton } from "./BrowseMultiverseButton"
import { SessionStats } from "./SessionStats"
import { SageSearchBar } from "./SageSearchBar"
import type {
  SageMode,
  Mood,
  SageSummary,
  RecommendationResult,
  SessionStats as ISessionStats,
} from "@/types/sage-selector"

interface SageSelectorPanelProps {
  onSageSelected?: (sage: SageSummary | SageSummary[]) => void
  onStartSession?: (mode: SageMode, sages: SageSummary | SageSummary[]) => void
}

export function SageSelectorPanel({ onSageSelected, onStartSession }: SageSelectorPanelProps) {
  const [mode, setMode] = useState<SageMode>("single")
  const [mood, setMood] = useState<Mood | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [selectedSageId, setSelectedSageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState<ISessionStats>({
    sessionId: `session-${Date.now()}`,
    messagesSent: 0,
    xpEarned: 0,
  })

  const handleDiscover = async () => {
    console.log("[v0] Discover clicked - mood:", mood, "mode:", mode)

    setIsDiscovering(true)
    setError(null)

    try {
      const response = await fetch("/api/recommendations/sage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, mood, limit: 5 }),
      })

      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }

      const result: RecommendationResult = await response.json()
      setRecommendations(result)

      // Auto-select primary
      if (Array.isArray(result.primary)) {
        setSelectedSageId(result.primary[0].id)
        onSageSelected?.(result.primary)
      } else {
        setSelectedSageId(result.primary.id)
        onSageSelected?.(result.primary)
      }

      // Award XP for discovery
      await fetch("/api/session/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionStats.sessionId,
          xpDelta: mode === "single" ? 25 : mode === "circle" ? 50 : mode === "duel" ? 40 : 75,
        }),
      })

      // Update local stats
      setSessionStats((prev) => ({
        ...prev,
        xpEarned: prev.xpEarned + (mode === "single" ? 25 : mode === "circle" ? 50 : mode === "duel" ? 40 : 75),
      }))
    } catch (err) {
      console.error("[v0] Discover error:", err)
      setError("Failed to discover sage. Please try again.")
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleSelectSage = (sage: SageSummary) => {
    console.log("[v0] Sage selected:", sage.name)
    setSelectedSageId(sage.id)
    onSageSelected?.(sage)
  }

  const getPrimary = (): SageSummary | null => {
    if (!recommendations) return null
    if (Array.isArray(recommendations.primary)) {
      return recommendations.primary.find((s) => s.id === selectedSageId) || recommendations.primary[0]
    }
    return recommendations.primary
  }

  const getMembers = (): SageSummary[] => {
    if (!recommendations || !Array.isArray(recommendations.primary)) return []
    return recommendations.primary
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <SageSearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Mode Selector */}
      <ModeSelector selectedMode={mode} onSelectMode={setMode} />

      {/* Hologram Preview */}
      <HologramPreview mode={mode} primary={getPrimary()} members={getMembers()} isDiscovering={isDiscovering} />

      {/* Mood Selector */}
      <MoodSelector selectedMood={mood} onSelectMood={setMood} />

      {/* Discover Button */}
      <DiscoverButton disabled={false} loading={isDiscovering} onClick={handleDiscover} mood={mood} />

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {/* Perfect Matches */}
      {recommendations && (
        <PerfectMatchesList result={recommendations} selectedSageId={selectedSageId} onSelect={handleSelectSage} />
      )}

      {/* Browse Multiverse */}
      <BrowseMultiverseButton onSelect={handleSelectSage} />

      {/* Session Stats */}
      <SessionStats stats={sessionStats} />
    </div>
  )
}
