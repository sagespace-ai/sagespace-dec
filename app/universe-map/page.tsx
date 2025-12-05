"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  HomeIcon,
  HeartIcon,
  SparklesIcon,
  TrendingUpIcon,
  ShareIcon,
  SearchIcon,
  ZapIcon,
  UserIcon,
  MessageCircleIcon,
  XIcon,
} from "@/components/icons"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"

interface FloatingSage {
  id: string
  name: string
  avatar: string
  domain: string
  role: string
  x: number
  y: number
  z: number
  vx: number
  vy: number
  interactions: number
  globalPopularity: number
  yourInteractions: number
  favorited: boolean
  trending: boolean
  recentInsight?: string
}

export default function UniverseMapPage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [sages, setSages] = useState<FloatingSage[]>([])
  const [selectedSage, setSelectedSage] = useState<FloatingSage | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [navigationMode, setNavigationMode] = useState<"explore" | "constellation" | "proximity" | "discovery">(
    "explore",
  )
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null)
  const [showNavigationPanel, setShowNavigationPanel] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [centerPosition, setCenterPosition] = useState({ x: 50, y: 50 })
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [liveHumans, setLiveHumans] = useState<any[]>([])
  const [showSocialPanel, setShowSocialPanel] = useState(false)
  const [friendsUsing, setFriendsUsing] = useState<any[]>([])
  const [trendingNearYou, setTrendingNearYou] = useState<any[]>([])
  const [isPanning, setIsPanning] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const constellations = {
    "Knowledge & Learning": ["Education", "History", "Science", "Research"],
    "Creative Arts": ["Arts", "Music", "Writing", "Design"],
    "Wellness & Life": ["Wellness", "Fitness", "Mindfulness", "Lifestyle"],
    "Tech & Innovation": ["Technology", "Software Development", "Innovation", "Data Science"],
    "Business & Finance": ["Business", "Finance", "Marketing", "Entrepreneurship"],
  }

  useEffect(() => {
    const floatingSages: FloatingSage[] = SAGE_TEMPLATES.slice(0, 50).map((sage, i) => ({
      id: `sage-${i}`,
      name: sage.name,
      avatar: sage.avatar,
      domain: sage.domain,
      role: sage.role,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      interactions: Math.floor(Math.random() * 5000),
      globalPopularity: Math.floor(Math.random() * 10000),
      yourInteractions: Math.floor(Math.random() * 50),
      favorited: Math.random() > 0.8,
      trending: Math.random() > 0.7,
      recentInsight:
        Math.random() > 0.5
          ? [
              "Just helped 1.2k people learn about mindfulness",
              "Shared breakthrough on productivity",
              "New insights on creative problem solving",
              "Trending conversation about work-life balance",
            ][Math.floor(Math.random() * 4)]
          : undefined,
    }))
    setSages(floatingSages)
  }, [])

  useEffect(() => {
    const animate = () => {
      setSages((prevSages) =>
        prevSages.map((sage) => {
          let newX = sage.x + sage.vx
          let newY = sage.y + sage.vy
          let newVx = sage.vx
          let newVy = sage.vy

          if (newX <= 0 || newX >= 100) {
            newVx = -sage.vx
            newX = Math.max(0, Math.min(100, newX))
          }
          if (newY <= 0 || newY >= 100) {
            newVy = -sage.vy
            newY = Math.max(0, Math.min(100, newY))
          }

          return { ...sage, x: newX, y: newY, vx: newVx, vy: newVy }
        }),
      )
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
          console.log("[v0] User location acquired:", position.coords)
        },
        (error) => console.log("[v0] Geolocation error:", error),
      )
    }

    // Mock real-time humans data
    const mockHumans = [
      { id: 1, name: "Sarah Chen", avatar: "👩‍💼", viewingSage: "Dr. Wellness", location: "2.3 mi away" },
      { id: 2, name: "Marcus Rodriguez", avatar: "👨‍🎨", viewingSage: "Creative Maven", location: "1.5 mi away" },
      { id: 3, name: "Emily Thompson", avatar: "👩‍🔬", viewingSage: "Prof. Einstein", location: "0.8 mi away" },
      { id: 4, name: "David Kim", avatar: "👨‍💻", viewingSage: "Code Architect", location: "3.1 mi away" },
    ]
    setLiveHumans(mockHumans)

    // Mock friends using sages
    const mockFriends = [
      { name: "Alex", avatar: "👤", sage: "Dr. Wellness", timestamp: "2m ago" },
      { name: "Jordan", avatar: "👤", sage: "Creative Maven", timestamp: "5m ago" },
      { name: "Taylor", avatar: "👤", sage: "Prof. Einstein", timestamp: "12m ago" },
    ]
    setFriendsUsing(mockFriends)

    // Mock trending near you
    const mockTrending = [
      { sage: "Dr. Wellness", count: 234, badge: "🔥", reason: "Health trends in your area" },
      { sage: "Financial Guru", count: 187, badge: "💰", reason: "Tax season prep" },
      { sage: "Career Coach", count: 156, badge: "📈", reason: "Job market insights" },
    ]
    setTrendingNearYou(mockTrending)
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoomLevel((prev) => Math.max(0.5, Math.min(2, prev + (e.deltaY > 0 ? -0.1 : 0.1))))
      } else {
        e.preventDefault()
        setIsPanning(true)
        setCenterPosition((prev) => ({
          x: Math.max(20, Math.min(80, prev.x + e.deltaX * 0.03)),
          y: Math.max(20, Math.min(80, prev.y + e.deltaY * 0.03)),
        }))
        setTimeout(() => setIsPanning(false), 100)
      }
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel as EventListener, { passive: false })
      return () => canvas.removeEventListener("wheel", handleWheel as EventListener)
    }
  }, [])

  const handleSageClick = (sage: FloatingSage) => {
    setSelectedSage(sage)
  }

  const handleFavorite = (sageId: string) => {
    setSages((prev) => prev.map((s) => (s.id === sageId ? { ...s, favorited: !s.favorited } : s)))
  }

  const handleChatNow = (sage: FloatingSage) => {
    router.push(`/playground?sage=${encodeURIComponent(sage.name)}`)
  }

  const getFilteredSages = () => {
    let filtered = [...sages]

    if (navigationMode === "constellation" && selectedConstellation) {
      const domains = constellations[selectedConstellation as keyof typeof constellations] || []
      filtered = filtered.filter((sage) => domains.includes(sage.domain))
    }

    if (navigationMode === "proximity") {
      // More intuitive proximity based on visible area
      filtered = filtered.filter((sage) => {
        const dx = sage.x - centerPosition.x
        const dy = sage.y - centerPosition.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < 35 / zoomLevel
      })
    }

    if (navigationMode === "discovery") {
      // Shuffle for true discovery
      filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 10)
    }

    if (filter === "favorites") filtered = filtered.filter((s) => s.favorited)
    if (filter === "trending") filtered = filtered.filter((s) => s.trending)
    if (filter === "yours") filtered = filtered.filter((s) => s.yourInteractions > 0)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.domain.toLowerCase().includes(query) ||
          s.role.toLowerCase().includes(query),
      )
    }

    return filtered
  }

  const filteredSages = getFilteredSages()

  const getSageScale = (z: number) => {
    return (0.5 + (z / 100) * 1.5) * zoomLevel
  }

  const getSageOpacity = (z: number) => {
    return 0.4 + (z / 100) * 0.6
  }

  const getSageViewerCount = (sageName: string) => {
    return liveHumans.filter((h) => h.viewingSage === sageName).length
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <div
        className="fixed pointer-events-none opacity-20 blur-3xl z-0"
        style={{
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(6,182,212,0.3) 50%, transparent 100%)",
          transform: `translate(${mousePosition.x - 400}px, ${mousePosition.y - 400}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
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
                <h1
                  className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  style={{ backgroundSize: "300% 300%", animation: "gradient 6s ease infinite" }}
                >
                  Sage Galaxy
                </h1>
              </div>

              {/* These should only appear as immersive floating buttons within the map */}
            </div>
          </div>
        </header>

        {showNavigationPanel && (
          <div className="fixed right-4 top-20 z-40 w-80 animate-slide-in-right">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-cyan-400" />
                  Navigation Control
                </h3>
                <button
                  onClick={() => setShowNavigationPanel(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-6">Choose how you want to explore the galaxy</p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setNavigationMode("explore")
                    setSelectedConstellation(null)
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    navigationMode === "explore"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500"
                      : "bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🌌</span>
                    <span className="font-semibold text-white">Free Explore</span>
                  </div>
                  <p className="text-xs text-slate-400">Float freely through all sages in the galaxy</p>
                </button>

                <button
                  onClick={() => setNavigationMode("constellation")}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    navigationMode === "constellation"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500"
                      : "bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">✨</span>
                    <span className="font-semibold text-white">Constellations</span>
                  </div>
                  <p className="text-xs text-slate-400">Group sages by domain like star constellations</p>
                </button>

                <button
                  onClick={() => {
                    setNavigationMode("proximity")
                    setSelectedConstellation(null)
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    navigationMode === "proximity"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500"
                      : "bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="font-semibold text-white">Nearby Only</span>
                  </div>
                  <p className="text-xs text-slate-400">Focus on sages close to you for easier browsing</p>
                </button>

                <button
                  onClick={() => {
                    setNavigationMode("discovery")
                    setSelectedConstellation(null)
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    navigationMode === "discovery"
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500"
                      : "bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎲</span>
                    <span className="font-semibold text-white">Discovery Mode</span>
                  </div>
                  <p className="text-xs text-slate-400">Random selection of 10 sages to discover</p>
                </button>
              </div>

              {navigationMode === "constellation" && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-cyan-400 mb-3">Select a Constellation</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.keys(constellations).map((constellation) => (
                      <button
                        key={constellation}
                        onClick={() => setSelectedConstellation(constellation)}
                        className={`w-full p-3 rounded-lg text-sm transition-all ${
                          selectedConstellation === constellation
                            ? "bg-cyan-500 text-white font-semibold"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {constellation}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-xs text-cyan-300">
                  <strong>Showing:</strong> {filteredSages.length} sages
                </p>
              </div>
            </Card>
          </div>
        )}

        {showSocialPanel && (
          <div className="fixed left-4 top-20 z-40 w-80 animate-slide-in-left">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-pink-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-pink-400" />
                  Who's Here Now
                </h3>
                <button
                  onClick={() => setShowSocialPanel(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                {userLocation ? `📍 Showing activity near you` : "🌍 Global activity"}
              </p>

              {/* Live humans viewing sages */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Right Now
                </h4>
                <div className="space-y-2">
                  {liveHumans.map((human) => (
                    <div
                      key={human.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-pink-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-2xl">{human.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{human.name}</p>
                        <p className="text-xs text-pink-400">Chatting with {human.viewingSage}</p>
                        <p className="text-xs text-slate-500">{human.location}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                        👀
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Friends activity */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">💫 Your Network</h4>
                <div className="space-y-2">
                  {friendsUsing.map((friend, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30"
                    >
                      <span className="text-xl">{friend.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <strong>{friend.name}</strong> used {friend.sage}
                        </p>
                        <p className="text-xs text-slate-400">{friend.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending near you */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  🔥 Trending {userLocation ? "Near You" : "Globally"}
                </h4>
                <div className="space-y-2">
                  {trendingNearYou.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30 hover:border-orange-500/50 transition-colors cursor-pointer"
                    >
                      <span className="text-2xl">{item.badge}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{item.sage}</p>
                        <p className="text-xs text-orange-400">{item.count} chats today</p>
                        <p className="text-xs text-slate-400">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location toggle */}
              <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-xs text-cyan-300 flex items-center gap-2">
                  <span>💡</span>
                  {userLocation
                    ? "Location enabled - seeing local activity"
                    : "Enable location to see sages popular in your area"}
                </p>
              </div>
            </Card>
          </div>
        )}

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Float Through the Sage Universe</h2>
              <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-6">
                {navigationMode === "explore" &&
                  "Discover sages floating in cosmic space. See who's trending, who you've connected with, and explore new wisdom guides."}
                {navigationMode === "constellation" &&
                  "Explore sages grouped by their domain constellation. Find specialists in your area of interest."}
                {navigationMode === "proximity" &&
                  "Focus on sages near you in the galaxy for easier discovery and less visual clutter."}
                {navigationMode === "discovery" &&
                  "Meet 10 randomly selected sages. Perfect for serendipitous discoveries and new connections."}
              </p>

              <div className="max-w-xl mx-auto mb-6">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search sages by name, role, or domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border-2 border-purple-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    filter === "all"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                      : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                  }`}
                >
                  🌌 All Sages
                </button>
                <button
                  onClick={() => setFilter("yours")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    filter === "yours"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                      : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                  }`}
                >
                  💬 Your Sages
                </button>
                <button
                  onClick={() => setFilter("trending")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    filter === "trending"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                      : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => setFilter("favorites")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    filter === "favorites"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                      : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                  }`}
                >
                  ⭐ Favorites
                </button>
              </div>
            </div>

            <div
              ref={canvasRef}
              className={`relative w-full h-[500px] md:h-[600px] bg-gradient-to-b from-purple-950/20 to-black/40 rounded-3xl border-2 border-purple-500/20 overflow-hidden mb-8 ${
                isPanning ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ perspective: "1000px", touchAction: "none" }}
            >
              {/* Navigate Button - Left side with spinning sparkles */}
              <button
                onClick={() => setShowNavigationPanel(!showNavigationPanel)}
                className="absolute left-6 top-6 z-40 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl px-6 py-3 shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <SparklesIcon className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                      <span className="font-bold text-white">Navigate</span>
                    </div>
                  </div>
                  {/* Orbiting particles */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
                    <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-orbit" />
                    <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-orbit-reverse" />
                  </div>
                </div>
              </button>

              {/* Who's Here Button - Right side with live avatars */}
              <button
                onClick={() => setShowSocialPanel(!showSocialPanel)}
                className="absolute right-6 top-6 z-40 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                  <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-pink-500/50 rounded-2xl px-6 py-3 shadow-2xl hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 border-2 border-slate-900 animate-bounce"
                          style={{ animationDelay: "0s" }}
                        />
                        <div
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 border-2 border-slate-900 animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 border-2 border-slate-900 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-white">Who's Here</span>
                        <span className="text-xs text-pink-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          {liveHumans.length} online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Start Chat Button - Bottom center with energy particles */}
              <button
                onClick={() => router.push("/playground")}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse" />
                  <div className="relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 backdrop-blur-xl rounded-3xl px-8 py-4 shadow-2xl hover:scale-110 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <MessageCircleIcon className="w-6 h-6 text-white" />
                      <span className="font-bold text-white text-lg">Start Chat</span>
                      <ZapIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                    </div>
                  </div>
                  {/* Energy particles */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none">
                    <div
                      className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                      style={{ top: "20%", left: "30%" }}
                    />
                    <div
                      className="absolute w-1 h-1 bg-cyan-300 rounded-full animate-ping"
                      style={{ top: "70%", right: "25%", animationDelay: "0.5s" }}
                    />
                    <div
                      className="absolute w-1 h-1 bg-pink-300 rounded-full animate-ping"
                      style={{ bottom: "20%", left: "40%", animationDelay: "1s" }}
                    />
                  </div>
                </div>
              </button>

              {/* Zoom controls - Sleek integrated design */}
              <div className="absolute left-6 bottom-6 z-40">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-30" />
                  <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 shadow-2xl">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.2))}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all hover:scale-110 font-bold text-xl"
                      >
                        +
                      </button>
                      <div className="text-xs text-white font-mono bg-slate-800/50 px-2 py-1 rounded">
                        {Math.round(zoomLevel * 100)}%
                      </div>
                      <button
                        onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.2))}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-all hover:scale-110 font-bold text-xl"
                      >
                        −
                      </button>
                      <button
                        onClick={() => {
                          setZoomLevel(1)
                          setCenterPosition({ x: 50, y: 50 })
                        }}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-600/50 border border-slate-500/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/50 transition-all hover:scale-110 text-xs"
                      >
                        ⟲
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location indicator - When active */}
              {userLocation && (
                <div className="absolute right-6 bottom-6 z-40">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-2xl blur-lg opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl p-3 shadow-2xl">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-green-400">Location Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-slate-900/90 backdrop-blur border border-purple-500/30 rounded-xl px-4 py-2 text-xs flex items-center gap-3">
                  <span className="text-white">
                    <strong>{filteredSages.length}</strong> sages visible
                  </span>
                  <div className="h-4 w-px bg-slate-600" />
                  <span className="text-cyan-400 font-mono">{Math.round(zoomLevel * 100)}% zoom</span>
                </div>
              </div>

              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  width: "100%",
                  height: "100%",
                  transition: isPanning ? "none" : "transform 0.2s ease-out",
                }}
              >
                {filteredSages.map((sage) => {
                  const scale = getSageScale(sage.z)
                  const opacity = getSageOpacity(sage.z)

                  const relativeX = sage.x - centerPosition.x
                  const relativeY = sage.y - centerPosition.y
                  const adjustedX = 50 + relativeX
                  const adjustedY = 50 + relativeY

                  if (adjustedX < -10 || adjustedX > 110 || adjustedY < -10 || adjustedY > 110) {
                    return null
                  }

                  const viewerCount = getSageViewerCount(sage.name)

                  return (
                    <button
                      key={sage.id}
                      onClick={() => handleSageClick(sage)}
                      className="absolute transition-all duration-300 hover:scale-125 cursor-pointer group"
                      style={{
                        left: `${adjustedX}%`,
                        top: `${adjustedY}%`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        opacity,
                        zIndex: Math.floor(sage.z),
                      }}
                    >
                      <div className="relative">
                        <div
                          className={`text-4xl md:text-5xl transition-all duration-300 group-hover:scale-110 ${
                            sage.trending ? "animate-pulse" : ""
                          }`}
                        >
                          {sage.avatar}
                        </div>

                        {viewerCount > 0 && (
                          <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-pink-500 rounded-full px-2 py-0.5 border-2 border-black text-xs font-bold text-white animate-pulse">
                            <span>👁️</span>
                            <span>{viewerCount}</span>
                          </div>
                        )}

                        <div
                          className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                            sage.trending ? "bg-orange-400" : sage.favorited ? "bg-yellow-400" : "bg-cyan-400"
                          }`}
                        />

                        {sage.trending && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                            🔥
                          </div>
                        )}
                        {sage.favorited && (
                          <div className="absolute -top-2 -left-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            ⭐
                          </div>
                        )}
                        {sage.yourInteractions > 0 && (
                          <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {sage.yourInteractions}
                          </div>
                        )}

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2">
                            <p className="text-sm font-semibold text-white">{sage.name}</p>
                            <p className="text-xs text-cyan-400">{sage.role}</p>
                            {viewerCount > 0 && <p className="text-xs text-pink-400 mt-1">{viewerCount} viewing now</p>}
                          </div>
                        </div>
                      </div>

                      {sage.yourInteractions > 0 && (
                        <div
                          className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent pointer-events-none"
                          style={{ transformOrigin: "left center" }}
                        />
                      )}
                    </button>
                  )
                })}

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                  <div className="relative">
                    <div className="text-6xl animate-pulse">👤</div>
                    <div className="absolute inset-0 blur-2xl bg-cyan-400 opacity-50" />
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <p className="text-sm font-bold text-cyan-400">You</p>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-cyan-500/20 rounded-full animate-ping" />
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-purple-500/10 rounded-full animate-ping"
                      style={{ animationDelay: "1s" }}
                    />
                  </div>
                </div>
              </div>

              {/* ... existing legend and navigation hints ... */}
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-purple-500/30 rounded-xl p-4 text-xs">
                <p className="font-semibold text-white mb-2">Legend</p>
                <div className="space-y-1 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>🔥</span>
                    <span>Trending now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <span>Your favorites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">●</span>
                    <span>You've chatted</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-xl p-3 text-xs">
                <p className="font-semibold text-white mb-1">🖱️ Navigation</p>
                <p className="text-slate-300">Scroll to pan</p>
                <p className="text-slate-300">Ctrl+Scroll to zoom</p>
              </div>
            </div>

            {selectedSage && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedSage(null)}
              >
                <Card
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/50 rounded-2xl p-6 md:p-8 max-w-2xl w-full relative overflow-hidden animate-scale-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-3xl" />

                  <div className="relative z-10">
                    <button
                      onClick={() => setSelectedSage(null)}
                      className="absolute top-0 right-0 text-slate-400 hover:text-white transition-colors p-2"
                    >
                      <XIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-start gap-6 mb-6">
                      <div className="text-8xl">{selectedSage.avatar}</div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">{selectedSage.name}</h2>
                        <p className="text-cyan-400 mb-4">{selectedSage.role}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                            {selectedSage.domain}
                          </span>
                          {selectedSage.trending && (
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30 flex items-center gap-1">
                              <TrendingUpIcon className="w-3 h-3" />
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedSage.recentInsight && (
                      <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <SparklesIcon className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-semibold text-cyan-400">Recent Activity</span>
                        </div>
                        <p className="text-slate-300 text-sm">{selectedSage.recentInsight}</p>
                      </div>
                    )}

                    {getSageViewerCount(selectedSage.name) > 0 && (
                      <div className="mb-6 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                          </span>
                          <span className="text-sm font-semibold text-pink-400">
                            {getSageViewerCount(selectedSage.name)}{" "}
                            {getSageViewerCount(selectedSage.name) === 1 ? "person is" : "people are"} chatting with
                            this sage right now
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <UserIcon className="w-4 h-4 text-cyan-400" />
                          <p className="text-2xl font-bold text-white">
                            {selectedSage.globalPopularity.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">Global Chats</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <MessageCircleIcon className="w-4 h-4 text-purple-400" />
                          <p className="text-2xl font-bold text-white">{selectedSage.yourInteractions}</p>
                        </div>
                        <p className="text-xs text-slate-400">Your Chats</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUpIcon className="w-4 h-4 text-orange-400" />
                          <p className="text-2xl font-bold text-white">{selectedSage.interactions.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-slate-400">Today's Activity</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleChatNow(selectedSage)}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                      >
                        <MessageCircleIcon className="w-4 h-4 mr-2" />
                        Chat Now
                      </Button>
                      <Button
                        onClick={() => handleFavorite(selectedSage.id)}
                        variant="outline"
                        className={`border-2 transition-colors ${
                          selectedSage.favorited
                            ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                            : "border-slate-600 text-slate-400 hover:border-yellow-500 hover:text-yellow-400"
                        }`}
                      >
                        <HeartIcon className={`w-4 h-4 ${selectedSage.favorited ? "fill-yellow-400" : ""}`} />
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-400 hover:border-cyan-500 bg-transparent"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <ZapIcon className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Pro Tips</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex gap-2">
                  <span>👥</span>
                  <span className="text-slate-300">See who else is exploring sages near you in real-time</span>
                </div>
                <div className="flex gap-2">
                  <span>📍</span>
                  <span className="text-slate-300">Enable location to discover trending sages in your area</span>
                </div>
                <div className="flex gap-2">
                  <span>🔍</span>
                  <span className="text-slate-300">
                    <span className="hidden md:inline">Scroll to navigate, Ctrl+Scroll to zoom like a map</span>
                    <span className="md:hidden">Pinch to zoom, swipe to navigate</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
