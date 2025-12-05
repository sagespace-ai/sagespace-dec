"use client"

import { useState, useCallback } from "react"
import type { ChatMessage, ChatStats, GenerationHints } from "@/lib/types/chat"

interface UseSageChatOptions {
  sessionId: string
  initialMessages?: ChatMessage[]
  initialStats?: ChatStats
}

export function useSageChat({ sessionId, initialMessages = [], initialStats }: UseSageChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [stats, setStats] = useState<ChatStats>(
    initialStats || {
      messagesSent: 0,
      xpEarned: 0,
      artifactsCollected: 0,
      questsCompleted: 0,
    },
  )
  const [isSending, setIsSending] = useState(false)
  const [isSageTyping, setIsSageTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, generationHints?: GenerationHints) => {
      if (!content.trim() || isSending) return

      setIsSending(true)
      setError(null)

      try {
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            content,
            mode: "single", // Get from context
            generationHints,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const data = await response.json()

        // Add user message
        setMessages((prev) => [...prev, data.userMessage])

        // Show typing indicator
        setIsSageTyping(true)

        // Simulate thinking delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Add sage messages
        setMessages((prev) => [...prev, ...data.sageMessages])
        setStats(data.stats)
        setIsSageTyping(false)
      } catch (err) {
        console.error("Send message error:", err)
        setError(err instanceof Error ? err.message : "Failed to send message")
        setIsSageTyping(false)
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, isSending],
  )

  return {
    messages,
    stats,
    isSending,
    isSageTyping,
    error,
    sendMessage,
  }
}
