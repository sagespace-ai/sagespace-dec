/**
 * UI Store (Zustand)
 *
 * PHASE 2: Centralized client/UI state
 * - Corresponds to "Consolidate State Management" in the SageSpace Architectural Audit
 * - Tracks lightweight UI preferences such as the active feed view
 */

import { create } from 'zustand'

export type FeedView = 'default' | 'marketplace' | 'universe' | 'following'

interface ActivationState {
  createCompleted: boolean
  sageCompleted: boolean
  engagementCompleted: boolean
  dismissed: boolean
}

interface UIState {
  feedView: FeedView
  setFeedView: (view: FeedView) => void
  hasSeenHomeWalkthrough: boolean
  setHasSeenHomeWalkthrough: (seen: boolean) => void
  activation: ActivationState
  setActivation: (update: Partial<ActivationState>) => void
  personaHint: string
  setPersonaHint: (value: string) => void
  // Remix: Selected feed items for remixing
  selectedFeedItems: string[]
  setSelectedFeedItems: (items: string[]) => void
  toggleFeedItemSelection: (itemId: string) => void
  clearFeedItemSelection: () => void
}

// Helpers for safe localStorage access
const FEED_VIEW_KEY = 'sagespace-feed-view'
const HOME_WALKTHROUGH_KEY = 'sagespace-home-walkthrough'
const ACTIVATION_KEY = 'sagespace-activation'
const PERSONA_HINT_KEY = 'sagespace-persona-hint'
const SELECTED_FEED_ITEMS_KEY = 'sagespace-selected-feed-items'

const DEFAULT_PERSONA_HINT =
  'A microbiologist fascinated by inclusion bodies, TEM/SEM imagery, and absurd scientific shitposting.'

function getInitialFeedView(): FeedView {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(FEED_VIEW_KEY) as FeedView | null
    if (stored && ['default', 'marketplace', 'universe'].includes(stored)) {
      return stored
    }
  }
  return 'default'
}

function getInitialWalkthroughSeen(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(HOME_WALKTHROUGH_KEY) === 'true'
}

function getInitialActivation(): ActivationState {
  if (typeof window === 'undefined') {
    return {
      createCompleted: false,
      sageCompleted: false,
      engagementCompleted: false,
      dismissed: false,
    }
  }
  try {
    const raw = window.localStorage.getItem(ACTIVATION_KEY)
    if (!raw) {
      return {
        createCompleted: false,
        sageCompleted: false,
        engagementCompleted: false,
        dismissed: false,
      }
    }
    const parsed = JSON.parse(raw) as Partial<ActivationState>
    return {
      createCompleted: !!parsed.createCompleted,
      sageCompleted: !!parsed.sageCompleted,
      engagementCompleted: !!parsed.engagementCompleted,
      dismissed: !!parsed.dismissed,
    }
  } catch {
    return {
      createCompleted: false,
      sageCompleted: false,
      engagementCompleted: false,
      dismissed: false,
    }
  }
}

function getInitialPersonaHint(): string {
  if (typeof window === 'undefined') return DEFAULT_PERSONA_HINT
  const stored = window.localStorage.getItem(PERSONA_HINT_KEY)
  return stored && stored.trim().length > 0 ? stored : DEFAULT_PERSONA_HINT
}

export const useUIStore = create<UIState>((set) => ({
  // PHASE 2: Default unified feed view (now persisted)
  feedView: getInitialFeedView(),
  setFeedView: (feedView) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FEED_VIEW_KEY, feedView)
    }
    set({ feedView })
  },
  // PHASE 4+: First-run walkthrough visibility
  hasSeenHomeWalkthrough: getInitialWalkthroughSeen(),
  setHasSeenHomeWalkthrough: (seen) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HOME_WALKTHROUGH_KEY, seen ? 'true' : 'false')
    }
    set({ hasSeenHomeWalkthrough: seen })
  },
  // Guided activation state
  activation: getInitialActivation(),
  setActivation: (update) =>
    set((prev) => {
      const next: ActivationState = {
        ...prev.activation,
        ...update,
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACTIVATION_KEY, JSON.stringify(next))
      }
      return { ...prev, activation: next }
    }),
  personaHint: getInitialPersonaHint(),
  setPersonaHint: (value) => {
    const next = value.trim().length > 0 ? value : DEFAULT_PERSONA_HINT
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PERSONA_HINT_KEY, next)
    }
    set({ personaHint: next })
  },
  // Remix: Feed item selection
  selectedFeedItems: (() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem(SELECTED_FEED_ITEMS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })(),
  setSelectedFeedItems: (items) => {
    const limited = items.slice(0, 2) // Max 2 items for remix
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SELECTED_FEED_ITEMS_KEY, JSON.stringify(limited))
    }
    set({ selectedFeedItems: limited })
  },
  toggleFeedItemSelection: (itemId) =>
    set((prev) => {
      const current = prev.selectedFeedItems
      const index = current.indexOf(itemId)
      let next: string[]
      if (index >= 0) {
        // Deselect
        next = current.filter((id) => id !== itemId)
      } else {
        // Select (max 2)
        if (current.length >= 2) {
          // Replace first item
          next = [current[1], itemId]
        } else {
          next = [...current, itemId]
        }
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SELECTED_FEED_ITEMS_KEY, JSON.stringify(next))
      }
      return { selectedFeedItems: next }
    }),
  clearFeedItemSelection: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SELECTED_FEED_ITEMS_KEY)
    }
    set({ selectedFeedItems: [] })
  },
}))
