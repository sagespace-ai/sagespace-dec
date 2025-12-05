"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import type { Conversation, CreateConversationRequest } from "@/lib/types"
import { useCallback } from "react"

const fetcher = (url: string) => http.get<Conversation[]>(url)

export function useConversations() {
  const { data, error, mutate } = useSWR<Conversation[]>("/api/conversations", fetcher)

  const createConversation = useCallback(
    async (request: CreateConversationRequest) => {
      const result = await http.post<Conversation>("/api/conversations", request)
      await mutate()
      return result
    },
    [mutate],
  )

  const deleteConversation = useCallback(
    async (id: string) => {
      await http.delete(`/api/conversations/${id}`)
      await mutate()
    },
    [mutate],
  )

  return {
    conversations: data || [],
    loading: !error && !data,
    error,
    refresh: mutate,
    createConversation,
    deleteConversation,
  }
}

export function useConversation(id: string | null) {
  const shouldFetch = Boolean(id)

  const fetcher = (url: string) => http.get<Conversation>(url)

  const { data, error, mutate } = useSWR<Conversation>(shouldFetch ? `/api/conversations/${id}` : null, fetcher)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!id) return

      // Optimistic update
      const optimisticMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content,
        timestamp: new Date().toISOString(),
      }

      if (data) {
        await mutate(
          {
            ...data,
            messages: [...data.messages, optimisticMessage],
          },
          false,
        )
      }

      const result = await http.post<Conversation>(`/api/chat`, { conversationId: id, content })
      await mutate(result)
    },
    [id, data, mutate],
  )

  return {
    conversation: data,
    loading: !error && !data && shouldFetch,
    error,
    refresh: mutate,
    sendMessage,
  }
}
