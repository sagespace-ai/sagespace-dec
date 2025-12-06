/**
 * useRealtimeFeed Hook
 * 
 * Subscribes to real-time updates for feed items and interactions using Supabase Realtime.
 * Automatically updates the feed when new items are created or interactions occur.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface UseRealtimeFeedOptions {
  userId?: string
  enabled?: boolean
}

export function useRealtimeFeed(options: UseRealtimeFeedOptions = {}) {
  const { userId, enabled = true } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !supabase || !userId) return

    // Subscribe to feed_items changes
    const feedItemsChannel = supabase
      .channel('feed_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'feed_items',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Feed item change:', payload)

          // Invalidate feed query to refetch
          queryClient.invalidateQueries({ queryKey: ['feed'] })

          // If it's a new item, we could optimistically add it
          if (payload.eventType === 'INSERT' && payload.new) {
            const newItem = payload.new as any
            // Optionally add to cache optimistically
            queryClient.setQueryData(['feed'], (old: any) => {
              if (!old) return old
              // Add new item to the first page
              const newPages = old.pages.map((page: any, index: number) => {
                if (index === 0) {
                  return {
                    ...page,
                    items: [newItem, ...page.items],
                  }
                }
                return page
              })
              return { ...old, pages: newPages }
            })
          }
        }
      )
      .subscribe()

    // Subscribe to feed_interactions changes
    const interactionsChannel = supabase
      .channel('feed_interactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_interactions',
        },
        (payload) => {
          console.log('Feed interaction change:', payload)

          // Invalidate feed query to update interaction counts
          queryClient.invalidateQueries({ queryKey: ['feed'] })
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      if (supabase) {
        supabase.removeChannel(feedItemsChannel)
        supabase.removeChannel(interactionsChannel)
      }
    }
  }, [enabled, userId, queryClient])
}
