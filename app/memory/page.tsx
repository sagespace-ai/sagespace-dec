"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XIcon, SearchIcon, EyeOffIcon, TrashIcon } from "@/components/icons"
import {
  HomeIcon,
  EyeIcon,
  ScaleIcon,
  SparklesIcon,
  TrendingUpIcon,
  ClockIcon,
  BookmarkIcon,
  CalendarIcon,
} from "@/components/icons"

export default function MemoryPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedView, setSelectedView] = useState<"moods" | "sages" | "timeline" | "insights">("moods")
  const [selectedMemory, setSelectedMemory] = useState<any>(null)
  const [showMemoryDetail, setShowMemoryDetail] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showMoodPlaylist, setShowMoodPlaylist] = useState(false)
  const [showMontage, setShowMontage] = useState(false)
  const [montageMemories, setMontageMemories] = useState<any[]>([])
  const [currentMontageIndex, setCurrentMontageIndex] = useState(0)
  const [isPlayingMontage, setIsPlayingMontage] = useState(false)
  const [montageSearch, setMontageSearch] = useState("")
  const [hiddenMemories, setHiddenMemories] = useState<Set<number>>(new Set())

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (isPlayingMontage && showMontage) {
      const timer = setTimeout(() => {
        if (currentMontageIndex < montageMemories.length - 1) {
          setCurrentMontageIndex((prev) => prev + 1)
        } else {
          setIsPlayingMontage(false)
        }
      }, 5000) // 5 seconds per memory
      return () => clearTimeout(timer)
    }
  }, [isPlayingMontage, currentMontageIndex, montageMemories.length, showMontage])

  const memoryMoods = [
    {
      id: "growth",
      name: "Personal Growth",
      icon: "🌱",
      color: "from-emerald-500/30 to-teal-500/30",
      borderColor: "border-emerald-500/50",
      count: 24,
      lastActive: "2 hours ago",
      topSages: ["Dr. Neural", "Prof. Knowledge"],
      preview: "Breakthrough moments and learning discoveries",
    },
    {
      id: "creative",
      name: "Creative Sparks",
      icon: "✨",
      color: "from-pink-500/30 to-purple-500/30",
      borderColor: "border-pink-500/50",
      count: 18,
      lastActive: "1 day ago",
      topSages: ["Creative Muse", "Design Guru"],
      preview: "Ideas, inspiration, and artistic exploration",
    },
    {
      id: "wellness",
      name: "Wellness Journey",
      icon: "💪",
      color: "from-orange-500/30 to-red-500/30",
      borderColor: "border-orange-500/50",
      count: 31,
      lastActive: "4 hours ago",
      topSages: ["Dr. Wellness", "Fitness Coach"],
      preview: "Health tips, fitness goals, and mindful moments",
    },
    {
      id: "productivity",
      name: "Productivity Wins",
      icon: "🎯",
      color: "from-cyan-500/30 to-blue-500/30",
      borderColor: "border-cyan-500/50",
      count: 42,
      lastActive: "30 minutes ago",
      topSages: ["Strategy Sage", "Time Master"],
      preview: "Goal setting, planning, and achievement unlocked",
    },
    {
      id: "curious",
      name: "Curious Minds",
      icon: "🔍",
      color: "from-violet-500/30 to-indigo-500/30",
      borderColor: "border-violet-500/50",
      count: 27,
      lastActive: "1 day ago",
      topSages: ["Science Sage", "History Buff"],
      preview: "Questions answered and mysteries explored",
    },
    {
      id: "support",
      name: "Emotional Support",
      icon: "💝",
      color: "from-rose-500/30 to-pink-500/30",
      borderColor: "border-rose-500/50",
      count: 15,
      lastActive: "5 hours ago",
      topSages: ["Empathy Guide", "Life Coach"],
      preview: "Comfort, encouragement, and heartfelt chats",
    },
  ]

  const memoriesByMood: Record<string, any[]> = {
    growth: [
      {
        id: 1,
        title: "Discovered my leadership style",
        sage: "Strategy Sage",
        avatar: "💼",
        date: "1 week ago",
        snippet: "Realized I lead best by empowering others rather than directing...",
        emotion: "💡",
        xpEarned: 150,
        mood: "empowered",
      },
      {
        id: 2,
        title: "Learned to embrace failure",
        sage: "Life Coach",
        avatar: "🎯",
        date: "2 weeks ago",
        snippet: "Every setback is a setup for a comeback. This changed my mindset...",
        emotion: "🌟",
        xpEarned: 180,
        mood: "inspired",
      },
      {
        id: 3,
        title: "Built better habits",
        sage: "Productivity Pro",
        avatar: "⚡",
        date: "3 days ago",
        snippet: "Starting small with 2-minute habits is the key to lasting change",
        emotion: "🔥",
        xpEarned: 120,
        mood: "motivated",
      },
    ],
    creative: [
      {
        id: 4,
        title: "Found my art style",
        sage: "Creative Muse",
        avatar: "🎨",
        date: "5 days ago",
        snippet: "Experimented with digital painting and discovered my unique voice",
        emotion: "✨",
        xpEarned: 200,
        mood: "inspired",
      },
      {
        id: 5,
        title: "Wrote my first song",
        sage: "Music Mentor",
        avatar: "🎵",
        date: "1 week ago",
        snippet: "Overcame creative block and composed something I'm proud of",
        emotion: "🎶",
        xpEarned: 220,
        mood: "joyful",
      },
    ],
    wellness: [
      {
        id: 6,
        title: "Morning meditation breakthrough",
        sage: "Dr. Wellness",
        avatar: "🧘",
        date: "1 day ago",
        snippet: "Finally experienced true mental clarity during meditation",
        emotion: "☮️",
        xpEarned: 100,
        mood: "peaceful",
      },
      {
        id: 7,
        title: "Hit my fitness goal",
        sage: "Fitness Coach",
        avatar: "💪",
        date: "3 days ago",
        snippet: "Ran 5K without stopping for the first time!",
        emotion: "🏆",
        xpEarned: 250,
        mood: "accomplished",
      },
    ],
    productivity: [
      {
        id: 8,
        title: "Master my calendar",
        sage: "Time Master",
        avatar: "⏰",
        date: "2 days ago",
        snippet: "Time blocking changed how I approach each day",
        emotion: "📅",
        xpEarned: 130,
        mood: "organized",
      },
    ],
    curious: [
      {
        id: 9,
        title: "Mind blown by quantum physics",
        sage: "Science Sage",
        avatar: "🔬",
        date: "4 days ago",
        snippet: "Understanding wave-particle duality opened my mind to new possibilities",
        emotion: "🤯",
        xpEarned: 180,
        mood: "fascinated",
      },
    ],
    support: [
      {
        id: 10,
        title: "Processing a difficult conversation",
        sage: "Empathy Guide",
        avatar: "💝",
        date: "6 hours ago",
        snippet: "Learned how to set boundaries while staying compassionate",
        emotion: "🤗",
        xpEarned: 110,
        mood: "supported",
      },
    ],
  }

  const pinnedMemories = [
    {
      id: 1,
      title: "The day I figured out my career path",
      sage: "Strategy Sage",
      avatar: "💼",
      date: "2 weeks ago",
      snippet: "We talked about aligning passion with skills, and it clicked...",
      emotion: "🎯",
      xpEarned: 150,
    },
    {
      id: 2,
      title: "Breakthrough meditation technique",
      sage: "Dr. Wellness",
      avatar: "🧘",
      date: "1 week ago",
      snippet: "Finally learned how to quiet my mind. Life-changing.",
      emotion: "🧠",
      xpEarned: 120,
    },
    {
      id: 3,
      title: "Creative project that got me excited",
      sage: "Creative Muse",
      avatar: "🎨",
      date: "3 days ago",
      snippet: "Explored a new art style I never would have tried before",
      emotion: "✨",
      xpEarned: 200,
    },
  ]

  const memoriesBySage = {
    "Dr. Wellness": {
      avatar: "🧘",
      role: "Health & Mindfulness",
      totalChats: 42,
      totalXP: 3200,
      memories: [
        {
          id: 6,
          title: "Morning meditation breakthrough",
          date: "1 day ago",
          snippet: "Finally experienced true mental clarity during meditation",
          emotion: "☮️",
          xpEarned: 100,
          mood: "peaceful",
        },
        {
          id: 7,
          title: "Hit my fitness goal",
          date: "3 days ago",
          snippet: "Ran 5K without stopping for the first time!",
          emotion: "🏆",
          xpEarned: 250,
          mood: "accomplished",
        },
        {
          id: 11,
          title: "Better sleep habits",
          date: "1 week ago",
          snippet: "Learned how to wind down properly before bed",
          emotion: "😴",
          xpEarned: 120,
          mood: "rested",
        },
      ],
    },
    "Strategy Sage": {
      avatar: "💼",
      role: "Career & Goals",
      totalChats: 38,
      totalXP: 2850,
      memories: [
        {
          id: 1,
          title: "Discovered my leadership style",
          date: "1 week ago",
          snippet: "Realized I lead best by empowering others rather than directing...",
          emotion: "💡",
          xpEarned: 150,
          mood: "empowered",
        },
        {
          id: 8,
          title: "Master my calendar",
          date: "2 days ago",
          snippet: "Time blocking changed how I approach each day",
          emotion: "📅",
          xpEarned: 130,
          mood: "organized",
        },
      ],
    },
    "Creative Muse": {
      avatar: "🎨",
      role: "Arts & Creativity",
      totalChats: 31,
      totalXP: 2400,
      memories: [
        {
          id: 4,
          title: "Found my art style",
          date: "5 days ago",
          snippet: "Experimented with digital painting and discovered my unique voice",
          emotion: "✨",
          xpEarned: 200,
          mood: "inspired",
        },
        {
          id: 5,
          title: "Wrote my first song",
          date: "1 week ago",
          snippet: "Overcame creative block and composed something I'm proud of",
          emotion: "🎶",
          xpEarned: 220,
          mood: "joyful",
        },
      ],
    },
    "Life Coach": {
      avatar: "🎯",
      role: "Personal Development",
      totalChats: 28,
      totalXP: 2100,
      memories: [
        {
          id: 2,
          title: "Learned to embrace failure",
          date: "2 weeks ago",
          snippet: "Every setback is a setup for a comeback. This changed my mindset...",
          emotion: "🌟",
          xpEarned: 180,
          mood: "inspired",
        },
      ],
    },
    "Code Architect": {
      avatar: "💻",
      role: "Software Development",
      totalChats: 24,
      totalXP: 1950,
      memories: [
        {
          id: 12,
          title: "Coding problem solved",
          date: "5 hours ago",
          snippet: "Finally debugged that tricky issue with React state",
          emotion: "🎉",
          xpEarned: 100,
          mood: "accomplished",
        },
      ],
    },
    "Science Sage": {
      avatar: "🔬",
      role: "Science & Discovery",
      totalChats: 19,
      totalXP: 1600,
      memories: [
        {
          id: 9,
          title: "Mind blown by quantum physics",
          date: "4 days ago",
          snippet: "Understanding wave-particle duality opened my mind to new possibilities",
          emotion: "🤯",
          xpEarned: 180,
          mood: "fascinated",
        },
      ],
    },
  }

  const recentMemories = [
    {
      id: 1,
      title: "Morning motivation chat",
      sage: "Life Coach",
      avatar: "💪",
      time: "2 hours ago",
      mood: "energized",
      snippet: "Started the day with goal-setting and positive affirmations",
      xp: 50,
    },
    {
      id: 2,
      title: "Coding problem solved",
      sage: "Code Architect",
      avatar: "💻",
      time: "5 hours ago",
      mood: "accomplished",
      snippet: "Finally debugged that tricky issue with React state",
      xp: 100,
    },
    {
      id: 3,
      title: "Healthy recipe ideas",
      sage: "Nutrition Expert",
      avatar: "🥗",
      time: "1 day ago",
      mood: "inspired",
      snippet: "Got amazing meal prep ideas for next week",
      xp: 75,
    },
    {
      id: 4,
      title: "Book recommendations",
      sage: "Prof. Knowledge",
      avatar: "📚",
      time: "2 days ago",
      mood: "curious",
      snippet: "Discovered 5 must-read books on psychology",
      xp: 80,
    },
  ]

  const stats = {
    totalConversations: 142,
    totalXP: 8750,
    longestStreak: 14,
    favoriteTime: "Morning",
    mostActiveDay: "Tuesday",
    totalSagesInteracted: 28,
  }

  const handlePlayAll = () => {
    if (selectedMood && memoriesByMood[selectedMood]) {
      const memories = memoriesByMood[selectedMood].filter((m) => !hiddenMemories.has(m.id))
      setMontageMemories(memories)
      setCurrentMontageIndex(0)
      setShowMontage(true)
      setIsPlayingMontage(true)
      setShowMoodPlaylist(false)
    }
  }

  const handleShuffle = () => {
    if (selectedMood && memoriesByMood[selectedMood]) {
      const memories = memoriesByMood[selectedMood].filter((m) => !hiddenMemories.has(m.id))
      const shuffled = [...memories].sort(() => Math.random() - 0.5)
      setMontageMemories(shuffled)
      setCurrentMontageIndex(0)
      setShowMontage(true)
      setIsPlayingMontage(true)
      setShowMoodPlaylist(false)
    }
  }

  const handleHideMemory = (memoryId: number) => {
    setHiddenMemories((prev) => new Set([...prev, memoryId]))
  }

  const handleDeleteMemory = (memoryId: number) => {
    setHiddenMemories((prev) => new Set([...prev, memoryId]))
  }

  const getFilteredMemories = () => {
    if (!selectedMood || !memoriesByMood[selectedMood]) return []

    const memories = memoriesByMood[selectedMood].filter((m) => !hiddenMemories.has(m.id))

    if (!montageSearch) return memories

    const search = montageSearch.toLowerCase()
    return memories.filter(
      (m) =>
        m.title.toLowerCase().includes(search) ||
        m.sage.toLowerCase().includes(search) ||
        m.snippet.toLowerCase().includes(search),
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <div
        className="fixed pointer-events-none opacity-30 blur-3xl z-0"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.2) 50%, transparent 100%)",
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

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

      {showMontage && montageMemories.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl">
          {/* Montage Controls */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    setShowMontage(false)
                    setIsPlayingMontage(false)
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-cyan-400"
                >
                  <XIcon className="w-5 h-5" />
                </Button>
                <div className="text-white">
                  <div className="text-sm text-slate-400">Memory Montage</div>
                  <div className="font-bold">
                    {currentMontageIndex + 1} of {montageMemories.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsPlayingMontage(!isPlayingMontage)}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isPlayingMontage ? "⏸️ Pause" : "▶️ Play"}
                </Button>
                <Button
                  onClick={() => setCurrentMontageIndex(Math.max(0, currentMontageIndex - 1))}
                  disabled={currentMontageIndex === 0}
                  size="sm"
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                >
                  ⏮️ Prev
                </Button>
                <Button
                  onClick={() => setCurrentMontageIndex(Math.min(montageMemories.length - 1, currentMontageIndex + 1))}
                  disabled={currentMontageIndex === montageMemories.length - 1}
                  size="sm"
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                >
                  ⏭️ Next
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="container mx-auto mt-4">
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentMontageIndex + 1) / montageMemories.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Memory Display */}
          <div className="h-full flex items-center justify-center p-20">
            <div className="max-w-5xl w-full animate-fade-in">
              {montageMemories[currentMontageIndex] && (
                <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/30 border-2 border-purple-500/30 rounded-3xl p-12 backdrop-blur-xl">
                  <div className="flex items-start gap-8 mb-8">
                    <div className="text-9xl animate-float">{montageMemories[currentMontageIndex].avatar}</div>
                    <div className="flex-1">
                      <div className="text-sm text-purple-400 mb-2">{montageMemories[currentMontageIndex].date}</div>
                      <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {montageMemories[currentMontageIndex].title}
                      </h2>
                      <p className="text-xl text-slate-300 mb-4">with {montageMemories[currentMontageIndex].sage}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{montageMemories[currentMontageIndex].emotion}</span>
                        <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                          {montageMemories[currentMontageIndex].mood}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-black/30 border border-cyan-500/30 p-8 rounded-2xl mb-6">
                    <p className="text-2xl text-slate-200 leading-relaxed">
                      {montageMemories[currentMontageIndex].snippet}
                    </p>
                  </Card>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">
                          +{montageMemories[currentMontageIndex].xpEarned}
                        </div>
                        <div className="text-sm text-slate-400">XP Earned</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedMemory(montageMemories[currentMontageIndex])
                          setShowMemoryDetail(true)
                          setShowMontage(false)
                          setIsPlayingMontage(false)
                        }}
                        size="sm"
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                      >
                        📖 View Full Details
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="container mx-auto">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                {montageMemories.map((memory, index) => (
                  <button
                    key={memory.id}
                    onClick={() => setCurrentMontageIndex(index)}
                    className={`flex-shrink-0 w-32 p-3 rounded-xl transition-all ${
                      index === currentMontageIndex
                        ? "bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-500 scale-110"
                        : "bg-slate-800/50 border border-slate-700 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="text-3xl mb-1">{memory.avatar}</div>
                    <div className="text-xs text-white font-medium line-clamp-2">{memory.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* <Link href="/demo"> */}
                <Link href="/playground">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-pink-400">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Hub
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Memory Lane
                </h1>
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
                <Link href="/council">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-pink-400">
                    <ScaleIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center animate-fade-in">
            <h2
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x"
              style={{ backgroundSize: "300% 300%" }}
            >
              Your Journey with Sages
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Revisit, reflect, and relive your most meaningful conversations
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-xl border-2 border-pink-500/30 p-4 rounded-2xl hover:scale-105 transition-transform duration-300 animate-float">
                <div className="text-3xl font-bold text-white mb-1">{stats.totalConversations}</div>
                <div className="text-sm text-pink-300">Total Chats</div>
                <div className="text-xs text-pink-200/60 mt-2">Memories created</div>
              </Card>

              <Card
                className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-xl border-2 border-purple-500/30 p-4 rounded-2xl hover:scale-105 transition-transform duration-300 animate-float"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stats.totalXP.toLocaleString()}</div>
                <div className="text-sm text-purple-300">Experience Points</div>
                <div className="text-xs text-purple-200/60 mt-2">Keep chatting!</div>
              </Card>

              <Card
                className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border-2 border-cyan-500/30 p-4 rounded-2xl hover:scale-105 transition-transform duration-300 animate-float"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stats.longestStreak}</div>
                <div className="text-sm text-cyan-300">Day Streak</div>
                <div className="text-xs text-cyan-200/60 mt-2">Personal best! 🔥</div>
              </Card>

              <Card
                className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border-2 border-orange-500/30 p-4 rounded-2xl hover:scale-105 transition-transform duration-300 animate-float"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stats.totalSagesInteracted}</div>
                <div className="text-sm text-orange-300">Sages Met</div>
                <div className="text-xs text-orange-200/60 mt-2">Growing network</div>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <button
                onClick={() => setSelectedView("moods")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedView === "moods"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 scale-105"
                    : "bg-slate-800/50 text-pink-400 border border-pink-500/50 hover:bg-pink-500/10"
                }`}
              >
                🎨 By Mood
              </button>
              <button
                onClick={() => setSelectedView("sages")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedView === "sages"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 scale-105"
                    : "bg-slate-800/50 text-pink-400 border border-pink-500/50 hover:bg-pink-500/10"
                }`}
              >
                🤖 By Sage
              </button>
              <button
                onClick={() => setSelectedView("timeline")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedView === "timeline"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 scale-105"
                    : "bg-slate-800/50 text-pink-400 border border-pink-500/50 hover:bg-pink-500/10"
                }`}
              >
                📅 Timeline
              </button>
              <button
                onClick={() => setSelectedView("insights")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedView === "insights"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 scale-105"
                    : "bg-slate-800/50 text-pink-400 border border-pink-500/50 hover:bg-pink-500/10"
                }`}
              >
                💡 Insights
              </button>
            </div>
          </div>

          {showMemoryDetail && selectedMemory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
              <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-2 border-purple-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-purple-500/30 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl">{selectedMemory.avatar}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{selectedMemory.title}</h3>
                        <p className="text-slate-400">
                          with {selectedMemory.sage} • {selectedMemory.date || selectedMemory.time}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMemoryDetail(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <XIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                    >
                      📌 Pin This Memory
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                    >
                      💬 Continue Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                    >
                      🔗 Share
                    </Button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Conversation Summary */}
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-6 rounded-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-3xl">{selectedMemory.emotion}</div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">What Happened</h4>
                        <p className="text-slate-300 leading-relaxed">{selectedMemory.snippet}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        {selectedMemory.mood || "Meaningful"}
                      </span>
                      <span className="text-purple-400 font-medium">
                        +{selectedMemory.xpEarned || selectedMemory.xp} XP Earned
                      </span>
                    </div>
                  </Card>

                  {/* Key Insights */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-yellow-400" />
                      Key Takeaways
                    </h4>
                    <div className="space-y-3">
                      {[
                        "Discovered a new perspective on handling work-life balance",
                        "Learned practical techniques to implement immediately",
                        "Felt understood and supported through the conversation",
                      ].map((insight, i) => (
                        <Card
                          key={i}
                          className="bg-slate-800/50 border border-purple-500/20 p-4 rounded-xl hover:border-purple-500/40 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <p className="text-slate-300">{insight}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Highlights */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Conversation Highlights</h4>
                    <div className="space-y-4">
                      {/* User Message */}
                      <div className="flex gap-3">
                        <img
                          src="/friendly-person-avatar.png"
                          alt="You"
                          className="w-10 h-10 rounded-full border-2 border-cyan-500"
                        />
                        <Card className="flex-1 bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl rounded-tl-none">
                          <p className="text-sm text-slate-400 mb-1">You</p>
                          <p className="text-white">
                            "I've been struggling to find motivation lately. How do I get back on track?"
                          </p>
                        </Card>
                      </div>

                      {/* Sage Response */}
                      <div className="flex gap-3">
                        <div className="text-4xl">{selectedMemory.avatar}</div>
                        <Card className="flex-1 bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl rounded-tl-none">
                          <p className="text-sm text-slate-400 mb-1">{selectedMemory.sage}</p>
                          <p className="text-white mb-3">
                            "Let's break this down together. Motivation often wavers when we lose sight of our 'why.'
                            What initially excited you about your goals?"
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>⭐ This helped you</span>
                          </div>
                        </Card>
                      </div>

                      {/* User Response */}
                      <div className="flex gap-3">
                        <img
                          src="/friendly-person-avatar.png"
                          alt="You"
                          className="w-10 h-10 rounded-full border-2 border-cyan-500"
                        />
                        <Card className="flex-1 bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl rounded-tl-none">
                          <p className="text-sm text-slate-400 mb-1">You</p>
                          <p className="text-white">
                            "You're right! I wanted to create something meaningful and help others..."
                          </p>
                        </Card>
                      </div>

                      {/* Breakthrough Moment */}
                      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-3xl">✨</div>
                          <div className="font-bold text-white">Breakthrough Moment</div>
                        </div>
                        <p className="text-slate-300 text-sm">
                          "This was when you realized your goals needed to reconnect with your core values."
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Emotional Journey */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Your Emotional Journey</h4>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { emoji: "😔", label: "Started", color: "from-slate-500/20 to-slate-600/20" },
                        { emoji: "🤔", label: "Exploring", color: "from-blue-500/20 to-cyan-500/20" },
                        { emoji: "💡", label: "Insight", color: "from-yellow-500/20 to-orange-500/20" },
                        { emoji: "😊", label: "Hopeful", color: "from-green-500/20 to-emerald-500/20" },
                        { emoji: "🎯", label: "Empowered", color: "from-pink-500/20 to-purple-500/20" },
                      ].map((mood, i) => (
                        <Card
                          key={i}
                          className={`bg-gradient-to-br ${mood.color} border border-white/10 p-3 rounded-xl text-center hover:scale-105 transition-transform`}
                        >
                          <div className="text-3xl mb-2">{mood.emoji}</div>
                          <div className="text-xs text-slate-300">{mood.label}</div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">What You Planned to Do</h4>
                    <div className="space-y-2">
                      {[
                        { task: "Write down 3 core values to guide decisions", completed: true },
                        { task: "Set up daily 10-minute reflection time", completed: true },
                        { task: "Reach out to a mentor for guidance", completed: false },
                      ].map((item, i) => (
                        <Card
                          key={i}
                          className={`border p-4 rounded-xl ${
                            item.completed
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-slate-800/50 border-purple-500/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`text-2xl ${item.completed ? "" : "opacity-50"}`}>
                              {item.completed ? "✅" : "⭕"}
                            </div>
                            <p className={`flex-1 ${item.completed ? "text-emerald-300" : "text-slate-300"}`}>
                              {item.task}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Similar Memories (Like Spotify's "Similar Playlists") */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Similar Memories You Might Like</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { title: "Finding purpose", sage: "Life Coach", emoji: "🎯", mood: "inspired" },
                        { title: "Overcoming doubts", sage: "Confidence Guide", emoji: "💪", mood: "empowered" },
                        { title: "Setting boundaries", sage: "Wellness Expert", emoji: "🛡️", mood: "peaceful" },
                      ].map((memory, i) => (
                        <Card
                          key={i}
                          className="bg-slate-800/50 border border-purple-500/20 p-4 rounded-xl hover:border-cyan-500/50 hover:scale-105 transition-all cursor-pointer group"
                        >
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{memory.emoji}</div>
                          <h5 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                            {memory.title}
                          </h5>
                          <p className="text-xs text-slate-400 mb-2">with {memory.sage}</p>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                            {memory.mood}
                          </span>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Memory Stats */}
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-6 rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-4">Memory Stats</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-400">18</div>
                        <div className="text-xs text-slate-400">Messages exchanged</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-cyan-400">12min</div>
                        <div className="text-xs text-slate-400">Duration</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-400">3</div>
                        <div className="text-xs text-slate-400">Breakthroughs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">5</div>
                        <div className="text-xs text-slate-400">Times revisited</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <BookmarkIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Your Pinned Moments</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {pinnedMemories.map((memory, i) => (
                <Card
                  key={memory.id}
                  onClick={() => {
                    setSelectedMemory(memory)
                    setShowMemoryDetail(true)
                  }}
                  className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform">{memory.avatar}</div>
                    <div className="text-3xl">{memory.emotion}</div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {memory.title}
                  </h4>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{memory.snippet}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{memory.date}</span>
                    <span className="text-yellow-400 font-medium">+{memory.xpEarned} XP</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {selectedView === "moods" && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-6">Explore by Mood & Theme</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoryMoods.map((mood, i) => (
                  <Card
                    key={mood.id}
                    onClick={() => {
                      setSelectedMood(mood.id)
                      setShowMoodPlaylist(true)
                    }}
                    className={`bg-gradient-to-br ${mood.color} backdrop-blur-xl border-2 ${mood.borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group cursor-pointer animate-fade-in`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-6xl group-hover:scale-110 transition-transform">{mood.icon}</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{mood.count}</div>
                        <div className="text-xs text-slate-300">memories</div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{mood.name}</h4>
                    <p className="text-sm text-slate-300 mb-4">{mood.preview}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">Last: {mood.lastActive}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">With:</span>
                      <div className="flex -space-x-2">
                        {mood.topSages.map((sage, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-xs"
                            title={sage}
                          >
                            {sage[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {showMoodPlaylist && selectedMood && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
              <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-2 border-purple-500/30 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20">
                {/* Mood Playlist Header */}
                <div
                  className={`bg-gradient-to-br ${
                    memoryMoods.find((m) => m.id === selectedMood)?.color
                  } border-b border-white/10 p-8`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="text-8xl animate-float">
                        {memoryMoods.find((m) => m.id === selectedMood)?.icon}
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-2">MEMORY COLLECTION</div>
                        <h2 className="text-4xl font-bold text-white mb-3">
                          {memoryMoods.find((m) => m.id === selectedMood)?.name}
                        </h2>
                        <p className="text-lg text-slate-300 mb-4">
                          {memoryMoods.find((m) => m.id === selectedMood)?.preview}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{memoriesByMood[selectedMood]?.length || 0} memories</span>
                          <span>•</span>
                          <span>
                            {memoriesByMood[selectedMood]?.reduce((sum, m) => sum + m.xpEarned, 0) || 0} Total XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowMoodPlaylist(false)
                        setSelectedMood(null)
                      }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <XIcon className="w-8 h-8" />
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-white">
                        {memoryMoods.find((m) => m.id === selectedMood)?.count || 0}
                      </div>
                      <div className="text-xs text-slate-300">Times visited</div>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-white">
                        {memoryMoods.find((m) => m.id === selectedMood)?.topSages.length || 0}
                      </div>
                      <div className="text-xs text-slate-300">Sages involved</div>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-white">
                        {memoryMoods.find((m) => m.id === selectedMood)?.lastActive}
                      </div>
                      <div className="text-xs text-slate-300">Last active</div>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-white">98%</div>
                      <div className="text-xs text-slate-300">Helpful rate</div>
                    </Card>
                  </div>
                </div>

                {/* Memory List - Like Spotify's song list */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-white">All Memories</h3>
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search memories..."
                          value={montageSearch}
                          onChange={(e) => setMontageSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-64"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePlayAll}
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                      >
                        ▶️ Play All
                      </Button>
                      <Button
                        onClick={handleShuffle}
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                      >
                        🔀 Shuffle
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getFilteredMemories().map((memory, index) => (
                      <Card
                        key={memory.id}
                        className="bg-slate-800/30 border border-purple-500/20 p-4 rounded-xl hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-slate-500 font-mono text-sm w-8">{index + 1}</div>
                          <div className="text-4xl group-hover:scale-110 transition-transform">{memory.avatar}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                              {memory.title}
                            </h4>
                            <p className="text-sm text-slate-400">
                              {memory.sage} • {memory.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{memory.emotion}</div>
                            <div className="text-xs text-purple-400">+{memory.xpEarned} XP</div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedMemory(memory)
                                setShowMemoryDetail(true)
                                setShowMoodPlaylist(false)
                              }}
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              ▶️
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleHideMemory(memory.id)
                              }}
                              className="text-slate-400 hover:text-orange-400"
                              title="Hide memory"
                            >
                              <EyeOffIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm("Are you sure you want to delete this memory?")) {
                                  handleDeleteMemory(memory.id)
                                }
                              }}
                              className="text-slate-400 hover:text-red-400"
                              title="Delete memory"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Mood Insights */}
                  <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 p-6 rounded-2xl mt-8">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-yellow-400" />
                      Why This Mood Matters to You
                    </h4>
                    <p className="text-slate-300 mb-4">
                      Your {memoryMoods.find((m) => m.id === selectedMood)?.name.toLowerCase()} conversations show
                      consistent growth patterns. You tend to have breakthroughs when exploring these topics, especially
                      during {stats.favoriteTime.toLowerCase()}.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 border border-cyan-500/30 p-4 rounded-xl">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="text-sm font-bold text-white mb-1">Most Active</div>
                        <div className="text-xs text-slate-400">
                          {memoryMoods.find((m) => m.id === selectedMood)?.topSages[0]}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 border border-purple-500/30 p-4 rounded-xl">
                        <div className="text-2xl mb-2">⏱️</div>
                        <div className="text-sm font-bold text-white mb-1">Avg Duration</div>
                        <div className="text-xs text-slate-400">12-15 minutes</div>
                      </div>
                      <div className="bg-slate-800/50 border border-pink-500/30 p-4 rounded-xl">
                        <div className="text-2xl mb-2">📈</div>
                        <div className="text-sm font-bold text-white mb-1">Growth Rate</div>
                        <div className="text-xs text-slate-400">+24% this month</div>
                      </div>
                    </div>
                  </Card>

                  {/* Similar Moods */}
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-white mb-4">You Might Also Like</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {memoryMoods
                        .filter((m) => m.id !== selectedMood)
                        .slice(0, 3)
                        .map((mood) => (
                          <Card
                            key={mood.id}
                            onClick={() => {
                              setSelectedMood(mood.id)
                              setShowMoodPlaylist(true)
                            }}
                            className={`bg-gradient-to-br ${mood.color} border-2 ${mood.borderColor} p-4 rounded-xl hover:scale-105 transition-transform cursor-pointer group`}
                          >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{mood.icon}</div>
                            <h5 className="font-bold text-white mb-1">{mood.name}</h5>
                            <p className="text-xs text-slate-300 mb-2">{mood.count} memories</p>
                            <p className="text-xs text-slate-400 line-clamp-2">{mood.preview}</p>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === "sages" && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-6">Explore by Sage</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(memoriesBySage).map(([sageName, sageData], i) => (
                  <Card
                    key={sageName}
                    className="bg-gradient-to-br from-slate-900/90 to-purple-900/30 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 hover:border-cyan-500/50 hover:scale-105 transition-all duration-300 group cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-6xl group-hover:scale-110 transition-transform">{sageData.avatar}</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{sageData.totalChats}</div>
                        <div className="text-xs text-slate-300">conversations</div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">{sageName}</h4>
                    <p className="text-sm text-cyan-400 mb-4">{sageData.role}</p>

                    <div className="space-y-2 mb-4">
                      {sageData.memories.slice(0, 2).map((memory) => (
                        <div
                          key={memory.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMemory({ ...memory, sage: sageName, avatar: sageData.avatar })
                            setShowMemoryDetail(true)
                          }}
                          className="bg-slate-800/50 border border-purple-500/20 p-3 rounded-lg hover:border-cyan-500/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{memory.emotion}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white line-clamp-1">{memory.title}</div>
                              <div className="text-xs text-slate-400">{memory.date}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-sm">
                        <span className="text-purple-400 font-bold">{sageData.totalXP.toLocaleString()}</span>
                        <span className="text-slate-400 text-xs ml-1">Total XP</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-cyan-400 hover:text-cyan-300"
                        // onClick={() => { /* TODO: Navigate to Sage's specific page or filter */ }}
                      >
                        View All →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedView === "timeline" && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-6">Your Recent Journey</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                {recentMemories.map((memory, i) => (
                  <Card
                    key={memory.id}
                    onClick={() => {
                      setSelectedMemory(memory)
                      setShowMemoryDetail(true)
                    }}
                    className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] group cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl group-hover:scale-110 transition-transform">{memory.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {memory.title}
                            </h4>
                            <p className="text-sm text-slate-400">with {memory.sage}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500">{memory.time}</div>
                            <div className="text-sm text-cyan-400 font-medium mt-1">+{memory.xp} XP</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{memory.snippet}</p>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                            {memory.mood}
                          </span>
                          <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 text-xs">
                            Revisit chat →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedView === "insights" && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Your Patterns & Insights</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CalendarIcon className="w-8 h-8 text-emerald-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.mostActiveDay}</div>
                        <div className="text-sm text-emerald-300">Your most active day</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">
                      You love starting conversations mid-week! Consider scheduling important chats on Tuesdays.
                    </p>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border-2 border-orange-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ClockIcon className="w-8 h-8 text-orange-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.favoriteTime}</div>
                        <div className="text-sm text-orange-300">Your peak chat time</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">
                      You're sharpest in the morning! Your best insights happen between 8-11 AM.
                    </p>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>✅</span>
                  What You Planned to Do
                </h4>
                <div className="space-y-2">
                  {[
                    { task: "Write down 3 core values to guide decisions", completed: true },
                    { task: "Set up daily 10-minute reflection time", completed: true },
                    { task: "Reach out to a mentor for guidance", completed: false },
                  ].map((item, i) => (
                    <Card
                      key={i}
                      className={`border p-4 rounded-xl ${
                        item.completed
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-slate-800/50 border-purple-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl ${item.completed ? "" : "opacity-50"}`}>
                          {item.completed ? "✅" : "⭕"}
                        </div>
                        <p className={`flex-1 ${item.completed ? "text-emerald-300" : "text-slate-300"}`}>
                          {item.task}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-4">Conversation Topics Over Time</h4>
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6">
                  <div className="grid grid-cols-12 gap-2 h-32">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="flex flex-col justify-end">
                        <div
                          className="bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                          style={{ height: `${Math.random() * 80 + 20}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-slate-400">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dec</span>
                  </div>
                </Card>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-4">Top Sage Collaborators</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: "Dr. Wellness", chats: 42, avatar: "🧘", growth: "+15%" },
                    { name: "Strategy Sage", chats: 38, avatar: "💼", growth: "+22%" },
                    { name: "Creative Muse", chats: 31, avatar: "🎨", growth: "+8%" },
                  ].map((sage, i) => (
                    <Card
                      key={i}
                      className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-purple-500/30 p-4 hover:scale-105 transition-transform"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-4xl">{sage.avatar}</div>
                        <div>
                          <div className="font-bold text-white">{sage.name}</div>
                          <div className="text-sm text-slate-400">{sage.chats} conversations</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <TrendingUpIcon className="w-3 h-3" />
                        <span>{sage.growth} this month</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl backdrop-blur animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-pink-400" />
              <h3 className="font-semibold text-white">Memory Lane Pro Tips</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-2">
                <span>📌</span>
                <span className="text-slate-300">Pin your favorite moments to revisit them anytime</span>
              </div>
              <div className="flex gap-2">
                <span>🎨</span>
                <span className="text-slate-300">Explore by mood to rediscover insights from similar situations</span>
              </div>
              <div className="flex gap-2">
                <span>📊</span>
                <span className="text-slate-300">Check insights weekly to understand your growth patterns</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
