"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { SageSelectorPanel } from "@/components/sage-selector/SageSelectorPanel"
import type { SageSummary, SageMode } from "@/types/sage-selector"
import {
  EyeIcon,
  ScaleIcon,
  BrainIcon,
  HomeIcon,
  SendIcon,
  ZapIcon,
  ActivityIcon,
  TrendingUpIcon,
  UsersIcon,
  ShareIcon,
  XIcon,
  UserIcon,
  SparklesIcon, // Import SparklesIcon
} from "@/components/icons"
import {
  uploadImage,
  generateImage,
  startAudioRecording,
  stopAudioRecording,
  createQuest,
  type QuestCreationResult,
} from "@/lib/playground/multimodal"
import { CodeEditorModal } from "@/components/playground/CodeEditorModal"
import { QuestCreatorModal } from "@/components/playground/QuestCreatorModal"
import { PlaygroundToastContainer, usePlaygroundToast } from "@/components/playground/PlaygroundToast"

type MessageType = "text" | "image" | "video" | "audio" | "code" | "artifact" | "quest"

interface SageData {
  name: string
  emoji: string
  specialty: string
  color: string
  id: string
  auraColor?: string
  personality?: string
  tone?: string
}

interface MessageMetadata {
  questTitle?: string
  reward?: string
  difficulty?: string
  artifactType?: string
  shareLink?: string
  [key: string]: unknown
}

interface Message {
  role: string
  content: string
  timestamp: Date
  type?: MessageType
  metadata?: MessageMetadata
}

