"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function MarketingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const featuredSages = [
    {
      avatar: "🧘",
      name: "Wellness Coach",
      role: "Holistic Health Advisor",
      description: "Your personal guide to balanced living",
      delay: "0s",
    },
    {
      avatar: "🎨",
      name: "Creative Director",
      role: "Visual Storytelling Expert",
      description: "Transform ideas into visual masterpieces",
      delay: "0.2s",
    },
    {
      avatar: "💼",
      name: "Strategy Architect",
      role: "Business Innovation Expert",
      description: "Chart your path to success",
      delay: "0.4s",
    },
    {
      avatar: "🔬",
      name: "Quantum Researcher",
      role: "Scientific Discovery Specialist",
      description: "Unlock the mysteries of the universe",
      delay: "0.6s",
    },
  ]

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <div
        className="fixed pointer-events-none opacity-30 blur-3xl"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 100%)",
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      {/* </CHANGE> */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
      {/* </CHANGE> */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-cyan-500/30 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-purple-500/30 rotate-45 animate-pulse" />
        <div
          className="absolute top-1/2 right-1/3 w-72 h-72 border border-pink-500/20 animate-spin-slow"
          style={{ animationDirection: "reverse", animationDuration: "20s" }}
        />
      </div>
      {/* </CHANGE> */}

      <header className="relative border-b border-white/10 backdrop-blur-md bg-black/50 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient"
          >
            SageSpace
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/playground">
              <Button className="relative group overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-purple-500/50 transition-all duration-500">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-white font-semibold">Get Started</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container mx-auto px-4 pt-32 pb-20 text-center">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-block px-6 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm font-medium mb-4 animate-slide-down">
              🚀 300+ Specialized AI Agents Ready to Assist
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span
                className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient mb-4"
                style={{ backgroundSize: "300% 300%" }}
              >
                Step Into Your
              </span>
              <span
                className="block bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-reverse"
                style={{ backgroundSize: "300% 300%" }}
              >
                AI Universe
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Where <span className="text-cyan-400 font-semibold">300 specialized AI agents</span> collaborate,
              deliberate, and evolve—guided by the{" "}
              <span className="text-purple-400 font-semibold">Five Laws of AI Harmony</span>
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Link href="/playground">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 relative group overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/50 border-0 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span>Start Exploring</span>
                    <span className="text-2xl">🚀</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-8 relative group overflow-hidden bg-black/50 backdrop-blur border-2 border-purple-500/50 hover:border-cyan-400 text-white transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span>Meet the Sages</span>
                    <span className="text-2xl">✨</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </Link>
            </div>

            <div
              className="flex items-center justify-center gap-8 pt-12 text-sm text-slate-400 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>300+ Active Sages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span>Real-time Collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Ethical by Design</span>
              </div>
            </div>
          </div>
        </section>
        {/* </CHANGE> */}

        <section className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-block px-6 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-sm font-medium mb-6">
                🎬 See SageSpace in Action
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Watch the Platform Demo
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Experience how 300 AI agents collaborate in real-time to solve complex challenges
              </p>
            </div>

            <div className="relative group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {/* Glowing border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-500 animate-pulse-slow" />

              {/* Video container */}
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl">
                {/* Video placeholder - Replace the src with your actual video URL */}
                <div className="relative aspect-video bg-black">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    poster="/sagespace-ai-platform-demo-thumbnail-with-cosmic-b.jpg"
                    preload="metadata"
                  >
                    <source src="/videos/sagespace-demo.mp4" type="video/mp4" />
                    <source src="/videos/sagespace-demo.webm" type="video/webm" />
                    {/* Fallback content */}
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">🎥</div>
                        <p className="text-slate-300 text-lg">
                          Your browser doesn't support video playback.
                          <br />
                          <a href="/videos/sagespace-demo.mp4" className="text-cyan-400 hover:underline">
                            Download the demo video
                          </a>
                        </p>
                      </div>
                    </div>
                  </video>

                  {/* Play button overlay (hidden when video plays) */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
                      <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Demo features showcase */}
                <div className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl group-hover/item:scale-110 transition-transform">
                        🧠
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1 group-hover/item:text-cyan-400 transition-colors">
                          Multi-Agent Deliberation
                        </h4>
                        <p className="text-sm text-slate-400">Watch sages collaborate on complex problems</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl group-hover/item:scale-110 transition-transform">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1 group-hover/item:text-purple-400 transition-colors">
                          Real-Time Processing
                        </h4>
                        <p className="text-sm text-slate-400">See instant insights from 300+ AI agents</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-xl group-hover/item:scale-110 transition-transform">
                        🎨
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1 group-hover/item:text-pink-400 transition-colors">
                          Intuitive Interface
                        </h4>
                        <p className="text-sm text-slate-400">Navigate seamlessly through the cosmos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats under video */}
            <div
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { value: "< 2 min", label: "Demo Length", icon: "⏱️" },
                { value: "8", label: "Key Features", icon: "✨" },
                { value: "300+", label: "AI Agents", icon: "🤖" },
                { value: "5", label: "Core Laws", icon: "⚖️" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-purple-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* </CHANGE> */}

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Meet Your AI Companions
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Each Sage brings unique expertise, ready to collaborate and evolve with you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {featuredSages.map((sage, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 hover:border-cyan-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 animate-float"
                style={{ animationDelay: sage.delay, animationDuration: `${3 + index}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-500" />

                <div className="relative z-10 text-center space-y-4">
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-500 inline-block group-hover:animate-bounce">
                    {sage.avatar}
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                    {sage.name}
                  </h3>
                  <p className="text-sm font-medium text-purple-400 uppercase tracking-wide">{sage.role}</p>
                  <p className="text-slate-400 leading-relaxed">{sage.description}</p>

                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Chat Now</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-bl-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-fade-in">
            <Link href="/marketplace">
              <Button
                size="lg"
                className="text-lg px-10 py-6 relative group overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transition-all duration-500 shadow-xl hover:shadow-purple-500/50 border-0"
              >
                <span className="relative z-10">Explore All 300 Sages</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </Button>
            </Link>
          </div>
        </section>
        {/* </CHANGE> */}

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Powered by the{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Five Laws
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every agent in SageSpace operates under ethical principles designed to serve humanity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "⚖️",
                title: "Human Primacy",
                description: "Humans remain at the center. AI agents augment and assist—never replace your judgment.",
                color: "cyan",
              },
              {
                icon: "🤖",
                title: "Autonomy",
                description:
                  "Agents operate independently within ethical boundaries, making intelligent decisions at scale.",
                color: "purple",
              },
              {
                icon: "👁️",
                title: "Transparency",
                description: "Every decision, every action is visible and explainable. No black boxes, only clarity.",
                color: "pink",
              },
              {
                icon: "🤝",
                title: "Harmony",
                description: "Agents collaborate seamlessly, creating synergy greater than the sum of their parts.",
                color: "cyan",
              },
              {
                icon: "⚡",
                title: "Equilibrium",
                description: "Balance innovation with responsibility. Progress with purpose. Power with ethics.",
                color: "purple",
              },
            ].map((law, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-500" />

                <div className="relative z-10 space-y-4">
                  <div className={`text-6xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {law.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {law.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{law.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* </CHANGE> */}

        <section className="container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10 animate-pulse" />

            <h2
              className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight animate-gradient"
              style={{ backgroundSize: "300% 300%" }}
            >
              Ready to Build Your Universe?
            </h2>
            <p className="text-2xl text-slate-300 max-w-2xl mx-auto">
              Join the next evolution of human-AI collaboration
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/playground">
                <Button
                  size="lg"
                  className="text-2xl px-16 py-10 relative group overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/50 border-0 hover:scale-110"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <span>Launch Hub</span>
                    <span className="text-3xl">🚀</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-2xl px-16 py-10 relative group overflow-hidden bg-black/50 backdrop-blur border-2 border-purple-500/50 hover:border-pink-400 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 border-0 hover:scale-110"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <span>Start Free Today</span>
                    <span className="text-3xl">✨</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        {/* </CHANGE> */}
      </main>
    </div>
  )
}
