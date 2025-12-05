"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeIcon, ActivityIcon, ZapIcon, SparklesIcon, XIcon } from "@/components/icons"

// View modes for the Observatory
type ViewMode = "creator" | "scientist" | "governance" | "cosmic"
type LayerMode = "globe" | "graph" | "heatmap" | "radar" | "all"

export default function ObservatoryPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("cosmic")
  const [activeLayer, setActiveLayer] = useState<LayerMode>("all")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedSage, setSelectedSage] = useState<any>(null)
  const [globeRotation, setGlobeRotation] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)

  // Stats from real-time data
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalInteractions: 0,
    avgResponseTime: 0,
    conversationsPerMinute: 0,
    tokensUsed: 0,
  })

  // Globe visualization data
  const [globePoints, setGlobePoints] = useState<
    Array<{
      lat: number
      lon: number
      name: string
      avatar: string
      activity: number
      domain: string
      connections: number
    }>
  >([])

  // Social graph data
  const [graphNodes, setGraphNodes] = useState<
    Array<{
      id: string
      name: string
      avatar: string
      x: number
      y: number
      size: number
      domain: string
      interactions: number
    }>
  >([])

  const [graphEdges, setGraphEdges] = useState<
    Array<{
      from: string
      to: string
      strength: number
      active: boolean
    }>
  >([])

  // Heatmap data
  const [heatmapData, setHeatmapData] = useState<
    Array<{
      lat: number
      lon: number
      intensity: number
      type: "high" | "medium" | "low" | "anomaly"
    }>
  >([])

  // Behavioral radar data
  const [radarAlerts, setRadarAlerts] = useState<
    Array<{
      id: string
      sageId: string
      type: "warning" | "error" | "info"
      category: string
      message: string
      severity: number
      timestamp: Date
    }>
  >([])

  // Real-time events feed
  const [eventsFeed, setEventsFeed] = useState<
    Array<{
      id: string
      type: string
      message: string
      timestamp: Date
      icon: string
    }>
  >([])

  // Enhanced 3D navigation state
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState(15) // 3D tilt angle
  const [showTutorial, setShowTutorial] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mouse tracking for cosmic effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Load agents data
  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data)
        setStats({
          totalAgents: data.length,
          activeAgents: data.filter((a: { status?: string }) => a.status === "active").length || data.length,
          totalInteractions: Math.floor(Math.random() * 10000 + 5000),
          avgResponseTime: Math.floor(Math.random() * 500 + 200),
          conversationsPerMinute: Math.floor(Math.random() * 50 + 20),
          tokensUsed: Math.floor(Math.random() * 1000000 + 500000),
        })

        const points = data.slice(0, 30).map((agent: any, i: number) => {
          // Cluster by domain for realistic geography
          const domainClusters: Record<string, { lat: number; lon: number }> = {
            Health: { lat: 40, lon: -100 }, // North America
            Education: { lat: 51, lon: 0 }, // Europe
            Creative: { lat: 35, lon: 139 }, // Asia
            Business: { lat: -33, lon: 151 }, // Australia
            Science: { lat: 48, lon: 2 }, // Europe
            Technology: { lat: 37, lon: -122 }, // Silicon Valley
          }

          const cluster = domainClusters[agent.domain as keyof typeof domainClusters] || { lat: 0, lon: 0 }
          const spread = 20 // degrees of spread from cluster center

          return {
            lat: cluster.lat + (Math.random() - 0.5) * spread,
            lon: cluster.lon + (Math.random() - 0.5) * spread * 2,
            name: agent.name,
            avatar: agent.avatar || "🤖",
            activity: Math.random() * 100,
            domain: agent.domain || "General",
            connections: Math.floor(Math.random() * 10 + 1),
          }
        })
        setGlobePoints(points)

        const nodes = data.slice(0, 20).map((agent: any, i: number) => {
          const angle = (i / data.slice(0, 20).length) * Math.PI * 2
          const radius = 200 + Math.random() * 100
          return {
            id: agent.id,
            name: agent.name,
            avatar: agent.avatar || "🤖",
            x: 400 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius,
            size: 30 + Math.random() * 30,
            domain: agent.domain || "General",
            interactions: Math.floor(Math.random() * 500 + 100),
          }
        })
        setGraphNodes(nodes)

        const edges: Array<{
          from: string
          to: string
          strength: number
          active: boolean
        }> = []
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            // Connect agents in same domain with higher probability
            if (nodes[i].domain === nodes[j].domain && Math.random() > 0.7) {
              edges.push({
                from: nodes[i].id,
                to: nodes[j].id,
                strength: Math.random(),
                active: Math.random() > 0.7,
              })
            } else if (Math.random() > 0.9) {
              edges.push({
                from: nodes[i].id,
                to: nodes[j].id,
                strength: Math.random() * 0.5,
                active: false,
              })
            }
          }
        }
        setGraphEdges(edges)

        const heatmap = Array.from({ length: 50 }, () => ({
          lat: Math.random() * 160 - 80,
          lon: Math.random() * 360 - 180,
          intensity: Math.random(),
          type: (["high", "medium", "low", "anomaly"] as const)[Math.floor(Math.random() * 4)],
        }))
        setHeatmapData(heatmap)

        const alerts = Array.from({ length: 5 }, (_, i) => ({
          id: `alert-${i}`,
          sageId: data[Math.floor(Math.random() * data.length)]?.id || "unknown",
          type: (["warning", "error", "info"] as const)[Math.floor(Math.random() * 3)],
          category: ["Hallucination", "Emotional Drift", "Safety Boundary", "Domain Violation", "Policy Mismatch"][
            Math.floor(Math.random() * 5)
          ],
          message: "Unusual behavioral pattern detected",
          severity: Math.random(),
          timestamp: new Date(Date.now() - Math.random() * 3600000),
        }))
        setRadarAlerts(alerts)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Auto-rotate globe
  useEffect(() => {
    if (!autoRotate) return
    const interval = setInterval(() => {
      setGlobeRotation((prev) => (prev + 0.2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [autoRotate])

  // Generate real-time events feed
  useEffect(() => {
    const eventTypes = [
      { icon: "🤝", message: (a: string, b: string) => `${a} collaborated with ${b}` },
      { icon: "🎨", message: (a: string) => `New artifact created by ${a}` },
      { icon: "⚠️", message: (a: string) => `Safety override prevented issue with ${a}` },
      { icon: "🔀", message: (a: string, b: string) => `${a} forked to create ${b}` },
      { icon: "📈", message: (a: string) => `Trending: ${a} seeing 50% activity spike` },
      { icon: "✅", message: (a: string) => `Compliance check passed for ${a}` },
    ]

    const interval = setInterval(() => {
      if (agents.length > 0) {
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        const agent1 = agents[Math.floor(Math.random() * agents.length)]
        const agent2 = agents[Math.floor(Math.random() * agents.length)]

        setEventsFeed((prev) => [
          {
            id: Date.now().toString(),
            type: "activity",
            message: event.message(agent1.name, agent2.name),
            timestamp: new Date(),
            icon: event.icon,
          },
          ...prev.slice(0, 19), // Keep last 20 events
        ])
      }
    }, 5000) // New event every 5 seconds

    return () => clearInterval(interval)
  }, [agents])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Wheel event detected:", e.deltaY)
    const delta = e.deltaY * -0.001
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta))
    console.log("[v0] Zoom changed from", zoom, "to", newZoom)
    setZoom(newZoom)
  }

  const project3DPoint = (lat: number, lon: number, rotation: number, depth = 200) => {
    const phi = (lat * Math.PI) / 180
    const theta = ((lon + rotation) * Math.PI) / 180

    const radius = depth
    const x = radius * Math.cos(phi) * Math.sin(theta)
    const y = -radius * Math.sin(phi)
    const z = radius * Math.cos(phi) * Math.cos(theta)

    // Apply tilt for 3D effect
    const tiltRad = (tilt * Math.PI) / 180
    const yTilted = y * Math.cos(tiltRad) - z * Math.sin(tiltRad)
    const zTilted = y * Math.sin(tiltRad) + z * Math.cos(tiltRad)

    // Enhanced perspective projection
    const perspective = 800
    const scale = (perspective / (perspective + zTilted)) * zoom
    const screenX = x * scale + 400 + panX
    const screenY = yTilted * scale + 300 + panY

    return {
      x: screenX,
      y: screenY,
      z: zTilted,
      visible: zTilted > -150,
      scale,
      depth: zTilted,
    }
  }

  // Get view mode theme
  const getViewModeTheme = () => {
    switch (viewMode) {
      case "creator":
        return {
          primary: "from-emerald-500 to-cyan-500",
          secondary: "from-emerald-500/20 to-cyan-500/20",
          accent: "emerald-400",
          description: "Track growth, forks, earnings & popularity",
        }
      case "scientist":
        return {
          primary: "from-blue-500 to-indigo-500",
          secondary: "from-blue-500/20 to-indigo-500/20",
          accent: "blue-400",
          description: "Analyze behavior drift, memory & semantic clustering",
        }
      case "governance":
        return {
          primary: "from-red-500 to-orange-500",
          secondary: "from-red-500/20 to-orange-500/20",
          accent: "red-400",
          description: "Monitor violations, audit logs & compliance",
        }
      default:
        return {
          primary: "from-cyan-400 via-purple-400 to-pink-400",
          secondary: "from-purple-500/10 to-cyan-500/10",
          accent: "cyan-400",
          description: "Explore the multiverse in cosmic splendor",
        }
    }
  }

  const theme = getViewModeTheme()

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <div
        className="fixed pointer-events-none opacity-30 blur-3xl z-0"
        style={{
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 100%)`,
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(150)].map((_, i) => (
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
        <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/multiverse">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <h1
                  className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
                >
                  SageSpace Observatory
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Selector */}
                <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-purple-500/30 rounded-lg p-1">
                  {(["cosmic", "creator", "scientist", "governance"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className={`text-xs ${
                        viewMode === mode
                          ? "bg-gradient-to-r " + theme.primary + " text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {mode === "cosmic" && "🌌"}
                      {mode === "creator" && "💰"}
                      {mode === "scientist" && "🔬"}
                      {mode === "governance" && "⚖️"}
                      <span className="ml-1 capitalize">{mode}</span>
                    </Button>
                  ))}
                </div>

                <div className="h-6 w-px bg-white/10" />

                {/* Layer Toggle */}
                <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveLayer(activeLayer === "all" ? "globe" : "all")}
                    className="text-slate-300 hover:text-cyan-400 text-xs"
                  >
                    {activeLayer === "all" ? "🗺️ All" : "🌍 Globe"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 mt-3 justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-white">{stats.activeAgents} Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                <ActivityIcon className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-medium text-white">{stats.conversationsPerMinute} conv/min</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <ZapIcon className="w-3 h-3 text-purple-400" />
                <span className="text-xs font-medium text-white">{stats.avgResponseTime}ms</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/20 border border-pink-500/30 rounded-lg">
                <SparklesIcon className="w-3 h-3 text-pink-400" />
                <span className="text-xs font-medium text-white">{(stats.tokensUsed / 1000).toFixed(0)}K tokens</span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-400 mt-2">{theme.description}</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {showTutorial && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <Card className="bg-gradient-to-br from-purple-900 to-slate-900 border-2 border-cyan-500 rounded-3xl max-w-2xl p-8">
                <div className="text-center space-y-6">
                  <div className="text-6xl">👋</div>
                  <h2 className="text-3xl font-bold text-white">Welcome to the Observatory!</h2>
                  <div className="text-left space-y-4 text-slate-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🌍</span>
                      <div>
                        <p className="font-semibold text-cyan-400">Interactive 3D Globe</p>
                        <p className="text-sm">
                          Each dot represents an AI sage. See where they are active around the world!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🖱️</span>
                      <div>
                        <p className="font-semibold text-purple-400">Navigate Easily</p>
                        <p className="text-sm">
                          Drag to rotate • Scroll to zoom • Click dots for details • Use zoom buttons
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="font-semibold text-emerald-400">Get Insights</p>
                        <p className="text-sm">
                          See live activity, trending sages, and which ones are most helpful right now
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowTutorial(false)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 text-lg py-6"
                  >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Start Exploring
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-400 py-12 animate-pulse">
              <div className="text-5xl mb-4">🌌</div>
              <div>Initializing Observatory Systems...</div>
              <div className="text-sm mt-2">Loading agents, graphs, and activity data</div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {(activeLayer === "all" || activeLayer === "globe") && (
                  <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                          <span>🌍</span>
                          <span>Live Sage Activity Map</span>
                        </h3>
                        <p className="text-sm text-slate-400">Drag to rotate • Scroll to zoom • Click for details</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAutoRotate(!autoRotate)}
                          className="text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {autoRotate ? "⏸️ Pause" : "▶️ Auto-Rotate"}
                        </Button>
                      </div>
                    </div>

                    <div
                      className="relative w-full h-[600px] bg-gradient-to-b from-purple-950/30 via-black/50 to-cyan-950/30 rounded-xl border-2 border-purple-500/30 overflow-hidden cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onWheel={handleWheel}
                      style={{ perspective: "1200px", touchAction: "none" }}
                    >
                      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-50">
                        <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-500/50 rounded-xl p-2 shadow-2xl">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                              className="text-white hover:bg-cyan-500/20 hover:text-cyan-400 px-3 py-2"
                              title="Zoom In"
                            >
                              <span className="text-xl">🔍+</span>
                            </Button>
                            <div className="h-px bg-cyan-500/30 mx-2" />
                            <div className="text-xs text-center text-cyan-400 font-mono px-2 py-1">
                              {Math.round(zoom * 100)}%
                            </div>
                            <div className="h-px bg-cyan-500/30 mx-2" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
                              className="text-white hover:bg-cyan-500/20 hover:text-cyan-400 px-3 py-2"
                              title="Zoom Out"
                            >
                              <span className="text-xl">🔍-</span>
                            </Button>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setZoom(1)
                            setPanX(0)
                            setPanY(0)
                            setTilt(15)
                          }}
                          className="bg-purple-500/20 border-2 border-purple-500/50 hover:bg-purple-500/30 text-white backdrop-blur-xl shadow-2xl"
                          title="Reset View"
                        >
                          <span className="mr-2">🎯</span>
                          <span className="text-xs font-semibold">Reset</span>
                        </Button>
                      </div>

                      <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: "none" }}>
                        {[...Array(12)].map((_, i) => {
                          const angle = (i - 6) * 15
                          const proj = project3DPoint(angle, 0, globeRotation, 200)
                          const proj2 = project3DPoint(angle, 180, globeRotation, 200)
                          if (proj.visible || proj2.visible) {
                            return (
                              <line
                                key={`lat-${i}`}
                                x1={proj.x}
                                y1={proj.y}
                                x2={proj2.x}
                                y2={proj2.y}
                                stroke="currentColor"
                                strokeWidth={2 * proj.scale}
                                className="text-cyan-400"
                                opacity={0.3 + proj.scale * 0.2}
                              />
                            )
                          }
                          return null
                        })}

                        {[...Array(24)].map((_, i) => {
                          const angle = i * 15
                          const proj1 = project3DPoint(90, angle, globeRotation, 200)
                          const proj2 = project3DPoint(-90, angle, globeRotation, 200)
                          return (
                            <line
                              key={`lon-${i}`}
                              x1={proj1.x}
                              y1={proj1.y}
                              x2={proj2.x}
                              y2={proj2.y}
                              stroke="currentColor"
                              strokeWidth={1 * zoom}
                              className="text-purple-500"
                              opacity={0.2}
                            />
                          )
                        })}
                      </svg>

                      {globePoints
                        .map((point, i) => ({
                          point,
                          i,
                          projected: project3DPoint(point.lat, point.lon, globeRotation),
                        }))
                        .sort((a, b) => a.projected.depth - b.projected.depth)
                        .map(({ point, i, projected }) => {
                          if (!projected.visible) return null

                          const opacity = Math.max(0.3, Math.min(1, (projected.depth + 200) / 400))
                          const size = 40 * projected.scale

                          return (
                            <div
                              key={i}
                              className="absolute transition-all duration-100"
                              style={{
                                left: `${projected.x}px`,
                                top: `${projected.y}px`,
                                transform: `translate(-50%, -50%) scale(${projected.scale})`,
                                opacity: opacity,
                                zIndex: Math.floor(projected.depth + 200),
                                filter: `blur(${Math.max(0, (200 - projected.depth) * 0.01)}px)`,
                              }}
                            >
                              <div
                                className="relative group cursor-pointer"
                                onClick={() => setSelectedSage(point)}
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              >
                                <div
                                  className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-40 group-hover:opacity-80 transition-opacity animate-pulse"
                                  style={{
                                    animationDuration: `${3 - point.activity / 50}s`,
                                    width: `${size * 1.5}px`,
                                    height: `${size * 1.5}px`,
                                    margin: `-${size * 0.25}px`,
                                  }}
                                />

                                {/* Sage avatar */}
                                <div
                                  className="relative flex items-center justify-center bg-gradient-to-br from-purple-600/50 to-cyan-600/50 backdrop-blur-sm border-2 border-cyan-400/50 rounded-full group-hover:border-cyan-300 group-hover:scale-110 transition-all"
                                  style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                  }}
                                >
                                  <span className="text-2xl" style={{ fontSize: `${size * 0.6}px` }}>
                                    {point.avatar}
                                  </span>
                                </div>

                                <div
                                  className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping"
                                  style={{
                                    width: `${size * 1.2}px`,
                                    height: `${size * 1.2}px`,
                                    margin: `-${size * 0.1}px`,
                                    opacity: point.activity / 100,
                                  }}
                                />

                                {(hoveredPoint === point || selectedSage === point) && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap animate-fade-in">
                                    <div className="bg-slate-900/95 backdrop-blur border-2 border-cyan-400 rounded-xl px-4 py-3 shadow-2xl">
                                      <p className="text-lg font-bold text-white mb-1">{point.name}</p>
                                      <div className="flex items-center gap-2 text-sm text-cyan-400 mb-1">
                                        <ZapIcon className="w-3 h-3" />
                                        <span>{Math.floor(point.activity)} people chatting now</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-purple-400">
                                        <span>🤝</span>
                                        <span>{point.connections} connections</span>
                                      </div>
                                      <div className="mt-2 text-xs text-emerald-400 font-semibold">
                                        {point.activity > 70
                                          ? "🔥 Trending!"
                                          : point.activity > 40
                                            ? "✨ Popular"
                                            : "💚 Available"}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                      <div
                        className="absolute pointer-events-none"
                        style={{
                          width: `${400 * zoom}px`,
                          height: `${400 * zoom}px`,
                          left: `${400 + panX}px`,
                          top: `${300 + panY}px`,
                          transform: `translate(-50%, -50%) rotateX(${tilt}deg)`,
                          borderRadius: "50%",
                          border: "3px solid rgba(139, 92, 246, 0.4)",
                          boxShadow: `
                            inset 0 0 80px rgba(6, 182, 212, 0.3),
                            inset 0 0 120px rgba(139, 92, 246, 0.2),
                            0 0 100px rgba(139, 92, 246, 0.4),
                            0 0 150px rgba(6, 182, 212, 0.3)
                          `,
                          background: "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.1), transparent 70%)",
                        }}
                      />

                      <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur border-2 border-purple-500/50 rounded-xl p-4 text-sm max-w-[250px]">
                        <p className="font-bold text-white mb-3 flex items-center gap-2">
                          <span>💡</span>
                          <span>What You're Seeing</span>
                        </p>
                        <div className="space-y-2 text-slate-300">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">📍</span>
                            <div>
                              <p className="font-semibold text-cyan-400">Each Dot = AI Sage</p>
                              <p className="text-xs">Positioned by expertise area</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">💫</span>
                            <div>
                              <p className="font-semibold text-purple-400">Glow = Activity</p>
                              <p className="text-xs">Brighter = more people using it</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">🔥</span>
                            <div>
                              <p className="font-semibold text-emerald-400">Trending Sages</p>
                              <p className="text-xs">Popular right now</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowTutorial(true)}
                          className="w-full mt-3 text-xs text-slate-400 hover:text-cyan-400"
                        >
                          Show Tutorial Again
                        </Button>
                      </div>

                      {isDragging && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cyan-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                          🖱️ Dragging to rotate
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-white"
                        onClick={() => {
                          const trending = globePoints.sort((a, b) => b.activity - a.activity)[0]
                          if (trending) setSelectedSage(trending)
                        }}
                      >
                        <span className="mr-2">🔥</span>
                        <span>Most Trending</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-white"
                        onClick={() => {
                          const popular = globePoints.sort((a, b) => b.connections - a.connections)[0]
                          if (popular) setSelectedSage(popular)
                        }}
                      >
                        <span className="mr-2">🤝</span>
                        <span>Most Connected</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-white"
                        onClick={() => {
                          const random = globePoints[Math.floor(Math.random() * globePoints.length)]
                          if (random) setSelectedSage(random)
                        }}
                      >
                        <span className="mr-2">🎲</span>
                        <span>Surprise Me</span>
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Layer 2: Social Graph */}
                {(activeLayer === "all" || activeLayer === "graph") && (
                  <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-cyan-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <span>🕸️</span>
                          <span>Social Graph</span>
                        </h3>
                        <p className="text-sm text-slate-400">Agent relationships and influence network</p>
                      </div>
                    </div>

                    <div className="relative w-full h-[400px] bg-gradient-to-br from-cyan-950/20 to-purple-950/20 rounded-xl border border-cyan-500/20 overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full">
                        {/* Draw edges */}
                        {graphEdges.map((edge, i) => {
                          const fromNode = graphNodes.find((n) => n.id === edge.from)
                          const toNode = graphNodes.find((n) => n.id === edge.to)
                          if (!fromNode || !toNode) return null

                          return (
                            <line
                              key={i}
                              x1={fromNode.x}
                              y1={fromNode.y}
                              x2={toNode.x}
                              y2={toNode.y}
                              stroke={edge.active ? "rgba(6, 182, 212, 0.6)" : "rgba(139, 92, 246, 0.3)"}
                              strokeWidth={edge.strength * 3 + 1}
                              className={edge.active ? "animate-pulse" : ""}
                            />
                          )
                        })}
                      </svg>

                      {/* Draw nodes */}
                      {graphNodes.map((node) => (
                        <div
                          key={node.id}
                          className="absolute cursor-pointer group"
                          style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onClick={() => setSelectedSage(node)}
                        >
                          <div
                            className="flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 backdrop-blur border-2 border-purple-500/50 group-hover:border-cyan-500 transition-all"
                            style={{
                              width: `${node.size}px`,
                              height: `${node.size}px`,
                            }}
                          >
                            <span className="text-xl">{node.avatar}</span>
                          </div>

                          {/* Node label */}
                          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <div className="bg-slate-900 border border-cyan-500/50 rounded px-2 py-1">
                              <p className="text-xs font-semibold text-white">{node.name}</p>
                              <p className="text-xs text-cyan-400">{node.interactions} interactions</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Module C: Events Feed */}
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-emerald-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🔔</span>
                      <span>Live Events</span>
                    </h3>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {eventsFeed.map((event) => (
                      <div
                        key={event.id}
                        className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/30 transition-colors animate-fade-in"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{event.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white leading-relaxed">{event.message}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {event.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Module D: Behavioral Radar */}
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-orange-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🧭</span>
                      <span>Safety Radar</span>
                    </h3>
                    <div className="text-xs text-slate-400">{radarAlerts.length} alerts</div>
                  </div>

                  <div className="space-y-2">
                    {radarAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-2 rounded-lg border ${
                          alert.type === "error"
                            ? "bg-red-500/10 border-red-500/30"
                            : alert.type === "warning"
                              ? "bg-orange-500/10 border-orange-500/30"
                              : "bg-blue-500/10 border-blue-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">
                            {alert.type === "error" ? "🔴" : alert.type === "warning" ? "⚠️" : "ℹ️"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{alert.category}</p>
                            <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-slate-700 h-1 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    alert.severity > 0.7
                                      ? "bg-red-500"
                                      : alert.severity > 0.4
                                        ? "bg-orange-500"
                                        : "bg-blue-500"
                                  }`}
                                  style={{ width: `${alert.severity * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">{Math.floor(alert.severity * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick stats */}
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Total Sages</span>
                      <span className="text-lg font-bold text-cyan-400">{stats.totalAgents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Active Now</span>
                      <span className="text-lg font-bold text-emerald-400">{stats.activeAgents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Interactions</span>
                      <span className="text-lg font-bold text-purple-400">
                        {stats.totalInteractions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Avg Response</span>
                      <span className="text-lg font-bold text-orange-400">{stats.avgResponseTime}ms</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedSage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSage(null)}
        >
          <div
            className={`bg-gradient-to-br from-slate-900 to-slate-800 border-2 ${
              viewMode === "governance"
                ? "border-red-500/30"
                : viewMode === "scientist"
                  ? "border-blue-500/30"
                  : "border-purple-500/30"
            } rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 bg-gradient-to-r ${theme.secondary} backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10`}
            >
              <div className="flex items-center gap-4">
                <div className="text-6xl">{selectedSage.avatar || "🤖"}</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedSage.name}</h2>
                  <p className={`text-${theme.accent}`}>{selectedSage.domain || selectedSage.role}</p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedSage(null)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <XIcon className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className={`bg-${theme.accent}/10 border-2 border-${theme.accent}/30 p-4`}>
                  <div className="text-2xl font-bold text-white mb-1">
                    {selectedSage.activity ? Math.floor(selectedSage.activity) : selectedSage.interactions || 0}
                  </div>
                  <div className="text-sm text-slate-300">Interactions</div>
                </Card>
                <Card className={`bg-${theme.accent}/10 border-2 border-${theme.accent}/30 p-4`}>
                  <div className="text-2xl font-bold text-white mb-1">
                    {selectedSage.connections || Math.floor(Math.random() * 20)}
                  </div>
                  <div className="text-sm text-slate-300">Connections</div>
                </Card>
                <Card className={`bg-${theme.accent}/10 border-2 border-${theme.accent}/30 p-4`}>
                  <div className="text-2xl font-bold text-white mb-1">98%</div>
                  <div className="text-sm text-slate-300">Trust Score</div>
                </Card>
              </div>

              {viewMode === "creator" && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Creator Insights</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Forks Created:</span>
                      <span className="font-bold text-emerald-400">{Math.floor(Math.random() * 50)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP Earned:</span>
                      <span className="font-bold text-cyan-400">{Math.floor(Math.random() * 5000 + 1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue (Credits):</span>
                      <span className="font-bold text-purple-400">{Math.floor(Math.random() * 1000)}</span>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === "scientist" && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Behavioral Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Behavioral Stability</span>
                        <span className="text-blue-400">92%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: "92%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Memory Utilization</span>
                        <span className="text-indigo-400">67%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: "67%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === "governance" && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Compliance Status</h3>
                  <div className="space-y-2">
                    {["GDPR Compliant", "HIPAA Verified", "SOC2 Certified", "Safety Checks Passed"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-emerald-400">
                        <span>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/playground?sage=${selectedSage.id}`} className="block">
                <Button className={`w-full bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`}>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Chat with {selectedSage.name?.split(" ")[0] || "Sage"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