// Map playground Sage names to actual Sage template IDs
const SAGE_NAME_TO_ID: Record<string, string> = {
  "Dr. Wellness": "health-1",        // Wellness Coach
  "Prof. Einstein": "edu-1",         // Math Tutor (closest match)
  "Chef Gourmet": "creative-1",       // Writing Mentor (closest match)
  "Coach Alpha": "health-3",         // Fitness Trainer
  "Sage Harmony": "creative-1",       // Writing Mentor
  "Tech Wizard": "tech-1",            // Code Architect
  "Money Maven": "health-1",         // Default to Wellness Coach (no business sage found)
  "Word Smith": "creative-1",         // Writing Mentor
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedSage, setSelectedSage] = useState("Dr. Wellness")
  const [selectedSageCircle, setSelectedSageCircle] = useState<string[]>([])
  const [stats, setStats] = useState({
    messagesSent: 0,
    xpEarned: 0,
    currentStreak: 1,
    tokensUsed: 0,
  })
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareConfig, setShareConfig] = useState({
    title: "",
    selectedMessages: [] as number[],
    visibility: "public" as "public" | "followers" | "private",
    tags: [] as string[],
    newTag: "",
  })

  const [sageMode, setSageMode] = useState<SageMode>("single")

  // Toast notifications
  const { toasts, showSuccess, showError, showInfo, dismissToast } = usePlaygroundToast()

  // Multimodal state
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [showQuestCreator, setShowQuestCreator] = useState(false)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null)
  const [pendingCode, setPendingCode] = useState<{ code: string; language: string } | null>(null)

  // mood, isDiscovering, showMoodSelector, hologramActive, particles, recentSages, trendingSages
  // showSageBrowser, allSages, sageSearchQuery, quickSearchQuery, loadingAllSages
  // isSpinning, slotPositions, spinSpeed, spinMode, numSlots, sageOMaticPage

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hologramRef = useRef<HTMLDivElement>(null) // Keep hologramRef for potential future use or if it's still referenced elsewhere
  const router = useRouter()
  
  // Audio recording refs
  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  const sages: SageData[] = [
    {
      name: "Dr. Wellness",
      emoji: "🧘",
      specialty: "Health & Mindfulness",
      color: "from-emerald-500 to-teal-500",
      auraColor: "rgba(16, 185, 129, 0.3)",
      personality: "Calm & Nurturing",
      tone: "Supportive",
      id: "1",
    },
    {
      name: "Prof. Einstein",
      emoji: "🔬",
      specialty: "Science & Research",
      color: "from-blue-500 to-cyan-500",
      auraColor: "rgba(59, 130, 246, 0.3)",
      personality: "Analytical & Curious",
      tone: "Educational",
      id: "2",
    },
    {
      name: "Chef Gourmet",
      emoji: "👨‍🍳",
      specialty: "Culinary Arts",
      color: "from-orange-500 to-red-500",
      auraColor: "rgba(249, 115, 22, 0.3)",
      personality: "Passionate & Creative",
      tone: "Enthusiastic",
      id: "3",
    },
    {
      name: "Coach Alpha",
      emoji: "💪",
      specialty: "Fitness & Athletics",
      color: "from-purple-500 to-pink-500",
      auraColor: "rgba(168, 85, 247, 0.3)",
      personality: "Motivating & Energetic",
      tone: "Inspiring",
      id: "4",
    },
    {
      name: "Sage Harmony",
      emoji: "🎨",
      specialty: "Creative Arts",
      color: "from-yellow-500 to-amber-500",
      auraColor: "rgba(234, 179, 8, 0.3)",
      personality: "Imaginative & Expressive",
      tone: "Artistic",
      id: "5",
    },
    {
      name: "Tech Wizard",
      emoji: "🧙‍♂️",
      specialty: "Technology & AI",
      color: "from-indigo-500 to-purple-500",
      auraColor: "rgba(99, 102, 241, 0.3)",
      personality: "Innovative & Logical",
      tone: "Technical",
      id: "6",
    },
    {
      name: "Money Maven",
      emoji: "💰",
      specialty: "Finance & Business",
      color: "from-green-500 to-emerald-500",
      auraColor: "rgba(34, 197, 94, 0.3)",
      personality: "Strategic & Pragmatic",
      tone: "Professional",
      id: "7",
    },
    {
      name: "Word Smith",
      emoji: "📝",
      specialty: "Writing & Literature",
      color: "from-pink-500 to-rose-500",
      auraColor: "rgba(236, 72, 153, 0.3)",
      personality: "Eloquent & Thoughtful",
      tone: "Literary",
      id: "8",
    },
  ]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSageSelected = (sage: SageSummary | SageSummary[]) => {
    if (Array.isArray(sage)) {
      const primary = sage[0]
      setSelectedSage(primary.name)
      setSelectedSageCircle(sage.map((s) => s.name))
    } else {
      setSelectedSage(sage.name)
      setSelectedSageCircle([])
    }
  }

  const handleStartSession = (mode: SageMode, sages: SageSummary | SageSummary[]) => {
    setSageMode(mode)
    handleSageSelected(sages)
  }

  const consultCircle = () => {
    const lastMessage = messages[messages.length - 1]?.content || input
    if (lastMessage) {
      router.push(`/council?query=${encodeURIComponent(lastMessage)}`)
    } else {
      router.push("/council")
    }
  }

  const openShareModal = () => {
    setShareConfig({
      title: messages.length > 0 ? `Conversation with ${selectedSage}` : "",
      selectedMessages: messages.map((_, i) => i), // Select all by default
      visibility: "public",
      tags: [],
      newTag: "",
    })
    setShowShareModal(true)
  }

  const toggleMessageSelection = (index: number) => {
    setShareConfig((prev) => ({
      ...prev,
      selectedMessages: prev.selectedMessages.includes(index)
        ? prev.selectedMessages.filter((i) => i !== index)
        : [...prev.selectedMessages, index].sort((a, b) => a - b),
    }))
  }

  const addTag = () => {
    if (shareConfig.newTag && !shareConfig.tags.includes(shareConfig.newTag)) {
      setShareConfig((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.toLowerCase()],
        newTag: "",
      }))
    }
  }

  const removeTag = (tag: string) => {
    setShareConfig((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const shareToFeed = () => {
    // In real app, this would POST to /api/feed
    console.log("[v0] Sharing to feed:", {
      title: shareConfig.title,
      messages: shareConfig.selectedMessages.map((i) => messages[i]),
      visibility: shareConfig.visibility,
      tags: shareConfig.tags,
      sage: selectedSage,
    })

    // Show success and close modal
    alert(`🎉 Shared to The Feed! Your wisdom is now helping others. +50 XP earned!`)
    setStats((prev) => ({ ...prev, xpEarned: prev.xpEarned + 50 }))
    setShowShareModal(false)
  }

  // Multimodal button handlers
  const handleImageClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          setPendingImage(file)
          const result = await uploadImage(file)
          // Store image URL for preview and attachment
          setPendingImageUrl(result.url)
          setInput((prev) => `${prev} [Image: ${file.name}]`.trim())
          showSuccess(`Image "${file.name}" ready to send`, 3000)
          console.log("[playground] Image uploaded:", result.url)
        } catch (error) {
          console.error("[playground] Image upload failed:", error)
          const errorMsg = "Failed to upload image. Please try again."
          setError(errorMsg)
          showError(errorMsg)
        } finally {
          setPendingImage(null)
        }
      }
    }
    input.click()
  }

  const handleRemoveImage = () => {
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl)
    }
    setPendingImageUrl(null)
    setPendingImage(null)
    setInput((prev) => prev.replace(/\[Image:.*?\]/g, "").trim())
  }

  const handleCodeClick = () => {
    setShowCodeEditor(true)
  }

  const handleCodeSave = (code: string, language: string) => {
    setPendingCode({ code, language })
    setInput((prev) => `${prev}\n\`\`\`${language}\n${code}\n\`\`\``.trim())
    showSuccess(`${language.toUpperCase()} code ready to send`, 3000)
    console.log("[playground] Code saved:", { code, language })
  }

  const handleRemoveCode = () => {
    setPendingCode(null)
    setInput((prev) => prev.replace(/```[\s\S]*?```/g, "").trim())
  }

  const handleQuestCreate = async (quest: QuestCreationResult) => {
    try {
      const questId = await createQuest(quest)
      setInput((prev) => `${prev} [Quest: ${quest.title}]`.trim())
      showSuccess(`Quest "${quest.title}" created!`, 3000)
      console.log("[playground] Quest created:", questId)
    } catch (error) {
      console.error("[playground] Quest creation failed:", error)
      const errorMsg = "Failed to create quest. Please try again."
      setError(errorMsg)
      showError(errorMsg)
    }
  }

  const handleAcceptQuest = async (questId: string, questTitle: string, rewardXp: number = 100) => {
    try {
      const response = await fetch("/api/quests/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId,
          conversationId: currentConversationId,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || "Failed to accept quest")
      }

      // Update quest status in the message metadata
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.type === "quest" && msg.metadata?.quests) {
            const updatedQuests = (msg.metadata.quests as Array<{ id: string; status?: string }>).map((q) =>
              q.id === questId ? { ...q, status: "accepted" } : q
            )
            return {
              ...msg,
              metadata: { ...msg.metadata, quests: updatedQuests },
            }
          }
          if (msg.type === "quest" && msg.metadata?.questId === questId) {
            return {
              ...msg,
              metadata: { ...msg.metadata, status: "accepted" },
            }
          }
          return msg
        })
      )

      // Award XP
      setStats((prev) => ({
        ...prev,
        xpEarned: prev.xpEarned + rewardXp,
      }))

      showSuccess(`Quest "${questTitle}" accepted! +${rewardXp} XP`, 4000)
      console.log("[playground] Quest accepted:", questId)
    } catch (error) {
      console.error("[playground] Quest acceptance failed:", error)
      const errorMsg = "Failed to accept quest. Please try again."
      setError(errorMsg)
      showError(errorMsg)
    }
  }

  const handleAudioClick = async () => {
    if (isRecordingAudio) {
      // Stop recording
      if (audioRecorderRef.current && audioStreamRef.current) {
        try {
          const result = await stopAudioRecording(audioRecorderRef.current, audioStreamRef.current)
          setPendingAudioUrl(result.url)
          setInput((prev) => `${prev} [Audio recorded]`.trim())
          showSuccess("Audio recorded and ready to send", 3000)
          console.log("[playground] Audio recorded:", result.url)
        } catch (error) {
          console.error("[playground] Audio recording failed:", error)
          setError("Failed to record audio. Please try again.")
        } finally {
          setIsRecordingAudio(false)
          audioRecorderRef.current = null
          audioStreamRef.current = null
        }
      }
    } else {
      // Start recording
      try {
        const { recorder, stream } = await startAudioRecording()
        audioRecorderRef.current = recorder
        audioStreamRef.current = stream
        recorder.start()
        setIsRecordingAudio(true)
        showInfo("Recording started... Click again to stop", 2000)
      } catch (error) {
        console.error("[playground] Failed to start recording:", error)
        setError(error instanceof Error ? error.message : "Failed to start audio recording.")
      }
    }
  }

  const handleRemoveAudio = () => {
    if (pendingAudioUrl) {
      URL.revokeObjectURL(pendingAudioUrl)
    }
    setPendingAudioUrl(null)
    setInput((prev) => prev.replace(/\[Audio recorded\]/g, "").trim())
  }

  const handleQuestClick = () => {
    setShowQuestCreator(true)
  }

  const handleReset = () => {
    setLoading(false)
    setError(null)
    // Optionally clear input
    // setInput("")
  }

  // Loading timeout effect
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn("[playground] Loading timeout - resetting state")
        setLoading(false)
        setError("Request timed out. Please try again.")
      }, 30000) // 30 second timeout

      return () => clearTimeout(timeout)
    }
  }, [loading])

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImageUrl && !pendingAudioUrl && !pendingCode) || loading) return

    // Build message with attachments
    const messageContent = input
    const attachments: { image?: string; audio?: string; code?: { code: string; language: string } } = {}
    
    if (pendingImageUrl) attachments.image = pendingImageUrl
    if (pendingAudioUrl) attachments.audio = pendingAudioUrl
    if (pendingCode) attachments.code = pendingCode

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      type: pendingImageUrl ? "image" : pendingCode ? "code" : pendingAudioUrl ? "audio" : "text",
      metadata: attachments,
    }
    
    setMessages((prev) => [...prev, userMessage])
    
    // Clear input and attachments
    setInput("")
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl)
      setPendingImageUrl(null)
    }
    if (pendingAudioUrl) {
      URL.revokeObjectURL(pendingAudioUrl)
      setPendingAudioUrl(null)
    }
    setPendingCode(null)
    setPendingImage(null)
    
    setLoading(true)
    setError(null)

    setStats((prev) => ({
      ...prev,
      messagesSent: prev.messagesSent + 1,
      tokensUsed: prev.tokensUsed + messageContent.length,
    }))

    try {
      // Map Sage name to template ID
      const personaId = SAGE_NAME_TO_ID[selectedSage] || "health-1" // Default to Wellness Coach

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,                    // ✅ Use correct field name and template ID
          userMessage: messageContent,   // ✅ Send just the new message
          conversationId: currentConversationId || undefined, // ✅ Track conversation
        }),
      })

      const data = await response.json()

      // Check for errors
      if (!data.ok) {
        const errorMsg = data.error || "Failed to get response from Sage"
        
        // If conversation not found, clear the stale ID and retry
        if (errorMsg.includes("Conversation not found") && currentConversationId) {
          console.warn("[playground] Stale conversation ID, clearing and will retry on next message")
          setCurrentConversationId(null)
          setError(null) // Clear error so user can retry
          showInfo("Starting a new conversation...", 2000)
        } else {
          setError(errorMsg)
          showError(errorMsg)
        }
        
        setLoading(false)
        // Remove the user message we optimistically added
        setMessages((prev) => prev.slice(0, -1))
        return
      }

      // Extract assistant message from correct response format
      const assistantContent = data.data?.assistantMessage || ""
      
      if (!assistantContent) {
        setError("Received empty response from Sage")
        setLoading(false)
        setMessages((prev) => prev.slice(0, -1))
        return
      }

      // Update conversation ID if this is a new conversation
      if (data.data?.conversationId && !currentConversationId) {
        setCurrentConversationId(data.data.conversationId)
      }

      const messageData: Message = {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        type: "text",
      }

      // Check if agent created artifacts or quests
      const createdArtifacts = data.data?.artifacts || []
      const createdQuests = data.data?.quests || []
      const agentOutput = data.data?.agentOutput

      // If agent created artifacts, mark message as artifact type
      if (createdArtifacts.length > 0) {
        messageData.type = "artifact"
        messageData.metadata = {
          artifactType: createdArtifacts[0].name,
          artifacts: createdArtifacts,
          shareLink: `/artifacts/${createdArtifacts[0].id}`,
        }
      }

      // If agent created quests, mark message as quest type
      if (createdQuests.length > 0) {
        messageData.type = "quest"
        messageData.metadata = {
          questTitle: createdQuests[0].title,
          quests: createdQuests,
          reward: `+${createdQuests[0].rewardXp || 100} XP`,
          difficulty: "Medium",
        }
      }

      // Check if response contains special content (fallback detection)
      if (!messageData.metadata && assistantContent.includes("```")) {
        messageData.type = "code"
      } else if (
        !messageData.metadata &&
        (assistantContent.toLowerCase().includes("quest") ||
          assistantContent.toLowerCase().includes("challenge"))
      ) {
        messageData.type = "quest"
        messageData.metadata = {
          questTitle: "Learning Quest",
          reward: "+50 XP",
          difficulty: "Medium",
        }
      } else if (
        !messageData.metadata &&
        (assistantContent.toLowerCase().includes("artifact") ||
          assistantContent.toLowerCase().includes("created"))
      ) {
        messageData.type = "artifact"
        messageData.metadata = {
          artifactType: "Knowledge Card",
          shareLink: `/artifacts/${Date.now()}`,
        }
      }

      setMessages((prev) => [...prev, messageData])

      // Show notification if agent created content
      if (createdArtifacts.length > 0 || createdQuests.length > 0) {
        const notifications = []
        if (createdArtifacts.length > 0) {
          const msg = `${createdArtifacts.length} artifact${createdArtifacts.length > 1 ? "s" : ""} created by ${selectedSage}!`
          notifications.push(msg)
          showSuccess(msg, 5000)
        }
        if (createdQuests.length > 0) {
          const msg = `${createdQuests.length} quest${createdQuests.length > 1 ? "s" : ""} created by ${selectedSage}!`
          notifications.push(msg)
          showSuccess(msg, 5000)
        }
        console.log("[playground] Agent created:", notifications.join(", "))
      }

      // Update stats with actual values from API if available
      if (data.data?.tokens) {
        setStats((prev) => ({
          ...prev,
          tokensUsed: prev.tokensUsed + (data.data.tokens.input || 0) + (data.data.tokens.output || 0),
          xpEarned: prev.xpEarned + 10, // Base XP per message
        }))
      } else {
        setStats((prev) => ({
          ...prev,
          xpEarned: prev.xpEarned + 10,
        }))
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMsg = "Network error. Please check your connection and try again."
      setError(errorMsg)
      showError(errorMsg)
      // Remove the user message we optimistically added
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      // Guarantee loading is reset
      setLoading(false)
    }
  }

  const currentSage = sages.find((s) => s.name === selectedSage) || sages[0]
  // const recommended = getRecommendedSages() // Removed as getRecommendedSages is removed

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Cosmic background */}
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
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Playground
                </h1>
              </div>

              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <ZapIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-white">{stats.xpEarned} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                  <ActivityIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-white">{stats.messagesSent} Msgs</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <TrendingUpIcon className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-medium text-white">{stats.currentStreak}🔥 Streak</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/observatory">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/council">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-purple-400">
                    <ScaleIcon className="w-4 h-4" />
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

        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* SAGE-O-MATIC Sidebar */}
            <aside className="lg:col-span-1">
              <Card
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 flex flex-col"
                style={{ minHeight: "calc(100vh - 180px)" }}
              >
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="relative inline-block">
                    <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                      SAGE-O-MATIC
                    </h2>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Your Portal to the Sage Multiverse</p>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                  <SageSelectorPanel onSageSelected={handleSageSelected} onStartSession={handleStartSession} />
                </div>
              </Card>
            </aside>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ minHeight: "calc(100vh - 180px)" }}
              >
                <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b border-purple-500/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl relative">
                        {currentSage.emoji}
                        <div
                          className="absolute -inset-2 rounded-full animate-pulse"
                          style={{ boxShadow: `0 0 20px ${currentSage.auraColor}` }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          {selectedSage}
                          {sageMode !== "single" && (
                            <span className="text-xs px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded">
                              {sageMode === "circle" && `+ ${selectedSageCircle.length - 1} more`}
                              {sageMode === "duel" && "DUEL MODE"}
                              {sageMode === "council" && `${selectedSageCircle.length} COUNCIL`}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span>Online & Ready • {currentSage.specialty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sageMode !== "council" && (
                        <Button
                          onClick={consultCircle}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white transition-all duration-300 hover:scale-105"
                        >
                          <UsersIcon className="w-4 h-4 mr-2" />
                          <span className="hidden md:inline">Consult Council</span>
                          <span className="md:hidden">Council</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Messages with rich multimodal cards */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: "thin" }}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                      <div className="text-6xl mb-6 animate-bounce relative">
                        {currentSage.emoji}
                        <div
                          className="absolute -inset-0 blur-2xl animate-pulse"
                          style={{ background: currentSage.auraColor }}
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {sageMode === "single" && `Ready to Chat with ${selectedSage}?`}
                        {sageMode === "circle" && `Your Sage Circle is Assembled`}
                        {sageMode === "duel" && `Let the Sage Duel Begin`}
                        {sageMode === "council" && `The Council Awaits Your Question`}
                      </h3>
                      <p className="text-slate-400 max-w-md mb-6">
                        {sageMode === "single" &&
                          `Ask me anything about ${currentSage.specialty}. I'm here to help you learn and grow!`}
                        {sageMode === "circle" &&
                          `Get diverse perspectives from multiple sages working together to solve your challenges.`}
                        {sageMode === "duel" &&
                          `Watch two expert sages debate and compete to give you the best insights.`}
                        {sageMode === "council" &&
                          `Harness the collective wisdom of the sage council for deep, multi-perspective reasoning.`}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                        <button
                          onClick={() => setInput("Tell me about your expertise")}
                          className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-left transition-all duration-300 hover:scale-105"
                        >
                          <div className="text-sm font-medium text-white mb-1">💡 Get Started</div>
                          <div className="text-xs text-slate-400">Tell me about your expertise</div>
                        </button>
                        <button
                          onClick={() => setInput("What can you help me with today?")}
                          className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-left transition-all duration-300 hover:scale-105"
                        >
                          <div className="text-sm font-medium text-white mb-1">🎯 Quick Help</div>
                          <div className="text-xs text-slate-400">What can you help me with today?</div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up group`}
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 text-white ml-auto"
                                : "bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-purple-500/30 text-white"
                            } backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300`}
                          >
                            {/* Message Header */}
                            <div
                              className={`px-4 pt-3 pb-2 flex items-center justify-between border-b ${msg.role === "user" ? "border-cyan-500/20" : "border-purple-500/20"}`}
                            >
                              <div className="flex items-center gap-3">
                                {msg.role === "assistant" && (
                                  <div className="relative">
                                    <div className="text-3xl">{currentSage.emoji}</div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full animate-pulse" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-sm">
                                    {msg.role === "user" ? "You" : currentSage.name}
                                  </div>
                                  <div className="text-xs text-slate-400 flex items-center gap-2">
                                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    {msg.type && msg.type !== "text" && (
                                      <span className="px-2 py-1 bg-purple-500/30 rounded text-xs">
                                        {msg.type === "code" && "📝 Code"}
                                        {msg.type === "quest" && "🎯 Quest"}
                                        {msg.type === "artifact" && "✨ Artifact"}
                                        {msg.type === "image" && "🖼️ Image"}
                                        {msg.type === "video" && "🎥 Video"}
                                        {msg.type === "audio" && "🎵 Audio"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {msg.role === "user" && (
                                  <div className="ml-auto">
                                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                                      <UserIcon className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              {msg.role === "assistant" && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="React"
                                  >
                                    ❤️
                                  </button>
                                  <button
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Bookmark"
                                  >
                                    🔖
                                  </button>
                                  <button
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Share"
                                  >
                                    <ShareIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Message Content */}
                            <div className="p-4">
                              {msg.type === "text" || !msg.type ? (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              ) : msg.type === "code" ? (
                                <div className="space-y-3">
                                  <p className="text-sm leading-relaxed mb-3">{msg.content.split("```")[0]}</p>
                                  <div className="bg-black/50 border border-cyan-500/30 rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/30">
                                      <span className="text-xs text-cyan-400 font-mono">Code</span>
                                      <button
                                        onClick={() => {
                                          const codeText = msg.content.split("```")[1]?.split("```")[0] || msg.content
                                          navigator.clipboard.writeText(codeText).then(() => {
                                            showSuccess("Code copied to clipboard!", 2000)
                                          }).catch(() => {
                                            showError("Failed to copy code")
                                          })
                                        }}
                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                    <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
                                      {msg.content.split("```")[1]?.split("```")[0] || msg.content}
                                    </pre>
                                  </div>
                                </div>
                              ) : msg.type === "quest" ? (
                                <div className="space-y-3">
                                  <p className="text-sm leading-relaxed mb-3">{msg.content}</p>
                                  {msg.metadata?.quests && Array.isArray(msg.metadata.quests) ? (
                                    // Multiple quests created
                                    <div className="space-y-2">
                                      {msg.metadata.quests.map((quest: { id: string; title: string; rewardXp?: number; status?: string }) => {
                                        const isAccepted = quest.status === "accepted"
                                        return (
                                          <div
                                            key={quest.id}
                                            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-4"
                                          >
                                            <div className="flex items-start justify-between mb-3">
                                              <div>
                                                <div className="text-lg font-bold text-yellow-400 mb-1">
                                                  🎯 {quest.title}
                                                </div>
                                                <div className="text-xs text-slate-400">Quest created by {selectedSage}</div>
                                              </div>
                                              <div className="text-sm font-bold text-yellow-400">
                                                +{quest.rewardXp || 100} XP
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => handleAcceptQuest(quest.id, quest.title, quest.rewardXp || 100)}
                                              className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                              disabled={isAccepted}
                                            >
                                              {isAccepted ? "✓ Quest Accepted" : "Accept Quest"}
                                            </button>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    // Single quest (fallback)
                                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <div className="text-lg font-bold text-yellow-400 mb-1">
                                            🎯 {msg.metadata?.questTitle || "New Quest Unlocked!"}
                                          </div>
                                          <div className="text-xs text-slate-400">
                                            Difficulty: {msg.metadata?.difficulty || "Medium"}
                                          </div>
                                        </div>
                                        <div className="text-sm font-bold text-yellow-400">
                                          {msg.metadata?.reward || "+50 XP"}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          // Extract quest info from metadata
                                          const questId: string = (typeof msg.metadata?.questId === "string" ? msg.metadata.questId : null) || `quest-${Date.now()}`
                                          const questTitle: string = (typeof msg.metadata?.questTitle === "string" ? msg.metadata.questTitle : null) || "Quest"
                                          // Parse reward XP from string like "+50 XP" or number
                                          let rewardXp = 100
                                          if (typeof msg.metadata?.reward === "string") {
                                            const match = msg.metadata.reward.match(/\d+/)
                                            rewardXp = match ? parseInt(match[0]) : 100
                                          } else if (typeof msg.metadata?.reward === "number") {
                                            rewardXp = msg.metadata.reward
                                          }
                                          handleAcceptQuest(questId, questTitle, rewardXp)
                                        }}
                                        className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={msg.metadata?.status === "accepted"}
                                      >
                                        {msg.metadata?.status === "accepted" ? "✓ Quest Accepted" : "Accept Quest"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : msg.type === "artifact" ? (
                                <div className="space-y-3">
                                  <p className="text-sm leading-relaxed mb-3">{msg.content}</p>
                                  {msg.metadata?.artifacts && Array.isArray(msg.metadata.artifacts) ? (
                                    // Multiple artifacts created
                                    <div className="space-y-2">
                                      {msg.metadata.artifacts.map((artifact: { id: string; name: string }) => (
                                        <div
                                          key={artifact.id}
                                          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-4"
                                        >
                                          <div className="flex items-center gap-3 mb-3">
                                            <div className="text-3xl">✨</div>
                                            <div className="flex-1">
                                              <div className="font-bold text-purple-400">{artifact.name}</div>
                                              <div className="text-xs text-slate-400">Artifact created by {selectedSage}</div>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleViewArtifact(artifact.id, artifact.name)}
                                              className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm transition-all"
                                            >
                                              View Artifact
                                            </button>
                                            <button
                                              onClick={() => handleShareArtifact(artifact.id)}
                                              className="flex-1 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-sm transition-all"
                                            >
                                              Share
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    // Single artifact (fallback)
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="text-3xl">✨</div>
                                        <div className="flex-1">
                                          <div className="font-bold text-purple-400">
                                            {msg.metadata?.artifactType || "Artifact Created"}
                                          </div>
                                          <div className="text-xs text-slate-400">Saved to your knowledge vault</div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            const artifactId = msg.metadata?.shareLink?.split("/").pop() || `artifact-${Date.now()}`
                                            handleViewArtifact(artifactId, msg.metadata?.artifactType as string || "Artifact")
                                          }}
                                          className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm transition-all"
                                        >
                                          View Artifact
                                        </button>
                                        <button
                                          onClick={() => {
                                            const artifactId = msg.metadata?.shareLink?.split("/").pop() || `artifact-${Date.now()}`
                                            handleShareArtifact(artifactId)
                                          }}
                                          className="flex-1 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-sm transition-all"
                                        >
                                          Share
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null}

                              {/* XP Notification */}
                              {msg.role === "assistant" && i === messages.length - 1 && (
                                <div className="mt-3 pt-3 border-t border-purple-500/20">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-yellow-400">
                                      <ZapIcon className="w-3 h-3" />
                                      <span>+10 XP earned</span>
                                    </div>
                                    <div className="text-slate-400">{stats.messagesSent} messages today</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Enhanced loading state with sage thinking animation */}
                      {loading && (
                        <div className="flex justify-start animate-slide-up">
                          <div className="max-w-[85%] rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-purple-500/30 backdrop-blur-sm shadow-2xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="text-3xl animate-bounce">{currentSage.emoji}</div>
                                <div className="absolute inset-0 animate-ping opacity-20">{currentSage.emoji}</div>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-white mb-1">
                                  {currentSage.name} is thinking...
                                </div>
                                <div className="flex gap-1">
                                  {[0, 1, 2].map((i) => (
                                    <div
                                      key={i}
                                      className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-bounce"
                                      style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Enhanced input area with multimodal hints */}
                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-t-2 border-purple-500/30 p-4">
                  {/* Multimodal input hints */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-500/20">
                    <div className="text-xs text-slate-400 mr-2">Add:</div>
                    <button
                      onClick={handleImageClick}
                      disabled={loading}
                      title="Upload or generate an image"
                      className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-xs text-purple-300 transition-all hover:scale-105 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🖼️ Image
                    </button>
                    <button
                      onClick={handleCodeClick}
                      disabled={loading}
                      title="Insert code snippet"
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-xs text-cyan-300 transition-all hover:scale-105 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📝 Code
                    </button>
                    <button
                      onClick={handleAudioClick}
                      disabled={loading}
                      title={isRecordingAudio ? "Stop recording" : "Record or upload audio"}
                      className={`px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 rounded-lg text-xs text-pink-300 transition-all hover:scale-105 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${isRecordingAudio ? "animate-pulse" : ""}`}
                    >
                      {isRecordingAudio ? "⏹️ Stop" : "🎵 Audio"}
                    </button>
                    <button
                      onClick={handleQuestClick}
                      disabled={loading}
                      title="Create a learning quest"
                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-xs text-yellow-300 transition-all hover:scale-105 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🎯 Quest
                    </button>
                    <div className="ml-auto text-xs text-slate-500 italic">Ask for images, code, quests & more!</div>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      value={input}
                      onChange={(e) => {
                        // Clear any error when user starts typing
                        if (error) {
                          setError(null)
                        }
                        setInput(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          if (!loading) {
                            sendMessage()
                          }
                        }
                      }}
                      placeholder={
                        loading
                          ? "Waiting for Sage response..."
                          : `Ask ${sageMode === "single" ? selectedSage : "your sages"} anything...`
                      }
                      className={`flex-1 bg-slate-800/80 border-2 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 transition-all ${
                        loading ? "opacity-50 cursor-wait" : ""
                      }`}
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-purple-500/50 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 relative"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs">Thinking...</span>
                        </div>
                      ) : (
                        <SendIcon className="w-5 h-5" />
                      )}
                    </Button>
                    {(error || loading) && (
                      <Button
                        onClick={handleReset}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-slate-400 hover:text-slate-300 text-xs"
                        title="Reset/Cancel"
                      >
                        {loading ? "Cancel" : "Clear"}
                      </Button>
                    )}
                  </div>
                  {error && (
                    <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center justify-between">
                      <span>{error}</span>
                      <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                    <div>Press Enter to send • Shift+Enter for new line</div>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <ZapIcon className="w-3 h-3" />
                      <span className="font-semibold">+10 XP per message</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShareIcon className="w-6 h-6 text-pink-400" />
                    Share Your Wisdom
                  </h2>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-slate-300 text-sm">
                  Choose what to share, add context, and inspire others in The Feed. Earn XP and recognition! 🌟
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Title Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white mb-2">Conversation Title *</label>
                  <Input
                    value={shareConfig.title}
                    onChange={(e) => setShareConfig((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., How I built a sustainable morning routine"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Make it catchy to attract more engagement!</p>
                </div>

                {/* Privacy Settings */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white mb-3">Who can see this?</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setShareConfig((prev) => ({ ...prev, visibility: "public" }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        shareConfig.visibility === "public"
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 shadow-lg"
                          : "bg-slate-800/50 border-slate-600 hover:border-green-500/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">🌍</div>
                      <div className="font-semibold text-white text-sm">Public</div>
                      <div className="text-xs text-slate-400 mt-1">Everyone can see & learn</div>
                    </button>
                    <button
                      onClick={() => setShareConfig((prev) => ({ ...prev, visibility: "followers" }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        shareConfig.visibility === "followers"
                          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500 shadow-lg"
                          : "bg-slate-800/50 border-slate-600 hover:border-blue-500/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <div className="font-semibold text-white text-sm">Followers</div>
                      <div className="text-xs text-slate-400 mt-1">Only your followers</div>
                    </button>
                    <button
                      onClick={() => setShareConfig((prev) => ({ ...prev, visibility: "private" }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        shareConfig.visibility === "private"
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 shadow-lg"
                          : "bg-slate-800/50 border-slate-600 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">🔒</div>
                      <div className="font-semibold text-white text-sm">Private</div>
                      <div className="text-xs text-slate-400 mt-1">Just for you</div>
                    </button>
                  </div>
                </div>

                {/* Message Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-white">
                      Select Messages to Share ({shareConfig.selectedMessages.length}/{messages.length})
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setShareConfig((prev) => ({ ...prev, selectedMessages: messages.map((_, i) => i) }))
                        }
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setShareConfig((prev) => ({ ...prev, selectedMessages: [] }))}
                        className="text-xs text-slate-400 hover:text-slate-300"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto bg-slate-800/30 rounded-xl p-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        onClick={() => toggleMessageSelection(i)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          shareConfig.selectedMessages.includes(i)
                            ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg"
                            : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={shareConfig.selectedMessages.includes(i)}
                            onChange={() => {}}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {msg.role === "user" ? (
                                <UserIcon className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <span className="text-lg">{sages.find((s) => s.name === selectedSage)?.emoji}</span>
                              )}
                              <span className="text-xs font-semibold text-white">
                                {msg.role === "user" ? "You" : selectedSage}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    💡 Tip: Remove sensitive or personal information for privacy
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Add Tags (helps others discover your conversation)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={shareConfig.newTag}
                      onChange={(e) => setShareConfig((prev) => ({ ...prev, newTag: e.target.value }))}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      placeholder="e.g., productivity, wellness, coding"
                      className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                    <Button
                      onClick={addTag}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400"
                    >
                      Add
                    </Button>
                  </div>
                  {shareConfig.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {shareConfig.tags.map((tag) => (
                        <span key={tag} className="text-xs text-purple-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <EyeIcon className="w-4 h-4 text-cyan-400" />
                    Preview
                  </h3>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-2">{shareConfig.title || "Untitled Conversation"}</h4>
                    <p className="text-sm text-slate-400 mb-2">
                      {shareConfig.selectedMessages.length} messages • {shareConfig.visibility} • with {selectedSage}
                    </p>
                    {shareConfig.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {shareConfig.tags.map((tag) => (
                          <span key={tag} className="text-xs text-purple-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    <SparklesIcon className="w-4 h-4 inline text-yellow-400 mr-1" />
                    Earn +50 XP by sharing valuable conversations!
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowShareModal(false)}
                      className="bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 text-white transition-all duration-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={shareToFeed}
                      disabled={!shareConfig.title || shareConfig.selectedMessages.length === 0}
                      className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Share to Feed
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          to {
            transform: translateX(200%);
          }
        }
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-scan {
          animation: scan 0.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}      </style>

      {/* Modals */}
      <CodeEditorModal
        isOpen={showCodeEditor}
        onClose={() => setShowCodeEditor(false)}
        onSave={handleCodeSave}
      />
      <QuestCreatorModal
        isOpen={showQuestCreator}
        onClose={() => setShowQuestCreator(false)}
        onCreate={handleQuestCreate}
      />
    </div>
  )
}
