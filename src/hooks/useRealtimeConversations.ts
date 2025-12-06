/**
 * useRealtimeConversations Hook
 * 
 * Subscribes to real-time updates for conversations and messages using Supabase Realtime.
 * Automatically updates conversation list and messages when new ones are created.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface UseRealtimeConversationsOptions {
  userId?: string
  conversationId?: string
  enabled?: boolean
}

export function useRealtimeConversations(options: UseRealtimeConversationsOptions = {}) {
  const { userId, conversationId, enabled = true } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !supabase || !userId) return

    // Subscribe to conversations changes
    const conversationsChannel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Conversation change:', payload)
          // Invalidate conversations query
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }
      )
      .subscribe()

    // Subscribe to messages changes for current conversation
    let messagesChannel: any = null
    if (conversationId) {
      messagesChannel = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            console.log('New message:', payload)
            // Invalidate conversation query to reload messages
            queryClient.invalidateQueries({ 
              queryKey: ['conversations', conversationId] 
            })
          }
        )
        .subscribe()
    }

    return () => {
      if (supabase) {
        supabase.removeChannel(conversationsChannel)
        if (messagesChannel) {
          supabase.removeChannel(messagesChannel)
        }
      }
    }
  }, [enabled, userId, conversationId, queryClient])
}
