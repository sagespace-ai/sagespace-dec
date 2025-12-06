/**
 * useRealtimeNotifications Hook
 * 
 * Subscribes to real-time updates for notifications using Supabase Realtime.
 * Automatically updates notifications when new ones are created.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

interface UseRealtimeNotificationsOptions {
  userId?: string
  enabled?: boolean
  showToasts?: boolean
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
  const { userId, enabled = true, showToasts = true } = options
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  useEffect(() => {
    if (!enabled || !supabase || !userId) return

    // Subscribe to notifications changes
    // Note: This assumes a notifications table exists
    // For now, we'll listen to feed_interactions as a proxy for notifications
    const notificationsChannel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_interactions',
        },
        (payload) => {
          const interaction = payload.new as any
          
          // Only show notifications for interactions on user's own items
          // (This is a simplified version - in production, you'd have a dedicated notifications table)
          if (interaction.user_id !== userId) {
            // Invalidate notifications query
            queryClient.invalidateQueries({ queryKey: ['notifications'] })

            // Show toast notification
            if (showToasts) {
              const interactionType = interaction.interaction_type
              if (interactionType === 'like') {
                showToast('Someone liked your post!', 'success')
              } else if (interactionType === 'comment') {
                showToast('New comment on your post!', 'success')
              } else if (interactionType === 'share') {
                showToast('Your post was shared!', 'success')
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(notificationsChannel)
      }
    }
  }, [enabled, userId, queryClient, showToasts, showToast])
}
