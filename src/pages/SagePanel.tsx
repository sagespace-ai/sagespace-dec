"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Send } from "lucide-react"
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from "../components/ui/Card2035"
import { Button2035 } from "../components/ui/Button2035"
import { Input2035 } from "../components/ui/Input2035"
import { WhatsNext, getContextualNextActions } from "../components/ui/WhatsNext"
import { FadeIn } from "../components/motion/FadeIn"
import { BackButton } from "../components/navigation/BackButton"
import Layout from "../components/Layout"
import { apiService } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import { useUIStore } from "../store/uiStore"
import { useEffect } from "react"
import { ConversationHistory } from "../components/sages/ConversationHistory"
import { History } from "lucide-react"
import { useRealtimeConversations } from "../hooks/useRealtimeConversations"
import { useAuth } from "../contexts/AuthContext"

interface Sage {
  id: string
  name: string
  role: string
  description: string
  avatar: string
  active: boolean
  memory: string
  autonomy: string
  dataAccess: string
  color: string
}

const sages: Sage[] = [
  {
    id: "athena",
    name: "Athena",
    role: "Researcher",
    description: "Curious & Methodical",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtY7Y2QtsWG6iFBZ8RFzGgUdMqB4Pnl_NhHb7BuYv2JGS6WKUS7w0Q2OtkwT-k53orH1sHRwynYOWPhVAvqeoRKh_xs4C8QdouBDXdj1cyzW-17pDssaEcpPJDhTdGvJ_w91jfsS7w6AMTXJBi7YbPbjQ4KCk3uNHqblUspuVd-ZmFApqBbkbUG9J76CyPUhLltYc6-xYGIemLCofljuNryC74QDWbeF56PYvuwllI3O35i4csqimrM8VKM2z_WkorojIFCPrtwS1I",
    active: true,
    memory: "Cross-session",
    autonomy: "Semi-Autonomous",
    dataAccess: "Tier 2 (Projects)",
    color: "indigo",
  },
  {
    id: "hephaestus",
    name: "Hephaestus",
    role: "Builder",
    description: "Pragmatic & Resourceful",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0MVdpzlZc3BwBv0LYVzs0udDu_thEMPsgm8udL-PLKd6B2PXzXMyhRZPINPmEGa3R7M2Jfxy5vaokHC8vR2iaGoYNUKelONKFypOFldGDdRvW0PTOsa4fNHqTYV63D514MJXbAk1hu4jyD2f7GzV1c2wXhPeJwKU5gV8ep8qjLl_OsMbYccwT8bOLXq8odvEg6c_SyU-ehELPLTag26IRGtJMC66gDDL2hwn_Gj1PUxRZhr8SAVrm16LA21NouMFRIHZhbk7xwBFE",
    active: false,
    memory: "Local",
    autonomy: "Advisory",
    dataAccess: "Tier 1 (Public)",
    color: "indigo",
  },
  {
    id: "oracle",
    name: "Oracle",
    role: "Analyst",
    description: "Insightful & Objective",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtI2v9fis6P1vwoiBcovxQ63CteqrbsK6_YpoAAjjT2RtECCOtKmTOe6uS718iUMgDnvfiCgXi_ZIWSLS6hnNb8d2__tFXuuLuJ9gLDDTH1l3Cwwih7NjcdVgglctu3z8CDoUrrxJxGlPmbwYBOwcl6bIWPdjofQbSetqjmUT8F7qGDcaOQM_UCmrmNRWOpzwJu4zrHJ16ojK4vzoWXnqfCsOvEXhB3rtmqpedMuPAxQac07uYrmyjRqLRjwTNEPHbghtIRw_eIN4X",
    active: false,
    memory: "Global",
    autonomy: "Autonomous",
    dataAccess: "Tier 3 (All Personal)",
    color: "blue",
  },
]

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function SagePanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { setActivation } = useUIStore()
  const { user } = useAuth()
  const [activeSage, setActiveSage] = useState<Sage>(sages[0])
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome! I am ${sages[0].name}, your AI ${sages[0].role}. How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [showStarters, setShowStarters] = useState(true)
  const [showWhatsNext, setShowWhatsNext] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Enable real-time conversation updates
  useRealtimeConversations({
    userId: user?.id,
    conversationId,
    enabled: !!user,
  })

  // Load conversation history when conversationId is set or sage changes
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!conversationId) {
        // Reset to welcome message if no conversation
        setMessages([
          {
            role: "assistant",
            content: `Welcome! I am ${activeSage.name}, your AI ${activeSage.role}. How can I assist you today?`,
            timestamp: new Date(),
          },
        ])
        setShowStarters(true)
        return
      }

      try {
        const { data, error } = await apiService.getConversation(conversationId)
        if (!error && data && data.messages && data.messages.length > 0) {
          // Convert database messages to UI format
          const loadedMessages: Message[] = data.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }))
          setMessages(loadedMessages)
          setShowStarters(false)
        } else {
          // No messages yet, show welcome
          setMessages([
            {
              role: "assistant",
              content: `Welcome! I am ${activeSage.name}, your AI ${activeSage.role}. How can I assist you today?`,
              timestamp: new Date(),
            },
          ])
          setShowStarters(true)
        }
      } catch (error) {
        console.error("Failed to load conversation:", error)
        // Continue with welcome message on error
        setMessages([
          {
            role: "assistant",
            content: `Welcome! I am ${activeSage.name}, your AI ${activeSage.role}. How can I assist you today?`,
            timestamp: new Date(),
          },
        ])
        setShowStarters(true)
      }
    }

    loadConversationHistory()
  }, [conversationId, activeSage.id, activeSage.name, activeSage.role])

  const conversationStarters = [
    "Help me research quantum computing",
    "What can you help me build?",
    "Show me my recent creations",
    "Analyze my feed activity",
  ]

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return

    const userMessage = message.trim()
    setMessage("")
    setIsSending(true)
    setShowStarters(false)

    // Add user message to conversation
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const aiService = (await import("../services/aiService")).default

      if (!aiService.isConfigured()) {
        throw new Error("AI service not configured. Please set VITE_XAI_API_KEY in your environment variables.")
      }

      // Build conversation history for AI
      const chatMessages = messages
        .filter((m) => m.role !== "assistant" || m.content !== messages[0].content) // Exclude welcome message
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))

      // Add current user message
      chatMessages.push({
        role: "user",
        content: userMessage,
      })

      // Build system prompt based on Sage personality
      const systemPrompt = `You are ${activeSage.name}, a ${activeSage.role}. ${activeSage.description}

Your personality traits:
- Memory scope: ${activeSage.memory}
- Autonomy level: ${activeSage.autonomy}
- Data access: ${activeSage.dataAccess}

Respond in character, be helpful, and maintain the personality described above. Keep responses concise but informative.`

      // Call AI service
      const reply = await aiService.chat(chatMessages, {
        systemPrompt,
        temperature: 0.8,
        maxTokens: 1500,
      })

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Track activation
      if (messages.length === 1) {
        // First real message
        setActivation({ sageCompleted: true })
        setTimeout(() => setShowWhatsNext(true), 1000)
      }

      if (user && conversationId) {
        try {
          // Attempt to save conversation history
          await apiService.chat({
            message: userMessage,
            sageId: activeSage.id,
            conversationId,
            history: chatMessages,
          })
        } catch (err) {
          console.warn("[SagePanel] Failed to save conversation to backend:", err)
          // Continue anyway - the chat worked, just saving failed
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      showToast(error.message || "Failed to send message", "error")

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: error.message.includes("not configured")
          ? "AI chat is not configured. Please contact your administrator to set up the VITE_XAI_API_KEY environment variable."
          : "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-full bg-background-light dark:bg-background-dark">
        {/* Main Chat Area */}
        <Card2035 className="flex-1 flex flex-col p-6 m-4">
          <Card2035Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BackButton className="md:hidden" />
                <Card2035Title>Chat with {activeSage.name}</Card2035Title>
              </div>
              <Button2035
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2"
                aria-label="View conversation history"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button2035>
            </div>
          </Card2035Header>
          <div className="flex-grow space-y-4 overflow-y-auto pr-2 mb-4">
            {messages.map((msg, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div
                  className={`p-4 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary/10 ml-auto max-w-[80%] text-gray-900 dark:text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <div className="text-sm font-medium mb-1 opacity-70">
                    {msg.role === "user" ? "You" : activeSage.name}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </FadeIn>
            ))}
            {isSending && (
              <FadeIn>
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </FadeIn>
            )}
            {messages.length === 1 && showStarters && (
              <FadeIn delay={0.2}>
                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">💡 Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {conversationStarters.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setMessage(starter)
                          setShowStarters(false)
                        }}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-gray-700 dark:text-gray-300"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Input2035
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
              placeholder="Talk to your Sage..."
              aria-label={`Message to ${activeSage.name}`}
            />
            <Button2035
              variant="primary"
              size="md"
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              aria-label={isSending ? "Sending message" : "Send message"}
            >
              <Send className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">{isSending ? "Sending…" : "Send"}</span>
            </Button2035>
          </div>

          {/* What's Next Suggestions */}
          {showWhatsNext && messages.length > 2 && (
            <div className="mt-4">
              <WhatsNext actions={getContextualNextActions(location.pathname, navigate)} />
            </div>
          )}
        </Card2035>

        {/* Sage Dock */}
        <Card2035 className="w-full lg:w-96 flex flex-col m-4">
          <Card2035Header>
            <Card2035Title>Sage Dock</Card2035Title>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your AI Companions</p>
          </Card2035Header>
          <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {sages.map((sage, index) => (
              <FadeIn key={sage.id} delay={index * 0.1}>
                <Card2035
                  interactive
                  onClick={() => setActiveSage(sage)}
                  className={`cursor-pointer ${activeSage.id === sage.id ? "ring-2 ring-primary" : ""}`}
                >
                  <Card2035Content>
                    <div className="flex items-start gap-4">
                      <img
                        alt={`${sage.name} Avatar`}
                        className="w-16 h-16 rounded-full border-2 border-primary"
                        src={sage.avatar || "/placeholder.svg"}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{sage.name}</h3>
                          {sage.active && (
                            <span className="text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            sage.color === "indigo"
                              ? "text-indigo-500 dark:text-indigo-400"
                              : "text-blue-500 dark:text-blue-400"
                          }`}
                        >
                          {sage.role}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{sage.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3 text-sm">
                      <div className="flex items-center gap-2" title="Memory Scope">
                        <span className="material-icons-outlined text-base text-gray-600 dark:text-gray-400">
                          memory
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white mr-2">Memory:</span>
                        <span className="text-gray-600 dark:text-gray-400">{sage.memory}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Autonomy Level">
                        <span className="material-icons-outlined text-base text-gray-600 dark:text-gray-400">
                          smart_toy
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white mr-2">Autonomy:</span>
                        <span className="text-gray-600 dark:text-gray-400">{sage.autonomy}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Data Access Tier">
                        <span className="material-icons-outlined text-base text-gray-600 dark:text-gray-400">
                          database
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white mr-2">Data Access:</span>
                        <span className="text-gray-600 dark:text-gray-400">{sage.dataAccess}</span>
                      </div>
                    </div>
                  </Card2035Content>
                </Card2035>
              </FadeIn>
            ))}
          </div>
          <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button2035 variant="secondary" size="md" className="w-full" onClick={() => navigate("/sages")}>
              <span className="material-icons-outlined mr-2">add_circle</span>
              Create New Sage
            </Button2035>
          </footer>
        </Card2035>
      </div>

      {/* Conversation History Sidebar */}
      <ConversationHistory
        sageId={activeSage.id}
        onSelectConversation={(id) => {
          setConversationId(id || undefined)
        }}
        currentConversationId={conversationId}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </Layout>
  )
}
