"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  HomeIcon,
  EyeIcon,
  BrainIcon,
  SparklesIcon,
  UsersIcon,
  ScaleIcon,
  ZapIcon,
  TrendingUpIcon,
  ActivityIcon,
  AwardIcon,
  ClockIcon,
  BookmarkIcon,
  XIcon,
} from "@/components/icons"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"

interface SavedCircle {
  id: string
  name: string
  sages: string[]
  lastUsed: string
  uses: number
}

export default function CouncilPage() {
  const [query, setQuery] = useState("")
  const [deliberation, setDeliberation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedSages, setSelectedSages] = useState<string[]>([])
  const [savedCircles, setSavedCircles] = useState<SavedCircle[]>([])
  const [suggestedSages, setSuggestedSages] = useState<string[]>([])
  const [showSavedCircles, setShowSavedCircles] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newCircleName, setNewCircleName] = useState("")
  const [sessionStats, setSessionStats] = useState({
    totalDeliberations: 127,
    consensusRate: 94,
    avgResponseTime: 3.2,
    xpEarned: 2480,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSages, setFilteredSages] = useState(SAGE_TEMPLATES)
  const [showSearchModal, setShowSearchModal] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const prefillQuery = searchParams.get("query")
    if (prefillQuery) {
      setQuery(prefillQuery)
    }
  }, [searchParams])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("sageCircles")
    if (stored) {
      setSavedCircles(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (query.trim().length > 10) {
      const queryLower = query.toLowerCase()
      const suggestions = availableSages
        .filter((sage) => sage.keywords.some((keyword) => queryLower.includes(keyword)))
        .map((sage) => sage.id)

      if (suggestions.length > 0 && suggestions.length < 6) {
        setSuggestedSages(suggestions)
      } else {
        setSuggestedSages([])
      }
    } else {
      setSuggestedSages([])
    }
  }, [query])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const results = SAGE_TEMPLATES.filter(
        (sage) =>
          sage.name.toLowerCase().includes(query) ||
          sage.domain.toLowerCase().includes(query) ||
          sage.role.toLowerCase().includes(query) ||
          sage.capabilities.some((cap) => cap.toLowerCase().includes(query)),
      )

      setFilteredSages(results.slice(0, 12)) // Show top 12 results
    } else {
      setFilteredSages(SAGE_TEMPLATES)
    }
  }, [searchQuery])

  const availableSages = [
    {
      id: "1",
      name: "Dr. Wellness",
      avatar: "🏥",
      domain: "Health",
      role: "Wellness & Lifestyle",
      keywords: ["health", "wellness", "fitness", "diet", "exercise", "mental health", "stress"],
    },
    {
      id: "2",
      name: "Prof. Knowledge",
      avatar: "📚",
      domain: "Education",
      role: "Learning & Research",
      keywords: ["learn", "study", "education", "research", "skills", "knowledge", "teach"],
    },
    {
      id: "3",
      name: "Creative Muse",
      avatar: "🎨",
      domain: "Creative",
      role: "Art & Innovation",
      keywords: ["creative", "art", "design", "innovation", "ideas", "brainstorm", "writing"],
    },
    {
      id: "4",
      name: "Strategy Sage",
      avatar: "💼",
      domain: "Business",
      role: "Planning & Growth",
      keywords: ["business", "strategy", "planning", "career", "finance", "growth", "productivity"],
    },
    {
      id: "5",
      name: "Dr. Neural",
      avatar: "🧠",
      domain: "Science",
      role: "Neuroscience & AI",
      keywords: ["science", "research", "technology", "ai", "brain", "cognitive", "analysis"],
    },
    {
      id: "6",
      name: "Code Architect",
      avatar: "💻",
      domain: "Technology",
      role: "Software & Systems",
      keywords: ["code", "programming", "software", "tech", "development", "app", "system"],
    },
  ]

  const toggleSage = (id: string) => {
    setSelectedSages((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const applySuggestions = () => {
    setSelectedSages(suggestedSages)
  }

  const saveCurrentCircle = () => {
    if (!newCircleName.trim() || selectedSages.length === 0) return

    const newCircle: SavedCircle = {
      id: Date.now().toString(),
      name: newCircleName,
      sages: selectedSages,
      lastUsed: new Date().toISOString(),
      uses: 1,
    }

    const updated = [newCircle, ...savedCircles]
    setSavedCircles(updated)
    localStorage.setItem("sageCircles", JSON.stringify(updated))
    setNewCircleName("")
    setShowSaveModal(false)
  }

  const loadSavedCircle = (circle: SavedCircle) => {
    setSelectedSages(circle.sages)

    // Update usage stats
    const updated = savedCircles.map((c) =>
      c.id === circle.id ? { ...c, lastUsed: new Date().toISOString(), uses: c.uses + 1 } : c,
    )
    setSavedCircles(updated)
    localStorage.setItem("sageCircles", JSON.stringify(updated))
    setShowSavedCircles(false)
  }

  const deleteSavedCircle = (id: string) => {
    const updated = savedCircles.filter((c) => c.id !== id)
    setSavedCircles(updated)
    localStorage.setItem("sageCircles", JSON.stringify(updated))
  }

  const startDeliberation = async () => {
    if (!query.trim()) return
    setLoading(true)

    try {
      const response = await fetch("/api/council/deliberate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          selectedSages: selectedSages.length > 0 ? selectedSages : availableSages.map((s) => s.id),
        }),
      })
      const data = await response.json()

      const mockPerspectives = availableSages
        .filter((s) => selectedSages.length === 0 || selectedSages.includes(s.id))
        .map((sage) => ({
          sage: sage.name,
          avatar: sage.avatar,
          perspective: generateMockPerspective(sage, query),
          confidence: Math.floor(Math.random() * 20 + 80),
          vote: Math.random() > 0.3 ? "agree" : "consider",
        }))

      setDeliberation({
        ...data,
        perspectives: mockPerspectives,
        consensus: generateConsensus(mockPerspectives),
        xpGained: 50,
      })

      setSessionStats((prev) => ({
        ...prev,
        totalDeliberations: prev.totalDeliberations + 1,
        xpEarned: prev.xpEarned + 50,
      }))
    } catch (error) {
      console.error("Deliberation error:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockPerspective = (sage: { id: string; name: string; personality?: string }, query: string) => {
    const perspectives = {
      "Dr. Wellness": `From a wellness perspective, this is about balance and sustainable habits. I'd recommend starting small and building momentum over time.`,
      "Prof. Knowledge": `Based on research and evidence, this approach has shown positive outcomes. The key is applying proven methodologies consistently.`,
      "Creative Muse": `I see creative opportunities here! Think outside the box - there might be unconventional solutions that spark innovation.`,
      "Strategy Sage": `Strategically speaking, we need to consider ROI and long-term goals. Let's break this down into actionable milestones.`,
      "Dr. Neural": `Cognitively, this engages several mental processes. Understanding the underlying patterns can help optimize your approach.`,
      "Code Architect": `From a systems perspective, we need scalable solutions. Let's architect this properly with flexibility in mind.`,
    }
    return (
      perspectives[sage.name as keyof typeof perspectives] ||
      "This is an interesting challenge that requires thoughtful consideration."
    )
  }

  const generateConsensus = (perspectives: any[]) => {
    const agreeCount = perspectives.filter((p) => p.vote === "agree").length
    const total = perspectives.length
    const percentage = Math.floor((agreeCount / total) * 100)

    return `${percentage}% consensus reached: The Sage Circle recommends moving forward with a balanced approach that combines insights from ${total} different perspectives. Each sage brings unique expertise to help you make the best decision.`
  }

  const displayedSages =
    selectedSages.length > 0
      ? SAGE_TEMPLATES.filter((sage) => selectedSages.includes(sage.id)).slice(0, 12)
      : availableSages

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Interactive gradient orb */}
      <div
        className="fixed pointer-events-none opacity-30 blur-3xl z-0"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 100%)",
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Animated stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/playground">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Hub
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Sage Circle
                </h1>
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <UsersIcon className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-medium text-white">
                    {sessionStats.totalDeliberations} Deliberations
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <ScaleIcon className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-medium text-white">{sessionStats.consensusRate}% Consensus</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                  <AwardIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-white">{sessionStats.xpEarned} XP Earned</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/playground">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                    <SparklesIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/observatory">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-purple-400">
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/memory">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-pink-400">
                    <BrainIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero section */}
            <div className="mb-8 text-center animate-fade-in">
              <h2
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x"
                style={{ backgroundSize: "300% 300%" }}
              >
                Collective Wisdom, Better Decisions
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Get diverse perspectives from multiple AI sages to make informed decisions
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-purple-500/30 p-4 rounded-2xl animate-float">
                <div className="flex items-center justify-between mb-2">
                  <UsersIcon className="w-6 h-6 text-purple-400" />
                  <TrendingUpIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{sessionStats.totalDeliberations}</div>
                <div className="text-xs text-purple-300">Total Deliberations</div>
              </Card>

              <Card
                className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-500/30 p-4 rounded-2xl animate-float"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <ScaleIcon className="w-6 h-6 text-emerald-400" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{sessionStats.consensusRate}%</div>
                <div className="text-xs text-emerald-300">Consensus Rate</div>
              </Card>

              <Card
                className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border-2 border-cyan-500/30 p-4 rounded-2xl animate-float"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <ZapIcon className="w-6 h-6 text-cyan-400" />
                  <ActivityIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{sessionStats.avgResponseTime}s</div>
                <div className="text-xs text-cyan-300">Avg Response Time</div>
              </Card>

              <Card
                className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border-2 border-orange-500/20 p-4 rounded-2xl animate-float"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <AwardIcon className="w-6 h-6 text-orange-400" />
                  <SparklesIcon className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{sessionStats.xpEarned}</div>
                <div className="text-xs text-orange-300">XP Earned</div>
              </Card>
            </div>

            {savedCircles.length > 0 && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-cyan-500/20 p-4 rounded-2xl mb-6 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-cyan-400" />
                    Recent Sage Circles
                  </h3>
                  <Button
                    onClick={() => setShowSavedCircles(!showSavedCircles)}
                    variant="ghost"
                    size="sm"
                    className="text-cyan-400 hover:text-cyan-300 text-xs"
                  >
                    {showSavedCircles ? "Hide" : "View All"}
                  </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {savedCircles.slice(0, 4).map((circle) => (
                    <button
                      key={circle.id}
                      onClick={() => loadSavedCircle(circle)}
                      className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-500/30 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="text-xs font-medium text-white whitespace-nowrap">{circle.name}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {circle.sages.length} sages • {circle.uses} uses
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Sage selection */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 p-6 rounded-3xl mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-purple-400" />
                  Select Your Sage Circle
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowSearchModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-white"
                  >
                    🔍 Search Sages
                  </Button>
                  {selectedSages.length > 0 && (
                    <Button
                      onClick={() => setShowSaveModal(true)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-500/30 text-white"
                    >
                      <BookmarkIcon className="w-4 h-4 mr-2" />
                      Save Circle
                    </Button>
                  )}
                </div>
              </div>

              {suggestedSages.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl animate-slide-down">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-100">AI Suggestion</span>
                      </div>
                      <p className="text-sm text-yellow-100/90 mb-2">
                        Based on your question, these sages might be most helpful:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableSages
                          .filter((s) => suggestedSages.includes(s.id))
                          .map((sage) => (
                            <span
                              key={sage.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-100"
                            >
                              {sage.avatar} {sage.name}
                            </span>
                          ))}
                      </div>
                    </div>
                    <Button
                      onClick={applySuggestions}
                      size="sm"
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-400 mb-4">
                Choose which sages to consult, or leave blank to get input from all perspectives
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {displayedSages.map((sage) => (
                  <button
                    key={sage.id}
                    onClick={() => toggleSage(sage.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedSages.includes(sage.id) || selectedSages.length === 0
                        ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-purple-500/50"
                        : "bg-slate-800/50 border-slate-700 opacity-50"
                    }`}
                  >
                    <div className="text-4xl mb-2">{sage.avatar}</div>
                    <div className="text-sm font-medium text-white">{sage.name.split(" ")[1] || sage.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{sage.role}</div>
                  </button>
                ))}
              </div>
              {selectedSages.length > 0 && (
                <div className="mt-4 flex items-center justify-between px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <span className="text-sm text-purple-300">
                    {selectedSages.length} sage{selectedSages.length > 1 ? "s" : ""} selected
                  </span>
                  <Button
                    onClick={() => setSelectedSages([])}
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </Card>

            {/* Query input */}
            <Card
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-cyan-500/20 p-6 rounded-3xl mb-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
                What Decision Do You Need Help With?
              </h3>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: I'm thinking about starting a fitness routine but I'm not sure where to begin. I want something sustainable that fits my busy schedule..."
                className="bg-slate-800/50 border-slate-700 text-white min-h-[120px] mb-4 rounded-xl resize-none focus:border-cyan-500/50 transition-colors"
              />
              <div className="flex gap-3">
                <Button
                  onClick={startDeliberation}
                  disabled={loading || !query.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-6 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Circle is Deliberating...
                    </>
                  ) : (
                    <>
                      <UsersIcon className="w-5 h-5 mr-2" />
                      Consult the Sage Circle
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-400">Try asking about:</span>
                {[
                  "Career decisions",
                  "Health goals",
                  "Learning strategies",
                  "Creative projects",
                  "Business planning",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setQuery(`Help me with ${example.toLowerCase()}`)}
                    className="text-xs px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 rounded-full border border-slate-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </Card>

            {/* Deliberation results */}
            {deliberation && (
              <div className="space-y-6 animate-fade-in">
                {/* Consensus summary */}
                <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-500/30 p-8 rounded-3xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl">
                      <ScaleIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">Circle Consensus</h3>
                      <p className="text-emerald-100 text-lg leading-relaxed">{deliberation.consensus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-emerald-500/30">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-lg">
                      <AwardIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-white">+{deliberation.xpGained} XP</span>
                    </div>
                    <span className="text-sm text-emerald-300">
                      Great question! You're leveling up your decision-making skills.
                    </span>
                  </div>
                </Card>

                {/* Individual perspectives */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    Individual Sage Perspectives
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {deliberation.perspectives?.map(
                      (
                        perspective: {
                          sage: string
                          avatar: string
                          perspective: string
                          confidence: number
                          vote: string
                        },
                        i: number,
                      ) => (
                        <Card
                          key={i}
                          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 p-6 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02] animate-slide-up"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-5xl">{perspective.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-white">{perspective.sage}</h4>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-slate-400">{perspective.confidence}% confident</div>
                                  <div
                                    className={`w-2 h-2 rounded-full ${perspective.vote === "agree" ? "bg-emerald-400" : "bg-yellow-400"}`}
                                  />
                                </div>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed">{perspective.perspective}</p>
                              <div className="mt-3 flex items-center gap-2">
                                <span
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    perspective.vote === "agree"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                  }`}
                                >
                                  {perspective.vote === "agree" ? "✓ Recommends" : "⚠ Consider"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ),
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">What would you like to do next?</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        setDeliberation(null)
                        setQuery("")
                      }}
                      className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-500/30 text-white"
                    >
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      New Deliberation
                    </Button>
                    <Link href="/playground" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-white">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Chat One-on-One
                      </Button>
                    </Link>
                    <Link href="/memory" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-white">
                        <BrainIcon className="w-4 h-4 mr-2" />
                        Save to Memory
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}

            {/* Pro tips */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl backdrop-blur animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Pro Tips for Better Deliberations</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex gap-2">
                  <span>🎯</span>
                  <span className="text-slate-300">
                    Be specific about your situation - more context leads to better insights
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>🤝</span>
                  <span className="text-slate-300">Select sages from different domains for diverse perspectives</span>
                </div>
                <div className="flex gap-2">
                  <span>💡</span>
                  <span className="text-slate-300">
                    Use deliberations for complex decisions that benefit from multiple viewpoints
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showSavedCircles && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 p-6 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookmarkIcon className="w-6 h-6 text-purple-400" />
                Saved Sage Circles
              </h2>
              <Button
                onClick={() => setShowSavedCircles(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {savedCircles.map((circle) => (
                <div
                  key={circle.id}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{circle.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {availableSages
                          .filter((s) => circle.sages.includes(s.id))
                          .map((sage) => (
                            <span key={sage.id} className="text-lg">
                              {sage.avatar}
                            </span>
                          ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {new Date(circle.lastUsed).toLocaleDateString()}
                        </span>
                        <span>{circle.uses} uses</span>
                        <span>{circle.sages.length} sages</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadSavedCircle(circle)}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                      >
                        Load
                      </Button>
                      <Button
                        onClick={() => deleteSavedCircle(circle.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {savedCircles.length === 0 && (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No saved circles yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Select sages and click "Save Circle" to save your favorite combinations
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 p-6 rounded-3xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookmarkIcon className="w-6 h-6 text-purple-400" />
                Save Sage Circle
              </h2>
              <Button
                onClick={() => setShowSaveModal(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Circle Name</label>
                <input
                  type="text"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  placeholder="e.g., Health & Wellness Team"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Selected Sages ({selectedSages.length})</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 border border-slate-700 rounded-xl">
                  {availableSages
                    .filter((s) => selectedSages.includes(s.id))
                    .map((sage) => (
                      <span
                        key={sage.id}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-white"
                      >
                        {sage.avatar} {sage.name}
                      </span>
                    ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowSaveModal(false)} variant="ghost" className="flex-1 text-slate-300">
                  Cancel
                </Button>
                <Button
                  onClick={saveCurrentCircle}
                  disabled={!newCircleName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white disabled:opacity-50"
                >
                  <BookmarkIcon className="w-4 h-4 mr-2" />
                  Save Circle
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 p-6 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-purple-400" />
                Browse All Sages
              </h2>
              <Button
                onClick={() => {
                  setShowSearchModal(false)
                  setSearchQuery("")
                }}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* Search input */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, domain, or expertise... (e.g., health, coding, writing)"
                  className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                  autoFocus
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Searching across 300 specialized AI sages • {filteredSages.length} results
              </p>
            </div>

            {/* Search results */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-2">
                {filteredSages.map((sage) => (
                  <button
                    key={sage.id}
                    onClick={() => {
                      toggleSage(sage.id)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-left ${
                      selectedSages.includes(sage.id)
                        ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-purple-500/50"
                        : "bg-slate-800/50 border-slate-700 hover:border-purple-500/30"
                    }`}
                  >
                    <div className="text-3xl mb-2">{sage.avatar}</div>
                    <div className="text-sm font-medium text-white truncate">{sage.name}</div>
                    <div className="text-xs text-slate-400 mt-1 truncate">{sage.role}</div>
                    <div className="text-xs text-purple-400 mt-1">{sage.domain}</div>
                  </button>
                ))}
              </div>

              {filteredSages.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No sages found matching "{searchQuery}"</p>
                  <p className="text-sm text-slate-500 mt-2">Try different keywords or browse by domain</p>
                </div>
              )}
            </div>

            {/* Selected count footer */}
            {selectedSages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <span className="text-sm text-purple-300">
                  {selectedSages.length} sage{selectedSages.length > 1 ? "s" : ""} selected
                </span>
                <Button
                  onClick={() => {
                    setShowSearchModal(false)
                    setSearchQuery("")
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                >
                  Done
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
