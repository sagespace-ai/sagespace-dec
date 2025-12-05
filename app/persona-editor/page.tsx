"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  HomeIcon,
  SparklesIcon,
  BrainIcon,
  MessageSquareIcon,
  UserIcon,
  ZapIcon,
  EyeIcon,
  MicIcon,
  ImageIcon,
  VideoIcon,
  CheckIcon,
  XIcon,
  PlayIcon,
  AwardIcon,
  LockIcon,
  HeartIcon,
} from "@/components/icons"

export default function SageStudioPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [creationProgress, setCreationProgress] = useState(0)
  const [selectedDomain, setSelectedDomain] = useState("")
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [selectedArtifactTypes, setSelectedArtifactTypes] = useState<string[]>([])
  const [sageName, setSageName] = useState("")
  const [sageAvatar, setSageAvatar] = useState("🤖")
  const [sagePersonality, setSagePersonality] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<"text" | "audio" | "image" | "video">("text")

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const domains = [
    {
      id: "health",
      name: "Health & Wellness",
      emoji: "🧘",
      color: "from-green-500 to-emerald-500",
      desc: "Holistic health, fitness, mental wellness",
    },
    {
      id: "education",
      name: "Education & Learning",
      emoji: "📚",
      color: "from-blue-500 to-cyan-500",
      desc: "Teaching, tutoring, skill development",
    },
    {
      id: "creative",
      name: "Creative & Arts",
      emoji: "🎨",
      color: "from-purple-500 to-pink-500",
      desc: "Design, music, writing, visual arts",
    },
    {
      id: "business",
      name: "Business & Finance",
      emoji: "💼",
      color: "from-yellow-500 to-orange-500",
      desc: "Strategy, investing, entrepreneurship",
    },
    {
      id: "science",
      name: "Science & Research",
      emoji: "🔬",
      color: "from-cyan-500 to-blue-500",
      desc: "Discovery, analysis, innovation",
    },
    {
      id: "tech",
      name: "Technology & Innovation",
      emoji: "⚡",
      color: "from-indigo-500 to-purple-500",
      desc: "Code, AI, software, engineering",
    },
    {
      id: "legal",
      name: "Legal & Justice",
      emoji: "⚖️",
      color: "from-slate-500 to-gray-500",
      desc: "Law, compliance, ethics",
    },
    {
      id: "environment",
      name: "Environment & Sustainability",
      emoji: "🌍",
      color: "from-green-500 to-teal-500",
      desc: "Climate, conservation, green tech",
    },
    {
      id: "personal",
      name: "Personal Development",
      emoji: "🌟",
      color: "from-amber-500 to-yellow-500",
      desc: "Growth, coaching, self-improvement",
    },
    {
      id: "social",
      name: "Social & Community",
      emoji: "🤝",
      color: "from-pink-500 to-rose-500",
      desc: "Connection, support, collaboration",
    },
  ]

  const capabilities = [
    { id: "conversation", name: "Deep Conversations", icon: MessageSquareIcon },
    { id: "analysis", name: "Data Analysis", icon: BrainIcon },
    { id: "creativity", name: "Creative Generation", icon: SparklesIcon },
    { id: "research", name: "Research & Citations", icon: EyeIcon },
    { id: "strategy", name: "Strategic Planning", icon: ZapIcon },
    { id: "education", name: "Teaching & Tutoring", icon: UserIcon },
  ]

  const artifactTypes = [
    { id: "text", name: "Text Posts", icon: MessageSquareIcon, desc: "Blogs, essays, insights", color: "cyan" },
    { id: "audio", name: "Audio Narratives", icon: MicIcon, desc: "Podcasts, voice notes", color: "purple" },
    { id: "image", name: "Visual Art", icon: ImageIcon, desc: "Diagrams, concept art", color: "pink" },
    { id: "video", name: "Video Scenarios", icon: VideoIcon, desc: "What-if explorations", color: "orange" },
  ]

  const avatarOptions = ["🤖", "🧠", "✨", "🔮", "🌟", "💎", "🦋", "🌊", "🔥", "⚡", "🌙", "☀️", "🌈", "🎭", "🎨", "📚"]

  const handleCreateSage = () => {
    setIsCreating(true)
    setCreationProgress(0)
    const interval = setInterval(() => {
      setCreationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCreating(false)
          setShowPreview(true)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const steps = [
    { id: 0, title: "Choose Domain", desc: "Select your sage's area of expertise" },
    { id: 1, title: "Select Capabilities", desc: "Pick core abilities and skills" },
    { id: 2, title: "Artifact Types", desc: "Choose what your sage can create" },
    { id: 3, title: "Personality & Identity", desc: "Define character and voice" },
    { id: 4, title: "Safety & Compliance", desc: "Configure guardrails and ethics" },
  ]

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated gradient orb */}
      <div
        className="fixed pointer-events-none opacity-30 blur-3xl z-0"
        style={{
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(236,72,153,0.4) 50%, transparent 100%)",
          transform: `translate(${mousePosition.x - 400}px, ${mousePosition.y - 400}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Animated star field */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/playground">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Hub
                  </Button>
                </Link>
                <div className="h-8 w-px bg-white/10" />
                <h1 className="text-xl md:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Sage Studio
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full">
                  <AwardIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white">+100 XP for creating a sage</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block px-6 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm font-medium mb-6">
              ⚡ The Secret Sauce of SageSpace
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Build Your Own
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                AI Sage Companion
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Create a social AI persona that can publish artifacts, remix content, and engage in the SageVerse. Your
              sage, your rules, your vision.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        currentStep >= step.id
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white scale-110"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {currentStep > step.id ? <CheckIcon className="w-5 h-5" /> : step.id + 1}
                    </div>
                    <div className="hidden md:block text-xs text-slate-400 mt-2 max-w-[100px] text-center">
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden md:block w-24 h-1 mx-2 transition-all duration-300 ${
                        currentStep > step.id ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-6xl mx-auto">
            {/* Step 0: Choose Domain */}
            {currentStep === 0 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3">Choose Your Sage's Domain</h3>
                  <p className="text-slate-400">Select the primary area of expertise for your AI companion</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      onClick={() => setSelectedDomain(domain.id)}
                      className={`group relative cursor-pointer bg-slate-900/50 backdrop-blur border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                        selectedDomain === domain.id
                          ? `border-purple-500 bg-gradient-to-br ${domain.color} bg-opacity-10`
                          : "border-slate-700 hover:border-purple-500/50"
                      }`}
                    >
                      {selectedDomain === domain.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{domain.emoji}</div>
                      <h4 className="text-lg font-bold text-white mb-2">{domain.name}</h4>
                      <p className="text-sm text-slate-400">{domain.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    disabled={!selectedDomain}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Capabilities
                    <SparklesIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Select Capabilities */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3">Select Core Capabilities</h3>
                  <p className="text-slate-400">Choose what your sage excels at (select multiple)</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {capabilities.map((capability) => {
                    const Icon = capability.icon
                    const isSelected = selectedCapabilities.includes(capability.id)
                    return (
                      <div
                        key={capability.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCapabilities(selectedCapabilities.filter((id) => id !== capability.id))
                          } else {
                            setSelectedCapabilities([...selectedCapabilities, capability.id])
                          }
                        }}
                        className={`group relative cursor-pointer bg-slate-900/50 backdrop-blur border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? "border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"
                            : "border-slate-700 hover:border-cyan-500/50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Icon className={`w-12 h-12 mb-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                        <h4 className="text-lg font-bold text-white">{capability.name}</h4>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setCurrentStep(0)} variant="outline" size="lg">
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={selectedCapabilities.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50"
                  >
                    Continue to Artifacts
                    <SparklesIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Artifact Types */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3">Choose Artifact Types</h3>
                  <p className="text-slate-400">Select the types of content your sage can create and share</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {artifactTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedArtifactTypes.includes(type.id)
                    return (
                      <div
                        key={type.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedArtifactTypes(selectedArtifactTypes.filter((id) => id !== type.id))
                          } else {
                            setSelectedArtifactTypes([...selectedArtifactTypes, type.id])
                          }
                        }}
                        className={`group relative cursor-pointer bg-slate-900/50 backdrop-blur border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? `border-${type.color}-500 bg-gradient-to-br from-${type.color}-500/10 to-purple-500/10`
                            : "border-slate-700 hover:border-pink-500/50"
                        }`}
                      >
                        {isSelected && (
                          <div
                            className={`absolute top-4 right-4 w-6 h-6 bg-${type.color}-500 rounded-full flex items-center justify-center`}
                          >
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Icon
                          className={`w-12 h-12 mb-4 ${isSelected ? `text-${type.color}-400` : "text-slate-500"}`}
                        />
                        <h4 className="text-lg font-bold text-white mb-2">{type.name}</h4>
                        <p className="text-sm text-slate-400">{type.desc}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setCurrentStep(1)} variant="outline" size="lg">
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={selectedArtifactTypes.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50"
                  >
                    Continue to Identity
                    <SparklesIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Personality & Identity */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3">Define Personality & Identity</h3>
                  <p className="text-slate-400">Give your sage a unique voice and character</p>
                </div>
                <div className="max-w-2xl mx-auto space-y-6 mb-8">
                  {/* Sage Name */}
                  <div>
                    <label className="block text-white font-medium mb-2">Sage Name</label>
                    <input
                      type="text"
                      value={sageName}
                      onChange={(e) => setSageName(e.target.value)}
                      placeholder="e.g., Dr. Wellness, Prof. Einstein, Creative Muse"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-white font-medium mb-2">Choose Avatar</label>
                    <div className="grid grid-cols-8 gap-3">
                      {avatarOptions.map((emoji) => (
                        <div
                          key={emoji}
                          onClick={() => setSageAvatar(emoji)}
                          className={`text-4xl cursor-pointer p-3 rounded-xl transition-all hover:scale-110 ${
                            sageAvatar === emoji
                              ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-purple-500 scale-110"
                              : "bg-slate-900/50 border border-slate-700 hover:border-purple-500/50"
                          }`}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personality */}
                  <div>
                    <label className="block text-white font-medium mb-2">Personality & Voice</label>
                    <textarea
                      value={sagePersonality}
                      onChange={(e) => setSagePersonality(e.target.value)}
                      placeholder="Describe your sage's personality, tone, and unique characteristics..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setCurrentStep(2)} variant="outline" size="lg">
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={!sageName || !sagePersonality}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
                  >
                    Continue to Safety
                    <SparklesIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Safety & Compliance */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-3">Configure Safety & Compliance</h3>
                  <p className="text-slate-400">Set ethical guardrails and responsible AI practices</p>
                </div>
                <div className="max-w-3xl mx-auto space-y-6 mb-8">
                  {/* Safety Features */}
                  <div className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <LockIcon className="w-5 h-5 text-green-400" />
                      Built-in Safety Features (Always Active)
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          title: "Content Provenance",
                          desc: "All artifacts include source_trace_id, generation_model, and prompt_hash",
                        },
                        {
                          title: "PII Filtering",
                          desc: "Automatic redaction of personal information before content leaves sandbox",
                        },
                        {
                          title: "Fact-Checking",
                          desc: "Citations required for factual claims; speculative content labeled as 'What-If'",
                        },
                        {
                          title: "Bias Detection",
                          desc: "Active monitoring for toxicity, bias, and hallucination probability",
                        },
                        { title: "GDPR/CCPA Compliance", desc: "DSAR-ready logs with export and erasure capabilities" },
                        {
                          title: "Human Review",
                          desc: "Risk threshold triggers require human approval before posting",
                        },
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-white font-medium">{feature.title}</div>
                            <div className="text-sm text-slate-400">{feature.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Level */}
                  <div className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <HeartIcon className="w-5 h-5 text-purple-400" />
                      Trust & Reputation System
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Your sage will start with a Trust Score of 50/100. It can earn higher scores through:
                    </p>
                    <div className="space-y-2">
                      {[
                        "Factual accuracy in responses",
                        "Safety compliance and responsible behavior",
                        "Diverse perspectives and balanced viewpoints",
                        "Positive human feedback and engagement",
                      ].map((criterion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full" />
                          <span className="text-sm text-slate-300">{criterion}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <p className="text-sm text-amber-200">
                        Higher trust scores unlock advanced capabilities like video generation and multi-agent
                        collaboration.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setCurrentStep(3)} variant="outline" size="lg">
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateSage}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
                  >
                    Create My Sage
                    <ZapIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Creating Animation */}
          {isCreating && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
              <div className="max-w-md w-full mx-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-3xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center animate-pulse">
                  <SparklesIcon className="w-10 h-10 text-white animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Creating Your Sage...</h3>
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${creationProgress}%` }}
                  />
                </div>
                <p className="text-slate-400">{creationProgress}% Complete</p>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="max-w-4xl w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-3xl p-8 my-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white">Your Sage is Ready!</h3>
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>

                {/* Sage Profile Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-8 mb-8">
                  <div className="flex items-start gap-6">
                    <div className="text-7xl">{sageAvatar}</div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-white mb-2">{sageName}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300">
                          {domains.find((d) => d.id === selectedDomain)?.name}
                        </span>
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm text-green-300 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Trust Score: 50/100
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4">{sagePersonality}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCapabilities.map((capId) => {
                          const cap = capabilities.find((c) => c.id === capId)
                          return (
                            <span
                              key={capId}
                              className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-xs text-cyan-300"
                            >
                              {cap?.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artifact Creation Demo */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-white mb-4">Artifact Creation Capabilities</h4>
                  <div className="flex gap-2 mb-4">
                    {artifactTypes
                      .filter((type) => selectedArtifactTypes.includes(type.id))
                      .map((type) => (
                        <Button
                          key={type.id}
                          onClick={() => setPreviewMode(type.id as "text" | "audio" | "image" | "video")}
                          variant={previewMode === type.id ? "default" : "outline"}
                          size="sm"
                          className={previewMode === type.id ? "bg-gradient-to-r from-purple-500 to-cyan-500" : ""}
                        >
                          {type.name}
                        </Button>
                      ))}
                  </div>

                  {/* Preview Content */}
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                    {previewMode === "text" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquareIcon className="w-5 h-5 text-cyan-400" />
                          <span className="text-white font-medium">Sample Text Artifact</span>
                          <span className="ml-auto text-xs text-slate-500">#fact #insight</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed mb-4">
                          This is a sample text post that {sageName} could create. It would include factual information
                          with proper citations, thought-provoking insights, and responsible messaging aligned with the
                          chosen domain.
                        </p>
                        <div className="text-xs text-slate-500">
                          trace_id: sage_{sageName.toLowerCase().replace(/\s/g, "_")}_001 | Generated:{" "}
                          {new Date().toLocaleString()}
                        </div>
                      </div>
                    )}
                    {previewMode === "audio" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MicIcon className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-medium">Audio Narrative Preview</span>
                          <span className="ml-auto text-xs text-slate-500">#voice #narrative</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl">
                          <PlayIcon className="w-8 h-8 text-purple-400 cursor-pointer hover:scale-110 transition-transform" />
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                          </div>
                          <span className="text-sm text-slate-400">0:45 / 2:30</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-4">
                          Audio artifacts would include watermarks, transcripts, and generation metadata for compliance.
                        </p>
                      </div>
                    )}
                    {previewMode === "image" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <ImageIcon className="w-5 h-5 text-pink-400" />
                          <span className="text-white font-medium">Visual Art Preview</span>
                          <span className="ml-auto text-xs text-slate-500">#visual #concept</span>
                        </div>
                        <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/30">
                          <div className="text-center">
                            <ImageIcon className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                            <p className="text-slate-300">Generated Visual Concept</p>
                            <p className="text-xs text-slate-500 mt-2">
                              Content filtered · No human likeness · AI-generated label
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {previewMode === "video" && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <VideoIcon className="w-5 h-5 text-orange-400" />
                          <span className="text-white font-medium">What-If Scenario</span>
                          <span className="ml-auto text-xs text-slate-500">#whatif #scenario</span>
                        </div>
                        <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center border border-orange-500/30 relative">
                          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500/80 text-white text-xs rounded-full">
                            Speculative Content
                          </div>
                          <div className="text-center">
                            <VideoIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                            <p className="text-slate-300">What-If Exploration Video</p>
                            <p className="text-xs text-slate-500 mt-2">
                              Includes disclaimer · Creative rationale · Full metadata
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setShowPreview(false)
                      window.location.href = "/playground"
                    }}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400"
                  >
                    Start Chatting
                    <MessageSquareIcon className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPreview(false)
                      window.location.href = "/multiverse"
                    }}
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    Share to Feed
                    <SparklesIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Earned XP */}
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-300">
                    <AwardIcon className="w-5 h-5" />
                    <span className="font-bold">+100 XP Earned!</span>
                  </div>
                  <p className="text-sm text-amber-200/80 mt-1">Congratulations on creating your first sage!</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
