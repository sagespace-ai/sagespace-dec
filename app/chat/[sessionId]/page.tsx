"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ContentBlockRenderer } from "@/components/chat/ContentBlockRenderer"
import type { ChatMessage, ChatStats, ContentBlock } from "@/types/chat"
import type { ChatSession, ChatParticipant } from "@/types/sage"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"
import { getPersonalizedStarterConversations } from "@/lib/personalization"
import type { StarterConversation } from "@/lib/sage-templates"
import type { UserProfile } from "@/types/user"
import {
  SendIcon,
  ZapIcon,
  UserIcon,
  HomeIcon,
  SparklesIcon,
  ImageIcon,
  MusicIcon,
  VideoIcon,
  FileTextIcon,
} from "@/components/icons"

export default function ChatSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ChatStats>({
    sessionId,
    messagesSent: 0,
    xpEarned: 0,
    artifactsCollected: 0,
  })
  const [selectedHints, setSelectedHints] = useState<string[]>(["text"])
  const [session, setSession] = useState<ChatSession | null>(null)
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [primarySageId, setPrimarySageId] = useState<string | null>(null)
  const [starterConversations, setStarterConversations] = useState<StarterConversation[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/chat/sessions?sessionId=${sessionId}`)
      const data = await response.json()
      if (data.session) {
        setSession(data.session)
        const sageId = data.session.primarySageId
        setPrimarySageId(sageId)
        
        // Get starter conversations for the primary Sage
        const sage = SAGE_TEMPLATES.find((s) => s.id === sageId)
        if (sage) {
          const starters = getPersonalizedStarterConversations(sage, null, messages, 5)
          setStarterConversations(starters)
        }
      }
    } catch (error) {
      console.error("[chat] Failed to fetch session:", error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
      const data = await response.json()

      if (data.messages) {
        interface MessageFromDB {
          id: string
          author_type: string
          author_id: string
          created_at: string
          mode_at_time: string
          blocks?: ContentBlock[]
          [key: string]: unknown
        }
        setMessages(
          data.messages.map((m: MessageFromDB) => ({
            ...m,
            authorType: m.author_type,
            authorId: m.author_id,
            createdAt: m.created_at,
            modeAtTime: m.mode_at_time,
          })),
        )
      }
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("[chat] Failed to fetch messages:", error)
    }
  }

  const sendMessage = async (customContent?: string) => {
    const messageContent = customContent || input
    if (!messageContent.trim() || loading) return

    setLoading(true)

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          content: messageContent,
          mode: session?.mode || "single",
          sageId: primarySageId || undefined,
          generationHints: {
            preferredBlocks: selectedHints,
            mood: null,
          },
        }),
      })

      const data = await response.json()

      if (data.userMessage && data.sageMessages) {
        setMessages((prev) => [...prev, data.userMessage, ...data.sageMessages])
        setStats(data.stats)
        setInput("")
        setSelectedHints(["text"]) // Reset hints
      }
    } catch (error) {
      console.error("[chat] Failed to send message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendClick = () => {
    sendMessage()
  }

  const toggleHint = (hint: string) => {
    if (hint === "text") return // Text is always included
    setSelectedHints((prev) => (prev.includes(hint) ? prev.filter((h) => h !== hint) : [...prev, hint]))
  }

  // Get primary Sage from template (fallback for display)
  const primarySage = primarySageId ? SAGE_TEMPLATES.find((s) => s.id === primarySageId) : null

  return (
    <div className="min-h-screen bg-black">
      {/* Cosmic background */}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/playground")}
                  className="text-slate-300 hover:text-cyan-400"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Back to Playground
                </Button>

                <div className="h-6 w-px bg-white/10" />

                {/* Sage info */}
                {primarySage && (
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{primarySage.avatar}</div>
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      {primarySage.name}
                      {participants.length > 1 && (
                        <span className="text-xs px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded">
                          +{participants.length - 1} more
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Online & Ready • {primarySage.domain}</span>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Stats */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <ZapIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium text-white">{stats.xpEarned} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                  <SparklesIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{stats.artifactsCollected} Artifacts</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl">
            {/* Messages */}
            <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: "thin" }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  {primarySageId && (() => {
                    const sage = SAGE_TEMPLATES.find((s) => s.id === primarySageId)
                    if (!sage) return null
                    return (
                      <>
                        <div className="text-6xl mb-6 animate-bounce">{sage.avatar}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{sage.name}</h3>
                          <p className="text-sm text-cyan-400 mb-4">{sage.role}</p>
                          {sage.synopsis && (
                            <p className="text-slate-300 max-w-md mb-6">{sage.synopsis}</p>
                          )}
                        </div>
                        {starterConversations.length > 0 && (
                          <div className="w-full max-w-2xl space-y-3">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                              Try starting with:
                            </p>
                            {starterConversations.map((starter) => (
                              <button
                                key={starter.id}
                                onClick={() => {
                                  sendMessage(starter.prompt).catch(console.error)
                                }}
                                className="w-full text-left p-4 rounded-lg border-2 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-cyan-500/30 hover:text-white transition-all duration-200"
                              >
                                <div className="font-medium text-sm mb-1">{starter.title}</div>
                                {starter.description && (
                                  <div className="text-xs text-slate-400">{starter.description}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.authorType === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl ${
                          msg.authorType === "user"
                            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white ml-auto"
                            : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white"
                        } backdrop-blur-sm shadow-lg`}
                      >
                        <div className="flex items-start gap-3">
                          {msg.authorType === "sage" && primarySageId && (() => {
                            const sage = SAGE_TEMPLATES.find((s) => s.id === primarySageId)
                            return sage ? <div className="text-2xl flex-shrink-0">{sage.avatar}</div> : null
                          })()}
                          <div className="flex-1">
                            {/* Render all content blocks */}
                            <div className="space-y-2">
                              {msg.blocks.map((block: ContentBlock) => (
                                <ContentBlockRenderer key={block.id} block={block} />
                              ))}
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          {msg.authorType === "user" && (
                            <div className="text-2xl flex-shrink-0">
                              <UserIcon className="w-6 h-6 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start animate-pulse">
                      <div className="max-w-[85%] p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            {primarySageId && (() => {
                              const sage = SAGE_TEMPLATES.find((s) => s.id === primarySageId)
                              return sage ? <div className="text-2xl">{sage.avatar}</div> : null
                            })()}
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-t border-purple-500/30 p-4">
              {/* Generation Hints */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: "image", icon: ImageIcon, label: "🎨 Generate Image" },
                  { id: "audio", icon: MusicIcon, label: "🎵 Generate Track" },
                  { id: "video", icon: VideoIcon, label: "🎬 Generate Video" },
                  { id: "post", icon: FileTextIcon, label: "📄 Long-form Article" },
                ].map((hint) => (
                  <button
                    key={hint.id}
                    onClick={() => toggleHint(hint.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg border-2 transition-all ${
                      selectedHints.includes(hint.id)
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                        : "bg-slate-800/50 border-slate-600 text-slate-400 hover:border-cyan-500/50"
                    }`}
                  >
                    {hint.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask your sages anything... or tell them what to create"
                  className="flex-1 bg-slate-800/80 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 rounded-xl px-4 py-3"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendClick}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-purple-500/50 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <SendIcon className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <div>Press Enter to send • Shift+Enter for new line</div>
                <div className="flex items-center gap-2">
                  <ZapIcon className="w-3 h-3 text-yellow-400" />
                  <span>+10 XP per message</span>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
